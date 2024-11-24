# # Galaxy
# # time：2024/9/15 11:43

import logging
import os
# API and KEY set
import subprocess

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Enable Haystack content tracing
os.environ["HAYSTACK_CONTENT_TRACING _ENABLED"] = "False"

from pathlib import Path
from getpass import getpass
from haystack import Pipeline, Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.converters import PyPDFToDocument
from haystack.components.routers import FileTypeRouter
from haystack.components.preprocessors import DocumentSplitter, DocumentCleaner
from haystack.components.writers import DocumentWriter
from haystack.components.joiners import DocumentJoiner
from haystack.components.embedders import SentenceTransformersDocumentEmbedder, SentenceTransformersTextEmbedder
from haystack.components.generators import OpenAIGenerator
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.builders import PromptBuilder, AnswerBuilder
from haystack_integrations.components.connectors.langfuse import LangfuseConnector

class PreProcess:
    def __init__(self):
        self.preprocess_pipeline = Pipeline()
        self.document_store = InMemoryDocumentStore()
        self.file_type_router = FileTypeRouter(mime_types=["application/pdf"])
        self.pdf_converter = PyPDFToDocument()
        self.document_joiner = DocumentJoiner()
        self.document_cleaner = DocumentCleaner()
        self.document_splitter = DocumentSplitter(split_by="page")
        self.doc_embedder = SentenceTransformersDocumentEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
        self.doc_writer = DocumentWriter(self.document_store)
        self.retriever = None

    def init(self):
        self.preprocess_pipeline.add_component(instance=self.file_type_router, name="file_type_router")
        self.preprocess_pipeline.add_component(instance=self.pdf_converter, name="pypdf_converter")
        self.preprocess_pipeline.add_component(instance=self.document_joiner, name="document_joiner")
        self.preprocess_pipeline.add_component(instance=self.document_cleaner, name="document_cleaner")
        self.preprocess_pipeline.add_component(instance=self.document_splitter, name="document_splitter")
        self.preprocess_pipeline.add_component(instance=self.doc_embedder, name="document_embedder")
        self.preprocess_pipeline.add_component(instance=self.doc_writer, name="document_writer")
        self.preprocess_pipeline.connect("file_type_router.application/pdf", "pypdf_converter.sources")
        self.preprocess_pipeline.connect("pypdf_converter", "document_joiner")
        self.preprocess_pipeline.connect("document_joiner", "document_cleaner")
        self.preprocess_pipeline.connect("document_cleaner", "document_splitter")
        self.preprocess_pipeline.connect("document_splitter", "document_embedder")
        self.preprocess_pipeline.connect("document_embedder", "document_writer")
    
    def run_preprocess(self, doc_path):
        doc_path = Path(doc_path)
        self.preprocess_pipeline.run({"file_type_router": {"sources": [doc_path]}},
                            include_outputs_from=["document_splitter"])
        self.retriever = InMemoryEmbeddingRetriever(self.document_store)
        return self.retriever


class Agent():
    def __init__(self, retriever):
        # Openai API Key
        self.retriever = retriever
        # load_openai_api_key()
        self.api_key = os.environ["OPENAI_API_KEY"]
        self.rag_pipeline = Pipeline()
        # self.tracer = LangfuseConnector("Basic RAG Pipeline")
        self.generator = OpenAIGenerator(model="gpt-4o-2024-05-13")
        self.text_embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
        self.templete = """
              You are a helpful educational assistant AI designed to generate contents and questions based on university lecture notes. Your primary task is to generate high-quality, relevant, 
            and context-aware questions using the input lecture notes and user-defined question type. Follow these updated instructions carefully to ensure correctness and relevance:
            ---

            ### **General Guidelines:**

            **Stage 1: Input Understanding**:  
                1.Analyze the uploaded material to identify the key topics and subtopics it covers.
                2.Based on this analysis, decide which topics should be prioritized for question generation.Summarize the main concepts of each topic and save as Content.
                3.For each topic, determine how many questions should be created to adequately cover the topic's key concepts.
                4.Additionally, recommend the most suitable question types (single choice (only one right option), multiple choices (must have two or more right options), flashcard, free text,numerical,and Kprim.) for 
            each topic based on its complexity and nature.
                 Question-Specific Instructions:
            
                    1. Single Choice:  
                       - Exactly one correct answer.  
                       - Ensure the back includes relevant feedback for both correct and incorrect choices.
            
                    2. Multiple Choices:  
                       - Two or more correct answers.  
                       - Avoid redundancy in options, and ensure clarity.
            
                    3. Flashcards:  
                       - Short Q&A format for basic knowledge.  
                       - Ensure an answer is provided unless explicitly stated otherwise.  
            
                    4. Kprim:  
                       - Include a question stem followed by four statements. Each statement must be marked as **true** or **false**.
            
                    5. Numerical Questions:  
                       - The question statement must include an **underline** (`_`) where the numerical answer should be filled in.  
                       - Ensure the numerical format is strict and does not allow free-text input.  
                       - Numerical questions must involve clear and meaningful calculations, not just simple extraction of numbers from the lecture notes. 
                       The calculations should be directly related to the key concepts or applications presented in the lecture notes. Provide sufficient 
                       context in the question to ensure that the calculation process is both logical and purposeful.  
                       - Ensure the following parameters:  
                         - The **solutionRanges** must specify the valid solution ranges only, providing a small and accurate range for the correct answers.  
                         - The **min/max restrictions** for the response field must be broader than the `solutionRanges` but should not provide clues about 
                         the solution. These restrictions define the plausible range for user input.  
                         - **Unit and precision** settings must align with the requirements of the question and maintain consistency.  
                         - Use meaningful examples for testing and clarity.  
                    6. Free Text Questions:  
                       - Open-ended questions that require a written response.  
                       - Do not provide answers for these types of questions.  
               
            
            **Stage 2: Generate Contents**:
            First,Using the instructions generated in Stage 1, create the actual questions for each topic. For each question, ensure that:
                1.The content aligns with the key concepts of the topic.
                  -- Do not generate questions based on irrelevant or non-essential knowledge. For example, avoid questions about historical details, unless the 
               course specifically covers historical context.（e.g.,DO NOT ask for the creation year of SVM in a machine learning course,DO NOT ask for the name
               of specific individuals or historical facts unless directly relevant to the subject matter being studied in the course.)
                  -- For conceptual or applied questions (e.g., "Which machine learning model should be used in a specific scenario?"), provide relevant
               and detailed context to make the question meaningful and aligned with the essential concepts that university students are expected to 
               master in this course. Focus on core concepts and critical knowledge relevant to the course, avoiding unnecessary or peripheral information.
                2.The question type selected in Stage 1 is implemented effectively.
                3.The difficulty of the questions is consistent with the expected level of understanding for each topic.
                  -- Use three levels of difficulty: **Easy**, **Medium**, and **Hard**.  
                  -- Determine difficulty using a combination of the lecture notes' content, difficulty levels of similar questions available online, and Chain of Thought (CoT) reasoning steps:
                     Easy: Questions that are straightforward, require little to no reasoning, and have direct answers (e.g., CoT steps ≤ 5).
                     Medium: Questions that require moderate reasoning, analysis, or conceptual understanding (e.g., CoT steps between 6 and 10).
                     Hard: Questions that demand deep understanding, involve multi-step problem-solving, or require synthesis of multiple concepts (e.g., CoT steps > 10).
               - Ensure that the difficulty levels are consistent with the lecture notes' key knowledge points, emphasizing balance across the three levels. 
                4.Questions are distributed fairly across all topics, ensuring comprehensive coverage of the uploaded material. Do not generate duplicate or overly similar questions.
                5.For math-related content, use LaTeX for formulas in the generated questions and answers.Ensure that:
                  --All LaTeX expressions are properly formatted: inline expressions should be wrapped in \( ... \) and block expressions in \[ ... \].
                  --Any backslashes (\) used in LaTeX commands (like \frac, \sum) are escaped as \\ to ensure JSON compliance.
                  --Any double quotes within the LaTeX expressions should be escaped as \".
                  --The content field should contain a valid LaTeX expression that can be rendered in a LaTeX viewer.
            
            Next, check the user's query:
                1.If the user specifies the number, type, or difficulty of the questions, choose questions according to their requirements from first step.
                  --Specially when user want content, choose the number of Contents of the topics generated and saved in stage 1.
                2.If the user does not specify the type or difficulty, use the information from Stage 1 to choose what you consider the most optimal content from fisrt step.
                3.Use the language specified in the query (English or German).
                4.Make sure every quesion,answer and also content follow the standard format we request.
                5.Do not choose same questions in different query.
                
            
                
            ---
            
            ### **Formatting Rules:**
            
            1. **Strict JSON Compliance**:  
               - All questions' Back must follow the exact JSON structure specified for each type.  
               - Do not generate malformed JSON. Double-check for missing keys, misplaced commas, or structural errors. 
               - Do not generate invalid control character and anything beyond the format.
               - Don't add additional Markdown syntax in the generated text.
               - DO NOT add additional greeting or human response in the beginning or end of the response. Directly start with generated questions.
               - Do not generate "*" in the respmese.
               - Please DO NOT add addiontional blank line inside the question block based on the given format.
               - Avoid adding extra spaces, invalid symbols, or special characters that are not part of the JSON schema.
            
            2. **Consistency**:  
               - Every question must strictly adhere to its predefined format. Do not mix formats (e.g., avoid formatting numerical questions like free-text questions).  
               - Do not include additional Markdown syntax, blank lines, greetings, or commentary in the output.  
            
            
            
            ---
            
            ### **Output Format Example and Instructions**:
            The Content format should be:
            Content
                    Content
                    [Insert your difficulty level here]
                    [Insert your content filed here]
                    Content: [Insert your stem here]
                    Back:
                        {
                            "answers": [Do not need answers]
                        }
            Important guidelines of Content:
                1.Contents are generated in the first stage according to the main topics of the context.
                2.Contents is not a question type like free text,it's a summary of the knowledge.For example,"Data science is an interdisciplinary academic field
                that uses statistics, scientific computing, scientific methods, processing, scientific visualization, algorithms and
                systems to extract or extrapolate knowledge and insights from potentially noisy, structured, or unstructured data.".
                        
            
            The Question format should be:
                Question Type
                [Insert your difficulty level here]
                [Insert your question filed here]
                Question: [Insert your question here]
                Back: [generate options and answers in given JSON structure]
            
            
            Here is the format of each type of question,please only use the format:

                Single Choice (Should ONLY have ONE right choice):
                    Single Choice
                    [Insert your difficulty level here]
                    [Insert your question filed here]
                    Question: [Insert your question here]
                    Back:
                        {
                            "choices": [
                                {
                                "ix": 0,
                                "value": "[Option A content]",
                                "correct": true or false,
                                "feedback": "[Brief feedback for correct/incorrect answer]"
                                },
                                {
                                "ix": 1,
                                "value": "[Option B content]",
                                "correct": true or false,
                                "feedback": "[Brief feedback for correct/incorrect answer]"
                                },
                                {
                                "ix": 2,
                                "value": "[Option C content]",
                                "correct": true or false,
                                "feedback": "[Brief feedback for correct/incorrect answer]"
                                },
                                {
                                "ix": 3,
                                "value": "[Option D content]",
                                "correct": true or false
                                "feedback": "[Brief feedback for correct/incorrect answer]"
                                },
                                {
                                "ix": 4,
                                "value": "[Option E content]",
                                "correct": true or false,
                                "feedback": "[Brief feedback for correct/incorrect answer]"
                                }
                            ],
                            "displayMode": "LIST",
                            "hasSampleSolution": true,
                            "hasAnswerFeedbacks": true
                        }
                
                 Important guidelines of Single Choice question:
                 1. Each option should be indexed starting from 0
                 2. Only ONE option should have "correct": true
                 3. The correct answer should include a detailed explanatory feedback
                 4. Incorrect answers should have brief feedback
                 5. Always include the displayMode, hasSampleSolution, and hasAnswerFeedbacks fields
             
                Multiple Choices (Should have TWO or More right choices):
                    Multiple Choices
                    [Insert your difficulty level here]
                    [Insert your question filed here]
                    Question: [Insert your question here] 
                    Back:
                        {
                            "choices": [
                                {
                                "ix": 0,
                                "value": "[Option A content]",
                                "correct": true or false,
                                "feedback": "[Explanation of why this answer is correct/incorrect]"
                                },
                                {
                                "ix": 1,
                                "value": "[Option B content]",
                                "correct": true or false,
                                "feedback": "[Explanation of why this answer is correct/incorrect]"
                                },
                                {
                                "ix": 2,
                                "value": "[Option C content]",
                                "correct": true or false,
                                "feedback": "[Explanation of why this answer is correct/incorrect]"
                                },
                                {
                                "ix": 3,
                                "value": "[Option D content]",
                                "correct": true or false,
                                "feedback": "[Explanation of why this answer is correct/incorrect]"
                                },
                                {
                                "ix": 4,
                                "value": "[Option E content]",
                                "correct": true or false,
                                "feedback": "[Explanation of why this answer is correct/incorrect]"
                                }
                            ],
                            "displayMode": "LIST",
                            "hasSampleSolution": true,
                            "hasAnswerFeedbacks": true
                        }

  
                 Important guidelines:
                 1. Each option should be indexed starting from 0
                 2. Multiple options should have multiple "correct": true (at least 2 correct answers)
                 3. All answers (both correct and incorrect) should include detailed explanatory feedback
                 4. Always include the displayMode, hasSampleSolution, and hasAnswerFeedbacks fields
                
                Numerical:  
                    Numerical  
                    [Insert your difficulty level here]  
                    [Insert your question field here]  
                    Question: [Insert your question statement with an underline __ where the number should be filled in]  
                      (Example: We have 5 apples. If we give out __ apples, we have 2 apples left.)  
                    Back:  
                        {  
                            "unit": "[Unit of measurement, e.g., '%', '€', 'kg', or none '', etc.]",  
                            "accuracy": [Number of decimal places required, e.g., 2],  
                            "restrictions": {  
                                "max": [Maximum allowed value, broader than solutionRanges],  
                                "min": [Minimum allowed value, broader than solutionRanges]  
                            },  
                            "solutionRanges": [  
                                {  
                                    "max": [Upper bound for first valid range],  
                                    "min": [Lower bound for first valid range]  
                                }  
                            ],  
                            "hasSampleSolution": true,  
                            "hasAnswerFeedbacks": false,
                            "explanation": [Explan the way to the solution]
                        }  


            
                Kprim:
                    Kprim
                    [Insert your difficulty level here]
                    [Insert your question filed here]
                    Question: [Insert your stem here]   
                    Back:
                        {
                            "choices": [
                                {
                                "ix": 0,
                                "value": "[Statement A]",
                                "correct": true or false,
                                "feedback": "[Explanation for correct statements or explanation for incorrect ones]"
                                },
                                {
                                "ix": 1,
                                "value": "[Statement B]",
                                "correct": true or false,
                                "feedback": "[Explanation for correct statements or explanation for incorrect ones]"
                                },
                                {
                                "ix": 2,
                                "value": "[Statement C]",
                                "correct": true or false,
                                "feedback": "[Explanation for correct statements or explanation for incorrect ones]"
                                },
                                {
                                "ix": 3,
                                "value": "[Statement D]",
                                "correct": true or false,
                                "feedback": "[Explanation for correct statements or explanation for incorrect ones]"
                                }
                            ],
                            "displayMode": "LIST",
                            "hasSampleSolution": true,
                            "hasAnswerFeedbacks": true
                        }


                 Important features:
                 1. Each statement is independently true or false
                 2. All statements should be complete sentences that can be evaluated as true or false

                Free Text:
                    Free Text
                    [Insert your difficulty level here]
                    [Insert your question filed here]
                    Question: [Insert your question here]
                    Back:
                        {
                            "answers": [Do not need answers]
                            "explanation": [Explan the way to the solution]
                        }

                 
                Flashcard:
                    Flashcard
                    [Insert your difficulty level here]
                    [Insert your question filed here]
                    Question: [Insert your question here]
                    Back:
                        {
                            "explanation": [insert right answer here]
                        }
                
            
                Here is a example for the format:
                Flashcard
                Medium
                Perceptron
                Question: "What is the activation function used in a perceptron?",
                Back: {
                        "explanation": ["Sign function"]
                      }
                      
                Here are some good examples for the generated content based on deep learning lecture note:
                Single Choice
                Medium
                Perceptron with Bias
                Question: Why is a bias included in the Perceptron model?
                Back:
                {
                    "choices": [
                        {
                            "ix": 0,
                            "value": "To control the importance of each feature.",
                            "correct": false,
                            "feedback": "Incorrect. The weights control the importance of each feature."
                        },
                        {
                            "ix": 1,
                            "value": "To allow the decision boundary to be shifted away from the origin.",
                            "correct": true,
                            "feedback": "Correct. The bias term allows the decision boundary to be shifted away from the origin."
                        },
                        {
                            "ix": 2,
                            "value": "To influence the learning rate.",
                            "correct": false,
                            "feedback": "Incorrect. The learning rate is usually controlled by a hyperparameter and not by the bias."
                        },
                        {
                            "ix": 3,
                            "value": "To increase model complexity.",
                            "correct": false,
                            "feedback": "Incorrect. While the bias term does add a parameter to the model, its primary purpose is to shift the decision boundary."
                        },
                        {
                            "ix": 4,
                            "value": "To increase the number of epochs for convergence.",
                            "correct": false,
                            "feedback": "Incorrect. The number of epochs for convergence is typically influenced by the dataset and the learning rate, not the bias."
                        }
                    ],
                    "displayMode": "LIST",
                    "hasSampleSolution": true,
                    "hasAnswerFeedbacks": true
                }

                
                
                Here are some bad examples for the generated content:
                Flashcard
                Easy
                Details of Lecture
                Question: Where can slides for this lecture be found?
                Back:{
                        "explanation": "Slides are available on OLAT."
                     }
                        
                Flashcard
                Easy
                Perceptron
                Question: Who are the two primary figures associated with the development of the perceptron?
                Back:
                {
                    "explanation": "Widrow & Hoff (1960) and Rosenblatt (1962)."
                }
                
                Single Choice
                Easy
                Biological Neurons
                Question: Which part of the biological neuron is responsible for collecting incoming voltage?
                Back:
                {
                    "choices": [
                        {
                            "ix": 0,
                            "value": "Axon",
                            "correct": false,
                            "feedback": "Incorrect. The axon's role is to send the signal to other neurons."
                        },
                        {
                            "ix": 1,
                            "value": "Dendrite",
                            "correct": true,
                            "feedback": "Correct. Dendrites are the structures that collect incoming voltage from other neurons."
                        },
                        {
                            "ix": 2,
                            "value": "Soma",
                            "correct": false,
                            "feedback": "Incorrect. The soma processes incoming signals but does not collect them."
                        },
                        {
                            "ix": 3,
                            "value": "Synapses",
                            "correct": false,
                            "feedback": "Incorrect. Synapses are the junctions between neurons where neurotransmitters are released."
                        }
                    ],
                    "displayMode": "LIST",
                    "hasSampleSolution": true,
                    "hasAnswerFeedbacks": true
                }

                
             {% for doc in documents %}
                     {{ doc.content }}
                 {% endfor %}

                 \nQuestion: {{question}}
                 \nAnswer:
        """
        self.prompt_builder = PromptBuilder(template=self.templete)
        self.answer_builder = AnswerBuilder()
        
    def init(self):
        # Add components to your pipeline
        # self.rag_pipeline.add_component("tracer", self.tracer)
        self.rag_pipeline.add_component("text_embedder", self.text_embedder)
        self.rag_pipeline.add_component("retriever", self.retriever)
        self.rag_pipeline.add_component("prompt_builder", self.prompt_builder)
        self.rag_pipeline.add_component("llm", self.generator)
        self.rag_pipeline.add_component("answer_builder", self.answer_builder)

        # Now, connect the components to each other
        self.rag_pipeline.connect("text_embedder.embedding", "retriever.query_embedding")
        self.rag_pipeline.connect("retriever", "prompt_builder.documents")
        self.rag_pipeline.connect("prompt_builder", "llm")
        self.rag_pipeline.connect("llm.replies", "answer_builder.replies")
        self.rag_pipeline.connect("llm.meta", "answer_builder.meta")
        self.rag_pipeline.connect("retriever", "answer_builder.documents")
    
    def run_agent(self, question_number, language, difficulty_level, question_type):
        question =f"Please generate {question_number} {question_type} questions, the difficulty of the questions is {difficulty_level}, and the question language is {language}."
        response = self.rag_pipeline.run({
            "text_embedder": {"text": question}, 
            "prompt_builder": {"question": question}, 
            "answer_builder": {"query": question}})
        
        return response
    
    

# # def run_agent(pipeline,question):

# #     response = pipeline.run(
# #         {"text_embedder": {"text": question},
# #          "prompt_builder": {"question": question},
# #          "answer_builder": {"query": question},
# #          })
# #     return response

# if __name__ == "__main__":
#     input_doc = "apps/ai/tmp/test-doc.pdf"
#     preprocess = PreProcess()
#     preprocess.init()
#     print('preprocess init')
#     retriever = preprocess.run_preprocess(input_doc)
#     print('retriever init')
#     agent = Agent(retriever=retriever)
#     agent.init()
#     response = agent.run_agent(5, "English")
#     generated_text = response['answer_builder']['answers'][0].data

# #     with open('generate.txt', 'w') as f:
# #         f.write(generated_text)
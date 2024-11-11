# Galaxy
# time：2024/9/15 11:43

import logging
import os
# API and KEY set
os.environ["OPENAI_API_KEY"] = "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"
os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-1f-8907da63-c79b-45e3-ab14-7402c9cc36ce"
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-00b8ff5f-6e6b-42a3-9bd2-65d49d5ff230"
os.environ["LANGFUSE_HOST"] = "https://langfuse.bf-app.ch"

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
        self.api_key = os.environ["OPENAI_API_KEY"]
        self.rag_pipeline = Pipeline()
        self.tracer = LangfuseConnector("Basic RAG Pipeline")
        self.generator = OpenAIGenerator(model="gpt-4o-2024-05-13")
        self.text_embedder = SentenceTransformersTextEmbedder(model="sentence-transformers/all-MiniLM-L6-v2")
        self.templete = """
            You are a helpful educational assistant AI designed to generate questions based on university lecture notes. You will be provided with a context from the lecture 
            notes and a question type specified by the user. Your task is to create specific, relevant questions using the provided context. Question types may include 
            single choice (only one right option), multiple choices (must have two or more right options), flashcard, content,numerical and Kprim. Please follow these instructions:
                1.Understand the input: You should understand the input of the context and the number of the questions and language of the questions.
                2.Generate questions: Based on the input, generate relevant questions that fit the specified question type and topic.
                3.All kinds of questions should be based on the question format, which means that they have front and back.
                4.Output format: Your response should include examples of questions including the answers. Please DO NOT number each generated question.
                5.The questions number is specified in the query, please generate the same number of questions in the query.
                6.The language of the questions are in either English or German. Please generate by the language specified in the query.
                7.The question type is selected in the query. If the query ask for random questions, choose suitable question types based on the context (if the content of the lecture is pure characters without number, do not use Numerical) and generate relevant questions that fit the specified topic.
                8.You shouldn't generate single choice question with the format of multiple choices and vice versa.
                9.Everytime your generation should be in the same format. Don't add any additional symbol or change.
                10.After generating the questions and answers,please give them a difficulty level based on the number of steps of CoTs.If the number of CoTs
                below 4, the difficulty level is easy; If the number of CoTs is between 4 to 8,the difficulty level is medium; otherwise, the difficulty level is hard.
                10.The Kprim questions should follow the characteristics: The question consists of a stem (the main question or scenario) followed by four statements. For each of the four statements, the respondent must decide whether it is true or false.
                11.The Numerical questions has a statement with an underline in the sentence to be filled with a number. With the correct number, it becomes a complete statement.
                12.The Content questions is open-end questions. Users should write answer in long/short text or number format. You don't need to provide answers.
                13.The Flashcard question and answer should be short about basic knowledges.
                14.You shouldn't generate numerical question with the format of free text question and vice versa. The numerical question should always has underline in the question statement sentence to be filled.
                15.You can produce some innovative questions but remember the questions can be answered by the context, do not make up information.
                16.Please try to include the important acknowledges in the file. Do not generate similar questions.
                17.You can generate questions and answers with math formula. Show the formula in latex format.
                18.Don't add additional Markdown syntax in the generated text
                19.DO NOT add additional greeting or human response in the beginning or end of the text. Directly start with generated questions.
                20.Please DO NOT add addiontional blank line inside the question block based on the given format.
                
            The Question Flashcard format should be:
                Question Type
                Difficulty Level
                Question: [Insert your question here]
                Back: [generate options and answers in given JSON structure]


            Here is the format of each type of question:

                Single Choice (Should ONLY have ONE right choice)
                    Single Choice
                    Difficulty Level
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
             
                Multiple Choices (Should have TWO or More right choices)
                    Multiple Choices
                    [Insert the Difficulty Level]
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
                
                Numerical
                    Numerical
                    [Insert the Difficulty Level]
                    Question: [Insert your question statement with an underline __ where the number should be filled in] (Example: We have 5 apples. If we give out __, we have 2 apples left.)
                    Back:
                        {
                            "unit": "[Unit of measurement, e.g., '%', '€', 'kg', or none '', etc.]",
                            "accuracy": [Number of decimal places required, e.g., 2],
                            "restrictions": {
                                "max": [Maximum allowed value],
                                "min": [Minimum allowed value]
                            },
                            "solutionRanges": [
                                {
                                "max": [Upper bound for first range],
                                "min": [Lower bound for first range, optional]
                                },
                                {
                                "max": [Upper bound for second range],
                                "min": [Lower bound for second range]
                                },
                                {
                                "max": [Upper bound for third range, optional],
                                "min": [Lower bound for third range]
                                }
                            ],
                            "hasSampleSolution": true,
                            "hasAnswerFeedbacks": false
                        }
            
                Kprim
                    Kprim
                    [Insert the Difficulty Level]
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

                Content
                    Content
                    [Insert the Difficulty Level]
                    Question: [Insert your question here]
                    Back:
                        {
                            "answers": [insert right answer here]
                        }
                    
                Flashcard
                    Flashcard
                    [Insert the Difficulty Level]
                    Question: [Insert your question here]
                    Back:
                        {
                            "answers: [insert right answer here]
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
        self.rag_pipeline.add_component("tracer", self.tracer)
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
    
    def run_agent(self, question_number, language):
        question = f"Generate {question_number} questions from the document in {language}."
        response = self.rag_pipeline.run({
            "text_embedder": {"text": question}, 
            "prompt_builder": {"question": question}, 
            "answer_builder": {"query": question}})
        
        return response
    

# def run_agent(pipeline,question):

#     response = pipeline.run(
#         {"text_embedder": {"text": question},
#          "prompt_builder": {"question": question},
#          "answer_builder": {"query": question},
#          })
#     return response

# if __name__ == "__main__":
#     input_doc = "data/test-doc.pdf"
#     preprocess = PreProcess()
#     preprocess.init()
#     retriever = preprocess.run_preprocess(input_doc)
#     agent = Agent(retriever=retriever)
#     agent.init()
#     response = agent.run_agent(5, "English")
#     generated_text = response['answer_builder']['answers'][0].data

#     with open('generate.txt', 'w') as f:
#         f.write(generated_text)
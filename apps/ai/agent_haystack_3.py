# # Galaxy
# # time：2024/9/15 11:43

import logging
import os

# API and KEY set
import subprocess
import re
import json
# import litellm
# from litellm import completion
from litellm import LiteLLM
from haystack import component
# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
# LLAMA_API_KEY= os.getenv("LLAMA_API_KEY")
# GIMINI_APT_KEY=os.getenv("GIMINI_APT_KEY")

# os.environ["LANGFUSE_PUBLIC_KEY"] = ""
# os.environ["LANGFUSE_SECRET_KEY"] = ""
os.environ["LANGFUSE_HOST"] = "https://cloud.langfuse.com"  # 🇪🇺 EU region

# Enable Haystack content tracing
os.environ["HAYSTACK_CONTENT_TRACING _ENABLED"] = "True"

from pathlib import Path
from getpass import getpass
from haystack import Pipeline, Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.converters import PyPDFToDocument
from haystack.components.routers import FileTypeRouter
from haystack.components.preprocessors import DocumentSplitter, DocumentCleaner
from haystack.components.writers import DocumentWriter
from haystack.components.joiners import DocumentJoiner
from haystack.components.embedders import (
    SentenceTransformersDocumentEmbedder,
    SentenceTransformersTextEmbedder,
)
from haystack.components.generators import OpenAIGenerator, HuggingFaceAPIGenerator
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.components.builders import PromptBuilder, AnswerBuilder
from haystack_integrations.components.connectors.langfuse import LangfuseConnector
from haystack_integrations.components.generators.anthropic import AnthropicGenerator
from haystack_integrations.components.generators.google_ai import (
    GoogleAIGeminiGenerator,
)
from haystack.components.retrievers.in_memory import InMemoryBM25Retriever


@component
class LiteLLMComponent:
    """
    A component to dynamically manage multiple models using litellm.
    """

    def __init__(self):
        """
        Initializes LiteLLMComponent with model configurations.
        """
        self.models = {
            "OpenAI": {
                "api_key_env": "OPENAI_API_KEY",
                "litellm_params": {
                    "model": "gpt-4o-2024-11-20"  # Model for OpenAI
                }
            },
            "Anthropic": {
                "api_key_env": "ANTHROPIC_API_KEY",
                "litellm_params": {
                    "model": "claude-3-haiku-20240307"  # Model for Anthropic
                }
            },
            "Llama": {
                "api_key_env": "LLAMA_API_KEY",
                "litellm_params": {
                    "model": "llama-2-13b-chat"  # Model for Llama
                }
            }
        }

    def get_generator(self, model: str):
        """
        Dynamically selects and initializes the appropriate litellm model.

        :param model: The model type to use (e.g., "OpenAI", "Anthropic", "Llama").
        :return: The litellm generator instance.
        """
        if model not in self.models:
            raise ValueError(f"Model '{model}' not supported. Available models: {list(self.models.keys())}")

        model_config = self.models[model]
        api_key = os.getenv(model_config["api_key_env"])
        if not api_key:
            raise EnvironmentError(f"API key for {model} not found in environment variable '{model_config['api_key_env']}'.")

        # Initialize LiteLLM without passing the model parameter to the constructor
        generator = LiteLLM()

        # Use the model parameter when calling the completion method
        generator.model = model_config["litellm_params"]["model"]
        generator.api_key = api_key

        return generator

    def run(self, model: str):
        """
        Run method required by Haystack component.

        :param model: The model type to use (e.g., "OpenAI", "Anthropic", "Llama").
        :return: The litellm generator instance.
        """
        return self.get_generator(model)
    
class PreProcess:
    def __init__(self):
        self.preprocess_pipeline = Pipeline()
        self.document_store = InMemoryDocumentStore()
        self.file_type_router = FileTypeRouter(mime_types=["application/pdf"])
        self.pdf_converter = PyPDFToDocument()
        self.document_joiner = DocumentJoiner()
        self.document_cleaner = DocumentCleaner()
        self.document_splitter = DocumentSplitter(split_by="page")
        self.doc_embedder = SentenceTransformersDocumentEmbedder(
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.doc_writer = DocumentWriter(self.document_store)
        self.retriever = None

    def init(self):
        self.preprocess_pipeline.add_component(
            instance=self.file_type_router, name="file_type_router"
        )
        self.preprocess_pipeline.add_component(
            instance=self.pdf_converter, name="pypdf_converter"
        )
        self.preprocess_pipeline.add_component(
            instance=self.document_joiner, name="document_joiner"
        )
        self.preprocess_pipeline.add_component(
            instance=self.document_cleaner, name="document_cleaner"
        )
        self.preprocess_pipeline.add_component(
            instance=self.document_splitter, name="document_splitter"
        )
        self.preprocess_pipeline.add_component(
            instance=self.doc_embedder, name="document_embedder"
        )
        self.preprocess_pipeline.add_component(
            instance=self.doc_writer, name="document_writer"
        )
        self.preprocess_pipeline.connect(
            "file_type_router.application/pdf", "pypdf_converter.sources"
        )
        self.preprocess_pipeline.connect("pypdf_converter", "document_joiner")
        self.preprocess_pipeline.connect("document_joiner", "document_cleaner")
        self.preprocess_pipeline.connect("document_cleaner", "document_splitter")
        self.preprocess_pipeline.connect("document_splitter", "document_embedder")
        self.preprocess_pipeline.connect("document_embedder", "document_writer")

    def run_preprocess(self, doc_path):
        doc_path = Path(doc_path)
        self.preprocess_pipeline.run(
            {"file_type_router": {"sources": [doc_path]}},
            include_outputs_from=["document_splitter"],
        )
        self.retriever = InMemoryEmbeddingRetriever(self.document_store)
        return self.retriever


def extract_questions(context, num, generated_content):
    context = re.sub(r"```json|```", "", context).strip()
    context = re.sub(r"\*", "", context).strip()
    context = context.replace("\\", "\\\\")
    #     print(context)
    parts = re.split(r"\n\s*\n", context)
    print(len(parts))
    if len(parts) == num + 1:
        parts = parts[1:]

    for part in parts:
        base_part = part.split("Back:")[0].strip()
        base_part = json.loads(base_part)
        generated_content += (
            f"\n{base_part.get("content") or base_part.get("question")}"
        )
    return generated_content


class Agent_stage1:
    def __init__(self, retriever, model, template):
        # Openai API Key
        self.retriever = retriever
        self.api_key = os.environ["OPENAI_API_KEY"]
        self.rag_pipeline = Pipeline()
        self.tracer = LangfuseConnector("Basic RAG Pipeline")

        self.model = model
        self.llm_component = LiteLLMComponent()
        result = component.run(model=model)
        # self.api_key = result["api_key"]
        self.generator = self.get_generator()


        self.text_embedder = SentenceTransformersTextEmbedder(
            model="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.template = template
        self.prompt_builder = PromptBuilder(template=self.template)
        self.answer_builder = AnswerBuilder()

    def get_generator(self):
        """
        Get the LiteLLM generator instance based on the model name.
        """
        return self.llm_component.run(self.model_name)

    def init(self):
        # Add components to your pipeline
        self.rag_pipeline.add_component("tracer", self.tracer)
        self.rag_pipeline.add_component("text_embedder", self.text_embedder)
        self.rag_pipeline.add_component("retriever", self.retriever)
        self.rag_pipeline.add_component("prompt_builder", self.prompt_builder)
        self.rag_pipeline.add_component("llm", self.generator)
        self.rag_pipeline.add_component("answer_builder", self.answer_builder)

        # Now, connect the components to each other
        self.rag_pipeline.connect(
            "text_embedder.embedding", "retriever.query_embedding"
        )
        self.rag_pipeline.connect("retriever", "prompt_builder.documents")
        self.rag_pipeline.connect("prompt_builder", "llm")
        self.rag_pipeline.connect("llm.replies", "answer_builder.replies")
        self.rag_pipeline.connect("llm.meta", "answer_builder.meta")
        self.rag_pipeline.connect("retriever", "answer_builder.documents")

    def run_agent(self):
        question = f"Please generate key points and all related original context according to the input document."
        #         generation_kwargs = {"max_tokens": 4096}
        response = self.rag_pipeline.run(
            {
                "text_embedder": {"text": question},
                "prompt_builder": {"question": question},
                #             "llm": {"generation_kwargs": generation_kwargs},
                "answer_builder": {"query": question},
            }
        )
        return response



class Agent_stage2:
    def __init__(self, retriever, model, template):
        # Openai API Key
        self.document_store = InMemoryDocumentStore()
        self.documents = [
            Document(
                content=retriever,
                meta={"source": "Generated Content"},
                id="generated_1",
            )
        ]
        self.document_store.write_documents(documents=self.documents)
        self.retriever = InMemoryBM25Retriever(document_store=self.document_store)
        self.api_key = os.environ["OPENAI_API_KEY"]
        self.rag_pipeline = Pipeline()
        self.tracer = LangfuseConnector("Basic RAG Pipeline")

        self.model = model
        self.llm_component = LiteLLMComponent()
        result = component.run(model=model)
        # self.api_key = result["api_key"]
        self.generator = self.get_generator()


        self.generated_content = ""
        self.template = template
        self.prompt_builder = PromptBuilder(template=self.template)
        self.answer_builder = AnswerBuilder()

    def get_generator(self):
        """
        Get the LiteLLM generator instance based on the model name.
        """
        return self.llm_component.run(self.model_name)

    def init(self):
        # Add components to your pipeline
        self.rag_pipeline.add_component("tracer", self.tracer)
        self.rag_pipeline.add_component("retriever", self.retriever)
        self.rag_pipeline.add_component("prompt_builder", self.prompt_builder)
        self.rag_pipeline.add_component("llm", self.generator)
        self.rag_pipeline.add_component("answer_builder", self.answer_builder)

        # Now, connect the components to each other
        self.rag_pipeline.connect("retriever", "prompt_builder.documents")
        self.rag_pipeline.connect("prompt_builder", "llm")
        self.rag_pipeline.connect("llm.replies", "answer_builder.replies")
        self.rag_pipeline.connect("llm.meta", "answer_builder.meta")
        self.rag_pipeline.connect("retriever", "answer_builder.documents")

    def run_agent(self, question_number, language, difficulty_level, question_type):
        question = f"Please generate {question_number} {question_type} questions, the difficulty of the questions is {difficulty_level}, and the question language is {language}."
        #         generation_kwargs = {"max_tokens": 4096}
        response = self.rag_pipeline.run(
            {
                "retriever": {"query": question},
                "prompt_builder": {
                    "question": question,
                    "generated_content": self.generated_content,
                },
                #             "llm": {"generation_kwargs": generation_kwargs},
                "answer_builder": {"query": question},
            }
        )
        self.generated_content = extract_questions(
            response["answer_builder"]["answers"][0].data,
            question_number,
            self.generated_content,
        )
        #         print(self.generated_content)
        return response

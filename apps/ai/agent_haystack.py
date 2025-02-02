# # Galaxy
# # time：2024/9/15 11:43

import logging
import os
import hashlib
import time
import threading

# API and KEY set
import subprocess
import re
import json
import redis

# from litellm import completion
# from litellm import LiteLLM
from haystack import component

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
# LLAMA_API_KEY= os.getenv("LLAMA_API_KEY")
# GIMINI_APT_KEY=os.getenv("GIMINI_APT_KEY")

# os.environ["LANGFUSE_PUBLIC_KEY"] = ""
# os.environ["LANGFUSE_SECRET_KEY"] = ""
os.environ["LANGFUSE_HOST"] = "https://cloud.langfuse.com"  # 🇪🇺 EU region

# Enable Haystack content tracing
os.environ["HAYSTACK_CONTENT_TRACING_ENABLED"] = "True"

from pathlib import Path
from getpass import getpass
import threading
from docling.datamodel.base_models import InputFormat, DocumentStream
from docling.pipeline.simple_pipeline import SimplePipeline
from docling.datamodel.pipeline_options import PdfPipelineOptions, TableFormerMode
from docling.document_converter import (
    DocumentConverter,
    PdfFormatOption,
    WordFormatOption,
    PowerpointFormatOption,
)
from docling.datamodel.document import ConversionResult
from docling_core.transforms.chunker import HierarchicalChunker

# from docling_core.transforms.chunker import hierarchical_chunker
from docling_core.transforms.chunker.base import BaseChunk
from haystack import Pipeline, Document
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.document_stores.types import DuplicatePolicy
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
from haystack.components.retrievers.in_memory import (
    InMemoryEmbeddingRetriever,
    InMemoryBM25Retriever,
)
from haystack.components.builders import PromptBuilder, AnswerBuilder
from haystack_integrations.components.connectors.langfuse import LangfuseConnector
from haystack_integrations.components.generators.anthropic import AnthropicGenerator
from haystack_integrations.components.generators.google_ai import (
    GoogleAIGeminiGenerator,
)

# from haystack_experimental.chat_message_stores.in_memory import InMemoryChatMessageStore
# from haystack_experimental.components.retrievers import ChatMessageRetriever
# from haystack_experimental.components.writers import ChatMessageWriter

# redis_cache = redis.Redis(host="redis_cache", port=6379, db=0)
redis_cache_host = os.getenv("REDIS_CACHE_HOST")
redis_cache_port = int(os.getenv("REDIS_CACHE_PORT"))
redis_cache_pass = os.getenv("REDIS_CACHE_PASS")
redis_cache_ssl = os.getenv("REDIS_CACHE_TLS", "").lower() == "true"


redis_cache = redis.Redis(
    host=redis_cache_host,
    port=redis_cache_port,
    password=redis_cache_pass,
    ssl=redis_cache_ssl,
)

redis_cache.ping()


class DocumentStore:
    def __init__(self, filename):
        self.filename = filename
        self.document_store = InMemoryDocumentStore(index=filename)
        self.start_time = time.time()
        self.check_interval = 30  # Check every 30s
        # # Init a timer
        self._start_timer()

    def get_store(self):
        return self.document_store

    def _start_timer(self):
        # Periodically check if n minutes have passed at self.check_interval
        timer = threading.Timer(self.check_interval, self._check_time)
        timer.start()

    def _check_time(self):
        # Calculate the time difference
        elapsed_time = time.time() - self.start_time
        if elapsed_time > 30 * 60:  # n mintues (n * 60)
            self.delete()
        else:
            self._start_timer()

    def delete(self):
        ids = redis_cache.lrange("document_id", 0, -1)
        ids = [i_d.decode("utf-8") for i_d in ids]
        logging.info(f"Deleting {len(ids)} documents from {self.filename}")
        self.document_store.delete_documents(ids)
        self.document_store.delete_documents(["agent_cache"])
        delete_pipe = redis_cache.pipeline()
        delete_pipe.set("document_store", 0)
        delete_pipe.set("agent_status", 0)
        delete_pipe.delete("filename")
        delete_pipe.delete("document_id")
        delete_pipe.execute()
        remaining = self.document_store.count_documents()
        logging.info(f"Deleted, {remaining} docuemnts remained from document store")


class Converter:
    def __init__(self, buf, filename, document_store):
        self.buf = buf
        self.filename = filename
        self.document_store = document_store

    def convert(self):
        doc = DocumentStream(name=self.filename, stream=self.buf)
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = False
        pipeline_options.do_table_structure = True
        pipeline_options.table_structure_options.do_cell_matching = True
        doc_converter = DocumentConverter(
            allowed_formats=[
                InputFormat.PDF,
                InputFormat.DOCX,
                InputFormat.PPTX,
            ],
            format_options={
                InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options),
                InputFormat.DOCX: WordFormatOption(pipeline_cls=SimplePipeline),
                InputFormat.PPTX: PowerpointFormatOption(pipeline_cls=SimplePipeline),
            },
        )
        convert_doc: ConversionResult = doc_converter.convert(doc)
        convert_doc = convert_doc.document

        chunks = list(HierarchicalChunker().chunk(convert_doc))
        documents = []
        ids = []
        for chunk in chunks:
            chunk_id = hashlib.sha256((chunk.text).encode("utf-8")).hexdigest()
            documents.append(Document(content=chunk.text, id=chunk_id))
            ids.append(chunk_id)
        self.document_store.write_documents(
            documents=documents, policy=DuplicatePolicy.SKIP
        )
        return ids


def extract_questions(context, num, generated_content):
    context = re.sub(r"```json|```", "", context).strip()
    context = re.sub(r"\*", "", context).strip()
    # context = context.replace("\\", "\\\\")
    #     print(context)
    parts = re.split(r"\n\s*\n", context)
    if len(parts) >= num + 1:
        parts = parts[len(parts) - num :]

    for part in parts:
        base_part = part.split("Back:")[0].strip()
        base_part = json.loads(base_part)
        generated_content += (
            f"\n{base_part.get("content") or base_part.get("question")}"
        )
    return generated_content


class Agent_stage1:
    def __init__(self, template):
        # Openai API Key
        # self.api_key = os.environ["OPENAI_API_KEY"]
        # elif model=='Llama':
        #     self.api_key = os.getenv("LLAMA_API_KEY")
        #     self.generator = HuggingFaceAPIGenerator(api_type="text_generation_inference", api_params={"model_name": "meta-llama/Meta-Llama-3-8B"})
        # else:
        #     self.api_key = os.getenv("TOGETHER_API_KEY")
        #     self.generator = GoogleAIGeminiGenerator(model="gemma-2-9b-it")
        # self.text_embedder = SentenceTransformersTextEmbedder(
        #     model="sentence-transformers/all-MiniLM-L6-v2"
        # )
        self.template = template

    def init(self, filename, model):
        # Add components to your pipeline
        # self.tracer = LangfuseConnector("Basic RAG Pipeline")
        self.document_store = InMemoryDocumentStore(index=filename)
        self.retriever = InMemoryBM25Retriever(document_store=self.document_store)
        if model == "OpenAI":
            # load_openai_api_key()
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.generator = OpenAIGenerator(model="gpt-4o-2024-11-20")
        else:
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            self.generator = AnthropicGenerator(model="claude-3-5-sonnet-20241022")
        self.prompt_builder = PromptBuilder(template=self.template)
        self.answer_builder = AnswerBuilder()
        self.rag_pipeline = Pipeline()

        # self.rag_pipeline.add_component("tracer", self.tracer)
        # self.rag_pipeline.add_component("text_embedder", self.text_embedder)
        self.rag_pipeline.add_component("retriever", self.retriever)
        self.rag_pipeline.add_component("prompt_builder", self.prompt_builder)
        self.rag_pipeline.add_component("llm", self.generator)
        self.rag_pipeline.add_component("answer_builder", self.answer_builder)

        # Now, connect the components to each other
        # self.rag_pipeline.connect(
        #     "text_embedder.embedding", "retriever.query_embedding"
        # )
        self.rag_pipeline.connect("retriever", "prompt_builder.documents")
        self.rag_pipeline.connect("prompt_builder", "llm")
        self.rag_pipeline.connect("llm.replies", "answer_builder.replies")
        self.rag_pipeline.connect("llm.meta", "answer_builder.meta")
        self.rag_pipeline.connect("retriever", "answer_builder.documents")

    def run_agent(self):
        question = f"Please generate key points and all related original context according to the input document."
        generation_kwargs = {"max_tokens": 4096}
        response = self.rag_pipeline.run(
            {
                "retriever": {"query": question},
                # "text_embedder": {"text": question},
                "prompt_builder": {"question": question},
                "llm": {"generation_kwargs": generation_kwargs},
                "answer_builder": {"query": question},
            }
        )
        return response


class Agent_stage2:
    def __init__(self, template):
        # self.api_key = os.environ["OPENAI_API_KEY"]

        self.template = template
        # Memory components
        # self.memory_store = InMemoryChatMessageStore()
        # self.memory_retriever = ChatMessageRetriever(memory_store)
        # self.memory_writer = ChatMessageWriter(memory_store)

    def init(self, filename, agent_one_content, model):
        # Openai API Key
        self.rag_pipeline = Pipeline()
        self.document_store = InMemoryDocumentStore(index=filename)
        self.documents = [
            Document(
                content=agent_one_content,
                meta={"source": "Generated Content"},
                id="agent_cache",
            )
        ]
        self.document_store.write_documents(
            documents=self.documents, policy=DuplicatePolicy.SKIP
        )
        self.retriever = InMemoryBM25Retriever(document_store=self.document_store)
        if model == "OpenAI":
            # load_openai_api_key()
            self.api_key = os.getenv("OPENAI_API_KEY")
            self.generator = OpenAIGenerator(model="gpt-4o-2024-11-20")
        else:
            self.api_key = os.getenv("ANTHROPIC_API_KEY")
            self.generator = AnthropicGenerator(model="claude-3-5-sonnet-20241022")
        # elif model=='Llama':
        #     self.api_key = os.getenv("LLAMA_API_KEY")
        #     self.generator = HuggingFaceAPIGenerator(api_type="text_generation_inference", api_params={"model_name": "meta-llama/Meta-Llama-3-8B"})
        # else:
        #     self.api_key = os.getenv("TOGETHER_API_KEY")
        #     self.generator = GoogleAIGeminiGenerator(model="gemma-2-9b-it")
        self.tracer = LangfuseConnector("Basic RAG Pipeline")
        self.generated_content = ""
        self.prompt_builder = PromptBuilder(template=self.template)
        self.answer_builder = AnswerBuilder()

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
        generation_kwargs = {"max_tokens": 4096}
        response = self.rag_pipeline.run(
            {
                "retriever": {"query": question},
                "prompt_builder": {
                    "question": question,
                    "generated_content": self.generated_content,
                },
                "llm": {"generation_kwargs": generation_kwargs},
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

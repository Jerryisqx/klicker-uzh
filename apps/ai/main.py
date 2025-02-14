from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import random
import logging
import re
import os
import json
import uuid
import redis
from io import BytesIO
from datetime import datetime
from agent_haystack import Agent_stage1, Agent_stage2, DocumentStore, Converter
from prisma import Prisma
import asyncio
from datetime import timedelta
import hashlib
import base64
import traceback
from parse_questions import parse_question

# os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
logging.basicConfig(level=logging.INFO)
app = FastAPI()
# database_url = os.getenv("DATABASE_URL_1")
# Initialize Prisma client
db = Prisma()
# os.environ["DATABASE_URL"] = database_url
db.connect()
# CORS configuration: allowing cross-domain requests from the front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitted sources
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

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

# redis_cache = redis.Redis(host="redis_cache", port=6379)
# redis_cache = redis.Redis(host=REDIS_CACHE_HOST, port=REDIS_CACHE_PORT, password=REDIS_CACHE_PASS)


# Define the request model for generating questions
class GenerateQuestionsRequest(BaseModel):
    limit: int
    language: str
    type: str
    difficulty: str
    model: str

    # @field_validator("language")
    # def validate_language(cls, value):
    #     allowed_languages = {"English", "German"}
    #     if value not in allowed_languages:
    #         raise ValueError(
    #             f"Invalid Languages: {value}, Language must be one of {allowed_languages}"
    #         )
    #     return value

    # @field_validator("type")
    # def validate_type(cls, value):
    #     allowed_types = {
    #         "Single Choice",
    #         "Multiple Choices",
    #         "Numerical",
    #         "Free Text",
    #         "Kprim",
    #         "Flashcard",
    #         "Content",
    #     }
    #     if value not in allowed_types:
    #         raise ValueError(
    #             f"Invalid Types: {value}, Type must be one of {allowed_types}"
    #         )
    #     return value

    # @field_validator("difficulty")
    # def validate_difficulty(cls, value):
    #     allowed_difficulties = {"EASY", "MEDIUM", "HARD"}
    #     if value not in allowed_difficulties:
    #         raise ValueError(
    #             f"Invalid Difficulty: {value}, Difficulty must be one of {allowed_difficulties}"
    #         )
    #     return value

    # @field_validator("model")
    # def validate_model(cls, value):
    #     allowed_models = {"OpenAI", "Claude", "Gemini", "Llama"}
    #     if value not in allowed_models:
    #         raise ValueError(
    #             f"Invalid Model: {value}, Model must be one of {allowed_models}"
    #         )
    #     return value


class FileUploadRequest(BaseModel):
    file: str
    filename: str


# Function to validate file type
def validate_file_type(file: UploadFile):
    allowed_extensions = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    }
    if file.content_type not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed types are: PDF, DOCX, PPTX.",
        )


def map_question_type(generated_type):
    type_mapping = {
        "Single Choice": "SC",
        "Multiple Choices": "MC",
        "Numerical": "NUMERICAL",
        "Free Text": "FREE_TEXT",
        "Kprim": "KPRIM",
        "Flashcard": "FLASHCARD",
    }
    return type_mapping.get(
        generated_type, "CONTENT"
    )  # Default to CONTENT if type not found


def map_difficulty_level(difficulty_level):
    difficulty_map = {"EASY": "EASY", "MEDIUM": "MEDIUM", "HARD": "HARD"}
    return difficulty_map.get(difficulty_level, "EASY")


async def insert_questions_to_db(questions):
    try:
        for question in questions:
            db.elementgenerated.create(
                data={
                    "content": question["question"],
                    "options": json.dumps(question["options"]),
                    "type": map_question_type(question["type"]),
                    "name": question["name"],
                    "ownerId": str(uuid.UUID("76047345-3801-4628-ae7b-adbebcfe8821")),
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now(),
                    "difficulty": question["difficulty"],
                    "explanation": (
                        question["options"]
                        .get("explanation", "")
                        .split("'explanation':")[-1]
                        if "explanation" in question["options"]
                        else ""
                    )
                    .replace("\r", "\\r")
                    .replace("\n", ""),
                }
            )
        logging.info(
            f"Successfully inserted {len(questions)} questions into the database."
        )
    except Exception as e:
        logging.error(f"Error inserting questions into the database: {e}")
        raise


@app.post("/generate")
async def generate_questions(request: GenerateQuestionsRequest):
    questions_number = request.limit
    language = request.language
    type = request.type
    difficulty = request.difficulty
    model = request.model
    logging.info(
        f"User Config checked: {questions_number}, {language}, {type}, {difficulty}, {model}"
    )

    logging.info("Starting the question generation process...")

    # prompt_path1 = os.path.join(os.getcwd(), "stage1.txt")
    # prompt_path2 = os.path.join(os.getcwd(), "stage2.txt")
    # with open(prompt_path1, "r", encoding="utf-8") as file:
    #     stage1 = file.read()
    # with open(prompt_path2, "r", encoding="utf-8") as file:
    #     stage2 = file.read()

    MAX_RETRIES = 3
    retry_count = 0
    generated_text1 = None

    if redis_cache.exists("document_store") == 0:
        logging.error("Cached File are deleted, please upload new file again!")
        return {"error": "Cannot find document store."}
    elif int(redis_cache.get("agent_status")) == 0:
        filename = redis_cache.get("filename").decode("utf-8")
        logging.info("Initializing OpenAI generator and retriever...")
        while generated_text1 is None and retry_count < MAX_RETRIES:
            try:
                # agent1 = Agent_stage1(model=model, template=stage1, filename=filename)
                app.state.agent1.init(filename, model)
                logging.info(f"Running Agent_stage1 (attempt {retry_count + 1})...")
                response1 = app.state.agent1.run_agent()
                generated_text1 = response1["answer_builder"]["answers"][0].data
                if not generated_text1:
                    raise ValueError("Generated text1 is empty.")
                else:
                    logging.info(f"Generated text:\n{generated_text1}")
            except Exception as e:
                retry_count += 1
                logging.error(f"Error in generating text1: {e}")
                if retry_count < MAX_RETRIES:
                    logging.info("Retrying Agent_stage1...")
                else:
                    logging.error("Maximum retries reached for Agent_stage1.")
                    raise
        app.state.agent2.init(filename, generated_text1, model)
        redis_cache.set("agent_status", 1)
    else:
        logging.info("Agent for document already exists")

    generated_text2 = None
    # Retry logic
    MAX_RETRIES = 3
    retry_count = 0
    success = False

    while not success and retry_count < MAX_RETRIES:
        try:
            if generated_text2 is None:
                # If generate error,restart agent
                logging.info(f"Generating response (attempt {retry_count + 1})...")
                try:
                    response2 = app.state.agent2.run_agent(
                        questions_number, language, difficulty, type
                    )
                    generated_text2 = response2["answer_builder"]["answers"][0].data
                    logging.info(f"Generated text:\n{generated_text2}")
                    if not generated_text2:
                        raise ValueError("Generated text is empty.")
                    else:
                        logging.info(f"Generated text:\n{generated_text2}")
                except Exception as e:
                    logging.error(f"Error during generation: {e}")
                    raise

                    # format the output
            result = parse_question(generated_text2, questions_number)
            if isinstance(result, str) and result.startswith("Error"):
                logging.error(f"Error during generation: {result}")
                raise

            # insert into the database
            logging.info("Inserting questions into the database...")
            await insert_questions_to_db(result)
            success = True

        except Exception as e:
            logging.error(f"Error inserting questions into the database: {e}")
            logging.info("Restarting agent and retrying...")
            retry_count += 1
            # restart agent
            try:
                if True:
                    # agent2 = Agent_stage2(
                    #     retriever=generated_text1, template=stage2, filename=filename
                    # )
                    app.state.agent2.init(filename, generated_text1, model)
                    redis_cache.set("agent_status", 1)
                else:
                    continue
            except Exception as init_error:
                logging.error(f"Error reinitializing OpenAI pipeline: {init_error}")
                break

    if not success:
        logging.error(
            "Failed to insert questions into the database after maximum retries."
        )
        return {"error": "Failed to insert questions into the database."}

    return {"latestNQuestions": generated_text2}


# Receive PDF file and save it into /tmp folder
@app.post("/upload")
async def upload_pdf(request: FileUploadRequest):
    try:
        logging.info(f"Received upload request for file: {request.filename}")
        logging.info(f"Received file content preview: {request.file[:50]}...")
        print("start")

        # Validate file content
        if not request.file:
            logging.error("No file content provided.")
            return {"message": "Upload failed: No file content provided."}

        # Parse Base64 file content
        try:
            if "," in request.file:
                base64_content = request.file.split(",")[1]
                logging.info("Found DataURL format, splitting content")
            else:
                base64_content = request.file
                logging.info("Using raw base64 content")

            input_bytes = base64.b64decode(base64_content)
            logging.info(f"Decoded file size: {len(input_bytes)} bytes")
        except Exception as e:
            logging.error(f"Error decoding base64 content: {str(e)}")
            return {"message": "Upload failed: Invalid file content."}

        # Validate file header (for PDF)
        if input_bytes[:4] != b"%PDF":
            logging.error(f"Invalid file header. First 4 bytes: {input_bytes[:4]}")
            return {"message": "Upload failed: Invalid file format (not a PDF)."}

        # Initialize file information
        filename = request.filename
        buf = BytesIO(input_bytes)

        # Check Redis cache for existing file
        cached_filename = redis_cache.get("filename")
        try:
            if cached_filename:
                # Check if cached filename is a string (bytes in Redis)
                cached_filename_str = cached_filename.decode("utf-8")
                if cached_filename_str == filename:
                    document_store = DocumentStore(filename).get_store()
                    if document_store.count_documents() > 0:
                        logging.info("Uploaded file found in cache, using cached data.")
                        return {"message": "Upload successful (cached)."}

        except Exception as e:
            logging.error(f"Error processing cached filename: {e}")
            # If error occurs, safely delete cache
            redis_cache.delete("filename")
            cached_filename_str = None

        try:
            # Create Document Store
            logging.info("Creating document store...")
            document_store = DocumentStore(filename).get_store()
            logging.info("Document store created successfully.")

            # Initialize and use Converter
            logging.info("Initializing document converter...")
            doc_converter = Converter(buf, filename, document_store)
            logging.info("Document converter initialized.")

            # Convert document
            logging.info("Starting document conversion...")
            ids = doc_converter.convert()
            if not ids:
                logging.error("Document conversion failed, no IDs returned.")
                return {"message": "Document processing failed."}

            chunk_id = ids[0]
            logging.info(f"Document conversion completed. Document ID: {chunk_id}")

            # Verify stored document
    #         try:
    #             documents = list(document_store.get_all_documents_generator())  # Convert generator to list
    # # Find the document with the matching ID
    #             sample_doc = next((doc for doc in documents if doc.id == chunk_id), None)
    #             logging.info(f"Sample document preview: {str(sample_doc)[:200]}...")
    #         except Exception as e:
    #             logging.error(f"Error retrieving document sample: {str(e)}")
    #             return {"message": "Document processing failed: Unable to retrieve document."}

            # Update Redis cache
            logging.info("Updating Redis cache...")
            upload_pipe = redis_cache.pipeline()
            upload_pipe.set("filename", filename)
            upload_pipe.set("document_store", 1)
            upload_pipe.set("agent_status", 0)
            upload_pipe.set("document_id", str(chunk_id))  # Store only one ID
            upload_pipe.execute()

            # Verify Redis data
            logging.info("Verifying Redis data after upload:")
            logging.info(f"filename exists: {redis_cache.exists('filename')}")
            logging.info(f"document_store exists: {redis_cache.exists('document_store')}")
            logging.info(f"agent_status exists: {redis_cache.exists('agent_status')}")
            logging.info(f"Stored document_id: {redis_cache.get('document_id').decode('utf-8')}")

            logging.info("Upload successful.")
            return {"message": "Upload successful."}
        except Exception as e:
            logging.error(f"Document processing error: {str(e)}")
            logging.error(f"Processing error traceback: {traceback.format_exc()}")
            return {"message": f"Document processing failed: {str(e)}"}
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {"message": "Upload failed: An unexpected error occurred."}



@app.on_event("startup")
async def startup_event():
    # Init Agent
    prompt_path1 = os.path.join(os.getcwd(), "stage1.txt")
    prompt_path2 = os.path.join(os.getcwd(), "stage2.txt")
    with open(prompt_path1, "r", encoding="utf-8") as file:
        stage1 = file.read()
    with open(prompt_path2, "r", encoding="utf-8") as file:
        stage2 = file.read()
    app.state.agent1 = Agent_stage1(template=stage1)
    app.state.agent2 = Agent_stage2(template=stage2)
    logging.info("Agent Instance created.")

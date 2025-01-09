from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Literal
import random
import logging
import re
import os
import json
import uuid
from datetime import datetime
from agent_haystack_2 import PreProcess, Agent_stage1, Agent_stage2
from prisma import Prisma
import asyncio
from datetime import timedelta
import hashlib
from parse_questions import parse_question

# Set the file expiry time to 1 minute
FILE_EXPIRATION_TIME = timedelta(minutes=60)
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

redis_cache = redis.Redis(host=redis_cache_host, port=redis_cache_port, password=redis_cache_pass)
# redis_cache = redis.Redis(host="redis_cache", port=6379)
# redis_cache = redis.Redis(host=REDIS_CACHE_HOST, port=REDIS_CACHE_PORT, password=REDIS_CACHE_PASS)

# Setting the base directory for uploading files
# UPLOAD_FOLDER = "tmp"
# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)
# uploaded_files = {}

# last_uploaded_file = None  # Record information about the last uploaded file


def check_if_new_file(file_path: str) -> bool:
    global last_uploaded_file, uploaded_files
    if last_uploaded_file == uploaded_files[file_path]:
        return False
    return True


# def calculate_file_hash(contents: bytes) -> str:
#     #calculate the hash to know if the file change
#     return hashlib.sha256(contents).hexdigest()


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


# # Function to get the latest PDF file from the database that is not deleted
# async def get_latest_pdf():
#     try:
#         result = await db.pdf_files.find_first(
#             where={"is_deleted": False}, order={"uploaded_at": "desc"}
#         )
#         if result:
#             return {
#                 "pdf_id": result.id,
#                 "file_name": result.file_name,
#                 "file_path": result.file_path,
#             }
#         return None
#     except Exception as e:
#         logging.error(f"Error querying the PDF data: {e}")
#         raise


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
                    "explanation":(
                        question["options"]
                        .get("explanation", "")
                        .split("'explanation':")[-1]
                        if "explanation" in question["options"]
                        else ""
                    ).replace("\r", "\\r").replace("\n", ""),
                }
            )
        logging.info(
            f"Successfully inserted {len(questions)} questions into the database."
        )
    except Exception as e:
        logging.error(f"Error inserting questions into the database: {e}")
        raise


# agent_cache = None


@app.post("/generate/")
async def generate_questions(request: GenerateQuestionsRequest):
    # global filename, agent_cache, generated_text1

    questions_number = request.limit
    language = request.language
    type = request.type
    difficulty = request.difficulty
    model = request.model
    logging.info(
        f"User Config checked: {questions_number}, {language}, {type}, {difficulty}, {model}"
    )

    logging.info("Starting the question generation process...")

    # pdf_file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    # prompt_path1 = os.path.join(os.getcwd(), "stage1.txt")
    # prompt_path2 = os.path.join(os.getcwd(), "stage2.txt")
    # with open(prompt_path1, "r", encoding="utf-8") as file:
    #     stage1 = file.read()
    # with open(prompt_path2, "r", encoding="utf-8") as file:
    #     stage2 = file.read()
    # is_new_file = check_if_new_file(pdf_file_path)
    # logging.info(f"Is there any new file {is_new_file}")
    # if agent_cache is None:
    #     logging.info("Agent_cache IS NONE")
    # else:
    #     logging.info("Agent_cache IS NOT NONE")

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
                app.state.agent1.init(filename, model)
                logging.info(f"Running Agent_stage1 (attempt {retry_count + 1})...")
                response1 = app.state.agent1.run_agent()
                generated_text1 = response1["answer_builder"]["answers"][0].data
                if not generated_text1:  # Test if the result is none
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
                    raise  # If reach max retry_count raise error
        app.state.agent2.init(filename, generated_text1, model)
        redis_cache.set("agent_status", 1)
    else:
        logging.info("Agent for document already exists.")
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
@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    input_bytes = await file.read()
    filename = str(file.filename)
    buf = BytesIO(input_bytes)

    if input_bytes == None:
        logging.error("No upload file found.")
        return {"message": "Upload not successful"}

    if (
        redis_cache.exists("filename") == 1
        and redis_cache.get("filename").decode("utf-8") == filename
    ):
        document_store = DocumentStore(filename).get_store()
        if document_store.count_documents() != 0:
            logging.info("Uploaded file in cache, using cached data ...")
            return {"message": "Upload successful"}
    elif (
        redis_cache.exists("filename") == 1
        and redis_cache.get("filename").decode("utf-8") != filename
    ):
        logging.info("Found unused cached memory, deleting first ...")
        DocumentStore(redis_cache.get("filename")).delete()

    document_store = DocumentStore(filename).get_store()
    DocConveter = Converter(buf, filename, document_store)
    ids = DocConveter.convert()

    upload_pipe = redis_cache.pipeline()
    upload_pipe.set("filename", filename)
    upload_pipe.set("document_store", 1)
    upload_pipe.set("agent_status", 0)
    for i_d in ids:
        upload_pipe.rpush("document_id", i_d)
    upload_pipe.execute()
    logging.info("Upload successfully")
    return {"message": "Upload successful"}


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
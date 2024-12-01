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
from agent_haystack import PreProcess, Agent
from prisma import Prisma
import asyncio
from datetime import timedelta
import hashlib

# Set the file expiry time to 1 minute
FILE_EXPIRATION_TIME = timedelta(minutes=60)

logging.basicConfig(level=logging.INFO)
app = FastAPI()
database_url = os.getenv("DATABASE_URL_1")
# Initialize Prisma client
db = Prisma()
os.environ["DATABASE_URL"] = database_url
db.connect()
# CORS configuration: allowing cross-domain requests from the front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitted sources
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Setting the base directory for uploading files
UPLOAD_FOLDER = "tmp"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
uploaded_files = {}

last_uploaded_file = None  # Record information about the last uploaded file


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

    @field_validator("language")
    def validate_language(cls, value):
        allowed_languages = {"English", "German"}
        if value not in allowed_languages:
            raise ValueError(
                f"Invalid Languages: {value}, Language must be one of {allowed_languages}"
            )
        return value

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


# Function to get the latest PDF file from the database that is not deleted
async def get_latest_pdf():
    try:
        result = await db.pdf_files.find_first(
            where={"is_deleted": False}, order={"uploaded_at": "desc"}
        )
        if result:
            return {
                "pdf_id": result.id,
                "file_name": result.file_name,
                "file_path": result.file_path,
            }
        return None
    except Exception as e:
        logging.error(f"Error querying the PDF data: {e}")
        raise


def parse_question(context, num):
    context = re.sub(r"```json|```", "", context).strip()
    context = re.sub(r"\*", "", context).strip()
    context = context.replace("\\", "\\\\")
    parts = re.split(r"\n\s*\n", context)
    if len(parts) == num + 1:
        parts = parts[1:]

    questions = []
    for part in parts:
        current_question = {}
        part = re.split(r"\n\s*", part)
        # print(part)
        current_question["type"] = part[0].strip()
        diff = part[1].upper()
        if ":" in diff:
            current_question["difficulty"] = diff.split(":")[1].strip()
        else:
            current_question["difficulty"] = diff.strip()
        # current_question['difficulty'] = diff.split(":")[1].strip()
        current_question["name"] = part[2]
        if "Question:" or "Content:" in part[3]:
            current_question["question"] = part[3].split(":", 1)[1].strip()
        else:
            current_question["question"] = part[3].strip()
        json_text = ""
        for block in part[4:]:
            try:
                json_text += block
                json.loads(json_text)
                break
            except Exception:
                continue
        current_question["options"] = json_text
        questions.append(current_question)

    return questions


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
            # check if 'options' contain 'explanation:'
            if '"explanation":' in question["options"]:
                db.elementgenerated.create(
                    data={
                        "content": question["question"],
                        "options": json.dumps(
                            json.loads(question["options"].split("Back:")[1].strip())
                        ),
                        "type": map_question_type(question["type"]),
                        "name": question["name"],
                        "ownerId": str(
                            uuid.UUID("76047345-3801-4628-ae7b-adbebcfe8821")
                        ),
                        "createdAt": datetime.now(),
                        "updatedAt": datetime.now(),
                        "difficulty": question["difficulty"],
                        "explanation": str(
                            question["options"].split('"explanation":')[1].strip()
                        ).strip(' "{}'),
                    }
                )
            else:
                # without 'explanation:' ，set None
                db.elementgenerated.create(
                    data={
                        "content": question["question"],
                        "options": json.dumps(
                            json.loads(question["options"].split("Back:")[1].strip())
                        ),
                        "type": map_question_type(question["type"]),
                        "name": question["name"],
                        "ownerId": str(
                            uuid.UUID("76047345-3801-4628-ae7b-adbebcfe8821")
                        ),
                        "createdAt": datetime.now(),
                        "updatedAt": datetime.now(),
                        "difficulty": question["difficulty"],
                    }
                )
        logging.info(
            f"Successfully inserted {len(questions)} questions into the database."
        )
    except Exception as e:
        logging.error(f"Error inserting questions into the database: {e}")
        raise


agent_cache = None


@app.post("/generate")
async def generate_questions(request: GenerateQuestionsRequest):
    global filename, agent_cache

    questions_number = request.limit
    language = request.language
    type = request.type
    difficulty = request.difficulty
    model = request.model
    logging.info(
        f"User Config checked: {questions_number}, {language}, {type}, {difficulty}, {model}"
    )

    logging.info("Starting the question generation process...")

    pdf_file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    prompt_path = os.path.join(os.getcwd(), "template.txt")
    with open(prompt_path, "r", encoding="utf-8") as file:
        template = file.read()
    is_new_file = check_if_new_file(pdf_file_path)
    logging.info(f"Is there any new file {is_new_file}")
    if agent_cache is None:
        logging.info("Agent_cache IS NONE")
    else:
        logging.info("Agent_cache IS NOT NONE")

    if is_new_file or agent_cache is None:
        logging.info("Initializing OpenAI generator and retriever...")
        try:
            preprocess = PreProcess()
            preprocess.init()
            retriever = preprocess.run_preprocess(pdf_file_path)
            agent = Agent(retriever=retriever, model=model, template=template)
            agent.init()
            agent_cache = agent
        except Exception as e:
            logging.error(f"Error initializing OpenAI pipeline: {e}")
    else:
        agent = agent_cache
        logging.info("No new file detected. Using existing Agent...")
    generated_text = None

    # Retry logic
    MAX_RETRIES = 3
    retry_count = 0
    success = False

    while not success and retry_count < MAX_RETRIES:
        try:
            if generated_text is None:
                # If generate error,restart agent
                logging.info(f"Generating response (attempt {retry_count + 1})...")
                try:
                    response = agent.run_agent(
                        questions_number, language, difficulty, type
                    )
                    generated_text = response["answer_builder"]["answers"][0].data
                    if not generated_text:
                        raise ValueError("Generated text is empty.")
                    else:
                        logging.info(f"Generated text:\n{generated_text}")
                except Exception as e:
                    logging.error(f"Error during generation: {e}")
                    raise

                    # format the output
            questions = parse_question(generated_text, request.limit)

            # insert into the database
            logging.info("Inserting questions into the database...")
            await insert_questions_to_db(questions)
            success = True

        except Exception as e:
            logging.error(f"Error inserting questions into the database: {e}")
            logging.info("Restarting agent and retrying...")
            retry_count += 1
            # restart agent
            try:
                if is_new_file:
                    preprocess = PreProcess()
                    preprocess.init()
                    retriever = preprocess.run_preprocess(pdf_file_path)
                    agent = Agent(retriever=retriever, model=model, template=template)
                    agent.init()
                    agent_cache = agent
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

    # return {"latestNQuestions": questions}
    return questions


# Receive PDF file and save it into /tmp folder
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global filename, uploaded_files, last_uploaded_file
    contents = await file.read()
    with open(f"{UPLOAD_FOLDER}/{file.filename}", "wb") as f:
        f.write(contents)
    filename = file.filename
    file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)
    uploaded_files[file_path] = datetime.now()
    last_uploaded_file = uploaded_files[file_path]
    return {"message": "Upload successful"}


# Define tasks to delete expired files
async def delete_expired_files():
    while True:
        now = datetime.now()
        for file_path, upload_time in list(uploaded_files.items()):
            # Delete the file if it is out of date
            if now - upload_time > FILE_EXPIRATION_TIME:
                try:
                    os.remove(file_path)
                    del uploaded_files[
                        file_path
                    ]  # Deletion of documents from the record
                    logging.info(f"Deleted expired file: {file_path}")
                except Exception as e:
                    logging.info(f"Failed to delete file {file_path}: {str(e)}")
        await asyncio.sleep(60)  # Check every 60 seconds


# Starting a timed task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(delete_expired_files())

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random
import logging
import re
import os
import json
import uuid
from datetime import datetime
from agent_haystack import PreProcess, Agent
from prisma import Prisma

logging.basicConfig(level=logging.INFO)
app = FastAPI()

# Initialize Prisma client
db = Prisma()
os.environ['DATABASE_URL'] = 'postgresql://klicker:klicker@192.168.254.170:5432/klicker'
db.connect()
# CORS 配置：允许来自前端的跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许的来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# 设置上传文件的基础目录
UPLOAD_FOLDER = 'tmp'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 请求体模型
class GenerateQuestionsRequest(BaseModel):
    limit: int
    language: str
    type: str
    difficulty: str

# Function to get the latest PDF file from the database that is not deleted
async def get_latest_pdf():
    try:
        result = await db.pdf_files.find_first(
            where={"is_deleted": False},
            order={"uploaded_at": "desc"}
        )
        if result:
            return {"pdf_id": result.id, "file_name": result.file_name, "file_path": result.file_path}
        return None
    except Exception as e:
        logging.error(f"Error querying the PDF data: {e}")
        raise

def parse_question(context):
    parts = re.split(r'\n\s*\n', context)

    questions = []
    for part in parts:
        current_question = {}
        part = re.split(r'\n\s*', part)
        current_question['type'] = part[0]
        current_question['difficulty'] = part[1]
        current_question['name'] = part[2]
        current_question['question'] = part[3][10:]
        json_text = ''

        for block in part[4:]:
            try:
                json_text += block
                json.loads(json_text)
                break
            except Exception:
                continue
        current_question['options'] = json_text
        questions.append(current_question)

    return questions

def map_question_type(generated_type):
    type_mapping = {
        'Single Choice': 'SC',
        'Multiple Choices': 'MC',
        'Numerical': 'NUMERICAL',
        'Free Text': 'FREE_TEXT',
        'Kprim': 'KPRIM',
        'Flashcard': 'FLASHCARD'
    }
    return type_mapping.get(generated_type, 'CONTENT')  # Default to CONTENT if type not found

async def insert_questions_to_db(questions):
    try:
        for question in questions:
            db.elementgenerated.create(
                data={
                    "content": question['question'],
                    "options": json.dumps(json.loads(question['options'].split("Back:")[1].strip())),
                    "type": map_question_type(question['type']),
                    "name": question['name'],
                    "ownerId": str(uuid.UUID("76047345-3801-4628-ae7b-adbebcfe8821")),  # 转换为字符串
                    "createdAt": datetime.now(),
                    "updatedAt": datetime.now(),
                    "difficulty": question['difficulty']
                }
            )
        logging.info(f"Successfully inserted {len(questions)} questions into the database.")
    except Exception as e:
        logging.error(f"Error inserting questions into the database: {e}")
        raise

@app.post('/generate')
async def generate_questions(request: GenerateQuestionsRequest):
    global filename

    questions_number = request.limit
    language = request.language
    type = request.type
    difficulty = request.difficulty

    logging.info("Starting the question generation process...")

    pdf_file_path = os.path.join(os.getcwd(), UPLOAD_FOLDER, filename)

    logging.info("Initializing OpenAI generator and retriever...")
    try:
        preprocess = PreProcess()
        preprocess.init()
        retriever = preprocess.run_preprocess(pdf_file_path)
        agent = Agent(retriever=retriever)
        agent.init()
    except Exception as e:
        logging.error(f"Error initializing OpenAI pipeline: {e}")

    try:
        logging.info(f"Generating response")
        response = agent.run_agent(questions_number, language, difficulty, type)
    except Exception as e:
        logging.error(f"Error during generation: {e}")

    generated_text = response['answer_builder']['answers'][0].data

    if not generated_text:
        logging.error("Generated text is empty.")
    else:
        logging.info(f"Generated text:\n{generated_text}")

    questions = parse_question(generated_text)
    await insert_questions_to_db(questions)

    return {"latestNQuestions": questions}

# Receive PDF file and save it into /tmp folder
@app.post('/upload')
async def upload_pdf(file: UploadFile = File(...)):
    global filename
    contents = await file.read()
    with open(f'{UPLOAD_FOLDER}/{file.filename}', 'wb') as f:
        f.write(contents)
    filename = file.filename
    return {"message": "Upload successful"}

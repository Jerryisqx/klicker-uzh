# from fastapi import FastAPI, HTTPException, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# import random
# import logging
# import psycopg2
# import psycopg2.extras
# import re
# import json
# import uuid
# from datetime import datetime
# from agent_haystack import PreProcess, Agent

# logging.basicConfig(level=logging.INFO)
# app = FastAPI()

# # CORS 配置：允许来自前端的跨域请求
# # origins = [
# #     "http://localhost:8000",
# #     "http://127.0.0.1:8000"
# # ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 允许的来源
#     allow_credentials=True,
#     allow_methods=["*"],  # 允许所有方法
#     allow_headers=["*"],  # 允许所有头部
# )

# # 请求体模型
# class GenerateQuestionsRequest(BaseModel):
#     limit: int
#     language: str


# def db_connect():
#     try:
#         connection = psycopg2.connect(
#             host="localhost",  # Database host
#             port="5432",
#             database="klicker",      # Database name
#             user="klicker",          # Username
#             password="klicker"       # Password
#         )
#         return connection
#     except Exception as e:
#         logging.error(f"Failed to connect to the database: {e}")
#         raise

# # Function to get the latest PDF file from the database that is not deleted
# def get_latest_pdf(connection):
#     try:
#         query = """
#             SELECT id, file_name, file_path 
#             FROM pdf_files 
#             WHERE is_deleted = false 
#             ORDER BY uploaded_at DESC 
#             LIMIT 1
#         """
#         with connection.cursor() as cursor:
#             cursor.execute(query)
#             result = cursor.fetchone()
#             if result:
#                 return {"pdf_id": result[0], "file_name": result[1], "file_path": result[2]}
#             return None
#     except Exception as e:
#         logging.error(f"Error querying the PDF data: {e}")
#         raise

# def parse_question(context):
#     parts = re.split(r'\n\s*\n', context)

#     questions = []
#     for part in parts:
#         current_question = {}
#         part = re.split(r'\n\s*', part)
#         current_question['type'] = part[0]
#         current_question['difficulty'] = part[1]
#         current_question['question'] = part[2][10:]
#         # Find JSON block (between first { and last } before blank part)
#         json_text = ''
        
#         for block in part[4:]:
#             try:
#                 json_text += block
#                 json.loads(json_text)
#                 break
#             except Exception as e:
#                 continue
#         current_question['options'] = json_text
#         questions.append(current_question)

#     return questions

# def map_question_type(generated_type):
#     type_mapping = {
#         'Single Choice': 'SC',
#         'Multiple Choices': 'MC',
#         'Numerical': 'NUMERICAL',
#         'Free Text': 'FREE_TEXT',
#         'Kprim': 'KPRIM'
#     }
#     return type_mapping.get(generated_type, 'CONTENT')  # Default to CONTENT if type not found

# def insert_questions_to_db(connection, questions):
#     try:
#         with connection.cursor() as cursor:
#             for question in questions:
#                 query = """ INSERT INTO "ElementGenerated" ("content", "options", "type", "name", "ownerId", "createdAt", "updatedAt") VALUES (%s, %s, %s, %s, %s, %s, %s)"""
#                 content = question['question']
#                 options = json.dumps(json.loads(question['options']))
#                 type = map_question_type(question['type'])
#                 name = "This is a question"
#                 psycopg2.extras.register_uuid()
#                 ownerid = uuid.UUID("76047345-3801-4628-ae7b-adbebcfe8821")
#                 current_time = datetime.now().replace(microsecond=datetime.now().microsecond - (datetime.now().microsecond % 1000))
#                 isAI = True
#                 cursor.execute(query, (content, options, type, name, ownerid, current_time, current_time))
#         connection.commit()
#         logging.info(f"Successfully inserted {len(questions)} questions into the database.")
#     except Exception as e:
#         connection.rollback()
#         logging.error(f"Error inserting questions into the database: {e}")
#         raise

# @app.post('/generate')
# async def generate_questions(request: GenerateQuestionsRequest):
#     # data = request.json
#     # questions_number = data.get('questions_number', 5)
#     # language = data.get('language', 'English')
#     questions_number = request.limit
#     language = request.language

#     db = None  # Initialize db_conn

#     logging.info("Starting the question generation process...")

#     # Get database connection
#     try:
#         db = db_connect()
#         logging.info("Database connection established.")
#     except Exception as e:
#         logging.error(f"Failed to connect to the database: {e}")

#     pdf_file_path = 'data/test-doc.pdf'
#     # logging.info(f"Latest PDF ID: {pdf_id}, Path: {pdf_file_path}")
#     # Initialize the generator and retriever
#     logging.info("Initializing OpenAI generator and retriever...")
#     try:
#         preprocess = PreProcess()
#         preprocess.init()
#         retriever = preprocess.run_preprocess(pdf_file_path)
#         agent = Agent(retriever=retriever)
#         agent.init()
#     except Exception as e:
#         logging.error(f"Error initializing OpenAI pipeline: {e}")

#     # Call the agent with the pipeline and query
#     try:
#         logging.info(f"Generating response")
#         response = agent.run_agent(questions_number, language)
#     except Exception as e:
#         logging.error(f"Error during generation: {e}")

#     # Extract the generated questions as plain text
#     generated_text = response['answer_builder']['answers'][0].data

#     # with open('generate.txt', 'w') as f:
#     #     f.write(generated_text)

#     # Log and print the generated text
#     if not generated_text:
#         logging.error("Generated text is empty.")
#     else:
#         logging.info(f"Generated text:\n{generated_text}")

#     questions = parse_question(generated_text)
    
#     insert_questions_to_db(db, questions)

#     if not db.closed:  # 检查连接是否已关闭
#         db.close()

#     return {"latestNQuestions": questions}
#     # return jsonify({"questions": questions})


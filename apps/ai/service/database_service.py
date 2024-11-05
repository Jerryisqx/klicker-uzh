from prisma import Prisma
from datetime import datetime
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.db = Prisma()
        self._connect()

    def _connect(self):
        """Connect to the database"""
        try:
            self.db.connect()
            logger.info("Successfully connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    async def create_questions(self, questions: List[Dict], owner_id: str):
        """Insert questions into the database using Prisma"""
        try:
            created_questions = []
            
            for question in questions:
                # Ensure options is valid JSON
                options = question['options']
                if isinstance(options, str):
                    options = json.loads(options)
                
                # Create question in database
                created_question = await self.db.element.create(
                    data={
                        'content': question['question'],
                        'options': options,
                        'type': question['type'],
                        'name': f"AI Generated Question - {question['difficulty']}",
                        'ownerId': owner_id,
                        'isAI': True
                    }
                )
                created_questions.append(created_question)
            
            return created_questions
            
        except Exception as e:
            logger.error(f"Error creating questions in database: {e}")
            raise

    # async def get_questions_by_owner(self, owner_id: str):
    #     """Retrieve questions for a specific owner"""
    #     try:
    #         questions = await self.db.element.find_many(
    #             where={
    #                 'ownerId': owner_id,
    #                 'isAI': True
    #             },
    #             order={
    #                 'createdAt': 'desc'
    #             }
    #         )
    #         return questions
    #     except Exception as e:
    #         logger.error(f"Error retrieving questions: {e}")
    #         raise

    async def __aenter__(self):
        await self.db.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.db.disconnect()
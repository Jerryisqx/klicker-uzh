import re
import json
from typing import List, Dict
from pathlib import Path
from .agent_haystack import PreProcess, Agent
import logging

logger = logging.getLogger(__name__)

class QuestionService:
    def __init__(self):
        self.preprocess = PreProcess()
        self.preprocess.init()
        
    async def generate_questions(
        self,
        pdf_path: Path,
        num_questions: int = 5,
        language: str = "English"
    ) -> List[Dict]:
        """Generate questions from PDF using agent_haystack"""
        try:
            # Initialize retriever for the PDF
            retriever = self.preprocess.run_preprocess(str(pdf_path))
            
            # Initialize agent
            agent = Agent(retriever=retriever)
            agent.init()
            
            # Generate questions
            response = agent.run_agent(num_questions, language)
            generated_text = response['answer_builder']['answers'][0].data
            
            # Parse and return questions
            return self._parse_questions(generated_text)
        
        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            raise

    def _parse_questions(self, generated_text: str) -> List[Dict]:
        """Parse generated text into structured questions"""
        # Implement your question parsing logic here
        # Return list of question dictionaries
        parts = re.split(r'\n\s*\n', generated_text)

        questions = []
        for part in parts:
            current_question = {}
            part = re.split(r'\n\s*', part)
            current_question['type'] = part[0]
            current_question['difficulty'] = part[1]
            current_question['question'] = part[2][10:]
            # Find JSON block (between first { and last } before blank part)
            json_text = ''
            
            for block in part[4:]:
                try:
                    json_text += block
                    json.loads(json_text)
                    break
                except Exception as e:
                    continue
            current_question['options'] = json_text
            questions.append(current_question)

        return questions

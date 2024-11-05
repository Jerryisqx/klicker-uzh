from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from typing import List, Dict, Optional
from pydantic import BaseModel
import logging

from config import Settings
from service.pdf_service import PDFService
from service.question_service import QuestionService
from service.database_service import DatabaseService
# from .prisma.schema import GenerateRequest, QuestionResponse
import uvicorn

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load settings
settings = Settings()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    filename: str
    questions_number: int = 5
    language: str = "English"

class Question(BaseModel):
    content: str
    options: Dict
    type: str
    name: Optional[str]

class QuestionResponse(BaseModel):
    message: str
    questions: List[Question]

# Initialize services
pdf_service = PDFService()
question_service = QuestionService()
db_service = DatabaseService()


@app.get("/pdfs")
async def list_pdfs():
    """List all PDFs in the tmp directory"""
    return pdf_service.list_pdfs()

@app.get("/pdfs/{filename}")
async def get_pdf_info(filename: str):
    """Get information about a specific PDF"""
    return pdf_service.get_pdf_info(filename)


@app.post("/generate", response_model=QuestionResponse)
async def generate_questions(request: GenerateRequest):
    """Generate questions from a PDF and store them in database"""
    try:
        # 1. Verify PDF exists
        pdf_path = pdf_service.get_pdf_path(request.filename)
        
        # 2. Generate questions
        questions = await question_service.generate_questions(
            pdf_path=pdf_path,
            num_questions=request.questions_number,
            language=request.language
        )
        
        # 3. Store in database
        saved_questions = await db_service.create_questions(questions)
        
        return {"message": "Questions generated successfully", "questions": saved_questions}
    
    except Exception as e:
        logger.error(f"Error in question generation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
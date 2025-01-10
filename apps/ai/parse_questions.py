import json
from pydantic import BaseModel, ValidationError, Field, field_validator
from typing import Literal
from typing import Optional, List
import re


# 定义验证模型
class Choice(BaseModel):
    ix: int  # Option index
    value: str  # Option content
    correct: bool  # True if correct, False otherwise
    feedback: Optional[str]  # Feedback for the option (optional)


# Numerical-specific solution range
class SolutionRange(BaseModel):
    max: float  # Upper bound of the range
    min: Optional[float]  # Lower bound of the range (optional)


# Back structures for different question types
class SingleChoice(BaseModel):
    gt_type: Literal["Single Choice"]
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class MultipleChoices(BaseModel):
    gt_type: Literal["Multiple Choices"]
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class Numerical(BaseModel):
    gt_type: Literal["Numerical"]
    unit: str  # Unit of measurement (e.g., %, €, etc.)
    accuracy: int  # Decimal places required
    restrictions: Optional[dict]  # Max and Min value restrictions
    solutionRanges: List[SolutionRange]
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = False
    explanation: str


class Kprim(BaseModel):
    gt_type: Literal["Kprim"]
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class FreeText(BaseModel):
    gt_type: Literal["Free Text"]
    answers: Optional[List[str]] = None  # No answers needed
    explanation: str


class Flashcard(BaseModel):
    gt_type: Literal["Flashcard"]
    explanation: str  # List of correct answers


class Content(BaseModel):
    gt_type: Literal["Content"]
    answers: str


class Base(BaseModel):
    type: str
    difficulty: str
    field: str
    question: str

    @field_validator("type", "difficulty", "field", "question", mode="before")
    @staticmethod
    def normalize_question_type(value: str):
        if ":" in value:
            return value.split(":")[1].strip()
        return value.strip()


# Main question classes
class Back(BaseModel):
    option: (
        SingleChoice
        | MultipleChoices
        | Numerical
        | Kprim
        | FreeText
        | Flashcard
        | Content
    ) = Field(discriminator="gt_type")


def parse_question(generated_text, num):
    context = re.sub(r"```json|```", "", generated_text).strip()
    context = re.sub(r"\*", "", context).strip()
    context = re.sub(r'\$(.*?)\$', r'$$\1$$', context)
    context = context.replace(r"\\\(", "$$").replace(r"\\\)", "$$")

    # context= context.replace("\n", "\\n").replace("\r", "\\r")
    parts = re.split(r"\n\s*\n", context)
    if len(parts) >= num + 1:
        parts = parts[len(parts) - num :]
    questions = []
    for part in parts:
        current_question = {}
        base_part = part.split("Back:")[0].strip()
        base_data = json.loads(base_part)
        back_data = {}
        back_data["gt_type"] = base_data["type"]
        back_part = part.split("Back:")[1].strip()
        back_part = json.loads(back_part)
        back_data.update(back_part)
        try:
            Base(**base_data)
            Back(option=back_data)
            current_question["type"] = base_data["type"]
            current_question["difficulty"] = base_data["difficulty"].upper()
            current_question["name"] = base_data["field"]
            current_question["question"] = base_data.get("content") or base_data.get(
                "question"
            )
            current_question["options"] = back_part
            questions.append(current_question)
        except ValidationError as e:
            return e
    return questions

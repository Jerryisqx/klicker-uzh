import re
import json
from pydantic import BaseModel, ValidationError
from typing import List


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
class BackSingleChoice(BaseModel):
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class BackMultipleChoices(BaseModel):
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class BackNumerical(BaseModel):
    unit: str  # Unit of measurement (e.g., %, €, etc.)
    accuracy: int  # Decimal places required
    restrictions: Optional[dict]  # Max and Min value restrictions
    solutionRanges: List[SolutionRange]
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = False


class BackKprim(BaseModel):
    choices: List[Choice]
    displayMode: str = "LIST"
    hasSampleSolution: bool = True
    hasAnswerFeedbacks: bool = True


class BackFreeText(BaseModel):
    answers: Optional[List[str]] = None  # No answers needed


class BackFlashcard(BaseModel):
    answers: List[str]  # List of correct answers


class BackContent(BaseModel):
    answers: Optional[List[str]] = None  # No answers needed


# Main question classes
class SingleChoice(BaseModel):
    type: str = "Single Choice"
    difficulty: str
    questionField: str
    question: str
    back: BackSingleChoice


class MultipleChoices(BaseModel):
    type: str = "Multiple Choices"
    difficulty: str
    questionField: str
    question: str
    back: BackMultipleChoices


class Numerical(BaseModel):
    type: str = "Numerical"
    difficulty: str
    questionField: str
    question: str
    back: BackNumerical


class Kprim(BaseModel):
    type: str = "Kprim"
    difficulty: str
    questionField: str
    question: str
    back: BackKprim


class FreeText(BaseModel):
    type: str = "Free Text"
    difficulty: str
    questionField: str
    question: str
    back: BackFreeText


class Flashcard(BaseModel):
    type: str = "Flashcard"
    difficulty: str
    questionField: str
    question: str
    back: BackFlashcard


class Content(BaseModel):
    type: str = "Content"
    difficulty: str
    questionField: str
    question: str
    back: BackContent


# 定义解析函数
def parse_question(context, num):
    # 解析输入为多部分
    parts = re.split(r"\n\s*\n", context)
    if len(parts) == num + 1:
        parts = parts[1:]  # 去掉第一部分（上下文描述）

    questions = []
    for part in parts:
        current_question = {}
        part = re.split(r"\n\s*", part)  # 按换行分割
        print(part)

        # 提取基本字段
        current_question["type"] = part[0].strip()
        diff = part[1].upper()
        if ":" in diff:
            current_question["difficulty"] = diff.split(":")[1].strip()
        else:
            current_question["difficulty"] = diff.strip()

        current_question["name"] = part[2]
        current_question["question"] = part[3][10:]

        # 提取 JSON 数据
        json_text = ""
        for block in part[4:]:
            try:
                json_text += block  # 累积 JSON 数据
                json.loads(json_text)  # 尝试解析 JSON
                break  # 如果成功解析，结束累积
            except Exception:
                continue

        current_question["options"] = json_text.strip()
        questions.append(current_question)

    return questions


# 解析后的数据进一步处理和验证
def process_questions(generated_text, num):
    # 调用解析函数
    questions = parse_question(generated_text, num)

    # 初始化结果列表
    validated_data = []

    for question in questions:
        # 尝试解析 JSON
        try:
            options = json.loads(
                question["options"].split("Back:")[1].strip()
            )  # 提取 Back 对象
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            continue

        # 验证 JSON 格式是否符合 Pydantic 模型
        try:
            validated_back = Back(**options)
            validated_question = Question(
                type=question["type"],
                difficulty=question["difficulty"],
                name=question["name"],
                question=question["question"],
                back=validated_back,
            )

            # 如果验证成功，生成最终的 `data`
            data = {
                "content": validated_question.question,
                "options": validated_question.back.dict(),  # 转换为字典格式
                "type": validated_question.type,
                "name": validated_question.name,
                "difficulty": validated_question.difficulty,
            }

            validated_data.append(data)

        except ValidationError as e:
            print(f"Validation failed: {e}")
            continue

    return validated_data


# 测试数据
generated_text = """
Single Choice
Difficulty: Easy
Question 1
What is the capital of France?
{
  "Back": {
    "choices": [
      {"ix": 0, "value": "Paris", "correct": true, "feedback": "Correct! Paris is the capital of France."},
      {"ix": 1, "value": "London", "correct": false, "feedback": "Incorrect. London is the capital of the United Kingdom."},
      {"ix": 2, "value": "Berlin", "correct": false, "feedback": "Incorrect. Berlin is the capital of Germany."},
      {"ix": 3, "value": "Madrid", "correct": false, "feedback": "Incorrect. Madrid is the capital of Spain."}
    ],
    "displayMode": "LIST",
    "hasSampleSolution": true,
    "hasAnswerFeedbacks": true
  }
}
"""

# 执行函数
results = process_questions(generated_text, 1)

# 输出结果
for data in results:
    print(json.dumps(data, indent=4))

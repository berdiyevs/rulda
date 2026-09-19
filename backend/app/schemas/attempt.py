import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttemptCreate(BaseModel):
    topic: str
    mode: str
    correct_count: int
    wrong_count: int
    total_questions: int
    passed: bool
    wrong_question_ids: list[int] = []
    correct_question_ids: list[int] = []


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    topic: str
    mode: str
    correct_count: int
    wrong_count: int
    total_questions: int
    passed: bool
    wrong_question_ids: list[int]
    correct_question_ids: list[int]
    created_at: datetime

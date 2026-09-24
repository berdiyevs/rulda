import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AttemptCreate(BaseModel):
    # Chegaralar: bitta so'rov bilan bazani katta hajmdagi ma'lumot bilan to'ldirib bo'lmasin.
    topic: str = Field(max_length=64)
    mode: str = Field(max_length=32)
    correct_count: int = Field(ge=0, le=2000)
    wrong_count: int = Field(ge=0, le=2000)
    total_questions: int = Field(ge=0, le=2000)
    passed: bool
    wrong_question_ids: list[int] = Field(default_factory=list, max_length=2000)
    correct_question_ids: list[int] = Field(default_factory=list, max_length=2000)


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

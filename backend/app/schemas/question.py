from pydantic import BaseModel, ConfigDict


class QuestionOption(BaseModel):
    id: int
    text: str
    is_correct: bool


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    pk: int
    id: int
    question: str
    image_url: str | None
    options: list[QuestionOption]
    ticketId: int | None


class QuestionCreate(BaseModel):
    id: int
    question: str
    image_url: str | None = None
    options: list[QuestionOption]
    ticketId: int | None = None


class QuestionUpdate(BaseModel):
    question: str | None = None
    image_url: str | None = None
    options: list[QuestionOption] | None = None
    ticketId: int | None = None

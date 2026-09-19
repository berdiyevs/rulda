from pydantic import BaseModel


class PlanOut(BaseModel):
    id: str
    label: str
    amount: int
    days: int


class ClickCreateRequest(BaseModel):
    plan: str


class ClickCreateResponse(BaseModel):
    payment_url: str

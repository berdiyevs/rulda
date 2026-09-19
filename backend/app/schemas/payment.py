from pydantic import BaseModel, ConfigDict


class PlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    amount: int
    days: int


class PlanUpdate(BaseModel):
    label: str | None = None
    amount: int | None = None
    days: int | None = None


class ClickCreateRequest(BaseModel):
    plan: str


class ClickCreateResponse(BaseModel):
    payment_url: str

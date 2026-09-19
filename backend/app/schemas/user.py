import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, computed_field

from ..core.premium import is_premium_active as compute_is_premium_active


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    display_name: str
    is_verified: bool
    is_admin: bool
    is_premium: bool
    premium_until: date | None
    exam_date: date | None
    created_at: datetime

    @computed_field
    @property
    def is_premium_active(self) -> bool:
        return compute_is_premium_active(self.is_premium, self.premium_until)


class ExamDateUpdate(BaseModel):
    exam_date: date

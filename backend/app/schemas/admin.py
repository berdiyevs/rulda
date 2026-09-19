import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, computed_field

from ..core.premium import is_premium_active as compute_is_premium_active


class AdminUserOut(BaseModel):
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
    last_login: datetime | None
    attempt_count: int = 0

    @computed_field
    @property
    def is_premium_active(self) -> bool:
        return compute_is_premium_active(self.is_premium, self.premium_until)


class AdminUserUpdate(BaseModel):
    is_verified: bool | None = None
    is_admin: bool | None = None
    is_premium: bool | None = None
    premium_until: date | None = None


class DailyCount(BaseModel):
    date: date
    count: int


class AdminStats(BaseModel):
    total_users: int
    verified_users: int
    premium_users: int
    admin_users: int
    total_attempts: int
    attempts_today: int
    passed_attempts: int
    signups_last_14_days: list[DailyCount]
    attempts_last_14_days: list[DailyCount]

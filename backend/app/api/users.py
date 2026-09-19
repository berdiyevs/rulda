from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db.models import User
from ..schemas.user import ExamDateUpdate, UserOut
from .deps import get_current_user, get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me/exam-date", response_model=UserOut)
def update_exam_date(
    payload: ExamDateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    current_user.exam_date = payload.exam_date
    db.commit()
    db.refresh(current_user)
    return current_user

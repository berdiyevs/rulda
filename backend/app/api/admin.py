import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db.models import QuizAttempt, Question, RoadSign, User
from ..schemas.admin import AdminStats, AdminUserOut, AdminUserUpdate, DailyCount
from ..schemas.question import QuestionCreate, QuestionOut, QuestionUpdate
from ..schemas.road_sign import RoadSignCreate, RoadSignOut, RoadSignUpdate
from .deps import get_current_admin, get_db

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


def _daily_counts(db: Session, date_column, days: int = 14) -> list[DailyCount]:
    since = datetime.now(timezone.utc) - timedelta(days=days - 1)
    rows = db.execute(
        select(func.date(date_column), func.count())
        .where(date_column >= since)
        .group_by(func.date(date_column))
    ).all()
    counts = {row[0]: row[1] for row in rows}
    today = datetime.now(timezone.utc).date()
    return [
        DailyCount(date=today - timedelta(days=i), count=counts.get(today - timedelta(days=i), 0))
        for i in range(days - 1, -1, -1)
    ]


@router.get("/users", response_model=list[AdminUserOut])
def list_users(db: Session = Depends(get_db)) -> list[AdminUserOut]:
    counts = dict(
        db.execute(select(QuizAttempt.user_id, func.count()).group_by(QuizAttempt.user_id)).all()
    )
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [
        AdminUserOut.model_validate(u).model_copy(update={"attempt_count": counts.get(u.id, 0)})
        for u in users
    ]


@router.patch("/users/{user_id}", response_model=AdminUserOut)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> AdminUserOut:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Foydalanuvchi topilmadi")

    if user.id == admin.id and payload.is_admin is False:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "O'zingizni admindan chiqara olmaysiz")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)

    attempt_count = db.scalar(
        select(func.count()).select_from(QuizAttempt).where(QuizAttempt.user_id == user.id)
    )
    return AdminUserOut.model_validate(user).model_copy(update={"attempt_count": attempt_count or 0})


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> None:
    if user_id == admin.id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "O'zingizni o'chira olmaysiz")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Foydalanuvchi topilmadi")

    db.delete(user)
    db.commit()


@router.get("/stats", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db)) -> AdminStats:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    return AdminStats(
        total_users=db.scalar(select(func.count()).select_from(User)) or 0,
        verified_users=db.scalar(select(func.count()).select_from(User).where(User.is_verified.is_(True))) or 0,
        premium_users=db.scalar(select(func.count()).select_from(User).where(User.is_premium.is_(True))) or 0,
        admin_users=db.scalar(select(func.count()).select_from(User).where(User.is_admin.is_(True))) or 0,
        total_attempts=db.scalar(select(func.count()).select_from(QuizAttempt)) or 0,
        attempts_today=db.scalar(
            select(func.count()).select_from(QuizAttempt).where(QuizAttempt.created_at >= today_start)
        )
        or 0,
        passed_attempts=db.scalar(
            select(func.count()).select_from(QuizAttempt).where(QuizAttempt.passed.is_(True))
        )
        or 0,
        signups_last_14_days=_daily_counts(db, User.created_at),
        attempts_last_14_days=_daily_counts(db, QuizAttempt.created_at),
    )


@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> Question:
    question = Question(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/questions/{pk}", response_model=QuestionOut)
def update_question(pk: int, payload: QuestionUpdate, db: Session = Depends(get_db)) -> Question:
    question = db.get(Question, pk)
    if question is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Savol topilmadi")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/questions/{pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(pk: int, db: Session = Depends(get_db)) -> None:
    question = db.get(Question, pk)
    if question is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Savol topilmadi")
    db.delete(question)
    db.commit()


@router.post("/road-signs", response_model=RoadSignOut, status_code=status.HTTP_201_CREATED)
def create_road_sign(payload: RoadSignCreate, db: Session = Depends(get_db)) -> RoadSign:
    if db.get(RoadSign, payload.id) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Shu ID bilan belgi allaqachon mavjud")
    sign = RoadSign(**payload.model_dump())
    db.add(sign)
    db.commit()
    db.refresh(sign)
    return sign


@router.patch("/road-signs/{sign_id}", response_model=RoadSignOut)
def update_road_sign(sign_id: str, payload: RoadSignUpdate, db: Session = Depends(get_db)) -> RoadSign:
    sign = db.get(RoadSign, sign_id)
    if sign is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Belgi topilmadi")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sign, field, value)
    db.commit()
    db.refresh(sign)
    return sign


@router.delete("/road-signs/{sign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_road_sign(sign_id: str, db: Session = Depends(get_db)) -> None:
    sign = db.get(RoadSign, sign_id)
    if sign is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Belgi topilmadi")
    db.delete(sign)
    db.commit()

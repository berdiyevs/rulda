from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.premium import attempt_requires_premium, is_premium_active, uz_day_bounds
from ..db.models import QuizAttempt, User
from ..schemas.attempt import AttemptCreate, AttemptOut
from .deps import get_current_user, get_db

router = APIRouter(prefix="/attempts", tags=["attempts"])


@router.post("", response_model=AttemptOut, status_code=status.HTTP_201_CREATED)
def create_attempt(
    payload: AttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> QuizAttempt:
    if attempt_requires_premium(payload.topic, payload.mode) and not is_premium_active(
        current_user.is_premium, current_user.premium_until
    ):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Bu funksiya faqat Premium foydalanuvchilar uchun")

    # Bepul foydalanuvchi kuniga (O'zbekiston vaqti bilan) bitta "Bugungi takrorlash" sessiyasini saqlay oladi.
    if payload.mode == "review" and not is_premium_active(current_user.is_premium, current_user.premium_until):
        day_start, day_end = uz_day_bounds()
        reviews_today = db.scalar(
            select(func.count())
            .select_from(QuizAttempt)
            .where(
                QuizAttempt.user_id == current_user.id,
                QuizAttempt.mode == "review",
                QuizAttempt.created_at >= day_start,
                QuizAttempt.created_at < day_end,
            )
        )
        if reviews_today:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Bugungi bepul takrorlash allaqachon bajarilgan. Premium bilan cheklovsiz takrorlashingiz mumkin.",
            )

    attempt = QuizAttempt(user_id=current_user.id, **payload.model_dump())
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("", response_model=list[AttemptOut])
def list_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[QuizAttempt]:
    return list(
        db.scalars(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == current_user.id)
            .order_by(QuizAttempt.created_at)
        ).all()
    )

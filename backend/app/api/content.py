from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.models import Question, RoadSign
from ..schemas.question import QuestionOut
from ..schemas.road_sign import RoadSignOut
from .deps import get_db

router = APIRouter(tags=["content"])


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db)) -> list[Question]:
    return list(db.scalars(select(Question).order_by(Question.id)).all())


@router.get("/road-signs", response_model=list[RoadSignOut])
def list_road_signs(db: Session = Depends(get_db)) -> list[RoadSign]:
    return list(db.scalars(select(RoadSign).order_by(RoadSign.id)).all())

import json
import logging
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..core.config import settings
from .models import Question, RoadSign
from .session import SessionLocal

logger = logging.getLogger("rulda.seed")


def _load_json(filename: str) -> list:
    path = Path(settings.seed_data_dir) / filename
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def seed_questions(db: Session) -> None:
    count = db.scalar(select(func.count()).select_from(Question))
    if count:
        return
    data = _load_json("questions.json")
    db.bulk_save_objects(
        [
            Question(
                id=q["id"],
                question=q["question"],
                image_url=q.get("image_url"),
                options=q["options"],
                ticketId=q.get("ticketId"),
            )
            for q in data
        ]
    )
    db.commit()
    logger.info("Seeded %d questions", len(data))


def seed_road_signs(db: Session) -> None:
    count = db.scalar(select(func.count()).select_from(RoadSign))
    if count:
        return
    data = _load_json("road-signs.json")
    db.bulk_save_objects(
        [RoadSign(id=s["id"], kategoriya=s["kategoriya"], nom=s["nom"], rasm=s["rasm"]) for s in data]
    )
    db.commit()
    logger.info("Seeded %d road signs", len(data))


def run_seed() -> None:
    db = SessionLocal()
    try:
        seed_questions(db)
        seed_road_signs(db)
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_seed()

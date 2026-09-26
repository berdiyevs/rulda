"""question text fixes: cyrillic words in latin text

Savollar matnidagi imlo tuzatishlari (mazmun va to'g'ri javoblar o'zgarmaydi):
lotin matn ichidagi kirillcha "ва" -> "va", "Сhapga" (kirillcha С) -> "Chapga",
rasmdagi harflarga mos kelishi uchun «A»/«B» (lotin) -> «А»/«В» (kirill) va
22-savolning takrorlangan variantidagi «B» va «B» -> «В» va «Г».

Faqat matn hali eski holatda bo'lsa yangilanadi (admin panelda qo'lda o'zgartirilgan bo'lsa, tegilmaydi).

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-26

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (savol ID, variant ID, eski matn, yangi matn)
FIXES = [
    (22, 3, "«А» ва «Б»", "«А» va «Б»"),
    (22, 4, "«А», «Б», «B» va «Г»", "«А», «Б», «В» va «Г»"),
    (22, 5, "«A», «B» va «B»", "«А», «В» va «Г»"),
    (62, 4, "«А» ва «Б»", "«А» va «Б»"),
    (62, 5, "«А» ва «В»", "«А» va «В»"),
    (147, 1, "«A»", "«А»"),
    (147, 3, "«А» ва «Б»", "«А» va «Б»"),
    (652, 1, "«А» ва «Б»", "«А» va «Б»"),
    (652, 3, "«Б» ва «Г»", "«Б» va «Г»"),
    (652, 4, "«В» ва «Г»", "«В» va «Г»"),
    (652, 5, "«Б», «В» ва «Г»", "«Б», «В» va «Г»"),
    (740, 1, "Сhapga va orqaga qayrilib olishga", "Chapga va orqaga qayrilib olishga"),
    (844, 1, "«A» ва «Д»", "«А» va «Д»"),
]

questions = sa.table(
    "questions",
    sa.column("pk", sa.Integer),
    sa.column("original_id", sa.Integer),
    sa.column("options", sa.JSON),
)


def _apply(pairs) -> None:
    bind = op.get_bind()
    by_question = {}
    for question_id, option_id, old, new in pairs:
        by_question.setdefault(question_id, []).append((option_id, old, new))

    for question_id, changes in by_question.items():
        rows = bind.execute(
            sa.select(questions.c.pk, questions.c.options).where(questions.c.original_id == question_id)
        ).fetchall()
        for pk, options in rows:
            updated = False
            new_options = []
            for option in options or []:
                option = dict(option)
                for option_id, old, new in changes:
                    if option.get("id") == option_id and option.get("text") == old:
                        option["text"] = new
                        updated = True
                new_options.append(option)
            if updated:
                bind.execute(sa.update(questions).where(questions.c.pk == pk).values(options=new_options))


def upgrade() -> None:
    _apply(FIXES)


def downgrade() -> None:
    _apply([(q, o, new, old) for q, o, old, new in FIXES])

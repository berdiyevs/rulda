"""admin fields and content tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("is_premium", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("premium_until", sa.Date(), nullable=True))

    op.create_table(
        "questions",
        sa.Column("pk", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("original_id", sa.Integer(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("options", sa.JSON(), nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_questions_original_id", "questions", ["original_id"])
    op.create_index("ix_questions_ticket_id", "questions", ["ticket_id"])

    op.create_table(
        "road_signs",
        sa.Column("id", sa.String(length=20), primary_key=True),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("image", sa.String(length=500), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("road_signs")
    op.drop_index("ix_questions_ticket_id", table_name="questions")
    op.drop_index("ix_questions_original_id", table_name="questions")
    op.drop_table("questions")
    op.drop_column("users", "premium_until")
    op.drop_column("users", "is_premium")
    op.drop_column("users", "is_admin")

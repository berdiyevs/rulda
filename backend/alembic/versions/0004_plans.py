"""plans table

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

plans_table = sa.table(
    "plans",
    sa.column("id", sa.String),
    sa.column("label", sa.String),
    sa.column("days", sa.Integer),
    sa.column("amount", sa.Integer),
    sa.column("sort_order", sa.Integer),
)


def upgrade() -> None:
    op.create_table(
        "plans",
        sa.Column("id", sa.String(length=32), primary_key=True),
        sa.Column("label", sa.String(length=64), nullable=False),
        sa.Column("days", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.bulk_insert(
        plans_table,
        [
            {"id": "1_week", "label": "1 hafta", "days": 7, "amount": 7000, "sort_order": 1},
            {"id": "1_month", "label": "1 oy", "days": 30, "amount": 15000, "sort_order": 2},
            {"id": "3_month", "label": "3 oy", "days": 90, "amount": 39000, "sort_order": 3},
        ],
    )


def downgrade() -> None:
    op.drop_table("plans")

"""create vehicles

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-25
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("make", sa.String(length=50), nullable=False),
        sa.Column("model", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=20), nullable=False),
        sa.Column("price", sa.BigInteger(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.CheckConstraint("char_length(make) >= 1", name="ck_vehicles_make"),
        sa.CheckConstraint("char_length(model) >= 1", name="ck_vehicles_model"),
        sa.CheckConstraint(
            "category IN ('sedan', 'suv', 'hatchback', 'coupe', 'truck', 'ev')",
            name="ck_vehicles_category",
        ),
        sa.CheckConstraint("price BETWEEN 1 AND 100000000000", name="ck_vehicles_price"),
        sa.CheckConstraint("quantity BETWEEN 0 AND 10000", name="ck_vehicles_quantity"),
    )


def downgrade() -> None:
    op.drop_table("vehicles")

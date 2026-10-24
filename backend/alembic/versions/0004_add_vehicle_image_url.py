"""add vehicle image url

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-25
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("vehicles", sa.Column("image_url", sa.String(length=500), nullable=True))
    op.create_check_constraint(
        "ck_vehicles_image_url",
        "vehicles",
        "image_url IS NULL OR image_url LIKE 'https://%'",
    )


def downgrade() -> None:
    op.drop_constraint("ck_vehicles_image_url", "vehicles", type_="check")
    op.drop_column("vehicles", "image_url")

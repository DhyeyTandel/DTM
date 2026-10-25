"""allow self hosted image paths

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-25
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint("ck_vehicles_image_url", "vehicles", type_="check")
    op.create_check_constraint(
        "ck_vehicles_image_url",
        "vehicles",
        "image_url IS NULL OR image_url LIKE 'https://%' "
        "OR (image_url LIKE '/images/%' AND image_url NOT LIKE '%..%')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_vehicles_image_url", "vehicles", type_="check")
    op.create_check_constraint(
        "ck_vehicles_image_url", "vehicles", "image_url IS NULL OR image_url LIKE 'https://%'"
    )

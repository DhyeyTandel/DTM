from sqlalchemy import CheckConstraint, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.domain.role import Role

EMAIL_UNIQUE_CONSTRAINT = "uq_users_email"
ROLE_CHECK_CONSTRAINT = "ck_users_role"
ROLE_VALUES = ", ".join(f"'{role.value}'" for role in Role)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name=EMAIL_UNIQUE_CONSTRAINT),
        CheckConstraint(f"role IN ({ROLE_VALUES})", name=ROLE_CHECK_CONSTRAINT),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320))
    password_hash: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20))

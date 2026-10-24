from sqlalchemy import BigInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.limits import MAKE_MAX_LENGTH, MODEL_MAX_LENGTH

CATEGORY_COLUMN_LENGTH = 20


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    make: Mapped[str] = mapped_column(String(MAKE_MAX_LENGTH))
    model: Mapped[str] = mapped_column(String(MODEL_MAX_LENGTH))
    category: Mapped[str] = mapped_column(String(CATEGORY_COLUMN_LENGTH))
    price: Mapped[int] = mapped_column(BigInteger)
    quantity: Mapped[int]

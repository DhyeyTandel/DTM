from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.limits import MAKE_MAX_LENGTH, MODEL_MAX_LENGTH


class Purchase(Base):
    """Make, model and price are copied, so a sale survives its vehicle being edited or deleted."""

    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", name="fk_purchases_user_id"))
    vehicle_id: Mapped[int | None] = mapped_column(
        ForeignKey("vehicles.id", name="fk_purchases_vehicle_id", ondelete="SET NULL")
    )
    make: Mapped[str] = mapped_column(String(MAKE_MAX_LENGTH))
    model: Mapped[str] = mapped_column(String(MODEL_MAX_LENGTH))
    price: Mapped[int] = mapped_column(BigInteger)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

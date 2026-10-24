from sqlalchemy import BigInteger, CheckConstraint, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.domain.category import Category
from app.limits import (
    IMAGE_URL_MAX_LENGTH,
    IMAGE_URL_SCHEME,
    MAKE_MAX_LENGTH,
    MODEL_MAX_LENGTH,
    PRICE_MAX,
    PRICE_MIN,
    QUANTITY_MAX,
    QUANTITY_MIN,
)

CATEGORY_COLUMN_LENGTH = 20
CATEGORY_VALUES = ", ".join(f"'{category.value}'" for category in Category)


class Vehicle(Base):
    __tablename__ = "vehicles"
    __table_args__ = (
        CheckConstraint("char_length(make) >= 1", name="ck_vehicles_make"),
        CheckConstraint("char_length(model) >= 1", name="ck_vehicles_model"),
        CheckConstraint(f"category IN ({CATEGORY_VALUES})", name="ck_vehicles_category"),
        CheckConstraint(f"price BETWEEN {PRICE_MIN} AND {PRICE_MAX}", name="ck_vehicles_price"),
        CheckConstraint(
            f"image_url IS NULL OR image_url LIKE '{IMAGE_URL_SCHEME}%'",
            name="ck_vehicles_image_url",
        ),
        CheckConstraint(
            f"quantity BETWEEN {QUANTITY_MIN} AND {QUANTITY_MAX}", name="ck_vehicles_quantity"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    make: Mapped[str] = mapped_column(String(MAKE_MAX_LENGTH))
    model: Mapped[str] = mapped_column(String(MODEL_MAX_LENGTH))
    category: Mapped[str] = mapped_column(String(CATEGORY_COLUMN_LENGTH))
    price: Mapped[int] = mapped_column(BigInteger)
    quantity: Mapped[int]
    image_url: Mapped[str | None] = mapped_column(String(IMAGE_URL_MAX_LENGTH))

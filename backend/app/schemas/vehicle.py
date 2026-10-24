from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.domain.category import Category
from app.limits import (
    MAKE_MAX_LENGTH,
    MODEL_MAX_LENGTH,
    PRICE_MAX,
    PRICE_MIN,
    QUANTITY_MAX,
    QUANTITY_MIN,
)
from app.schemas.base import RequestSchema

Make = Annotated[str, StringConstraints(min_length=1, max_length=MAKE_MAX_LENGTH)]
Model = Annotated[str, StringConstraints(min_length=1, max_length=MODEL_MAX_LENGTH)]
Price = Annotated[int, Field(strict=True, ge=PRICE_MIN, le=PRICE_MAX)]

Quantity = Annotated[int, Field(strict=True, ge=QUANTITY_MIN, le=QUANTITY_MAX)]


class VehicleCreate(RequestSchema):
    make: Make
    model: Model
    category: Category
    price: Price
    quantity: Quantity


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: int
    quantity: int

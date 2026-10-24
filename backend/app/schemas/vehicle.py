from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.domain.category import Category
from app.limits import PRICE_MAX, PRICE_MIN
from app.schemas.base import RequestSchema

Make = Annotated[str, StringConstraints(min_length=1)]
Model = Annotated[str, StringConstraints(min_length=1)]
Price = Annotated[int, Field(strict=True, ge=PRICE_MIN, le=PRICE_MAX)]


class VehicleCreate(RequestSchema):
    make: Make
    model: Model
    category: Category
    price: Price
    quantity: int


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: int
    quantity: int

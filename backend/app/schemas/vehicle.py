from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.domain.category import Category
from app.schemas.base import RequestSchema

Make = Annotated[str, StringConstraints(min_length=1)]
Model = Annotated[str, StringConstraints(min_length=1)]


class VehicleCreate(RequestSchema):
    make: Make
    model: Model
    category: Category
    price: int
    quantity: int


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: int
    quantity: int

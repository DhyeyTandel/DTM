from pydantic import BaseModel, ConfigDict

from app.domain.category import Category
from app.schemas.base import RequestSchema


class VehicleCreate(RequestSchema):
    make: str
    model: str
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

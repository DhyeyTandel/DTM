import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, StringConstraints

from app.domain.category import Category
from app.limits import (
    IMAGE_PATH_FORBIDDEN,
    IMAGE_PATH_PREFIX,
    IMAGE_URL_MAX_LENGTH,
    IMAGE_URL_SCHEME,
    MAKE_MAX_LENGTH,
    MODEL_MAX_LENGTH,
    PRICE_MAX,
    PRICE_MIN,
    QUANTITY_MAX,
    QUANTITY_MIN,
    RESTOCK_AMOUNT_MAX,
    RESTOCK_AMOUNT_MIN,
)
from app.schemas.base import RequestSchema

Make = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MAKE_MAX_LENGTH)
]
Model = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=MODEL_MAX_LENGTH)
]


def refuse_dots_in_image_path(image_url: str) -> str:
    if image_url.startswith(IMAGE_PATH_PREFIX) and IMAGE_PATH_FORBIDDEN in image_url:
        raise ValueError("An image path cannot go up a folder")
    return image_url


# A plain string, not HttpUrl: HttpUrl rewrites the address, which could pass the column length.
# Either an https address or a self hosted photo under /images/.
ImageUrl = Annotated[
    str,
    StringConstraints(
        max_length=IMAGE_URL_MAX_LENGTH,
        pattern=rf"^({re.escape(IMAGE_URL_SCHEME)}|{re.escape(IMAGE_PATH_PREFIX)})\S+$",
    ),
    AfterValidator(refuse_dots_in_image_path),
]
Price = Annotated[int, Field(strict=True, ge=PRICE_MIN, le=PRICE_MAX)]
Quantity = Annotated[int, Field(strict=True, ge=QUANTITY_MIN, le=QUANTITY_MAX)]

RestockAmount = Annotated[int, Field(strict=True, ge=RESTOCK_AMOUNT_MIN, le=RESTOCK_AMOUNT_MAX)]


class VehicleCreate(RequestSchema):
    make: Make
    model: Model
    category: Category
    price: Price
    quantity: Quantity
    image_url: ImageUrl | None = None


class VehicleUpdate(RequestSchema):
    make: Make
    model: Model
    category: Category
    price: Price
    image_url: ImageUrl | None


class RestockRequest(RequestSchema):
    amount: RestockAmount


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    make: str
    model: str
    category: str
    price: int
    quantity: int
    image_url: str | None

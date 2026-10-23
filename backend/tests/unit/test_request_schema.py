import pytest
from pydantic import ValidationError

from app.schemas.base import RequestSchema


class ExampleRequest(RequestSchema):
    name: str


def test_unknown_field_is_refused() -> None:
    with pytest.raises(ValidationError):
        ExampleRequest.model_validate({"name": "Creta", "role": "admin"})

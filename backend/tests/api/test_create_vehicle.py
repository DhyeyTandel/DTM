import pytest
from fastapi.testclient import TestClient

from app.limits import (
    MAKE_MAX_LENGTH,
    MODEL_MAX_LENGTH,
    PRICE_MAX,
    PRICE_MIN,
    QUANTITY_MAX,
    QUANTITY_MIN,
)
from tests.vehicles import VALID_VEHICLE, VEHICLES_URL


def test_an_admin_adding_a_vehicle_gets_201_with_the_vehicle_and_its_id(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    body = response.json()
    assert response.status_code == 201
    assert isinstance(body["id"], int)
    assert {key: body[key] for key in VALID_VEHICLE} == VALID_VEHICLE


def test_adding_a_vehicle_with_an_image_url_returns_it(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    image_url = "https://upload.wikimedia.org/wikipedia/commons/a/a1/Corolla.jpg"

    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "image_url": image_url}, headers=admin_headers
    )

    assert response.status_code == 201
    assert response.json()["image_url"] == image_url


def test_adding_a_vehicle_without_an_image_url_returns_null_for_it(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    assert response.status_code == 201
    assert response.json()["image_url"] is None


def test_adding_a_vehicle_without_a_token_returns_401(client: TestClient) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE)

    assert response.status_code == 401


def test_a_customer_adding_a_vehicle_gets_403(
    client: TestClient, buyer_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=buyer_headers)

    assert response.status_code == 403
    assert "detail" in response.json()


def test_two_vehicles_get_different_ids(client: TestClient, admin_headers: dict[str, str]) -> None:
    first = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)
    second = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    assert first.json()["id"] != second.json()["id"]


def test_two_vehicles_with_the_same_make_and_model_are_allowed(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    assert response.status_code == 201


@pytest.mark.parametrize("category", ["bus", "SUV", ""])
def test_a_category_outside_the_list_returns_422(
    client: TestClient, admin_headers: dict[str, str], category: str
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "category": category}, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize("missing_field", list(VALID_VEHICLE))
def test_a_body_missing_a_field_returns_422(
    client: TestClient, admin_headers: dict[str, str], missing_field: str
) -> None:
    body = {key: value for key, value in VALID_VEHICLE.items() if key != missing_field}

    response = client.post(VEHICLES_URL, json=body, headers=admin_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("field", ["make", "model"])
def test_an_empty_make_or_model_returns_422(
    client: TestClient, admin_headers: dict[str, str], field: str
) -> None:
    response = client.post(VEHICLES_URL, json={**VALID_VEHICLE, field: ""}, headers=admin_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("price", [0, -1, PRICE_MAX + 1])
def test_a_price_outside_the_range_returns_422(
    client: TestClient, admin_headers: dict[str, str], price: int
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "price": price}, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize("price", [PRICE_MIN, PRICE_MAX])
def test_a_price_at_either_end_of_the_range_is_accepted(
    client: TestClient, admin_headers: dict[str, str], price: int
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "price": price}, headers=admin_headers
    )

    assert response.status_code == 201
    assert response.json()["price"] == price


@pytest.mark.parametrize("price", [10.5, 100.0, "100", True])
def test_a_price_that_is_not_a_whole_number_returns_422(
    client: TestClient, admin_headers: dict[str, str], price: object
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "price": price}, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize("quantity", [QUANTITY_MIN - 1, QUANTITY_MAX + 1, 5.5, "5", True])
def test_a_quantity_outside_the_range_or_not_a_whole_number_returns_422(
    client: TestClient, admin_headers: dict[str, str], quantity: object
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "quantity": quantity}, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize("quantity", [QUANTITY_MIN, QUANTITY_MAX])
def test_a_quantity_at_either_end_of_the_range_is_accepted(
    client: TestClient, admin_headers: dict[str, str], quantity: int
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "quantity": quantity}, headers=admin_headers
    )

    assert response.status_code == 201
    assert response.json()["quantity"] == quantity


@pytest.mark.parametrize(
    ("field", "longest"), [("make", MAKE_MAX_LENGTH), ("model", MODEL_MAX_LENGTH)]
)
def test_a_make_or_model_over_the_maximum_length_returns_422(
    client: TestClient, admin_headers: dict[str, str], field: str, longest: int
) -> None:
    too_long = "a" * (longest + 1)

    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, field: too_long}, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize("field", ["make", "model"])
def test_a_make_or_model_is_stored_without_surrounding_spaces(
    client: TestClient, admin_headers: dict[str, str], field: str
) -> None:
    padded = f"  {VALID_VEHICLE[field]}  "

    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, field: padded}, headers=admin_headers
    )

    assert response.json()[field] == VALID_VEHICLE[field]


@pytest.mark.parametrize("field", ["make", "model"])
def test_a_make_or_model_of_only_spaces_returns_422(
    client: TestClient, admin_headers: dict[str, str], field: str
) -> None:
    response = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, field: "   "}, headers=admin_headers
    )

    assert response.status_code == 422

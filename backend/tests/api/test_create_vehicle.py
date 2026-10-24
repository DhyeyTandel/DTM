import pytest
from fastapi.testclient import TestClient

from tests.vehicles import VALID_VEHICLE, VEHICLES_URL


def test_an_admin_adding_a_vehicle_gets_201_with_the_vehicle_and_its_id(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    body = response.json()
    assert response.status_code == 201
    assert isinstance(body["id"], int)
    assert {key: body[key] for key in VALID_VEHICLE} == VALID_VEHICLE


def test_adding_a_vehicle_without_a_token_returns_401(client: TestClient) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE)

    assert response.status_code == 401


def test_a_customer_adding_a_vehicle_gets_403(
    client: TestClient, buyer_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=buyer_headers)

    assert response.status_code == 403


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

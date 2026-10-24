from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.limits import IMAGE_URL_MAX_LENGTH, MAKE_MAX_LENGTH, PRICE_MAX, VEHICLE_ID_MAX
from tests.vehicles import VEHICLES_URL

NEW_FIELDS = {
    "make": "Honda",
    "model": "City",
    "category": "hatchback",
    "price": 1_200_000_00,
    "image_url": None,
}
IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/c/c1/City.jpg"


def test_an_admin_updating_a_vehicle_gets_200_with_the_new_values(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}", json=NEW_FIELDS, headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json() == {**stocked_vehicle, **NEW_FIELDS}


def test_updating_replaces_the_image_url_and_null_clears_it(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    url = f"{VEHICLES_URL}/{stocked_vehicle['id']}"

    replaced = client.put(url, json={**NEW_FIELDS, "image_url": IMAGE_URL}, headers=admin_headers)
    cleared = client.put(url, json={**NEW_FIELDS, "image_url": None}, headers=admin_headers)

    assert replaced.json()["image_url"] == IMAGE_URL
    assert cleared.json()["image_url"] is None


@pytest.mark.parametrize(
    "image_url",
    [
        "http://example.com/car.jpg",
        "javascript:alert(1)",
        "https://example.com/my car.jpg",
        "",
        "https://",
        "https://" + "a" * IMAGE_URL_MAX_LENGTH,
    ],
)
def test_an_update_with_a_bad_image_url_returns_422_and_the_vehicle_is_unchanged(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    image_url: str,
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}",
        json={**NEW_FIELDS, "image_url": image_url},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]


def test_a_customer_updating_a_vehicle_gets_403_and_nothing_changes(
    client: TestClient,
    admin_headers: dict[str, str],
    buyer_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}", json=NEW_FIELDS, headers=buyer_headers
    )

    assert response.status_code == 403
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]


def test_updating_a_missing_vehicle_returns_404(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.put(f"{VEHICLES_URL}/999", json=NEW_FIELDS, headers=admin_headers)

    assert response.status_code == 404
    assert "detail" in response.json()


def test_a_quantity_in_the_body_returns_422_and_stock_is_unchanged(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}",
        json={**NEW_FIELDS, "quantity": 999},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]


@pytest.mark.parametrize("missing_field", list(NEW_FIELDS))
def test_a_body_missing_a_field_returns_422(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    missing_field: str,
) -> None:
    body = {key: value for key, value in NEW_FIELDS.items() if key != missing_field}

    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}", json=body, headers=admin_headers
    )

    assert response.status_code == 422


@pytest.mark.parametrize(
    "changes",
    [
        {"make": ""},
        {"make": "a" * (MAKE_MAX_LENGTH + 1)},
        {"category": "bus"},
        {"price": 0},
        {"price": PRICE_MAX + 1},
        {"price": 10.5},
    ],
)
def test_invalid_values_return_422_and_the_stored_vehicle_is_unchanged(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    changes: dict[str, object],
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}",
        json={**NEW_FIELDS, **changes},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]


@pytest.mark.parametrize("field", ["make", "model"])
def test_an_updated_make_or_model_is_trimmed_and_spaces_alone_return_422(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    field: str,
) -> None:
    url = f"{VEHICLES_URL}/{stocked_vehicle['id']}"

    padded = client.put(url, json={**NEW_FIELDS, field: "  Padded  "}, headers=admin_headers)
    blank = client.put(url, json={**NEW_FIELDS, field: "   "}, headers=admin_headers)

    assert padded.json()[field] == "Padded"
    assert blank.status_code == 422


@pytest.mark.parametrize("vehicle_id", ["abc", "0", "-1", str(VEHICLE_ID_MAX + 1)])
def test_an_id_that_is_not_a_valid_vehicle_id_returns_422(
    client: TestClient, admin_headers: dict[str, str], vehicle_id: str
) -> None:
    response = client.put(f"{VEHICLES_URL}/{vehicle_id}", json=NEW_FIELDS, headers=admin_headers)

    assert response.status_code == 422

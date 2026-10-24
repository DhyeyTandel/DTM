from typing import Any

from fastapi.testclient import TestClient

from tests.vehicles import VEHICLES_URL

NEW_FIELDS = {"make": "Honda", "model": "City", "category": "hatchback", "price": 1_200_000_00}


def test_an_admin_updating_a_vehicle_gets_200_with_the_new_values(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.put(
        f"{VEHICLES_URL}/{stocked_vehicle['id']}", json=NEW_FIELDS, headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json() == {**stocked_vehicle, **NEW_FIELDS}


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

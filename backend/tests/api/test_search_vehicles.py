from typing import Any

from fastapi.testclient import TestClient

from tests.vehicles import VALID_VEHICLE, VEHICLES_URL

SEARCH_URL = f"{VEHICLES_URL}/search"


def add_vehicle(client: TestClient, headers: dict[str, str], **changes: Any) -> dict[str, Any]:
    response = client.post(VEHICLES_URL, json={**VALID_VEHICLE, **changes}, headers=headers)
    vehicle: dict[str, Any] = response.json()
    return vehicle


def test_searching_by_make_returns_the_matching_vehicles(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    toyota = add_vehicle(client, admin_headers)
    add_vehicle(client, admin_headers, make="Honda")

    response = client.get(SEARCH_URL, params={"make": "toyota"}, headers=buyer_headers)

    assert response.status_code == 200
    assert response.json() == [toyota]

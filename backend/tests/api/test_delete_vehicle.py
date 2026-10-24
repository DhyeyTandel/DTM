from typing import Any

from fastapi.testclient import TestClient

from tests.vehicles import VEHICLES_URL


def test_an_admin_deleting_a_vehicle_gets_204(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.delete(f"{VEHICLES_URL}/{stocked_vehicle['id']}", headers=admin_headers)

    assert response.status_code == 204
    assert response.content == b""


def test_a_customer_deleting_a_vehicle_gets_403_and_the_vehicle_remains(
    client: TestClient,
    admin_headers: dict[str, str],
    buyer_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
) -> None:
    response = client.delete(f"{VEHICLES_URL}/{stocked_vehicle['id']}", headers=buyer_headers)

    assert response.status_code == 403
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]

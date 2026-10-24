from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.limits import VEHICLE_ID_MAX
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


def test_a_deleted_vehicle_no_longer_appears_in_the_list(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    client.delete(f"{VEHICLES_URL}/{stocked_vehicle['id']}", headers=admin_headers)

    assert client.get(VEHICLES_URL, headers=admin_headers).json() == []


def test_deleting_a_missing_vehicle_returns_404(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.delete(f"{VEHICLES_URL}/999", headers=admin_headers)

    assert response.status_code == 404
    assert "detail" in response.json()


def test_deleting_the_same_vehicle_twice_gives_204_then_404(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    url = f"{VEHICLES_URL}/{stocked_vehicle['id']}"

    first = client.delete(url, headers=admin_headers)
    second = client.delete(url, headers=admin_headers)

    assert (first.status_code, second.status_code) == (204, 404)


@pytest.mark.parametrize("vehicle_id", ["abc", "0", "-1", str(VEHICLE_ID_MAX + 1)])
def test_an_id_that_is_not_a_valid_vehicle_id_returns_422(
    client: TestClient, admin_headers: dict[str, str], vehicle_id: str
) -> None:
    response = client.delete(f"{VEHICLES_URL}/{vehicle_id}", headers=admin_headers)

    assert response.status_code == 422

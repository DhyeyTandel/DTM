from typing import Any

from fastapi.testclient import TestClient

from tests.vehicles import VALID_VEHICLE, VEHICLES_URL

MISSING_VEHICLE_ID = 999_999


def purchase_url(vehicle_id: int) -> str:
    return f"{VEHICLES_URL}/{vehicle_id}/purchase"


def test_a_customer_purchase_returns_the_full_vehicle_with_one_less_in_stock(
    client: TestClient, buyer_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.post(purchase_url(stocked_vehicle["id"]), headers=buyer_headers)

    assert response.status_code == 200
    assert response.json() == {**stocked_vehicle, "quantity": VALID_VEHICLE["quantity"] - 1}


def test_an_admin_purchase_is_handled_like_a_customers(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.post(purchase_url(stocked_vehicle["id"]), headers=admin_headers)

    assert response.status_code == 200
    assert response.json()["quantity"] == VALID_VEHICLE["quantity"] - 1


def test_purchasing_a_sold_out_vehicle_returns_409_and_stock_stays_zero(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    sold_out = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "quantity": 0}, headers=admin_headers
    ).json()

    response = client.post(purchase_url(sold_out["id"]), headers=buyer_headers)

    assert response.status_code == 409
    assert "detail" in response.json()
    assert client.get(VEHICLES_URL, headers=buyer_headers).json() == [sold_out]


def test_purchasing_a_missing_vehicle_returns_404(
    client: TestClient, buyer_headers: dict[str, str]
) -> None:
    response = client.post(purchase_url(MISSING_VEHICLE_ID), headers=buyer_headers)

    assert response.status_code == 404


def test_a_body_sent_to_purchase_is_not_read_and_exactly_one_unit_is_bought(
    client: TestClient, buyer_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.post(
        purchase_url(stocked_vehicle["id"]), json={"quantity": 3}, headers=buyer_headers
    )

    assert response.status_code == 200
    assert response.json()["quantity"] == VALID_VEHICLE["quantity"] - 1

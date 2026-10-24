from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.limits import QUANTITY_MAX, RESTOCK_AMOUNT_MAX
from tests.vehicles import VALID_VEHICLE, VEHICLES_URL

MISSING_VEHICLE_ID = 999_999


def restock_url(vehicle_id: int) -> str:
    return f"{VEHICLES_URL}/{vehicle_id}/restock"


def test_an_admin_restock_returns_the_full_vehicle_with_the_new_quantity(
    client: TestClient, admin_headers: dict[str, str], stocked_vehicle: dict[str, Any]
) -> None:
    response = client.post(
        restock_url(stocked_vehicle["id"]), json={"amount": 20}, headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json() == {**stocked_vehicle, "quantity": stocked_vehicle["quantity"] + 20}


def test_a_customer_restocking_gets_403_and_stock_is_unchanged(
    client: TestClient,
    admin_headers: dict[str, str],
    buyer_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
) -> None:
    response = client.post(
        restock_url(stocked_vehicle["id"]), json={"amount": 20}, headers=buyer_headers
    )

    assert response.status_code == 403
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [stocked_vehicle]


def test_restocking_a_missing_vehicle_returns_404(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(
        restock_url(MISSING_VEHICLE_ID), json={"amount": 20}, headers=admin_headers
    )

    assert response.status_code == 404


@pytest.mark.parametrize(
    "body", [{"amount": 0}, {"amount": -5}, {"amount": RESTOCK_AMOUNT_MAX + 1}]
)
def test_an_amount_outside_the_range_returns_422(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    body: dict[str, Any],
) -> None:
    response = client.post(restock_url(stocked_vehicle["id"]), json=body, headers=admin_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("body", [{"amount": 2.5}, {"amount": "20"}, {"amount": True}, {}])
def test_an_amount_that_is_not_a_whole_number_or_is_missing_returns_422(
    client: TestClient,
    admin_headers: dict[str, str],
    stocked_vehicle: dict[str, Any],
    body: dict[str, Any],
) -> None:
    response = client.post(restock_url(stocked_vehicle["id"]), json=body, headers=admin_headers)

    assert response.status_code == 422


def test_restocking_a_sold_out_vehicle_makes_it_purchasable_again(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    sold_out = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "quantity": 0}, headers=admin_headers
    ).json()
    purchase_url = f"{VEHICLES_URL}/{sold_out['id']}/purchase"
    assert client.post(purchase_url, headers=buyer_headers).status_code == 409

    client.post(restock_url(sold_out["id"]), json={"amount": 2}, headers=admin_headers)

    assert client.post(purchase_url, headers=buyer_headers).status_code == 200


def test_a_restock_past_the_stock_limit_returns_409_and_quantity_is_unchanged(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    nearly_full = client.post(
        VEHICLES_URL, json={**VALID_VEHICLE, "quantity": QUANTITY_MAX - 1}, headers=admin_headers
    ).json()

    response = client.post(
        restock_url(nearly_full["id"]), json={"amount": 2}, headers=admin_headers
    )

    assert response.status_code == 409
    assert "detail" in response.json()
    assert client.get(VEHICLES_URL, headers=admin_headers).json() == [nearly_full]

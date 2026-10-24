from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.limits import PRICE_MAX
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


def test_searching_without_a_token_returns_401(client: TestClient) -> None:
    response = client.get(SEARCH_URL)

    assert response.status_code == 401


def test_a_search_with_no_match_returns_200_and_an_empty_list(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    add_vehicle(client, admin_headers)

    response = client.get(SEARCH_URL, params={"make": "ferrari"}, headers=admin_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_out_of_stock_vehicles_are_included_in_the_results(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    sold_out = add_vehicle(client, admin_headers, quantity=0)

    response = client.get(SEARCH_URL, params={"make": "toyota"}, headers=admin_headers)

    assert response.json() == [sold_out]


def test_a_minimum_price_above_the_maximum_returns_422(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.get(
        SEARCH_URL,
        params={"min_price": 2_000_000_00, "max_price": 1_000_000_00},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert "detail" in response.json()


def test_a_price_range_narrows_the_results(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    add_vehicle(client, admin_headers, price=1_000_000_00)
    middle = add_vehicle(client, admin_headers, price=2_000_000_00)
    add_vehicle(client, admin_headers, price=3_000_000_00)

    response = client.get(
        SEARCH_URL,
        params={"min_price": 1_500_000_00, "max_price": 2_500_000_00},
        headers=admin_headers,
    )

    assert response.json() == [middle]


@pytest.mark.parametrize("bound", ["min_price", "max_price"])
@pytest.mark.parametrize("value", ["-1", "10.5", "abc", str(PRICE_MAX + 1)])
def test_a_price_bound_that_is_negative_not_whole_or_too_large_returns_422(
    client: TestClient, admin_headers: dict[str, str], bound: str, value: str
) -> None:
    response = client.get(SEARCH_URL, params={bound: value}, headers=admin_headers)

    assert response.status_code == 422


@pytest.mark.parametrize("category", ["bus", "SUV"])
def test_a_category_outside_the_list_returns_422(
    client: TestClient, admin_headers: dict[str, str], category: str
) -> None:
    response = client.get(SEARCH_URL, params={"category": category}, headers=admin_headers)

    assert response.status_code == 422


def test_searching_by_category_returns_only_that_category(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    add_vehicle(client, admin_headers, category="sedan")
    suv = add_vehicle(client, admin_headers, category="suv")

    response = client.get(SEARCH_URL, params={"category": "suv"}, headers=admin_headers)

    assert response.json() == [suv]


def test_searching_by_part_of_the_model_returns_the_matching_vehicles(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    corolla = add_vehicle(client, admin_headers)
    add_vehicle(client, admin_headers, model="Camry")

    response = client.get(SEARCH_URL, params={"model": "COROL"}, headers=admin_headers)

    assert response.json() == [corolla]


@pytest.mark.parametrize("field", ["make", "model"])
@pytest.mark.parametrize("blank", ["", "   "])
def test_blank_search_text_behaves_like_no_filter(
    client: TestClient, admin_headers: dict[str, str], field: str, blank: str
) -> None:
    everything = [
        add_vehicle(client, admin_headers),
        add_vehicle(client, admin_headers, make="Honda"),
    ]

    response = client.get(SEARCH_URL, params={field: blank}, headers=admin_headers)

    assert response.json() == everything


def test_spaces_around_search_text_are_ignored(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    toyota = add_vehicle(client, admin_headers)

    response = client.get(SEARCH_URL, params={"make": "  toyota  "}, headers=admin_headers)

    assert response.json() == [toyota]

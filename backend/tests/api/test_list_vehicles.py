from fastapi.testclient import TestClient

from tests.vehicles import VALID_VEHICLE, VEHICLES_URL


def test_a_customer_listing_vehicles_gets_all_of_them(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    toyota = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers).json()
    honda_fields = {**VALID_VEHICLE, "make": "Honda", "model": "City"}
    honda = client.post(VEHICLES_URL, json=honda_fields, headers=admin_headers).json()

    response = client.get(VEHICLES_URL, headers=buyer_headers)

    assert response.status_code == 200
    assert response.json() == [toyota, honda]


def test_list_and_search_responses_include_the_image_url(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    image_url = "https://upload.wikimedia.org/wikipedia/commons/a/a1/Corolla.jpg"
    client.post(VEHICLES_URL, json={**VALID_VEHICLE, "image_url": image_url}, headers=admin_headers)

    listed = client.get(VEHICLES_URL, headers=buyer_headers).json()
    searched = client.get(f"{VEHICLES_URL}/search", headers=buyer_headers).json()

    assert [vehicle["image_url"] for vehicle in listed] == [image_url]
    assert [vehicle["image_url"] for vehicle in searched] == [image_url]


def test_a_vehicle_with_zero_stock_is_listed(
    client: TestClient, admin_headers: dict[str, str], buyer_headers: dict[str, str]
) -> None:
    sold_out = {**VALID_VEHICLE, "quantity": 0}
    client.post(VEHICLES_URL, json=sold_out, headers=admin_headers)

    response = client.get(VEHICLES_URL, headers=buyer_headers)

    assert [vehicle["quantity"] for vehicle in response.json()] == [0]


def test_with_no_vehicles_the_list_is_empty(
    client: TestClient, buyer_headers: dict[str, str]
) -> None:
    response = client.get(VEHICLES_URL, headers=buyer_headers)

    assert response.status_code == 200
    assert response.json() == []


def test_listing_vehicles_without_a_token_returns_401(client: TestClient) -> None:
    response = client.get(VEHICLES_URL)

    assert response.status_code == 401

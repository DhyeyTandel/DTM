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

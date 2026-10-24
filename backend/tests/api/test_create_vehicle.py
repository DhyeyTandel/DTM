from fastapi.testclient import TestClient

from tests.vehicles import VALID_VEHICLE, VEHICLES_URL


def test_an_admin_adding_a_vehicle_gets_201_with_the_vehicle_and_its_id(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=admin_headers)

    body = response.json()
    assert response.status_code == 201
    assert isinstance(body["id"], int)
    assert {key: body[key] for key in VALID_VEHICLE} == VALID_VEHICLE

import pytest
from fastapi.testclient import TestClient

from tests.vehicles import VEHICLES_URL

VEHICLE_ROUTES = [
    ("GET", VEHICLES_URL),
    ("GET", f"{VEHICLES_URL}/search"),
    ("POST", VEHICLES_URL),
    ("PUT", f"{VEHICLES_URL}/1"),
    ("DELETE", f"{VEHICLES_URL}/1"),
    ("POST", f"{VEHICLES_URL}/1/purchase"),
    ("POST", f"{VEHICLES_URL}/1/restock"),
]


@pytest.mark.parametrize(("method", "url"), VEHICLE_ROUTES)
def test_a_vehicle_route_without_a_token_returns_401(
    client: TestClient, method: str, url: str
) -> None:
    response = client.request(method, url)

    assert response.status_code == 401
    assert "detail" in response.json()

from collections.abc import Callable
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import Response

from app.config import Settings
from app.main import create_app
from tests.vehicles import VEHICLES_URL

UNREACHABLE_DATABASE_URL = "postgresql+psycopg://dtm:dtm@localhost:1/dtm"
SECRET_INTERNALS = "secret internals"
BOOM_URL = "/api/boom"
CREDENTIALS = {"email": "buyer@example.com", "password": "correct horse"}

Request = Callable[[TestClient, dict[str, str], dict[str, str]], Response]

ERROR_REQUESTS: dict[str, Request] = {
    "401 no token": lambda client, buyer, admin: client.get(VEHICLES_URL),
    "403 customer on admin route": lambda client, buyer, admin: client.post(
        VEHICLES_URL, json={}, headers=buyer
    ),
    "404 missing vehicle": lambda client, buyer, admin: client.post(
        f"{VEHICLES_URL}/999999/restock", json={"amount": 1}, headers=admin
    ),
    "404 unknown route": lambda client, buyer, admin: client.get("/api/nope"),
    "405 wrong method": lambda client, buyer, admin: client.delete(VEHICLES_URL, headers=admin),
    "409 duplicate email": lambda client, buyer, admin: client.post(
        "/api/auth/register", json={"email": "owner@example.com", "password": "correct horse"}
    ),
    "422 invalid body": lambda client, buyer, admin: client.post(
        VEHICLES_URL, json={}, headers=admin
    ),
    "422 body that is not JSON": lambda client, buyer, admin: client.post(
        VEHICLES_URL, content="{bad", headers=admin
    ),
}


def assert_error_shape(response: Response) -> None:
    assert response.headers["content-type"] == "application/json"
    body = response.json()
    assert set(body) == {"detail"}
    assert isinstance(body["detail"], str | list)
    assert body["detail"]


@pytest.mark.parametrize("name", ERROR_REQUESTS)
def test_every_error_body_is_json_with_only_a_detail(
    client: TestClient, buyer_headers: dict[str, str], admin_headers: dict[str, str], name: str
) -> None:
    response = ERROR_REQUESTS[name](client, buyer_headers, admin_headers)

    assert response.status_code >= 400
    assert_error_shape(response)


def test_the_database_being_down_gives_the_same_shape(settings: Settings) -> None:
    app = create_app(settings.model_copy(update={"database_url": UNREACHABLE_DATABASE_URL}))

    assert_error_shape(TestClient(app).get("/api/health"))


def test_an_unexpected_exception_gives_500_with_no_internals(settings: Settings) -> None:
    app: FastAPI = create_app(settings)

    def boom() -> Any:
        raise RuntimeError(SECRET_INTERNALS)

    app.add_api_route(BOOM_URL, boom)

    response = TestClient(app, raise_server_exceptions=False).get(BOOM_URL)

    assert response.status_code == 500
    assert_error_shape(response)
    assert SECRET_INTERNALS not in response.text
    assert "Traceback" not in response.text

from typing import Annotated

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.dependencies import get_current_user
from app.models.user import User

PROBE_URL = "/probe/current-user"


@pytest.fixture
def probe_client(app: FastAPI) -> TestClient:
    @app.get(PROBE_URL)
    def probe(user: Annotated[User, Depends(get_current_user)]) -> dict[str, str | int]:
        return {"id": user.id, "email": user.email, "role": user.role}

    return TestClient(app)


def test_a_request_with_no_token_returns_401(probe_client: TestClient) -> None:
    response = probe_client.get(PROBE_URL)

    assert response.status_code == 401
    assert "detail" in response.json()


def test_a_valid_token_gives_the_signed_in_user(probe_client: TestClient, buyer_token: str) -> None:
    response = probe_client.get(PROBE_URL, headers={"Authorization": f"Bearer {buyer_token}"})

    assert response.status_code == 200
    assert response.json()["email"] == "buyer@example.com"
    assert response.json()["role"] == "customer"


def test_a_malformed_token_returns_401(probe_client: TestClient) -> None:
    response = probe_client.get(PROBE_URL, headers={"Authorization": "Bearer not-a-token"})

    assert response.status_code == 401

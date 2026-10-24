from typing import Annotated

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.dependencies import require_admin
from app.models.user import User

PROBE_URL = "/probe/admin"


@pytest.fixture
def probe_client(app: FastAPI) -> TestClient:
    @app.get(PROBE_URL)
    def probe(user: Annotated[User, Depends(require_admin)]) -> dict[str, str]:
        return {"role": user.role}

    return TestClient(app)


def test_a_customer_token_returns_403(probe_client: TestClient, buyer_token: str) -> None:
    response = probe_client.get(PROBE_URL, headers={"Authorization": f"Bearer {buyer_token}"})

    assert response.status_code == 403
    assert "detail" in response.json()


def test_an_admin_token_is_accepted(probe_client: TestClient, admin_token: str) -> None:
    response = probe_client.get(PROBE_URL, headers={"Authorization": f"Bearer {admin_token}"})

    assert response.status_code == 200
    assert response.json() == {"role": "admin"}

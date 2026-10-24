from datetime import timedelta
from typing import Annotated

import jwt
import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.dependencies import get_current_user
from app.models.user import User
from app.security.tokens import create_access_token

PROBE_URL = "/probe/current-user"
OTHER_SECRET_KEY = "a-different-secret-that-is-also-long-enough"


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def user_id_of(token: str) -> int:
    return int(jwt.decode(token, options={"verify_signature": False})["sub"])


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


def test_a_token_signed_with_a_different_secret_returns_401(
    probe_client: TestClient, settings: Settings, buyer_token: str
) -> None:
    forged_token = create_access_token(
        user_id_of(buyer_token), OTHER_SECRET_KEY, settings.token_algorithm, timedelta(minutes=5)
    )

    response = probe_client.get(PROBE_URL, headers=bearer(forged_token))

    assert response.status_code == 401


def test_an_expired_token_returns_401(
    probe_client: TestClient, settings: Settings, buyer_token: str
) -> None:
    expired_token = create_access_token(
        user_id_of(buyer_token),
        settings.secret_key,
        settings.token_algorithm,
        timedelta(minutes=-1),
    )

    response = probe_client.get(PROBE_URL, headers=bearer(expired_token))

    assert response.status_code == 401


def test_a_valid_token_for_a_user_that_no_longer_exists_returns_401(
    probe_client: TestClient,
    rolled_back_session_factory: sessionmaker[Session],
    buyer_token: str,
) -> None:
    with rolled_back_session_factory() as session:
        session.query(User).delete()
        session.commit()

    response = probe_client.get(PROBE_URL, headers=bearer(buyer_token))

    assert response.status_code == 401

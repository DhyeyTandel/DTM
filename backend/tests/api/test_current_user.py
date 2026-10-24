from datetime import UTC, datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.domain.role import Role
from app.models.user import User
from app.security.tokens import create_access_token
from tests.vehicles import VALID_VEHICLE, VEHICLES_URL

OTHER_SECRET_KEY = "a-different-secret-that-is-also-long-enough"


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def user_id_of(token: str) -> int:
    return int(jwt.decode(token, options={"verify_signature": False})["sub"])


def test_a_valid_token_is_accepted(client: TestClient, buyer_token: str) -> None:
    response = client.get(VEHICLES_URL, headers=bearer(buyer_token))

    assert response.status_code == 200


def test_a_malformed_token_returns_401(client: TestClient) -> None:
    response = client.get(VEHICLES_URL, headers={"Authorization": "Bearer not-a-token"})

    assert response.status_code == 401


def test_a_token_signed_with_a_different_secret_returns_401(
    client: TestClient, settings: Settings, buyer_token: str
) -> None:
    forged_token = create_access_token(
        user_id_of(buyer_token), OTHER_SECRET_KEY, settings.token_algorithm, timedelta(minutes=5)
    )

    response = client.get(VEHICLES_URL, headers=bearer(forged_token))

    assert response.status_code == 401


def test_an_expired_token_returns_401(
    client: TestClient, settings: Settings, buyer_token: str
) -> None:
    expired_token = create_access_token(
        user_id_of(buyer_token),
        settings.secret_key,
        settings.token_algorithm,
        timedelta(minutes=-1),
    )

    response = client.get(VEHICLES_URL, headers=bearer(expired_token))

    assert response.status_code == 401


def test_a_valid_token_for_a_user_that_no_longer_exists_returns_401(
    client: TestClient,
    rolled_back_session_factory: sessionmaker[Session],
    buyer_token: str,
) -> None:
    with rolled_back_session_factory() as session:
        session.query(User).delete()
        session.commit()

    response = client.get(VEHICLES_URL, headers=bearer(buyer_token))

    assert response.status_code == 401


def test_an_authorization_header_without_the_bearer_scheme_returns_401(
    client: TestClient, buyer_token: str
) -> None:
    response = client.get(VEHICLES_URL, headers={"Authorization": f"Basic {buyer_token}"})

    assert response.status_code == 401


@pytest.mark.parametrize("missing_claim", ["exp", "sub"])
def test_a_signed_token_missing_a_claim_returns_401(
    client: TestClient, settings: Settings, buyer_token: str, missing_claim: str
) -> None:
    claims = {
        "sub": str(user_id_of(buyer_token)),
        "exp": datetime.now(UTC) + timedelta(minutes=5),
    }
    del claims[missing_claim]
    token = jwt.encode(claims, settings.secret_key, algorithm=settings.token_algorithm)

    response = client.get(VEHICLES_URL, headers=bearer(token))

    assert response.status_code == 401


def test_a_signed_token_with_a_non_numeric_sub_returns_401(
    client: TestClient, settings: Settings
) -> None:
    claims = {"sub": "not-a-number", "exp": datetime.now(UTC) + timedelta(minutes=5)}
    token = jwt.encode(claims, settings.secret_key, algorithm=settings.token_algorithm)

    response = client.get(VEHICLES_URL, headers=bearer(token))

    assert response.status_code == 401


def test_the_role_comes_from_the_database_not_the_token(
    client: TestClient,
    rolled_back_session_factory: sessionmaker[Session],
    buyer_token: str,
) -> None:
    before = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=bearer(buyer_token))
    with rolled_back_session_factory() as session:
        session.query(User).update({User.role: Role.ADMIN})
        session.commit()

    after = client.post(VEHICLES_URL, json=VALID_VEHICLE, headers=bearer(buyer_token))

    assert (before.status_code, after.status_code) == (403, 201)

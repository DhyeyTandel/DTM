from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.config import Settings
from app.domain.errors import InvalidCredentials
from app.limits import PASSWORD_MAX_BYTES
from app.services.auth_service import AuthService
from tests.unit.fakes import FakeUserRepository

EMAIL = "buyer@example.com"
PASSWORD = "correct horse"


def build_service_with_registered_buyer(settings: Settings) -> AuthService:
    service = AuthService(FakeUserRepository(), settings)
    service.register(EMAIL, PASSWORD)
    return service


def test_login_with_correct_credentials_returns_an_access_token(settings: Settings) -> None:
    service = build_service_with_registered_buyer(settings)

    token = service.login(EMAIL, PASSWORD)

    assert token


def test_login_with_a_wrong_password_raises_invalid_credentials(settings: Settings) -> None:
    service = build_service_with_registered_buyer(settings)

    with pytest.raises(InvalidCredentials):
        service.login(EMAIL, "wrong password")


def test_login_with_an_unknown_email_raises_invalid_credentials(settings: Settings) -> None:
    service = build_service_with_registered_buyer(settings)

    with pytest.raises(InvalidCredentials):
        service.login("nobody@example.com", PASSWORD)


def test_the_token_carries_only_the_user_id_and_an_expiry_from_config(
    settings: Settings,
) -> None:
    short_lived_settings = settings.model_copy(update={"token_lifetime_minutes": 15})
    service = build_service_with_registered_buyer(short_lived_settings)

    token = service.login(EMAIL, PASSWORD)

    claims = jwt.decode(token, settings.secret_key, algorithms=[settings.token_algorithm])
    expected_expiry = datetime.now(UTC) + timedelta(minutes=15)
    assert set(claims) == {"sub", "exp"}
    assert claims["sub"] == "1"
    assert abs(claims["exp"] - expected_expiry.timestamp()) < 5


def test_login_with_a_password_over_the_byte_limit_raises_invalid_credentials(
    settings: Settings,
) -> None:
    service = build_service_with_registered_buyer(settings)

    with pytest.raises(InvalidCredentials):
        service.login(EMAIL, "a" * (PASSWORD_MAX_BYTES + 1))

import pytest

from app.config import Settings
from app.domain.errors import InvalidAdminSettings
from app.limits import PASSWORD_MAX_BYTES, PASSWORD_MIN_BYTES
from app.services.seed_admin import seed_admin
from tests.credentials import ADMIN_EMAIL, ADMIN_PASSWORD
from tests.unit.fakes import FakeUserRepository


@pytest.mark.parametrize(
    "admin_values",
    [
        {},
        {"admin_email": ADMIN_EMAIL},
        {"admin_password": ADMIN_PASSWORD},
    ],
    ids=["both missing", "password missing", "email missing"],
)
def test_the_seed_fails_with_a_clear_message_when_admin_settings_are_missing(
    settings: Settings, admin_values: dict[str, str]
) -> None:
    incomplete_settings = settings.model_copy(update=admin_values)

    with pytest.raises(InvalidAdminSettings, match="ADMIN_EMAIL and ADMIN_PASSWORD"):
        seed_admin(FakeUserRepository(), incomplete_settings)


@pytest.mark.parametrize(
    "password",
    ["a" * (PASSWORD_MIN_BYTES - 1), "a" * (PASSWORD_MAX_BYTES + 1)],
    ids=["too short", "too long"],
)
def test_the_seed_refuses_an_admin_password_outside_the_byte_limits(
    admin_settings: Settings, password: str
) -> None:
    bad_password_settings = admin_settings.model_copy(update={"admin_password": password})

    with pytest.raises(InvalidAdminSettings, match="ADMIN_PASSWORD"):
        seed_admin(FakeUserRepository(), bad_password_settings)

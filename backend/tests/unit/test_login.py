from app.config import Settings
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

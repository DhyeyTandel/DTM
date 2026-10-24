from app.domain.role import Role
from app.services.auth_service import AuthService
from tests.unit.fakes import FakeUserRepository


def test_registering_a_new_email_creates_a_customer() -> None:
    service = AuthService(FakeUserRepository())

    user = service.register("buyer@example.com", "correct horse")

    assert user.email == "buyer@example.com"
    assert user.role == Role.CUSTOMER

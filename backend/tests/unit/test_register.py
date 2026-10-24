import bcrypt

from app.domain.role import Role
from app.services.auth_service import AuthService
from tests.unit.fakes import FakeUserRepository


def test_registering_a_new_email_creates_a_customer() -> None:
    service = AuthService(FakeUserRepository())

    user = service.register("buyer@example.com", "correct horse")

    assert user.email == "buyer@example.com"
    assert user.role == Role.CUSTOMER


def test_the_stored_password_is_a_hash_not_the_plain_text() -> None:
    users = FakeUserRepository()
    service = AuthService(users)

    service.register("buyer@example.com", "correct horse")

    stored_hash = users.users[0].password_hash
    assert stored_hash != "correct horse"
    assert bcrypt.checkpw(b"correct horse", stored_hash.encode())

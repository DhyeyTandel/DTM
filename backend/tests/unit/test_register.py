import bcrypt
import pytest

from app.domain.errors import EmailAlreadyRegistered
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


def test_registering_an_existing_email_is_refused() -> None:
    service = AuthService(FakeUserRepository())
    service.register("buyer@example.com", "correct horse")

    with pytest.raises(EmailAlreadyRegistered):
        service.register("buyer@example.com", "another password")


def test_the_email_is_trimmed_and_lowercased_before_it_is_stored_or_looked_up() -> None:
    users = FakeUserRepository()
    service = AuthService(users)

    service.register("  Buyer@Example.COM ", "correct horse")

    assert users.users[0].email == "buyer@example.com"
    with pytest.raises(EmailAlreadyRegistered):
        service.register("BUYER@example.com  ", "another password")

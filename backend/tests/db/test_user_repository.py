import pytest
from sqlalchemy.orm import Session, sessionmaker

from app.domain.errors import EmailAlreadyRegistered
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import SqlUserRepository


def build_user(email: str) -> User:
    return User(email=email, password_hash="not-a-real-hash", role=Role.CUSTOMER)


def test_inserting_the_same_email_twice_raises_email_already_registered(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        users = SqlUserRepository(session)
        users.add(build_user("buyer@example.com"))

        with pytest.raises(EmailAlreadyRegistered):
            users.add(build_user("buyer@example.com"))

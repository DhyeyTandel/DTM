import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.domain.errors import EmailAlreadyRegistered
from app.domain.role import Role
from app.repositories.user_repository import SqlUserRepository


def test_inserting_the_same_email_twice_raises_email_already_registered(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        users = SqlUserRepository(session)
        users.add("buyer@example.com", "not-a-real-hash", Role.CUSTOMER)

        with pytest.raises(EmailAlreadyRegistered):
            users.add("buyer@example.com", "not-a-real-hash", Role.CUSTOMER)


def test_a_role_outside_the_list_is_refused_and_not_reported_as_a_duplicate_email(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        with pytest.raises(IntegrityError):
            SqlUserRepository(session).add("buyer@example.com", "not-a-real-hash", "superuser")

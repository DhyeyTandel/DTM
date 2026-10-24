from typing import Protocol

from psycopg.errors import UniqueViolation
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domain.errors import EmailAlreadyRegistered
from app.domain.role import Role
from app.models.user import EMAIL_UNIQUE_CONSTRAINT, User


class UserRepository(Protocol):
    def add(self, email: str, password_hash: str, role: str) -> User: ...

    def make_admin(self, user_id: int, password_hash: str) -> User: ...

    def find_by_email(self, email: str) -> User | None: ...

    def find_by_id(self, user_id: int) -> User | None: ...


class SqlUserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, email: str, password_hash: str, role: str) -> User:
        user = User(email=email, password_hash=password_hash, role=role)
        self.session.add(user)
        try:
            self.session.flush()
        except IntegrityError as error:
            if not is_duplicate_email(error):
                raise
            raise EmailAlreadyRegistered from error
        return user

    def make_admin(self, user_id: int, password_hash: str) -> User:
        statement = (
            update(User)
            .where(User.id == user_id)
            .values(role=Role.ADMIN, password_hash=password_hash)
            .returning(User)
        )
        return self.session.scalars(statement).one()

    def find_by_email(self, email: str) -> User | None:
        return self.session.query(User).filter_by(email=email).one_or_none()

    def find_by_id(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)


def is_duplicate_email(error: IntegrityError) -> bool:
    return (
        isinstance(error.orig, UniqueViolation)
        and error.orig.diag.constraint_name == EMAIL_UNIQUE_CONSTRAINT
    )

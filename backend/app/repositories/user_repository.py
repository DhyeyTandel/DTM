from typing import Protocol

from psycopg.errors import UniqueViolation
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domain.errors import EmailAlreadyRegistered
from app.models.user import EMAIL_UNIQUE_CONSTRAINT, User


class UserRepository(Protocol):
    def add(self, user: User) -> User: ...

    def find_by_email(self, email: str) -> User | None: ...

    def find_by_id(self, user_id: int) -> User | None: ...


class SqlUserRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, user: User) -> User:
        self.session.add(user)
        try:
            self.session.flush()
        except IntegrityError as error:
            if not is_duplicate_email(error):
                raise
            raise EmailAlreadyRegistered from error
        return user

    def find_by_email(self, email: str) -> User | None:
        return self.session.query(User).filter_by(email=email).one_or_none()

    def find_by_id(self, user_id: int) -> User | None:
        return self.session.get(User, user_id)


def is_duplicate_email(error: IntegrityError) -> bool:
    return (
        isinstance(error.orig, UniqueViolation)
        and error.orig.diag.constraint_name == EMAIL_UNIQUE_CONSTRAINT
    )

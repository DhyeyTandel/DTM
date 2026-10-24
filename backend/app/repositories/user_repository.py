from typing import Protocol

from app.models.user import User


class UserRepository(Protocol):
    def add(self, user: User) -> User: ...

    def find_by_email(self, email: str) -> User | None: ...

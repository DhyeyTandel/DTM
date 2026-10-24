from datetime import timedelta

from app.config import Settings
from app.domain.errors import EmailAlreadyRegistered
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password
from app.security.tokens import create_access_token


def normalise_email(email: str) -> str:
    return email.strip().lower()


class AuthService:
    def __init__(self, users: UserRepository, settings: Settings) -> None:
        self.users = users
        self.settings = settings

    def register(self, email: str, password: str) -> User:
        email = normalise_email(email)
        if self.users.find_by_email(email) is not None:
            raise EmailAlreadyRegistered
        user = User(email=email, password_hash=hash_password(password), role=Role.CUSTOMER)
        return self.users.add(user)

    def login(self, email: str, password: str) -> str:
        user = self.users.find_by_email(normalise_email(email))
        assert user is not None
        return create_access_token(
            user.id,
            self.settings.secret_key,
            self.settings.token_algorithm,
            timedelta(minutes=self.settings.token_lifetime_minutes),
        )

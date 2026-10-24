from datetime import timedelta

from app.config import Settings
from app.domain.email import normalise_email
from app.domain.errors import EmailAlreadyRegistered, InvalidCredentials
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password, verify_password
from app.security.tokens import create_access_token


class AuthService:
    def __init__(self, users: UserRepository, settings: Settings) -> None:
        self.users = users
        self.settings = settings

    def register(self, email: str, password: str) -> User:
        email = normalise_email(email)
        if self.users.find_by_email(email) is not None:
            raise EmailAlreadyRegistered
        return self.users.add(email, hash_password(password), Role.CUSTOMER)

    def login(self, email: str, password: str) -> str:
        user = self.users.find_by_email(normalise_email(email))
        if user is None or not verify_password(password, user.password_hash):
            raise InvalidCredentials
        return create_access_token(
            user.id,
            self.settings.secret_key,
            self.settings.token_algorithm,
            timedelta(minutes=self.settings.token_lifetime_minutes),
        )

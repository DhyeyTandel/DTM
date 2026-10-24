from app.domain.errors import EmailAlreadyRegistered
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password


def normalise_email(email: str) -> str:
    return email.strip().lower()


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def register(self, email: str, password: str) -> User:
        email = normalise_email(email)
        if self.users.find_by_email(email) is not None:
            raise EmailAlreadyRegistered
        user = User(email=email, password_hash=hash_password(password), role=Role.CUSTOMER)
        return self.users.add(user)

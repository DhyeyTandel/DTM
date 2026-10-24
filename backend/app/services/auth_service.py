from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def register(self, email: str, password: str) -> User:
        user = User(email=email, password_hash=hash_password(password), role=Role.CUSTOMER)
        return self.users.add(user)

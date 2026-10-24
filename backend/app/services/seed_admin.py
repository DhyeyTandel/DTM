from app.config import Settings
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password
from app.services.auth_service import normalise_email


def seed_admin(users: UserRepository, settings: Settings) -> User:
    assert settings.admin_email is not None
    assert settings.admin_password is not None
    email = normalise_email(settings.admin_email)
    existing = users.find_by_email(email)
    if existing is not None:
        return existing
    admin = User(
        email=email,
        password_hash=hash_password(settings.admin_password),
        role=Role.ADMIN,
    )
    return users.add(admin)

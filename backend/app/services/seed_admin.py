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
    password_hash = hash_password(settings.admin_password)
    admin = users.find_by_email(email)
    if admin is None:
        return users.add(User(email=email, password_hash=password_hash, role=Role.ADMIN))
    admin.role = Role.ADMIN
    admin.password_hash = password_hash
    return admin

from app.config import Settings
from app.domain.errors import InvalidAdminSettings
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password
from app.services.auth_service import normalise_email

MISSING_SETTINGS_MESSAGE = "ADMIN_EMAIL and ADMIN_PASSWORD must both be set to seed the admin"


def seed_admin(users: UserRepository, settings: Settings) -> User:
    if settings.admin_email is None or settings.admin_password is None:
        raise InvalidAdminSettings(MISSING_SETTINGS_MESSAGE)
    email = normalise_email(settings.admin_email)
    password_hash = hash_password(settings.admin_password)
    admin = users.find_by_email(email)
    if admin is None:
        return users.add(User(email=email, password_hash=password_hash, role=Role.ADMIN))
    admin.role = Role.ADMIN
    admin.password_hash = password_hash
    return admin

from app.config import Settings
from app.domain.email import normalise_email
from app.domain.errors import InvalidAdminSettings
from app.domain.role import Role
from app.limits import PASSWORD_MAX_BYTES, PASSWORD_MIN_BYTES
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.security.passwords import hash_password, password_fits_limits

MISSING_SETTINGS_MESSAGE = "ADMIN_EMAIL and ADMIN_PASSWORD must both be set to seed the admin"
BAD_PASSWORD_MESSAGE = (
    f"ADMIN_PASSWORD must be {PASSWORD_MIN_BYTES} to {PASSWORD_MAX_BYTES} bytes long"
)


def seed_admin(users: UserRepository, settings: Settings) -> User:
    if settings.admin_email is None or settings.admin_password is None:
        raise InvalidAdminSettings(MISSING_SETTINGS_MESSAGE)
    if not password_fits_limits(settings.admin_password):
        raise InvalidAdminSettings(BAD_PASSWORD_MESSAGE)
    email = normalise_email(settings.admin_email)
    password_hash = hash_password(settings.admin_password)
    existing = users.find_by_email(email)
    if existing is None:
        return users.add(email, password_hash, Role.ADMIN)
    return users.make_admin(existing.id, password_hash)

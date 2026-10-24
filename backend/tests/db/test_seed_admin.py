from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import SqlUserRepository
from app.security.passwords import verify_password
from app.services.seed_admin import seed_admin
from tests.credentials import ADMIN_EMAIL, ADMIN_PASSWORD


def test_the_seed_creates_an_admin_from_the_configured_email_and_password(
    rolled_back_session_factory: sessionmaker[Session], admin_settings: Settings
) -> None:
    with rolled_back_session_factory() as session:
        users = SqlUserRepository(session)

        seed_admin(users, admin_settings)

        admin = users.find_by_email(ADMIN_EMAIL)
        assert admin is not None
        assert admin.role == Role.ADMIN
        assert verify_password(ADMIN_PASSWORD, admin.password_hash)


def test_running_the_seed_twice_leaves_exactly_one_admin(
    rolled_back_session_factory: sessionmaker[Session], admin_settings: Settings
) -> None:
    with rolled_back_session_factory() as session:
        users = SqlUserRepository(session)

        seed_admin(users, admin_settings)
        seed_admin(users, admin_settings)

        assert session.query(User).filter_by(role=Role.ADMIN).count() == 1

from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.database import build_session_factory
from app.domain.errors import InvalidAdminSettings
from app.repositories.user_repository import SqlUserRepository
from app.repositories.vehicle_repository import SqlVehicleRepository
from app.services.seed_admin import seed_admin
from app.services.seed_vehicles import seed_vehicles


def run_seed(settings: Settings, session_factory: sessionmaker[Session]) -> None:
    with session_factory() as session:
        seed_admin(SqlUserRepository(session), settings)
        seed_vehicles(SqlVehicleRepository(session))
        session.commit()


def main() -> None:
    settings = Settings()
    try:
        run_seed(settings, build_session_factory(settings.database_url))
    except InvalidAdminSettings as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    main()

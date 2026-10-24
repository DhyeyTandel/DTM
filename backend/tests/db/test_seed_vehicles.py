from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.models.vehicle import Vehicle
from app.seed import run_seed


def vehicle_count(session_factory: sessionmaker[Session]) -> int:
    with session_factory() as session:
        return session.scalar(select(func.count()).select_from(Vehicle)) or 0


def test_running_the_seed_entry_point_stocks_the_table(
    committed_session_factory: sessionmaker[Session], admin_settings: Settings
) -> None:
    run_seed(admin_settings, committed_session_factory)

    assert vehicle_count(committed_session_factory) >= 15


def test_running_the_seed_entry_point_twice_does_not_duplicate_the_vehicles(
    committed_session_factory: sessionmaker[Session], admin_settings: Settings
) -> None:
    run_seed(admin_settings, committed_session_factory)
    after_first_run = vehicle_count(committed_session_factory)

    run_seed(admin_settings, committed_session_factory)

    assert vehicle_count(committed_session_factory) == after_first_run

import threading
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.domain.errors import OutOfStock
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import SqlVehicleRepository
from app.services.vehicle_service import VehicleService

BUYER_COUNT = 10
BARRIER_TIMEOUT_SECONDS = 10


@pytest.fixture
def buyer_session_factory(
    test_database_url: str, committed_session_factory: sessionmaker[Session]
) -> Iterator[sessionmaker[Session]]:
    """One connection per buyer, so no thread waits for a free connection.

    Depends on committed_session_factory so this engine is gone before that fixture truncates.
    """
    engine = create_engine(test_database_url, pool_size=BUYER_COUNT, max_overflow=0)
    yield sessionmaker(bind=engine)
    engine.dispose()


def stock_vehicle(session_factory: sessionmaker[Session], quantity: int) -> int:
    with session_factory() as session:
        vehicle = SqlVehicleRepository(session).add(
            "Toyota", "Corolla", "sedan", 1_500_000_00, quantity
        )
        vehicle_id = vehicle.id
        session.commit()
    return vehicle_id


def stored_quantity(session_factory: sessionmaker[Session], vehicle_id: int) -> int:
    with session_factory() as session:
        vehicle = session.get(Vehicle, vehicle_id)
        assert vehicle is not None
        return vehicle.quantity


def buy_at_the_same_moment(session_factory: sessionmaker[Session], vehicle_id: int) -> list[bool]:
    """All buyers wait at the barrier, then purchase together. True means a buyer got one."""
    barrier = threading.Barrier(BUYER_COUNT)

    def buy() -> bool:
        with session_factory() as session:
            barrier.wait(timeout=BARRIER_TIMEOUT_SECONDS)
            try:
                VehicleService(SqlVehicleRepository(session)).purchase(vehicle_id)
            except OutOfStock:
                return False
            session.commit()
            return True

    with ThreadPoolExecutor(max_workers=BUYER_COUNT) as pool:
        futures = [pool.submit(buy) for _ in range(BUYER_COUNT)]
        return [future.result() for future in futures]


def test_ten_buyers_of_the_last_unit_give_one_success_and_stock_zero(
    committed_session_factory: sessionmaker[Session],
    buyer_session_factory: sessionmaker[Session],
) -> None:
    vehicle_id = stock_vehicle(committed_session_factory, quantity=1)

    outcomes = buy_at_the_same_moment(buyer_session_factory, vehicle_id)

    assert outcomes.count(True) == 1
    assert stored_quantity(committed_session_factory, vehicle_id) == 0


def test_ten_buyers_against_three_in_stock_give_three_successes_and_stock_zero(
    committed_session_factory: sessionmaker[Session],
    buyer_session_factory: sessionmaker[Session],
) -> None:
    vehicle_id = stock_vehicle(committed_session_factory, quantity=3)

    outcomes = buy_at_the_same_moment(buyer_session_factory, vehicle_id)

    assert outcomes.count(True) == 3
    assert stored_quantity(committed_session_factory, vehicle_id) == 0

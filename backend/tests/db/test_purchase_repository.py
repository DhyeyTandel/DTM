import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.domain.errors import OutOfStock, VehicleNotFound
from app.domain.role import Role
from app.models.purchase import Purchase
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories.purchase_repository import SqlPurchaseRepository
from app.repositories.user_repository import SqlUserRepository
from app.repositories.vehicle_repository import SqlVehicleRepository
from app.services.purchase_service import PurchaseService

PRICE = 1_500_000_00
UNKNOWN_ID = 999_999


def add_buyer(session: Session) -> int:
    buyer = User(email="buyer@example.com", password_hash="not-a-real-hash", role=Role.CUSTOMER)
    return SqlUserRepository(session).add(buyer).id


def add_vehicle(session: Session, quantity: int = 5) -> int:
    vehicles = SqlVehicleRepository(session)
    return vehicles.add("Toyota", "Corolla", "sedan", PRICE, quantity).id


def build_service(session: Session) -> PurchaseService:
    return PurchaseService(SqlVehicleRepository(session), SqlPurchaseRepository(session))


def all_purchases(session: Session) -> list[Purchase]:
    session.expire_all()
    return list(session.scalars(select(Purchase).order_by(Purchase.id)))


def test_a_purchase_writes_one_row_with_the_buyer_and_the_vehicle_as_it_was(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        buyer_id = add_buyer(session)
        vehicle_id = add_vehicle(session)

        build_service(session).purchase(buyer_id, vehicle_id)

        (purchase,) = all_purchases(session)
        assert purchase.user_id == buyer_id
        assert purchase.vehicle_id == vehicle_id
        assert (purchase.make, purchase.model, purchase.price) == ("Toyota", "Corolla", PRICE)
        assert purchase.created_at is not None


@pytest.mark.parametrize(("quantity", "error"), [(0, OutOfStock), (None, VehicleNotFound)])
def test_a_purchase_of_a_sold_out_or_missing_vehicle_writes_no_row(
    rolled_back_session_factory: sessionmaker[Session],
    quantity: int | None,
    error: type[Exception],
) -> None:
    with rolled_back_session_factory() as session:
        buyer_id = add_buyer(session)
        vehicle_id = add_vehicle(session, quantity) if quantity is not None else UNKNOWN_ID

        with pytest.raises(error):
            build_service(session).purchase(buyer_id, vehicle_id)

        assert all_purchases(session) == []


def test_deleting_a_purchased_vehicle_keeps_the_purchase_with_no_vehicle_id(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        buyer_id = add_buyer(session)
        vehicle_id = add_vehicle(session)
        build_service(session).purchase(buyer_id, vehicle_id)

        assert SqlVehicleRepository(session).delete(vehicle_id)

        (purchase,) = all_purchases(session)
        assert purchase.vehicle_id is None
        assert (purchase.make, purchase.model, purchase.price) == ("Toyota", "Corolla", PRICE)


def test_when_the_purchase_row_cannot_be_written_the_stock_change_is_rolled_back(
    committed_session_factory: sessionmaker[Session],
) -> None:
    with committed_session_factory() as setup_session:
        vehicle_id = add_vehicle(setup_session, quantity=5)
        setup_session.commit()

    with committed_session_factory() as session:
        with pytest.raises(IntegrityError):
            build_service(session).purchase(UNKNOWN_ID, vehicle_id)

    with committed_session_factory() as checking_session:
        stored = checking_session.get(Vehicle, vehicle_id)
        assert stored is not None
        assert stored.quantity == 5

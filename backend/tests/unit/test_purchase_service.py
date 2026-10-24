import pytest

from app.domain.category import Category
from app.domain.errors import OutOfStock, VehicleNotFound
from app.services.purchase_service import PurchaseService
from tests.unit.fakes import FakePurchaseRepository, FakeVehicleRepository

BUYER_ID = 7


def build_service(
    quantity: int = 5,
) -> tuple[PurchaseService, FakeVehicleRepository, FakePurchaseRepository]:
    vehicles = FakeVehicleRepository()
    vehicles.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, quantity)
    purchases = FakePurchaseRepository()
    return PurchaseService(vehicles, purchases), vehicles, purchases


def test_purchasing_a_vehicle_with_stock_returns_it_with_one_less_in_stock() -> None:
    service, vehicles, _purchases = build_service(quantity=5)
    vehicle_id = vehicles.vehicles[0].id

    purchased = service.purchase(BUYER_ID, vehicle_id)

    assert purchased.id == vehicle_id
    assert purchased.quantity == 4


def test_purchasing_with_zero_stock_raises_out_of_stock() -> None:
    service, vehicles, _purchases = build_service(quantity=0)

    with pytest.raises(OutOfStock):
        service.purchase(BUYER_ID, vehicles.vehicles[0].id)


def test_purchasing_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service, vehicles, _purchases = build_service()

    with pytest.raises(VehicleNotFound):
        service.purchase(BUYER_ID, vehicles.vehicles[0].id + 1)


def test_a_purchase_records_who_bought_which_vehicle_as_it_was_then() -> None:
    service, vehicles, purchases = build_service()
    vehicle = vehicles.vehicles[0]

    service.purchase(BUYER_ID, vehicle.id)

    (recorded,) = purchases.recorded
    assert recorded == (BUYER_ID, vehicle.id, "Toyota", "Corolla", 1_500_000_00)


def test_a_failed_purchase_records_nothing() -> None:
    service, vehicles, purchases = build_service(quantity=0)

    with pytest.raises(OutOfStock):
        service.purchase(BUYER_ID, vehicles.vehicles[0].id)

    assert purchases.recorded == []

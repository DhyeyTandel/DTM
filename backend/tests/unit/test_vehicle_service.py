import pytest

from app.domain.category import Category
from app.domain.errors import (
    InvalidPriceRange,
    InvalidQuantity,
    StockLimitExceeded,
    VehicleNotFound,
)
from app.limits import QUANTITY_MAX, RESTOCK_AMOUNT_MAX, RESTOCK_AMOUNT_MIN
from app.services.vehicle_service import VehicleService
from tests.unit.fakes import FakeVehicleRepository


def test_adding_a_vehicle_stores_make_model_category_price_and_quantity() -> None:
    vehicles = FakeVehicleRepository()
    service = VehicleService(vehicles)

    service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    stored = vehicles.vehicles[0]
    assert stored.make == "Toyota"
    assert stored.model == "Corolla"
    assert stored.category == Category.SEDAN
    assert stored.price == 1_500_000_00
    assert stored.quantity == 5


def test_updating_a_vehicle_replaces_make_model_category_price_and_image_url() -> None:
    vehicles = FakeVehicleRepository()
    service = VehicleService(vehicles)
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    updated = service.update(
        added.id, "Honda", "City", Category.HATCHBACK, 1_200_000_00, "https://example.com/city.jpg"
    )

    assert updated.image_url == "https://example.com/city.jpg"
    assert updated.make == "Honda"
    assert updated.model == "City"
    assert updated.category == Category.HATCHBACK
    assert updated.price == 1_200_000_00


def test_updating_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(VehicleNotFound):
        service.update(1, "Honda", "City", Category.HATCHBACK, 1_200_000_00, None)


def test_deleting_a_vehicle_removes_it() -> None:
    vehicles = FakeVehicleRepository()
    service = VehicleService(vehicles)
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    service.delete(added.id)

    assert vehicles.vehicles == []


def test_deleting_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(VehicleNotFound):
        service.delete(1)


def test_a_minimum_price_above_the_maximum_raises_invalid_price_range() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(InvalidPriceRange):
        service.search(min_price=2_000_000_00, max_price=1_000_000_00)


def test_restocking_adds_the_amount_to_the_quantity() -> None:
    service = VehicleService(FakeVehicleRepository())
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    restocked = service.restock(added.id, 20)

    assert restocked.quantity == 25


def test_restocking_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(VehicleNotFound):
        service.restock(1, 20)


@pytest.mark.parametrize("amount", [RESTOCK_AMOUNT_MIN - 1, -1, RESTOCK_AMOUNT_MAX + 1])
def test_restocking_an_amount_outside_the_allowed_range_raises_invalid_quantity(
    amount: int,
) -> None:
    service = VehicleService(FakeVehicleRepository())
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    with pytest.raises(InvalidQuantity):
        service.restock(added.id, amount)


def test_restocking_past_the_stock_limit_raises_stock_limit_exceeded() -> None:
    service = VehicleService(FakeVehicleRepository())
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, QUANTITY_MAX)

    with pytest.raises(StockLimitExceeded):
        service.restock(added.id, RESTOCK_AMOUNT_MIN)

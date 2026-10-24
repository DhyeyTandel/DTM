import pytest

from app.domain.category import Category
from app.domain.errors import InvalidPriceRange, OutOfStock, VehicleNotFound
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


def test_updating_a_vehicle_replaces_make_model_category_and_price() -> None:
    vehicles = FakeVehicleRepository()
    service = VehicleService(vehicles)
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    updated = service.update(added.id, "Honda", "City", Category.HATCHBACK, 1_200_000_00)

    assert updated.make == "Honda"
    assert updated.model == "City"
    assert updated.category == Category.HATCHBACK
    assert updated.price == 1_200_000_00


def test_updating_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(VehicleNotFound):
        service.update(1, "Honda", "City", Category.HATCHBACK, 1_200_000_00)


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


def test_purchasing_a_vehicle_with_stock_returns_it_with_one_less_in_stock() -> None:
    service = VehicleService(FakeVehicleRepository())
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    purchased = service.purchase(added.id)

    assert purchased.id == added.id
    assert purchased.quantity == 4


def test_purchasing_with_zero_stock_raises_out_of_stock() -> None:
    service = VehicleService(FakeVehicleRepository())
    added = service.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 0)

    with pytest.raises(OutOfStock):
        service.purchase(added.id)


def test_purchasing_a_missing_vehicle_raises_vehicle_not_found() -> None:
    service = VehicleService(FakeVehicleRepository())

    with pytest.raises(VehicleNotFound):
        service.purchase(1)

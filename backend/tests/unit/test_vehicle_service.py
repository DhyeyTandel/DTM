from app.domain.category import Category
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

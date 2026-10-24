from app.domain.category import Category
from app.domain.errors import InvalidPriceRange, OutOfStock, VehicleNotFound
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository


def normalise_search_text(text: str | None) -> str | None:
    # Blank text must not become LIKE '%   %', which would match almost nothing.
    if text is None:
        return None
    return text.strip() or None


class VehicleService:
    def __init__(self, vehicles: VehicleRepository) -> None:
        self.vehicles = vehicles

    def add(self, make: str, model: str, category: Category, price: int, quantity: int) -> Vehicle:
        return self.vehicles.add(make, model, category, price, quantity)

    def list_all(self) -> list[Vehicle]:
        return self.vehicles.search()

    def search(
        self,
        make: str | None = None,
        model: str | None = None,
        category: Category | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
    ) -> list[Vehicle]:
        if min_price is not None and max_price is not None and min_price > max_price:
            raise InvalidPriceRange
        return self.vehicles.search(
            normalise_search_text(make),
            normalise_search_text(model),
            category,
            min_price,
            max_price,
        )

    def update(
        self, vehicle_id: int, make: str, model: str, category: Category, price: int
    ) -> Vehicle:
        vehicle = self.vehicles.update(vehicle_id, make, model, category, price)
        if vehicle is None:
            raise VehicleNotFound
        return vehicle

    def delete(self, vehicle_id: int) -> None:
        if not self.vehicles.delete(vehicle_id):
            raise VehicleNotFound

    def purchase(self, vehicle_id: int) -> Vehicle:
        vehicle = self.vehicles.purchase(vehicle_id)
        if vehicle is not None:
            return vehicle
        # Only picks which error to raise. Whether the purchase happened was decided by the update.
        if not self.vehicles.exists(vehicle_id):
            raise VehicleNotFound
        raise OutOfStock

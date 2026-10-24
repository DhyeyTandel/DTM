from app.domain.category import Category
from app.domain.errors import VehicleNotFound
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository


class VehicleService:
    def __init__(self, vehicles: VehicleRepository) -> None:
        self.vehicles = vehicles

    def add(self, make: str, model: str, category: Category, price: int, quantity: int) -> Vehicle:
        vehicle = Vehicle(make=make, model=model, category=category, price=price, quantity=quantity)
        return self.vehicles.add(vehicle)

    def list_all(self) -> list[Vehicle]:
        return self.vehicles.list_all()

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

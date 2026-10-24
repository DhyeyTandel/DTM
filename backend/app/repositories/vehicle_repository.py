from typing import Protocol

from app.models.vehicle import Vehicle


class VehicleRepository(Protocol):
    def add(self, vehicle: Vehicle) -> Vehicle: ...

    def update(
        self, vehicle_id: int, make: str, model: str, category: str, price: int
    ) -> Vehicle: ...

from typing import Protocol

from app.models.vehicle import Vehicle


class VehicleRepository(Protocol):
    def add(self, vehicle: Vehicle) -> Vehicle: ...

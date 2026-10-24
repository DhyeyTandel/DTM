from typing import Protocol

from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


class VehicleRepository(Protocol):
    def add(self, vehicle: Vehicle) -> Vehicle: ...

    def update(
        self, vehicle_id: int, make: str, model: str, category: str, price: int
    ) -> Vehicle | None: ...

    def delete(self, vehicle_id: int) -> bool: ...


class SqlVehicleRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, vehicle: Vehicle) -> Vehicle:
        self.session.add(vehicle)
        self.session.flush()
        return vehicle

    def update(
        self, vehicle_id: int, make: str, model: str, category: str, price: int
    ) -> Vehicle | None:
        raise NotImplementedError

    def delete(self, vehicle_id: int) -> bool:
        raise NotImplementedError

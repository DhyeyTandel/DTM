from typing import Protocol

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle


class VehicleRepository(Protocol):
    def add(self, vehicle: Vehicle) -> Vehicle: ...

    def list_all(self) -> list[Vehicle]: ...

    def search(
        self,
        make: str | None = None,
        model: str | None = None,
        category: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
    ) -> list[Vehicle]: ...

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

    def list_all(self) -> list[Vehicle]:
        return list(self.session.scalars(select(Vehicle).order_by(Vehicle.id)))

    def search(
        self,
        make: str | None = None,
        model: str | None = None,
        category: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
    ) -> list[Vehicle]:
        statement = select(Vehicle).order_by(Vehicle.id)
        if make is not None:
            statement = statement.where(Vehicle.make.icontains(make, autoescape=True))
        if model is not None:
            statement = statement.where(Vehicle.model.icontains(model, autoescape=True))
        if category is not None:
            statement = statement.where(Vehicle.category == category)
        if min_price is not None:
            statement = statement.where(Vehicle.price >= min_price)
        if max_price is not None:
            statement = statement.where(Vehicle.price <= max_price)
        return list(self.session.scalars(statement))

    def update(
        self, vehicle_id: int, make: str, model: str, category: str, price: int
    ) -> Vehicle | None:
        statement = (
            update(Vehicle)
            .where(Vehicle.id == vehicle_id)
            .values(make=make, model=model, category=category, price=price)
            .returning(Vehicle)
        )
        return self.session.scalars(statement).one_or_none()

    def delete(self, vehicle_id: int) -> bool:
        statement = delete(Vehicle).where(Vehicle.id == vehicle_id).returning(Vehicle.id)
        return self.session.scalar(statement) is not None

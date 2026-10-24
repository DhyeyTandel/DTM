from typing import Protocol

from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session

from app.limits import QUANTITY_MAX
from app.models.vehicle import Vehicle


class VehicleRepository(Protocol):
    def add(
        self,
        make: str,
        model: str,
        category: str,
        price: int,
        quantity: int,
        image_url: str | None = None,
    ) -> Vehicle: ...

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

    def purchase(self, vehicle_id: int) -> Vehicle | None: ...

    def restock(self, vehicle_id: int, amount: int) -> Vehicle | None: ...

    def exists(self, vehicle_id: int) -> bool: ...


class SqlVehicleRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(
        self,
        make: str,
        model: str,
        category: str,
        price: int,
        quantity: int,
        image_url: str | None = None,
    ) -> Vehicle:
        vehicle = Vehicle(
            make=make,
            model=model,
            category=category,
            price=price,
            quantity=quantity,
            image_url=image_url,
        )
        self.session.add(vehicle)
        self.session.flush()
        return vehicle

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

    def purchase(self, vehicle_id: int) -> Vehicle | None:
        # The quantity check and the decrement are one statement, so two buyers cannot both pass it.
        statement = (
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.quantity > 0)
            .values(quantity=Vehicle.quantity - 1)
            .returning(Vehicle)
        )
        return self.session.scalars(statement).one_or_none()

    def restock(self, vehicle_id: int, amount: int) -> Vehicle | None:
        # The cap check and the addition are one statement, like purchase.
        statement = (
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.quantity + amount <= QUANTITY_MAX)
            .values(quantity=Vehicle.quantity + amount)
            .returning(Vehicle)
        )
        return self.session.scalars(statement).one_or_none()

    def exists(self, vehicle_id: int) -> bool:
        statement = select(Vehicle.id).where(Vehicle.id == vehicle_id)
        return self.session.scalar(statement) is not None

from typing import Protocol

from sqlalchemy.orm import Session

from app.models.purchase import Purchase


class PurchaseRepository(Protocol):
    def add(self, user_id: int, vehicle_id: int, make: str, model: str, price: int) -> None: ...


class SqlPurchaseRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, user_id: int, vehicle_id: int, make: str, model: str, price: int) -> None:
        purchase = Purchase(
            user_id=user_id, vehicle_id=vehicle_id, make=make, model=model, price=price
        )
        self.session.add(purchase)
        self.session.flush()

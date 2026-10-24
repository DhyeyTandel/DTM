from typing import Protocol


class PurchaseRepository(Protocol):
    def add(self, user_id: int, vehicle_id: int, make: str, model: str, price: int) -> None: ...

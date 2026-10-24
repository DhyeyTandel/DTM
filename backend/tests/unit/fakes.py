from app.domain.role import Role
from app.limits import QUANTITY_MAX
from app.models.user import User
from app.models.vehicle import Vehicle


class FakeUserRepository:
    def __init__(self) -> None:
        self.users: list[User] = []

    def add(self, email: str, password_hash: str, role: str) -> User:
        user = User(email=email, password_hash=password_hash, role=role)
        user.id = len(self.users) + 1
        self.users.append(user)
        return user

    def make_admin(self, user_id: int, password_hash: str) -> User:
        user = next(user for user in self.users if user.id == user_id)
        user.role = Role.ADMIN
        user.password_hash = password_hash
        return user

    def find_by_email(self, email: str) -> User | None:
        return next((user for user in self.users if user.email == email), None)

    def find_by_id(self, user_id: int) -> User | None:
        return next((user for user in self.users if user.id == user_id), None)


class FakeVehicleRepository:
    def __init__(self) -> None:
        self.vehicles: list[Vehicle] = []

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
        vehicle.id = len(self.vehicles) + 1
        self.vehicles.append(vehicle)
        return vehicle

    def search(
        self,
        make: str | None = None,
        model: str | None = None,
        category: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
    ) -> list[Vehicle]:
        return list(self.vehicles)

    def update(
        self,
        vehicle_id: int,
        make: str,
        model: str,
        category: str,
        price: int,
        image_url: str | None,
    ) -> Vehicle | None:
        vehicle = next((vehicle for vehicle in self.vehicles if vehicle.id == vehicle_id), None)
        if vehicle is not None:
            vehicle.make = make
            vehicle.model = model
            vehicle.category = category
            vehicle.price = price
            vehicle.image_url = image_url
        return vehicle

    def delete(self, vehicle_id: int) -> bool:
        remaining = [vehicle for vehicle in self.vehicles if vehicle.id != vehicle_id]
        was_deleted = len(remaining) < len(self.vehicles)
        self.vehicles = remaining
        return was_deleted

    def purchase(self, vehicle_id: int) -> Vehicle | None:
        vehicle = next((vehicle for vehicle in self.vehicles if vehicle.id == vehicle_id), None)
        if vehicle is None or vehicle.quantity == 0:
            return None
        vehicle.quantity -= 1
        return vehicle

    def restock(self, vehicle_id: int, amount: int) -> Vehicle | None:
        vehicle = next((vehicle for vehicle in self.vehicles if vehicle.id == vehicle_id), None)
        if vehicle is None or vehicle.quantity + amount > QUANTITY_MAX:
            return None
        vehicle.quantity += amount
        return vehicle

    def exists(self, vehicle_id: int) -> bool:
        return any(vehicle.id == vehicle_id for vehicle in self.vehicles)


class FakePurchaseRepository:
    def __init__(self) -> None:
        self.recorded: list[tuple[int, int, str, str, int]] = []

    def add(self, user_id: int, vehicle_id: int, make: str, model: str, price: int) -> None:
        self.recorded.append((user_id, vehicle_id, make, model, price))

from app.domain.errors import OutOfStock, VehicleNotFound
from app.models.vehicle import Vehicle
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.vehicle_repository import VehicleRepository


class PurchaseService:
    def __init__(self, vehicles: VehicleRepository, purchases: PurchaseRepository) -> None:
        self.vehicles = vehicles
        self.purchases = purchases

    def purchase(self, user_id: int, vehicle_id: int) -> Vehicle:
        vehicle = self.vehicles.purchase(vehicle_id)
        if vehicle is None:
            # Only picks which error to raise; the update already decided nothing was bought.
            if not self.vehicles.exists(vehicle_id):
                raise VehicleNotFound
            raise OutOfStock
        self.purchases.add(user_id, vehicle.id, vehicle.make, vehicle.model, vehicle.price)
        return vehicle

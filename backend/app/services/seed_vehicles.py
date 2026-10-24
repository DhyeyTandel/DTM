from app.domain.category import Category
from app.repositories.vehicle_repository import VehicleRepository

# Prices are in paise. A quantity of zero shows how the list handles a sold-out car.
SAMPLE_VEHICLES: list[tuple[str, str, Category, int, int]] = [
    ("Maruti Suzuki", "Swift", Category.HATCHBACK, 7_50_000_00, 12),
    ("Tata", "Tiago", Category.HATCHBACK, 6_00_000_00, 8),
    ("Hyundai", "i20", Category.HATCHBACK, 8_50_000_00, 0),
    ("Honda", "City", Category.SEDAN, 12_50_000_00, 6),
    ("Hyundai", "Verna", Category.SEDAN, 11_50_000_00, 4),
    ("Skoda", "Slavia", Category.SEDAN, 13_00_000_00, 0),
    ("Toyota", "Fortuner", Category.SUV, 38_00_000_00, 3),
    ("Mahindra", "XUV700", Category.SUV, 18_00_000_00, 7),
    ("Hyundai", "Creta", Category.SUV, 15_00_000_00, 10),
    ("BMW", "2 Series Gran Coupe", Category.COUPE, 45_00_000_00, 2),
    ("Audi", "A5", Category.COUPE, 60_00_000_00, 0),
    ("Toyota", "Hilux", Category.TRUCK, 30_00_000_00, 5),
    ("Isuzu", "D-Max V-Cross", Category.TRUCK, 25_00_000_00, 4),
    ("Tata", "Nexon EV", Category.EV, 15_00_000_00, 9),
    ("MG", "ZS EV", Category.EV, 19_00_000_00, 3),
    ("Hyundai", "Ioniq 5", Category.EV, 46_00_000_00, 1),
]


def seed_vehicles(vehicles: VehicleRepository) -> None:
    # Only an empty table is seeded, so a redeploy does not duplicate the cars.
    if vehicles.search():
        return
    for make, model, category, price, quantity in SAMPLE_VEHICLES:
        vehicles.add(make, model, category, price, quantity)

from typing import NamedTuple

from app.domain.category import Category
from app.repositories.vehicle_repository import VehicleRepository


class SampleVehicle(NamedTuple):
    make: str
    model: str
    category: Category
    price: int
    quantity: int
    image_url: str


PHOTO_FOLDER = "/images/vehicles/"


def vehicle_photo(filename: str) -> str:
    return f"{PHOTO_FOLDER}{filename}"


# Prices are paise, grouped as lakhs: 7_50_000_00 is 7,50,000 rupees.
# Zero stock is there to show sold-out cars.
# The photos are from Wikimedia Commons, kept in frontend/public/images/vehicles (see
# docs/IMAGE_CREDITS.md).
SAMPLE_VEHICLES = [
    SampleVehicle(
        "Maruti Suzuki",
        "Swift",
        Category.HATCHBACK,
        7_50_000_00,
        12,
        vehicle_photo("maruti-suzuki-swift.jpg"),
    ),
    SampleVehicle(
        "Tata",
        "Tiago",
        Category.HATCHBACK,
        6_00_000_00,
        8,
        vehicle_photo("tata-tiago.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "i20",
        Category.HATCHBACK,
        8_50_000_00,
        0,
        vehicle_photo("hyundai-i20.jpg"),
    ),
    SampleVehicle(
        "Honda",
        "City",
        Category.SEDAN,
        12_50_000_00,
        6,
        vehicle_photo("honda-city.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Verna",
        Category.SEDAN,
        11_50_000_00,
        4,
        vehicle_photo("hyundai-verna.jpg"),
    ),
    SampleVehicle(
        "Skoda",
        "Slavia",
        Category.SEDAN,
        13_00_000_00,
        0,
        vehicle_photo("skoda-slavia.jpg"),
    ),
    SampleVehicle(
        "Toyota",
        "Fortuner",
        Category.SUV,
        38_00_000_00,
        3,
        vehicle_photo("toyota-fortuner.jpg"),
    ),
    SampleVehicle(
        "Mahindra",
        "XUV700",
        Category.SUV,
        18_00_000_00,
        7,
        vehicle_photo("mahindra-xuv700.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Creta",
        Category.SUV,
        15_00_000_00,
        10,
        vehicle_photo("hyundai-creta.jpg"),
    ),
    SampleVehicle(
        "BMW",
        "2 Series Gran Coupe",
        Category.COUPE,
        45_00_000_00,
        2,
        vehicle_photo("bmw-2-series-gran-coupe.jpg"),
    ),
    SampleVehicle(
        "Audi",
        "A5",
        Category.COUPE,
        60_00_000_00,
        0,
        vehicle_photo("audi-a5.jpg"),
    ),
    SampleVehicle(
        "Toyota",
        "Hilux",
        Category.TRUCK,
        30_00_000_00,
        5,
        vehicle_photo("toyota-hilux.jpg"),
    ),
    SampleVehicle(
        "Isuzu",
        "D-Max V-Cross",
        Category.TRUCK,
        25_00_000_00,
        4,
        vehicle_photo("isuzu-d-max-v-cross.jpg"),
    ),
    SampleVehicle(
        "Tata",
        "Nexon EV",
        Category.EV,
        15_00_000_00,
        9,
        vehicle_photo("tata-nexon-ev.jpg"),
    ),
    SampleVehicle(
        "MG",
        "ZS EV",
        Category.EV,
        19_00_000_00,
        3,
        vehicle_photo("mg-zs-ev.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Ioniq 5",
        Category.EV,
        46_00_000_00,
        1,
        vehicle_photo("hyundai-ioniq-5.jpg"),
    ),
]


def seed_vehicles(vehicles: VehicleRepository) -> None:
    # Only an empty table is seeded, so a redeploy does not duplicate the cars.
    if vehicles.search():
        return
    for sample in SAMPLE_VEHICLES:
        vehicles.add(
            sample.make,
            sample.model,
            sample.category,
            sample.price,
            sample.quantity,
            sample.image_url,
        )

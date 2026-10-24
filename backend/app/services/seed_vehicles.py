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


COMMONS_THUMBNAIL_BASE = "https://thumb.wikimedia.org/wikipedia/commons/thumb"
THUMBNAIL_WIDTH = 960


def commons_photo(folder: str, filename: str) -> str:
    return f"{COMMONS_THUMBNAIL_BASE}/{folder}/{filename}/{THUMBNAIL_WIDTH}px-{filename}"


# Prices are paise, grouped as lakhs: 7_50_000_00 is 7,50,000 rupees.
# Zero stock is there to show sold-out cars.
# The photos are from Wikimedia Commons and credited in the README.
SAMPLE_VEHICLES = [
    SampleVehicle(
        "Maruti Suzuki",
        "Swift",
        Category.HATCHBACK,
        7_50_000_00,
        12,
        commons_photo("4/43", "Maruti_Suzuki_Swift_4456.JPG"),
    ),
    SampleVehicle(
        "Tata",
        "Tiago",
        Category.HATCHBACK,
        6_00_000_00,
        8,
        commons_photo("c/ca", "2022_Tata_Tiago_XZA%2B_front_20230512.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "i20",
        Category.HATCHBACK,
        8_50_000_00,
        0,
        commons_photo("6/6d", "Hyundai_i20_%28BC3%29_1X7A6488.jpg"),
    ),
    SampleVehicle(
        "Honda",
        "City",
        Category.SEDAN,
        12_50_000_00,
        6,
        commons_photo("5/5c", "2022_Honda_City_ZX_i-VTEC_%28India%29_front_view.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Verna",
        Category.SEDAN,
        11_50_000_00,
        4,
        commons_photo("3/31", "HYUNDAI_VERNA_%28HYUNDAI_ACCENT%29_%28RB%2CRC%29_China.jpg"),
    ),
    SampleVehicle(
        "Skoda",
        "Slavia",
        Category.SEDAN,
        13_00_000_00,
        0,
        commons_photo("a/a9", "Skoda_Slavia_Side_view.jpg"),
    ),
    SampleVehicle(
        "Toyota",
        "Fortuner",
        Category.SUV,
        38_00_000_00,
        3,
        commons_photo("2/2c", "Toyota_Fortuner_LTD_4x2_20221019.jpg"),
    ),
    SampleVehicle(
        "Mahindra",
        "XUV700",
        Category.SUV,
        18_00_000_00,
        7,
        commons_photo("3/35", "2023_Mahindra_XUV700_AX7L_front.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Creta",
        Category.SUV,
        15_00_000_00,
        10,
        commons_photo("5/55", "HYUNDAI_CRETA_%2C_iX25_%28SU2%29_China_%284%29.jpg"),
    ),
    SampleVehicle(
        "BMW",
        "2 Series Gran Coupe",
        Category.COUPE,
        45_00_000_00,
        2,
        commons_photo("b/b5", "BMW_2_Series_Gran_Coupe_IMG001.jpg"),
    ),
    SampleVehicle(
        "Audi",
        "A5",
        Category.COUPE,
        60_00_000_00,
        0,
        commons_photo("3/32", "Audi_A5_Sportback_F5_FL_1X7A7086.jpg"),
    ),
    SampleVehicle(
        "Toyota",
        "Hilux",
        Category.TRUCK,
        30_00_000_00,
        5,
        commons_photo("8/81", "Toyota_HiLux_GR_Sport_1X7A7281.jpg"),
    ),
    SampleVehicle(
        "Isuzu",
        "D-Max V-Cross",
        Category.TRUCK,
        25_00_000_00,
        4,
        commons_photo("6/6b", "2021_Isuzu_D-Max_V-Cross_4-Door_3.0_Ddi_M.jpg"),
    ),
    SampleVehicle(
        "Tata",
        "Nexon EV",
        Category.EV,
        15_00_000_00,
        9,
        commons_photo("2/25", "Tata_Nexon_Blue_Dual_Tone.jpg"),
    ),
    SampleVehicle(
        "MG",
        "ZS EV",
        Category.EV,
        19_00_000_00,
        3,
        commons_photo("b/b9", "MG_ZS_EV_Facelift_1X7A5867.jpg"),
    ),
    SampleVehicle(
        "Hyundai",
        "Ioniq 5",
        Category.EV,
        46_00_000_00,
        1,
        commons_photo("a/a3", "Hyundai_Ioniq_5_1X7A0848.jpg"),
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

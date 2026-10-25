from app.domain.category import Category
from app.limits import (
    IMAGE_PATH_PREFIX,
    IMAGE_URL_MAX_LENGTH,
    IMAGE_URL_SCHEME,
    PRICE_MAX,
    PRICE_MIN,
    QUANTITY_MAX,
    QUANTITY_MIN,
)
from app.services.seed_vehicles import seed_vehicles
from tests.unit.fakes import FakeVehicleRepository

SEED_PHOTO_FOLDER = "/images/vehicles/"
MINIMUM_SAMPLE_SIZE = 15
MINIMUM_SOLD_OUT = 3


def test_seeding_an_empty_table_adds_about_fifteen_vehicles_in_every_category() -> None:
    vehicles = FakeVehicleRepository()

    seed_vehicles(vehicles)

    assert len(vehicles.vehicles) >= MINIMUM_SAMPLE_SIZE
    assert {vehicle.category for vehicle in vehicles.vehicles} == set(Category)


def test_a_few_of_the_seeded_vehicles_are_out_of_stock() -> None:
    vehicles = FakeVehicleRepository()

    seed_vehicles(vehicles)

    sold_out = [vehicle for vehicle in vehicles.vehicles if vehicle.quantity == 0]
    assert MINIMUM_SOLD_OUT <= len(sold_out) < len(vehicles.vehicles)


def test_every_seeded_vehicle_is_within_the_price_and_quantity_limits() -> None:
    vehicles = FakeVehicleRepository()

    seed_vehicles(vehicles)

    for vehicle in vehicles.vehicles:
        assert PRICE_MIN <= vehicle.price <= PRICE_MAX
        assert QUANTITY_MIN <= vehicle.quantity <= QUANTITY_MAX


def test_every_seeded_vehicle_has_its_own_image_inside_the_limit() -> None:
    vehicles = FakeVehicleRepository()

    seed_vehicles(vehicles)

    image_urls = [vehicle.image_url for vehicle in vehicles.vehicles]
    for image_url in image_urls:
        assert image_url is not None
        assert image_url.startswith((IMAGE_URL_SCHEME, IMAGE_PATH_PREFIX))
        assert len(image_url) <= IMAGE_URL_MAX_LENGTH
        assert not any(character.isspace() for character in image_url)
    assert len(set(image_urls)) == len(image_urls)


def test_every_seeded_vehicle_photo_is_self_hosted_under_images_vehicles() -> None:
    vehicles = FakeVehicleRepository()

    seed_vehicles(vehicles)

    for vehicle in vehicles.vehicles:
        assert vehicle.image_url is not None
        assert vehicle.image_url.startswith(SEED_PHOTO_FOLDER)


def test_seeding_a_table_that_already_has_a_vehicle_adds_nothing() -> None:
    vehicles = FakeVehicleRepository()
    vehicles.add("Toyota", "Corolla", Category.SEDAN, 1_500_000_00, 5)

    seed_vehicles(vehicles)

    assert len(vehicles.vehicles) == 1

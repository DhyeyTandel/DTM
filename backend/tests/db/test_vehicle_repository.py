from typing import Any

import pytest
from psycopg.errors import CheckViolation
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.limits import PRICE_MAX, QUANTITY_MAX
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import SqlVehicleRepository


def build_vehicle(**changes: object) -> dict[str, Any]:
    fields: dict[str, Any] = {
        "make": "Toyota",
        "model": "Corolla",
        "category": "sedan",
        "price": 1_500_000_00,
        "quantity": 5,
    }
    return {**fields, **changes}


@pytest.mark.parametrize(
    ("changes", "constraint"),
    [
        ({"price": 0}, "ck_vehicles_price"),
        ({"price": PRICE_MAX + 1}, "ck_vehicles_price"),
        ({"quantity": -1}, "ck_vehicles_quantity"),
        ({"quantity": QUANTITY_MAX + 1}, "ck_vehicles_quantity"),
        ({"category": "bus"}, "ck_vehicles_category"),
        ({"make": ""}, "ck_vehicles_make"),
        ({"model": ""}, "ck_vehicles_model"),
        ({"image_url": "http://example.com/car.jpg"}, "ck_vehicles_image_url"),
        ({"image_url": "javascript:alert(1)"}, "ck_vehicles_image_url"),
        ({"image_url": "/etc/passwd"}, "ck_vehicles_image_url"),
        ({"image_url": "//evil.example/x.jpg"}, "ck_vehicles_image_url"),
        ({"image_url": "/images/../secret.jpg"}, "ck_vehicles_image_url"),
        ({"image_url": "/images/%2e%2e/secret.jpg"}, "ck_vehicles_image_url"),
        ({"image_url": "/images/a\\b.jpg"}, "ck_vehicles_image_url"),
    ],
)
def test_the_database_refuses_a_vehicle_that_breaks_a_check_constraint(
    rolled_back_session_factory: sessionmaker[Session],
    changes: dict[str, object],
    constraint: str,
) -> None:
    with rolled_back_session_factory() as session:
        with pytest.raises(IntegrityError) as refused:
            SqlVehicleRepository(session).add(**build_vehicle(**changes))

    assert isinstance(refused.value.orig, CheckViolation)
    assert refused.value.orig.diag.constraint_name == constraint


def test_a_vehicle_without_an_image_url_is_accepted_and_has_none(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        vehicle = SqlVehicleRepository(session).add(**build_vehicle())

        assert vehicle.image_url is None


def test_a_self_hosted_photo_path_is_accepted(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        vehicle = SqlVehicleRepository(session).add(
            **build_vehicle(image_url="/images/vehicles/swift.jpg")
        )

        assert vehicle.image_url == "/images/vehicles/swift.jpg"


def test_updating_changes_only_the_five_editable_columns(
    committed_session_factory: sessionmaker[Session],
) -> None:
    with committed_session_factory() as setup_session:
        vehicle = SqlVehicleRepository(setup_session).add(**build_vehicle(quantity=5))
        vehicle_id = vehicle.id
        setup_session.commit()

    with committed_session_factory() as editing_session:
        editing_session.get(Vehicle, vehicle_id)
        with committed_session_factory() as buying_session:
            buying_session.execute(
                update(Vehicle).where(Vehicle.id == vehicle_id).values(quantity=4)
            )
            buying_session.commit()

        updated = SqlVehicleRepository(editing_session).update(
            vehicle_id, "Honda", "City", "hatchback", 1_200_000_00, "https://example.com/city.jpg"
        )
        assert updated is not None
        returned_quantity = updated.quantity
        editing_session.commit()

    with committed_session_factory() as checking_session:
        stored = checking_session.get(Vehicle, vehicle_id)
        assert stored is not None
        assert (stored.make, stored.image_url, stored.quantity) == (
            "Honda",
            "https://example.com/city.jpg",
            4,
        )
    assert returned_quantity == 4


def add_vehicles(session: Session, *vehicles: dict[str, Any]) -> list[Vehicle]:
    repository = SqlVehicleRepository(session)
    return [repository.add(**fields) for fields in vehicles]


def test_a_search_with_no_filters_returns_every_vehicle(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        added = add_vehicles(
            session, build_vehicle(), build_vehicle(make="Honda", model="City"), build_vehicle()
        )

        found = SqlVehicleRepository(session).search()

        assert found == added


def test_a_search_by_make_returns_only_that_make(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        toyota, _honda = add_vehicles(session, build_vehicle(), build_vehicle(make="Honda"))

        found = SqlVehicleRepository(session).search(make="Toyota")

        assert found == [toyota]


def test_a_search_by_model_returns_only_that_model(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        corolla, _city = add_vehicles(session, build_vehicle(), build_vehicle(model="City"))

        found = SqlVehicleRepository(session).search(model="Corolla")

        assert found == [corolla]


def test_a_search_by_category_returns_only_that_category(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        _sedan, suv = add_vehicles(session, build_vehicle(), build_vehicle(category="suv"))

        found = SqlVehicleRepository(session).search(category="suv")

        assert found == [suv]


def test_a_search_by_minimum_price_returns_vehicles_at_or_above_it(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        _cheap, expensive = add_vehicles(
            session, build_vehicle(price=1_000_000_00), build_vehicle(price=2_000_000_00)
        )

        found = SqlVehicleRepository(session).search(min_price=1_500_000_00)

        assert found == [expensive]


def test_a_search_by_maximum_price_returns_vehicles_at_or_below_it(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        cheap, _expensive = add_vehicles(
            session, build_vehicle(price=1_000_000_00), build_vehicle(price=2_000_000_00)
        )

        found = SqlVehicleRepository(session).search(max_price=1_500_000_00)

        assert found == [cheap]


def test_a_search_by_price_range_returns_vehicles_inside_it(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        _cheap, middle, _expensive = add_vehicles(
            session,
            build_vehicle(price=1_000_000_00),
            build_vehicle(price=2_000_000_00),
            build_vehicle(price=3_000_000_00),
        )

        found = SqlVehicleRepository(session).search(min_price=1_500_000_00, max_price=2_500_000_00)

        assert found == [middle]


def test_a_price_equal_to_the_minimum_or_maximum_is_included(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        added = add_vehicles(
            session, build_vehicle(price=1_000_000_00), build_vehicle(price=2_000_000_00)
        )

        found = SqlVehicleRepository(session).search(min_price=1_000_000_00, max_price=2_000_000_00)

        assert found == added


def test_several_filters_together_all_have_to_match(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        match, *_others = add_vehicles(
            session,
            build_vehicle(category="suv", price=2_000_000_00),
            build_vehicle(make="Honda", category="suv", price=2_000_000_00),
            build_vehicle(category="sedan", price=2_000_000_00),
            build_vehicle(category="suv", price=9_000_000_00),
        )

        found = SqlVehicleRepository(session).search(
            make="Toyota", category="suv", min_price=1_000_000_00, max_price=3_000_000_00
        )

        assert found == [match]


def test_make_and_model_match_on_part_of_the_text_ignoring_case(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        corolla, _city = add_vehicles(
            session, build_vehicle(), build_vehicle(make="Honda", model="City")
        )
        repository = SqlVehicleRepository(session)

        assert repository.search(make="toy") == [corolla]
        assert repository.search(model="OROL") == [corolla]


@pytest.mark.parametrize("text", ["%", "_", "/"])
def test_wildcards_and_the_escape_character_in_search_text_are_matched_literally(
    rolled_back_session_factory: sessionmaker[Session], text: str
) -> None:
    with rolled_back_session_factory() as session:
        literal, _plain = add_vehicles(
            session, build_vehicle(make=f"A{text}B"), build_vehicle(make="AxxB")
        )

        found = SqlVehicleRepository(session).search(make=text)

        assert found == [literal]


def test_a_purchase_lowers_quantity_by_exactly_one(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        (added,) = add_vehicles(session, build_vehicle(quantity=5))

        purchased = SqlVehicleRepository(session).purchase(added.id)

        assert purchased is not None
        assert purchased.quantity == 4


def test_a_purchase_of_the_last_unit_leaves_quantity_zero(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        (added,) = add_vehicles(session, build_vehicle(quantity=1))

        purchased = SqlVehicleRepository(session).purchase(added.id)

        assert purchased is not None
        assert purchased.quantity == 0


def test_a_purchase_at_zero_stock_changes_nothing_and_returns_nothing(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        (added,) = add_vehicles(session, build_vehicle(quantity=0))
        repository = SqlVehicleRepository(session)

        assert repository.purchase(added.id) is None

        session.refresh(added)
        assert added.quantity == 0


def test_a_restock_adds_to_the_current_quantity_and_keeps_a_purchase_made_in_between(
    committed_session_factory: sessionmaker[Session],
) -> None:
    with committed_session_factory() as setup_session:
        vehicle_id = SqlVehicleRepository(setup_session).add(**build_vehicle(quantity=5)).id
        setup_session.commit()

    with committed_session_factory() as restocking_session:
        restocking_session.get(Vehicle, vehicle_id)
        with committed_session_factory() as buying_session:
            assert SqlVehicleRepository(buying_session).purchase(vehicle_id) is not None
            buying_session.commit()

        restocked = SqlVehicleRepository(restocking_session).restock(vehicle_id, 10)
        assert restocked is not None
        returned_quantity = restocked.quantity
        restocking_session.commit()

    with committed_session_factory() as checking_session:
        stored = checking_session.get(Vehicle, vehicle_id)
        assert stored is not None
        assert stored.quantity == 14
    assert returned_quantity == 14


def test_a_restock_to_exactly_the_limit_is_accepted(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        (added,) = add_vehicles(session, build_vehicle(quantity=QUANTITY_MAX - 10))

        restocked = SqlVehicleRepository(session).restock(added.id, 10)

        assert restocked is not None
        assert restocked.quantity == QUANTITY_MAX


def test_a_restock_past_the_limit_changes_nothing_and_returns_nothing(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        (added,) = add_vehicles(session, build_vehicle(quantity=QUANTITY_MAX - 10))

        assert SqlVehicleRepository(session).restock(added.id, 11) is None

        session.refresh(added)
        assert added.quantity == QUANTITY_MAX - 10


def test_restocking_a_missing_vehicle_returns_nothing(
    rolled_back_session_factory: sessionmaker[Session],
) -> None:
    with rolled_back_session_factory() as session:
        assert SqlVehicleRepository(session).restock(999_999, 10) is None

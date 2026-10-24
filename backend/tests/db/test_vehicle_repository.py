import pytest
from psycopg.errors import CheckViolation
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.limits import PRICE_MAX, QUANTITY_MAX
from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import SqlVehicleRepository


def build_vehicle(**changes: object) -> Vehicle:
    fields: dict[str, object] = {
        "make": "Toyota",
        "model": "Corolla",
        "category": "sedan",
        "price": 1_500_000_00,
        "quantity": 5,
    }
    return Vehicle(**{**fields, **changes})


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
    ],
)
def test_the_database_refuses_a_vehicle_that_breaks_a_check_constraint(
    rolled_back_session_factory: sessionmaker[Session],
    changes: dict[str, object],
    constraint: str,
) -> None:
    with rolled_back_session_factory() as session:
        with pytest.raises(IntegrityError) as refused:
            SqlVehicleRepository(session).add(build_vehicle(**changes))

    assert isinstance(refused.value.orig, CheckViolation)
    assert refused.value.orig.diag.constraint_name == constraint


def test_updating_changes_only_the_four_editable_columns(
    committed_session_factory: sessionmaker[Session],
) -> None:
    with committed_session_factory() as setup_session:
        vehicle = SqlVehicleRepository(setup_session).add(build_vehicle(quantity=5))
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
            vehicle_id, "Honda", "City", "hatchback", 1_200_000_00
        )
        assert updated is not None
        returned_quantity = updated.quantity
        editing_session.commit()

    with committed_session_factory() as checking_session:
        stored = checking_session.get(Vehicle, vehicle_id)
        assert stored is not None
        assert (stored.make, stored.quantity) == ("Honda", 4)
    assert returned_quantity == 4


def add_vehicles(session: Session, *vehicles: Vehicle) -> list[Vehicle]:
    repository = SqlVehicleRepository(session)
    return [repository.add(vehicle) for vehicle in vehicles]


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

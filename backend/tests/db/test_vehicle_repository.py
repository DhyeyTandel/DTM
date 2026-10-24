import pytest
from psycopg.errors import CheckViolation
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

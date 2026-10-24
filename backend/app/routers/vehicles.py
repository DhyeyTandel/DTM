from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status

from app.dependencies import (
    get_current_user,
    get_purchase_service,
    get_vehicle_service,
    require_admin,
)
from app.domain.category import Category
from app.limits import (
    PRICE_BOUND_MIN,
    PRICE_MAX,
    SEARCH_TEXT_MAX_LENGTH,
    VEHICLE_ID_MAX,
    VEHICLE_ID_MIN,
)
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import RestockRequest, VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.purchase_service import PurchaseService
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles")

VehicleId = Annotated[int, Path(ge=VEHICLE_ID_MIN, le=VEHICLE_ID_MAX)]
PriceBound = Annotated[int, Query(ge=PRICE_BOUND_MIN, le=PRICE_MAX)]
SearchText = Annotated[str, Query(max_length=SEARCH_TEXT_MAX_LENGTH)]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=VehicleResponse,
    dependencies=[Depends(require_admin)],
)
def add_vehicle(
    body: VehicleCreate, service: Annotated[VehicleService, Depends(get_vehicle_service)]
) -> Vehicle:
    return service.add(
        body.make, body.model, body.category, body.price, body.quantity, body.image_url
    )


@router.get("", response_model=list[VehicleResponse], dependencies=[Depends(get_current_user)])
def list_vehicles(
    service: Annotated[VehicleService, Depends(get_vehicle_service)],
) -> list[Vehicle]:
    return service.list_all()


@router.put("/{vehicle_id}", response_model=VehicleResponse, dependencies=[Depends(require_admin)])
def update_vehicle(
    vehicle_id: VehicleId,
    body: VehicleUpdate,
    service: Annotated[VehicleService, Depends(get_vehicle_service)],
) -> Vehicle:
    return service.update(vehicle_id, body.make, body.model, body.category, body.price)


@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_vehicle(
    vehicle_id: VehicleId, service: Annotated[VehicleService, Depends(get_vehicle_service)]
) -> None:
    service.delete(vehicle_id)


@router.get(
    "/search", response_model=list[VehicleResponse], dependencies=[Depends(get_current_user)]
)
def search_vehicles(
    service: Annotated[VehicleService, Depends(get_vehicle_service)],
    make: SearchText | None = None,
    model: SearchText | None = None,
    category: Category | None = None,
    min_price: PriceBound | None = None,
    max_price: PriceBound | None = None,
) -> list[Vehicle]:
    return service.search(
        make=make, model=model, category=category, min_price=min_price, max_price=max_price
    )


@router.post("/{vehicle_id}/purchase", response_model=VehicleResponse)
def purchase_vehicle(
    vehicle_id: VehicleId,
    user: Annotated[User, Depends(get_current_user)],
    service: Annotated[PurchaseService, Depends(get_purchase_service)],
) -> Vehicle:
    return service.purchase(user.id, vehicle_id)


@router.post(
    "/{vehicle_id}/restock", response_model=VehicleResponse, dependencies=[Depends(require_admin)]
)
def restock_vehicle(
    vehicle_id: VehicleId,
    body: RestockRequest,
    service: Annotated[VehicleService, Depends(get_vehicle_service)],
) -> Vehicle:
    return service.restock(vehicle_id, body.amount)

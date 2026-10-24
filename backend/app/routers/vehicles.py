from typing import Annotated

from fastapi import APIRouter, Depends, Path, status

from app.dependencies import get_current_user, get_vehicle_service, require_admin
from app.limits import VEHICLE_ID_MAX
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles")

VehicleId = Annotated[int, Path(ge=1, le=VEHICLE_ID_MAX)]


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=VehicleResponse,
    dependencies=[Depends(require_admin)],
)
def add_vehicle(
    body: VehicleCreate, service: Annotated[VehicleService, Depends(get_vehicle_service)]
) -> Vehicle:
    return service.add(body.make, body.model, body.category, body.price, body.quantity)


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


@router.get("/search", response_model=list[VehicleResponse])
def search_vehicles(
    service: Annotated[VehicleService, Depends(get_vehicle_service)], make: str | None = None
) -> list[Vehicle]:
    return service.search(make=make)

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_vehicle_service
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=VehicleResponse)
def add_vehicle(
    body: VehicleCreate, service: Annotated[VehicleService, Depends(get_vehicle_service)]
) -> Vehicle:
    return service.add(body.make, body.model, body.category, body.price, body.quantity)

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_auth_service
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def register(
    request: RegisterRequest, service: Annotated[AuthService, Depends(get_auth_service)]
) -> User:
    return service.register(request.email, request.password)

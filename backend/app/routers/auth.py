from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.dependencies import get_auth_service
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def register(
    body: RegisterRequest, service: Annotated[AuthService, Depends(get_auth_service)]
) -> User:
    return service.register(body.email, body.password)


@router.post("/login", response_model=TokenResponse)
def login(
    body: LoginRequest, service: Annotated[AuthService, Depends(get_auth_service)]
) -> TokenResponse:
    return TokenResponse(access_token=service.login(body.email, body.password))

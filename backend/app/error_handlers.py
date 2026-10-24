from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.domain.errors import (
    DomainError,
    EmailAlreadyRegistered,
    InvalidCredentials,
    NotAuthenticated,
)

STATUS_BY_ERROR: dict[type[DomainError], int] = {
    EmailAlreadyRegistered: status.HTTP_409_CONFLICT,
    InvalidCredentials: status.HTTP_401_UNAUTHORIZED,
    NotAuthenticated: status.HTTP_401_UNAUTHORIZED,
}


def handle_domain_error(request: Request, error: Exception) -> JSONResponse:
    assert isinstance(error, DomainError)
    return JSONResponse(status_code=STATUS_BY_ERROR[type(error)], content={"detail": error.message})

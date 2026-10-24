from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.domain.errors import DomainError, EmailAlreadyRegistered

STATUS_BY_ERROR: dict[type[DomainError], int] = {
    EmailAlreadyRegistered: status.HTTP_409_CONFLICT,
}


def handle_domain_error(request: Request, error: Exception) -> JSONResponse:
    assert isinstance(error, DomainError)
    return JSONResponse(status_code=STATUS_BY_ERROR[type(error)], content={"detail": error.message})

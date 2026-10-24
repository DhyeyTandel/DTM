from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.domain.errors import (
    AdminRequired,
    DomainError,
    EmailAlreadyRegistered,
    InvalidCredentials,
    InvalidPriceRange,
    InvalidQuantity,
    NotAuthenticated,
    OutOfStock,
    StockLimitExceeded,
    VehicleNotFound,
)

STATUS_BY_ERROR: dict[type[DomainError], int] = {
    EmailAlreadyRegistered: status.HTTP_409_CONFLICT,
    InvalidCredentials: status.HTTP_401_UNAUTHORIZED,
    NotAuthenticated: status.HTTP_401_UNAUTHORIZED,
    AdminRequired: status.HTTP_403_FORBIDDEN,
    VehicleNotFound: status.HTTP_404_NOT_FOUND,
    OutOfStock: status.HTTP_409_CONFLICT,
    StockLimitExceeded: status.HTTP_409_CONFLICT,
    InvalidQuantity: status.HTTP_422_UNPROCESSABLE_CONTENT,
    InvalidPriceRange: status.HTTP_422_UNPROCESSABLE_CONTENT,
}


def handle_domain_error(request: Request, error: Exception) -> JSONResponse:
    assert isinstance(error, DomainError)
    return JSONResponse(status_code=STATUS_BY_ERROR[type(error)], content={"detail": error.message})

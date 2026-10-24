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

UNEXPECTED_ERROR_MESSAGE = "Internal server error"

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


def handle_unexpected_error(request: Request, error: Exception) -> JSONResponse:
    # The message is fixed on purpose: the exception text and trace stay in the server log.
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": UNEXPECTED_ERROR_MESSAGE},
    )

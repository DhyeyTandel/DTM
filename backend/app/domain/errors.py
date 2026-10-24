class DomainError(Exception):
    message: str


class EmailAlreadyRegistered(DomainError):
    message = "Email already registered"


class InvalidCredentials(DomainError):
    message = "Invalid email or password"


class NotAuthenticated(DomainError):
    message = "Not authenticated"


class AdminRequired(DomainError):
    message = "Admin access required"


class VehicleNotFound(DomainError):
    message = "Vehicle not found"


class OutOfStock(DomainError):
    message = "Vehicle is out of stock"


class InvalidPriceRange(DomainError):
    message = "Minimum price must not be above maximum price"


class InvalidAdminSettings(Exception):
    pass

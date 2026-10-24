class DomainError(Exception):
    message: str


class EmailAlreadyRegistered(DomainError):
    message = "Email already registered"


class InvalidCredentials(DomainError):
    message = "Invalid email or password"


class NotAuthenticated(DomainError):
    message = "Not authenticated"

class DomainError(Exception):
    message: str


class EmailAlreadyRegistered(DomainError):
    message = "Email already registered"

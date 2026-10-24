from app.domain.errors import DomainError
from app.error_handlers import STATUS_BY_ERROR


def test_every_domain_error_has_a_status_code() -> None:
    assert set(DomainError.__subclasses__()) <= set(STATUS_BY_ERROR)

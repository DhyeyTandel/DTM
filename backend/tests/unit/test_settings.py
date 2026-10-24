import pytest
from pydantic import ValidationError

from app.config import Settings


def test_the_app_refuses_to_start_when_the_secret_key_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("SECRET_KEY", raising=False)

    with pytest.raises(ValidationError, match="secret_key"):
        Settings(_env_file=None, database_url="postgresql+psycopg://unused")

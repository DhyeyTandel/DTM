import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from tests.credentials import ADMIN_EMAIL, ADMIN_PASSWORD

BACKEND_DIRECTORY = Path(__file__).resolve().parent.parent
DEFAULT_TEST_DATABASE_URL = "postgresql+psycopg://dtm:dtm@localhost:5433/dtm_test"
TEST_SECRET_KEY = "test-secret-key-that-is-long-enough-for-hs256"


@pytest.fixture(scope="session")
def test_database_url() -> str:
    return os.environ.get("TEST_DATABASE_URL", DEFAULT_TEST_DATABASE_URL)


@pytest.fixture
def settings(test_database_url: str) -> Settings:
    return Settings(_env_file=None, database_url=test_database_url, secret_key=TEST_SECRET_KEY)


@pytest.fixture
def admin_settings(settings: Settings) -> Settings:
    return settings.model_copy(
        update={"admin_email": ADMIN_EMAIL, "admin_password": ADMIN_PASSWORD}
    )


@pytest.fixture(scope="session")
def migration_config(test_database_url: str) -> Config:
    config = Config(str(BACKEND_DIRECTORY / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIRECTORY / "alembic"))
    config.set_main_option("sqlalchemy.url", test_database_url)
    return config


@pytest.fixture(scope="session")
def database_engine(test_database_url: str, migration_config: Config) -> Iterator[Engine]:
    command.upgrade(migration_config, "head")

    engine = create_engine(test_database_url)
    yield engine
    engine.dispose()


@pytest.fixture
def rolled_back_session_factory(database_engine: Engine) -> Iterator[sessionmaker[Session]]:
    """Sessions that share one outer transaction, thrown away after the test.

    A commit inside a session only releases a savepoint, so nothing reaches the database.
    Only for tests that run one request at a time; concurrent code needs its own connections.
    """
    with database_engine.connect() as connection:
        outer_transaction = connection.begin()
        yield sessionmaker(bind=connection, join_transaction_mode="create_savepoint")
        outer_transaction.rollback()

import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

BACKEND_DIRECTORY = Path(__file__).resolve().parent.parent
DEFAULT_TEST_DATABASE_URL = "postgresql+psycopg://dtm:dtm@localhost:5433/dtm_test"


@pytest.fixture(scope="session")
def database_engine() -> Iterator[Engine]:
    database_url = os.environ.get("TEST_DATABASE_URL", DEFAULT_TEST_DATABASE_URL)
    migration_config = Config(str(BACKEND_DIRECTORY / "alembic.ini"))
    migration_config.set_main_option("script_location", str(BACKEND_DIRECTORY / "alembic"))
    migration_config.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(migration_config, "head")

    engine = create_engine(database_url)
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

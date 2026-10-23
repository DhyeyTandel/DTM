from collections.abc import Iterator

import pytest
from sqlalchemy import Engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base


@pytest.fixture
def committed_session_factory(database_engine: Engine) -> Iterator[sessionmaker[Session]]:
    """Sessions that really commit, for concurrency tests where each thread opens its own.

    Close every session before the test ends, or the truncate waits on its lock.
    """
    yield sessionmaker(bind=database_engine)
    with database_engine.begin() as connection:
        for table in Base.metadata.sorted_tables:
            connection.execute(text(f"TRUNCATE TABLE {table.name} RESTART IDENTITY CASCADE"))

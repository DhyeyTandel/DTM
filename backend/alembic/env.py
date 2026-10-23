from alembic import context
from sqlalchemy import create_engine

from app.config import Settings
from app.database import Base

config = context.config


def database_url() -> str:
    # Tests set their own URL on the config, so they can never migrate the dev database.
    return config.get_main_option("sqlalchemy.url") or Settings().database_url


def run_migrations() -> None:
    engine = create_engine(database_url())
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()


run_migrations()

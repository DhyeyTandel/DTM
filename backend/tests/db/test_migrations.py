from alembic import command
from alembic.config import Config
from sqlalchemy import Engine, inspect

APP_TABLES = {"users", "vehicles", "purchases"}


def table_names(engine: Engine) -> set[str]:
    return set(inspect(engine).get_table_names())


def test_migrations_run_from_empty_to_head_and_back_down(
    migration_config: Config, database_engine: Engine
) -> None:
    command.downgrade(migration_config, "base")
    assert table_names(database_engine) & APP_TABLES == set()

    command.upgrade(migration_config, "head")
    assert APP_TABLES <= table_names(database_engine)

    command.downgrade(migration_config, "base")
    assert table_names(database_engine) & APP_TABLES == set()

    command.upgrade(migration_config, "head")
    assert APP_TABLES <= table_names(database_engine)

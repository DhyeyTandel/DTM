from fastapi import FastAPI
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.database import build_session_factory


def create_app(session_factory: sessionmaker[Session]) -> FastAPI:
    app = FastAPI(title="Dhyey Tandel Motors")
    app.state.session_factory = session_factory
    return app


def create_production_app() -> FastAPI:
    return create_app(build_session_factory(Settings().database_url))

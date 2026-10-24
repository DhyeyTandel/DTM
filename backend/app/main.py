from fastapi import FastAPI

from app.config import Settings
from app.database import build_session_factory
from app.routers import health

API_PREFIX = "/api"


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(title="Dhyey Tandel Motors")
    app.state.settings = settings
    app.state.session_factory = build_session_factory(settings.database_url)
    app.include_router(health.router, prefix=API_PREFIX)
    return app


def create_production_app() -> FastAPI:
    return create_app(Settings())

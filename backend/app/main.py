from fastapi import FastAPI

from app.config import Settings
from app.database import build_session_factory
from app.domain.errors import DomainError
from app.error_handlers import handle_domain_error, handle_unexpected_error
from app.routers import auth, health, vehicles

API_PREFIX = "/api"


def create_app(settings: Settings) -> FastAPI:
    app = FastAPI(title="Dhyey Tandel Motors")
    app.state.settings = settings
    app.state.session_factory = build_session_factory(settings.database_url)
    app.add_exception_handler(DomainError, handle_domain_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
    app.include_router(health.router, prefix=API_PREFIX)
    app.include_router(auth.router, prefix=API_PREFIX)
    app.include_router(vehicles.router, prefix=API_PREFIX)
    return app


def create_production_app() -> FastAPI:
    return create_app(Settings())

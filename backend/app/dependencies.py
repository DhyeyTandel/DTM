from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import Settings
from app.domain.errors import NotAuthenticated
from app.models.user import User
from app.repositories.user_repository import SqlUserRepository
from app.services.auth_service import AuthService


def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.session_factory() as session:
        yield session
        session.commit()


# Every user of the session must declare it this way, or FastAPI may open a second one.
SessionDependency = Annotated[Session, Depends(get_session, scope="function")]


def get_settings(request: Request) -> Settings:
    settings: Settings = request.app.state.settings
    return settings


def get_auth_service(
    session: SessionDependency, settings: Annotated[Settings, Depends(get_settings)]
) -> AuthService:
    return AuthService(SqlUserRepository(session), settings)


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    raise NotAuthenticated

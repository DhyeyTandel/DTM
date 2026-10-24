from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import Settings
from app.domain.errors import AdminRequired, NotAuthenticated
from app.domain.role import Role
from app.models.user import User
from app.repositories.user_repository import SqlUserRepository, UserRepository
from app.security.tokens import read_user_id
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


def get_user_repository(session: SessionDependency) -> UserRepository:
    return SqlUserRepository(session)


def get_auth_service(
    users: Annotated[UserRepository, Depends(get_user_repository)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AuthService:
    return AuthService(users, settings)


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
    users: Annotated[UserRepository, Depends(get_user_repository)],
) -> User:
    if credentials is None:
        raise NotAuthenticated
    user_id = read_user_id(credentials.credentials, settings.secret_key, settings.token_algorithm)
    user = users.find_by_id(user_id)
    if user is None:
        raise NotAuthenticated
    return user


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.role != Role.ADMIN:
        raise AdminRequired
    return user

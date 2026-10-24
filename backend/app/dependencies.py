from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.repositories.user_repository import SqlUserRepository
from app.services.auth_service import AuthService


def get_session(request: Request) -> Iterator[Session]:
    with request.app.state.session_factory() as session:
        yield session
        session.commit()


# Every user of the session must declare it this way, or FastAPI may open a second one.
SessionDependency = Annotated[Session, Depends(get_session, scope="function")]


def get_auth_service(session: SessionDependency) -> AuthService:
    return AuthService(SqlUserRepository(session))

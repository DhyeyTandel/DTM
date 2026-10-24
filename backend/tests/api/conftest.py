import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.domain.role import Role
from app.main import create_app
from app.models.user import User


@pytest.fixture
def app(settings: Settings, rolled_back_session_factory: sessionmaker[Session]) -> FastAPI:
    app = create_app(settings)
    app.state.session_factory = rolled_back_session_factory
    return app


@pytest.fixture
def client(app: FastAPI) -> TestClient:
    return TestClient(app)


@pytest.fixture
def buyer_token(client: TestClient) -> str:
    credentials = {"email": "buyer@example.com", "password": "correct horse"}
    client.post("/api/auth/register", json=credentials)
    token: str = client.post("/api/auth/login", json=credentials).json()["access_token"]
    return token


@pytest.fixture
def admin_token(client: TestClient, rolled_back_session_factory: sessionmaker[Session]) -> str:
    credentials = {"email": "owner@example.com", "password": "correct horse"}
    client.post("/api/auth/register", json=credentials)
    with rolled_back_session_factory() as session:
        session.query(User).filter_by(email=credentials["email"]).update({User.role: Role.ADMIN})
        session.commit()
    token: str = client.post("/api/auth/login", json=credentials).json()["access_token"]
    return token


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {admin_token}"}

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.main import create_app


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

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings
from app.main import create_app


@pytest.fixture
def client(settings: Settings, rolled_back_session_factory: sessionmaker[Session]) -> TestClient:
    app = create_app(settings)
    app.state.session_factory = rolled_back_session_factory
    return TestClient(app)

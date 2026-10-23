import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.main import create_app


@pytest.fixture
def client(rolled_back_session_factory: sessionmaker[Session]) -> TestClient:
    return TestClient(create_app(rolled_back_session_factory))

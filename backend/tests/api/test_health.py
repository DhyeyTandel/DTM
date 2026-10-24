from fastapi.testclient import TestClient

from app.database import build_session_factory
from app.main import create_app

UNREACHABLE_DATABASE_URL = "postgresql+psycopg://dtm:dtm@localhost:1/dtm"


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_returns_503_when_database_does_not_answer() -> None:
    app = create_app(build_session_factory(UNREACHABLE_DATABASE_URL))

    response = TestClient(app).get("/api/health")

    assert response.status_code == 503
    assert "detail" in response.json()

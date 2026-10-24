from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

UNREACHABLE_DATABASE_URL = "postgresql+psycopg://dtm:dtm@localhost:1/dtm"


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_returns_503_when_database_does_not_answer(settings: Settings) -> None:
    unreachable_settings = settings.model_copy(update={"database_url": UNREACHABLE_DATABASE_URL})
    app = create_app(unreachable_settings)

    response = TestClient(app).get("/api/health")

    assert response.status_code == 503
    assert "detail" in response.json()

from fastapi.testclient import TestClient

REGISTER_URL = "/api/auth/register"
LOGIN_URL = "/api/auth/login"
CREDENTIALS = {"email": "buyer@example.com", "password": "correct horse"}


def test_login_returns_200_with_a_bearer_token(client: TestClient) -> None:
    client.post(REGISTER_URL, json=CREDENTIALS)

    response = client.post(LOGIN_URL, json=CREDENTIALS)

    body = response.json()
    assert response.status_code == 200
    assert body["token_type"] == "bearer"
    assert body["access_token"]

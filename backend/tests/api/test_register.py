from fastapi.testclient import TestClient

REGISTER_URL = "/api/auth/register"
VALID_REGISTRATION = {"email": "buyer@example.com", "password": "correct horse"}


def test_register_returns_201_with_id_email_and_customer_role(client: TestClient) -> None:
    response = client.post(REGISTER_URL, json=VALID_REGISTRATION)

    body = response.json()
    assert response.status_code == 201
    assert isinstance(body["id"], int)
    assert body["email"] == "buyer@example.com"
    assert body["role"] == "customer"

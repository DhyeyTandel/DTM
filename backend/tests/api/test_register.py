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


def test_register_response_never_contains_the_password_or_its_hash(client: TestClient) -> None:
    response = client.post(REGISTER_URL, json=VALID_REGISTRATION)

    assert "password" not in response.json()
    assert "password_hash" not in response.json()
    assert VALID_REGISTRATION["password"] not in response.text
    assert "$2b$" not in response.text


def test_register_with_a_duplicate_email_returns_409(client: TestClient) -> None:
    client.post(REGISTER_URL, json=VALID_REGISTRATION)

    response = client.post(REGISTER_URL, json=VALID_REGISTRATION)

    assert response.status_code == 409
    assert "detail" in response.json()

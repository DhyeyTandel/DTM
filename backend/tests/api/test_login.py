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


def test_wrong_password_and_unknown_email_both_return_the_same_401(client: TestClient) -> None:
    client.post(REGISTER_URL, json=CREDENTIALS)

    wrong_password = client.post(LOGIN_URL, json={**CREDENTIALS, "password": "wrong password"})
    unknown_email = client.post(LOGIN_URL, json={**CREDENTIALS, "email": "nobody@example.com"})

    assert wrong_password.status_code == 401
    assert unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_login_matches_the_email_ignoring_letter_case(client: TestClient) -> None:
    client.post(REGISTER_URL, json=CREDENTIALS)

    response = client.post(LOGIN_URL, json={**CREDENTIALS, "email": " Buyer@EXAMPLE.com "})

    assert response.status_code == 200

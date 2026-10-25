from fastapi.testclient import TestClient

ME_URL = "/api/auth/me"


def bearer(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_me_returns_the_id_email_and_role_of_a_customer(
    client: TestClient, buyer_token: str
) -> None:
    response = client.get(ME_URL, headers=bearer(buyer_token))

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "buyer@example.com"
    assert body["role"] == "customer"
    assert isinstance(body["id"], int)


def test_me_tells_an_admin_from_a_customer(client: TestClient, admin_token: str) -> None:
    response = client.get(ME_URL, headers=bearer(admin_token))

    assert response.json()["role"] == "admin"


def test_me_does_not_return_the_password_hash(client: TestClient, buyer_token: str) -> None:
    response = client.get(ME_URL, headers=bearer(buyer_token))

    assert set(response.json()) == {"id", "email", "role"}


def test_me_without_a_token_returns_401(client: TestClient) -> None:
    assert client.get(ME_URL).status_code == 401


def test_me_with_a_bad_token_returns_401(client: TestClient) -> None:
    assert client.get(ME_URL, headers=bearer("not.a.token")).status_code == 401

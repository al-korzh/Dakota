import pytest
import asyncio
import pytest_asyncio
from httpx import AsyncClient
from unittest.mock import patch

from app.main import app


@pytest.fixture(scope='session', autouse=True)
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_users(async_client: AsyncClient):
    response = await async_client.post("/users", json={
        "email": "test@example.com",
        "telegram_id": 123456789,
        "password": "password"
    })
    assert response.status_code == 200
    _id = response.json()["id"]

    response = await async_client.get(f"/users/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get("/users")
    assert response.status_code == 200
    result = response.json()
    assert isinstance(result, list)
    assert len(result) > 0

    response = await async_client.put(f"/users/{_id}", json={
        "email": "test@example.com",
        "telegram_id": 0000000000,
        "password": "password"
    })
    assert response.status_code == 200
    assert response.json()["telegram_id"] == 0000000000

    response = await async_client.delete(f"/users/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get(f"/users/{_id}")
    assert response.status_code == 404


@pytest.mark.asyncio
@patch("app.services.Auth.utils.send_email")
async def test_auth(mock_send_email, async_client: AsyncClient):
    user = {
        "email": "test@example.com",
        "telegram_id": 123456789,
        "password": "password"
    }
    response = await async_client.post("/users", json=user)
    assert response.status_code == 200
    _id = response.json()["id"]

    response = await async_client.post(
        "/auth/login",
        data={"username": user.get("email"), "password": "wrong_password"},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Incorrect username or password"}

    response = await async_client.post(
        "/auth/login",
        data={"username": "wrong@example.com", "password": user.get("password")},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Incorrect username or password"}

    response = await async_client.post(
        "/auth/login",
        data={"username": user.get("email"), "password": user.get("password")},
    )
    assert response.status_code == 200
    assert "access_token" in response.cookies

    response = await async_client.post("/auth/check", cookies={"access_token": response.cookies["access_token"]})
    assert response.status_code == 200
    assert response.json()["email"] == user["email"]

    response = await async_client.post("/auth/check", cookies={"access_token": "invalid_token"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}

    response = await async_client.post("/auth/logout")
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
    assert "access_token" not in response.cookies

    response = await async_client.post("/auth/check", cookies={})
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}

    response = await async_client.post("/auth/reset-password", json={"username": user["email"]})
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
    mock_send_email.assert_called_once_with(
        user["email"],
        "Password Reset Request",
        f"Your new password is: {mock_send_email.call_args[0][2].split()[-1]}"
    )

    response = await async_client.post("/auth/reset-password", json={"username": "wrong@example.com"})
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found"}

    response = await async_client.delete(f"/users/{_id}")
    assert response.status_code == 200
    assert response.json()["id"] == _id

    response = await async_client.get(f"/users/{_id}")
    assert response.status_code == 404

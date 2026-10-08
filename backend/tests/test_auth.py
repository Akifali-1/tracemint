import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


@pytest.mark.asyncio
async def test_auth_me_unauthenticated(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is False
    assert data["user"] is None


@pytest.mark.asyncio
async def test_auth_me_authenticated(authenticated_client: AsyncClient, test_user: User):
    response = await authenticated_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["authenticated"] is True
    assert data["user"]["email"] == test_user.email
    assert data["user"]["name"] == test_user.name
    assert data["user"]["has_github"] is False


@pytest.mark.asyncio
async def test_auth_logout(authenticated_client: AsyncClient):
    response = await authenticated_client.post("/api/auth/logout")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

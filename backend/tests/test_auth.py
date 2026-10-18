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


@pytest.mark.asyncio
async def test_google_login_composite_state(client: AsyncClient):
    response = await client.get("/api/auth/google/login?redirect_url=https://tracemint.tech", follow_redirects=False)
    assert response.status_code == 307
    location = response.headers["location"]
    assert "https://accounts.google.com/o/oauth2/v2/auth" in location
    assert "state=" in location
    assert "oauth_state_google" in response.cookies
    assert response.cookies["oauth_frontend_origin"].strip('\'"') == "https://tracemint.tech"


@pytest.mark.asyncio
async def test_google_callback_redirects_to_production_domain_from_state(client: AsyncClient):
    import base64
    from unittest.mock import patch

    csrf = "random_test_csrf_token_value_12345"
    b64_origin = base64.urlsafe_b64encode(b"https://tracemint.tech").decode()
    state = f"{csrf}.{b64_origin}"

    mock_profile = {
        "google_id": "google-user-9999",
        "email": "user@tracemint.tech",
        "name": "TraceMint User",
        "avatar_url": "https://tracemint.tech/avatar.png"
    }

    with patch("app.api.auth.exchange_google_code", return_value=mock_profile):
        # Even if cross-site cookies were dropped:
        response = await client.get(f"/api/auth/google/callback?code=mock_code&state={state}", follow_redirects=False)
        assert response.status_code == 302
        redirect_url = response.headers["location"]
        assert redirect_url.startswith("https://tracemint.tech/?auth=success")
        assert "localhost" not in redirect_url


def test_clean_backend_url_strips_newline():
    from app.core.config import Settings
    s = Settings(BACKEND_URL="https://tracemint-api.onrender.com\n")
    assert s.clean_backend_url == "https://tracemint-api.onrender.com"
    assert "\n" not in s.clean_backend_url

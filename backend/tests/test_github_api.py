import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_github_status_disconnected(authenticated_client: AsyncClient):
    resp = await authenticated_client.get("/api/github/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["connected"] is False


@pytest.mark.asyncio
async def test_github_status_connected(
    authenticated_client: AsyncClient,
    user_with_github: User
):
    resp = await authenticated_client.get("/api/github/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["connected"] is True
    assert data["username"] == "dev_proven"


@pytest.mark.asyncio
async def test_github_disconnect(
    authenticated_client: AsyncClient,
    user_with_github: User
):
    resp = await authenticated_client.post("/api/github/disconnect")
    assert resp.status_code == 200
    assert resp.json()["status"] == "success"

    # Status should now be disconnected
    check_resp = await authenticated_client.get("/api/github/status")
    assert check_resp.json()["connected"] is False


@pytest.mark.asyncio
async def test_github_sync_failure_handling(
    authenticated_client: AsyncClient,
    user_with_github: User
):
    with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.side_effect = RuntimeError("GitHub API 503 Service Unavailable")

        sync_resp = await authenticated_client.post("/api/github/sync")
        assert sync_resp.status_code == 502
        assert "Failed to synchronize with GitHub" in sync_resp.json()["error"]["message"]

import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.analysis import GeminiAnalysisResult, SkillEvidence, StrengthEvidence, NotableProject


@pytest.mark.asyncio
async def test_unauthorized_profile_endpoints(client: AsyncClient):
    resp1 = await client.get("/api/profile/me")
    assert resp1.status_code == 401

    resp2 = await client.post("/api/profile/generate")
    assert resp2.status_code == 401


@pytest.mark.asyncio
async def test_generate_profile_without_github(authenticated_client: AsyncClient):
    resp = await authenticated_client.post("/api/profile/generate")
    assert resp.status_code == 400
    assert "No GitHub account connected" in resp.json()["error"]["message"]


@pytest.mark.asyncio
async def test_generate_profile_flow(
    authenticated_client: AsyncClient,
    user_with_github: User,
    db_session: AsyncSession
):
    mock_repos = [
        {
            "github_repo_id": 101,
            "name": "tracemint-backend",
            "full_name": "dev_proven/tracemint-backend",
            "description": "FastAPI developer proof platform",
            "html_url": "https://github.com/dev_proven/tracemint-backend",
            "language": "Python",
            "stars": 15,
            "forks": 3,
            "topics": ["fastapi", "python"],
            "is_fork": False,
            "repo_created_at": None,
            "repo_updated_at": None
        }
    ]

    mock_gemini_analysis = GeminiAnalysisResult(
        summary="Backend developer with demonstrated experience in Python and FastAPI.",
        skills=[
            SkillEvidence(name="Python", confidence=0.9, evidence=["tracemint-backend"]),
            SkillEvidence(name="FastAPI", confidence=0.85, evidence=["tracemint-backend"])
        ],
        strengths=[
            StrengthEvidence(name="API Architecture", evidence=["tracemint-backend"])
        ],
        notable_projects=[
            NotableProject(repository="tracemint-backend", reason="FastAPI service with 15 stars")
        ],
        insights=["Primary focus on backend APIs and microservices."]
    )

    with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_repos
        with patch("app.services.gemini_client.GeminiClient.analyze_evidence", new_callable=AsyncMock) as mock_ai:
            mock_ai.return_value = mock_gemini_analysis

            # Call generate endpoint
            gen_resp = await authenticated_client.post("/api/profile/generate", json={"force_refresh": True})
            assert gen_resp.status_code == 200
            data = gen_resp.json()
            assert data["username_slug"] == "dev_proven"
            assert len(data["skills"]) == 2
            assert data["skills"][0]["name"] == "Python"
            assert data["metrics"]["repository_count"] == 1
            assert data["metrics"]["total_stars"] == 15

            # Call /api/profile/me
            me_resp = await authenticated_client.get("/api/profile/me")
            assert me_resp.status_code == 200
            me_data = me_resp.json()
            assert me_data["username_slug"] == "dev_proven"


@pytest.mark.asyncio
async def test_public_profile_access(
    client: AsyncClient,
    authenticated_client: AsyncClient,
    user_with_github: User
):
    mock_repos = [
        {
            "github_repo_id": 202,
            "name": "proven-lib",
            "full_name": "dev_proven/proven-lib",
            "description": "Deterministic library",
            "html_url": "https://github.com/dev_proven/proven-lib",
            "language": "Go",
            "stars": 50,
            "forks": 10,
            "topics": ["go"],
            "is_fork": False,
            "repo_created_at": None,
            "repo_updated_at": None
        }
    ]

    mock_gemini_analysis = GeminiAnalysisResult(
        summary="Go systems engineer.",
        skills=[SkillEvidence(name="Go", confidence=0.95, evidence=["proven-lib"])],
        strengths=[],
        notable_projects=[],
        insights=[]
    )

    with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_repos
        with patch("app.services.gemini_client.GeminiClient.analyze_evidence", new_callable=AsyncMock) as mock_ai:
            mock_ai.return_value = mock_gemini_analysis
            await authenticated_client.post("/api/profile/generate")

    # Access public endpoint without any authentication
    pub_resp = await client.get("/api/profile/dev_proven")
    assert pub_resp.status_code == 200
    pub_data = pub_resp.json()

    assert pub_data["username_slug"] == "dev_proven"
    assert pub_data["display_name"] == "Test Developer"
    # Verify no private data is exposed!
    assert "email" not in pub_data
    assert "google_id" not in pub_data
    assert "access_token" not in pub_data
    assert "access_token_encrypted" not in pub_data
    assert "id" not in pub_data  # internal DB user ID


@pytest.mark.asyncio
async def test_public_profile_not_found(client: AsyncClient):
    resp = await client.get("/api/profile/nonexistent_user_9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_profile_caching_behavior(
    authenticated_client: AsyncClient,
    user_with_github: User
):
    mock_repos = [
        {
            "github_repo_id": 303,
            "name": "cache-test-repo",
            "full_name": "dev_proven/cache-test-repo",
            "description": "Caching verification repository",
            "html_url": "https://github.com/dev_proven/cache-test-repo",
            "language": "Python",
            "stars": 1,
            "forks": 0,
            "topics": [],
            "is_fork": False,
            "repo_created_at": None,
            "repo_updated_at": None
        }
    ]
    mock_analysis = GeminiAnalysisResult(
        summary="Cache test profile.",
        skills=[SkillEvidence(name="Python", confidence=0.8, evidence=["cache-test-repo"])],
        strengths=[],
        notable_projects=[],
        insights=[]
    )

    with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
        mock_fetch.return_value = mock_repos
        with patch("app.services.gemini_client.GeminiClient.analyze_evidence", new_callable=AsyncMock) as mock_ai:
            mock_ai.return_value = mock_analysis

            # First call: triggers Gemini
            resp1 = await authenticated_client.post("/api/profile/generate")
            assert resp1.status_code == 200
            assert mock_ai.call_count == 1

            # Second call without force_refresh: reuses cache without calling Gemini again!
            resp2 = await authenticated_client.post("/api/profile/generate", json={"force_refresh": False})
            assert resp2.status_code == 200
            assert mock_ai.call_count == 1  # Not called again!

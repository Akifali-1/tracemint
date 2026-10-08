import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.db.session import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.core.security import create_session_token, encrypt_token
from app.schemas.analysis import GeminiAnalysisResult, SkillEvidence, StrengthEvidence, NotableProject


@pytest.mark.asyncio
async def test_user_profile_data_isolation(db_session: AsyncSession):
    """
    Audit test verifying strict separation between users:
    - User A (Alice) and User B (Bob) have separate accounts.
    - Profiles generated for Alice and Bob do NOT mix or overwrite each other.
    - GET /api/profile/me returns only the authenticated user's profile.
    - GET /api/analysis/evidence returns only the authenticated user's repositories.
    - AI Rate limit counters apply independently per user.
    - Public profiles expose only safe public fields, never tokens or private IDs.
    """
    # 1. Create User A (Alice) and User B (Bob)
    user_a = User(
        google_id="google-user-a",
        email="alice@company.com",
        name="Alice Engineer",
        avatar_url="https://avatar.alice.com"
    )
    user_b = User(
        google_id="google-user-b",
        email="bob@company.com",
        name="Bob Architect",
        avatar_url="https://avatar.bob.com"
    )
    db_session.add_all([user_a, user_b])
    await db_session.commit()
    await db_session.refresh(user_a)
    await db_session.refresh(user_b)

    gh_a = GitHubAccount(
        user_id=user_a.id,
        github_id="gh-alice-100",
        username="alice_coder",
        avatar_url="https://avatars.github.com/alice",
        access_token_encrypted=encrypt_token("gho_alice_secret_token_111")
    )
    gh_b = GitHubAccount(
        user_id=user_b.id,
        github_id="gh-bob-200",
        username="bob_systems",
        avatar_url="https://avatars.github.com/bob",
        access_token_encrypted=encrypt_token("gho_bob_secret_token_222")
    )
    db_session.add_all([gh_a, gh_b])
    await db_session.commit()

    # 2. Setup mock data for Alice and Bob
    alice_repos = [
        {
            "github_repo_id": 1001,
            "name": "alice-frontend",
            "full_name": "alice_coder/alice-frontend",
            "description": "React Dashboard",
            "html_url": "https://github.com/alice_coder/alice-frontend",
            "language": "TypeScript",
            "stars": 42,
            "forks": 5,
            "topics": ["react", "typescript"],
            "is_fork": False,
            "repo_created_at": None,
            "repo_updated_at": None
        }
    ]

    bob_repos = [
        {
            "github_repo_id": 2002,
            "name": "bob-distributed-engine",
            "full_name": "bob_systems/bob-distributed-engine",
            "description": "High throughput raft cluster",
            "html_url": "https://github.com/bob_systems/bob-distributed-engine",
            "language": "Rust",
            "stars": 128,
            "forks": 19,
            "topics": ["rust", "raft", "systems"],
            "is_fork": False,
            "repo_created_at": None,
            "repo_updated_at": None
        }
    ]

    alice_gemini = GeminiAnalysisResult(
        summary="Senior Frontend Engineer specializing in TypeScript and React ecosystems.",
        skills=[SkillEvidence(name="TypeScript", confidence=0.95, evidence=["alice-frontend"])],
        strengths=[StrengthEvidence(name="Component Architecture", evidence=["alice-frontend"])],
        notable_projects=[NotableProject(repository="alice-frontend", reason="42 stars")],
        insights=["Specializes in interactive UI."]
    )

    bob_gemini = GeminiAnalysisResult(
        summary="Systems programmer specializing in distributed systems and Rust.",
        skills=[SkillEvidence(name="Rust", confidence=0.98, evidence=["bob-distributed-engine"])],
        strengths=[StrengthEvidence(name="Concurrency & Performance", evidence=["bob-distributed-engine"])],
        notable_projects=[NotableProject(repository="bob-distributed-engine", reason="128 stars")],
        insights=["Core focus on low-level infrastructure."]
    )

    # 3. Create authenticated clients for Alice and Bob
    token_a = create_session_token(user_a.id)
    token_b = create_session_token(user_b.id)

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client_a:
        async with AsyncClient(transport=transport, base_url="http://test") as client_b:
            client_a.cookies.set("tracemint_session", token_a)
            client_b.cookies.set("tracemint_session", token_b)

            # Generate profile for Alice
            with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
                mock_fetch.return_value = alice_repos
                with patch("app.services.gemini_client.GeminiClient.analyze_evidence", new_callable=AsyncMock) as mock_ai:
                    mock_ai.return_value = alice_gemini
                    resp_gen_a = await client_a.post("/api/profile/generate", json={"force_refresh": True})
                    assert resp_gen_a.status_code == 200

            # Generate profile for Bob
            with patch("app.services.github_client.GitHubClient.fetch_user_repositories", new_callable=AsyncMock) as mock_fetch:
                mock_fetch.return_value = bob_repos
                with patch("app.services.gemini_client.GeminiClient.analyze_evidence", new_callable=AsyncMock) as mock_ai:
                    mock_ai.return_value = bob_gemini
                    resp_gen_b = await client_b.post("/api/profile/generate", json={"force_refresh": True})
                    assert resp_gen_b.status_code == 200

            # 4. Verify GET /api/profile/me isolation
            resp_me_a = await client_a.get("/api/profile/me")
            assert resp_me_a.status_code == 200
            data_a = resp_me_a.json()
            assert data_a["username_slug"] == "alice_coder"
            assert data_a["skills"][0]["name"] == "TypeScript"
            assert data_a["metrics"]["total_stars"] == 42
            assert data_a["username_slug"] != "bob_systems"

            resp_me_b = await client_b.get("/api/profile/me")
            assert resp_me_b.status_code == 200
            data_b = resp_me_b.json()
            assert data_b["username_slug"] == "bob_systems"
            assert data_b["skills"][0]["name"] == "Rust"
            assert data_b["metrics"]["total_stars"] == 128
            assert data_b["username_slug"] != "alice_coder"

            # 5. Verify GET /api/analysis/evidence isolation
            ev_a = await client_a.get("/api/analysis/evidence")
            assert ev_a.status_code == 200
            ev_a_data = ev_a.json()
            assert ev_a_data["username"] == "alice_coder"
            assert "TypeScript" in ev_a_data["languages"]
            assert "Rust" not in ev_a_data["languages"]

            ev_b = await client_b.get("/api/analysis/evidence")
            assert ev_b.status_code == 200
            ev_b_data = ev_b.json()
            assert ev_b_data["username"] == "bob_systems"
            assert "Rust" in ev_b_data["languages"]
            assert "TypeScript" not in ev_b_data["languages"]

            # 6. Verify Public Profile Sanitization (No tokens, no user IDs exposed)
            pub_a = await client_a.get("/api/profile/alice_coder")
            assert pub_a.status_code == 200
            pub_data = pub_a.json()
            assert pub_data["username_slug"] == "alice_coder"
            assert "access_token" not in pub_data
            assert "access_token_encrypted" not in pub_data
            assert "email" not in pub_data
            assert "google_id" not in pub_data
            assert "user_id" not in pub_data

            # 7. Verify AI Usage Quota Isolation
            usage_a = await client_a.get("/api/profile/ai-usage")
            assert usage_a.status_code == 200
            # Alice has used 1 call
            assert usage_a.json()["used"] == 1

            usage_b = await client_b.get("/api/profile/ai-usage")
            assert usage_b.status_code == 200
            # Bob has used 1 call (his own, not Alice's)
            assert usage_b.json()["used"] == 1

    app.dependency_overrides.clear()

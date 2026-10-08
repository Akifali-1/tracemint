import pytest
from unittest.mock import patch, AsyncMock
from app.services.gemini_client import GeminiClient
from app.schemas.analysis import DeterministicEvidence


@pytest.mark.asyncio
async def test_gemini_client_fallback_on_empty_api_key():
    client = GeminiClient()
    client.api_key = ""  # No API key configured

    evidence = DeterministicEvidence(
        username="fallback_user",
        repository_count=3,
        languages={"Python": 2, "Rust": 1},
        total_stars=25,
        total_forks=4,
        recent_repository_count=2,
        active_repository_count=2,
        repositories=[
            {"name": "py-repo", "language": "Python", "stars": 15, "forks": 2, "description": "Backend API", "topics": []},
            {"name": "rust-tool", "language": "Rust", "stars": 10, "forks": 2, "description": "CLI utility", "topics": []}
        ]
    )

    result = await client.analyze_evidence(evidence)

    assert result is not None
    assert "fallback_user" in result.summary
    assert len(result.skills) > 0
    assert any(s.name == "Python" for s in result.skills)
    assert any(s.name == "Rust" for s in result.skills)
    # Verification that evidence is referenced
    for skill in result.skills:
        assert len(skill.evidence) >= 1


@pytest.mark.asyncio
async def test_gemini_client_retry_and_fallback_on_malformed_json():
    client = GeminiClient()
    client.api_key = "fake_key"

    evidence = DeterministicEvidence(
        username="retry_user",
        repository_count=1,
        languages={"Python": 1},
        total_stars=5,
        total_forks=0,
        recent_repository_count=1,
        active_repository_count=1,
        repositories=[{"name": "single-repo", "language": "Python", "stars": 5, "forks": 0, "description": "Test", "topics": []}]
    )

    import httpx
    # Mock Gemini returning invalid non-JSON string
    with patch.object(client, "_call_gemini_api", new_callable=AsyncMock) as mock_api:
        mock_api.return_value = httpx.Response(
            status_code=200,
            json={"candidates": [{"content": {"parts": [{"text": "Sorry, I cannot format this as JSON properly."}]}}]}
        )

        result = await client.analyze_evidence(evidence)
        # Should gracefully fall back to deterministic synthesis instead of crashing
        assert result is not None
        assert "retry_user" in result.summary
        assert any(s.name == "Python" for s in result.skills)

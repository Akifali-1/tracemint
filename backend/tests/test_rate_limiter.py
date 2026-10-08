import pytest
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.gemini_usage import GeminiUsageLog
from app.services.rate_limiter import GeminiRateLimiter
from app.core.config import settings


@pytest.mark.asyncio
async def test_rate_limiter_allows_under_limit(db_session: AsyncSession, test_user: User):
    # Should not raise
    await GeminiRateLimiter.check_rate_limit(db_session, test_user.id)
    count = await GeminiRateLimiter.get_usage_count_last_24h(db_session, test_user.id)
    assert count == 0


@pytest.mark.asyncio
async def test_rate_limiter_records_and_blocks_at_limit(db_session: AsyncSession, test_user: User):
    limit = settings.GEMINI_REQUESTS_PER_USER_PER_DAY

    # Record limit requests
    for i in range(limit):
        await GeminiRateLimiter.record_usage(db_session, test_user.id, feature="profile_analysis")

    count = await GeminiRateLimiter.get_usage_count_last_24h(db_session, test_user.id)
    assert count == limit

    # Next check must raise HTTP 429
    with pytest.raises(HTTPException) as exc_info:
        await GeminiRateLimiter.check_rate_limit(db_session, test_user.id)

    assert exc_info.value.status_code == 429
    assert exc_info.value.detail == "You've reached today's AI analysis limit. Try again tomorrow."


@pytest.mark.asyncio
async def test_rate_limiter_resets_after_24_hours(db_session: AsyncSession, test_user: User):
    # Insert an old usage record from 25 hours ago
    old_time = datetime.now(timezone.utc) - timedelta(hours=25)
    old_log = GeminiUsageLog(
        user_id=test_user.id,
        requested_at=old_time,
        feature="profile_analysis"
    )
    db_session.add(old_log)
    await db_session.commit()

    count = await GeminiRateLimiter.get_usage_count_last_24h(db_session, test_user.id)
    assert count == 0

    # User can still make requests
    await GeminiRateLimiter.check_rate_limit(db_session, test_user.id)

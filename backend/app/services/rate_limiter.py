from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.logging import logger
from app.models.gemini_usage import GeminiUsageLog


class GeminiRateLimiter:
    """
    Enforces a server-side limit on Gemini API requests per authenticated user in a rolling 24-hour window.
    Tracks usage in PostgreSQL and blocks requests with HTTP 429 before any Gemini API call is made.
    """

    @staticmethod
    async def get_usage_count_last_24h(db: AsyncSession, user_id: int) -> int:
        """Counts how many Gemini requests the user has made in the rolling past 24 hours."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
        stmt = (
            select(func.count(GeminiUsageLog.id))
            .where(
                GeminiUsageLog.user_id == user_id,
                GeminiUsageLog.requested_at >= cutoff
            )
        )
        res = await db.execute(stmt)
        return res.scalar() or 0

    @staticmethod
    async def get_remaining_requests(db: AsyncSession, user_id: int) -> int:
        """Returns the number of allowed Gemini requests remaining for the user today."""
        used = await GeminiRateLimiter.get_usage_count_last_24h(db, user_id)
        limit = settings.GEMINI_REQUESTS_PER_USER_PER_DAY
        return max(0, limit - used)

    @staticmethod
    async def check_rate_limit(db: AsyncSession, user_id: int) -> None:
        """
        Enforces the rate limit BEFORE making any Gemini API call.
        Raises HTTP 429 if the user has reached their daily allowance.
        """
        max_requests = settings.GEMINI_REQUESTS_PER_USER_PER_DAY
        current_count = await GeminiRateLimiter.get_usage_count_last_24h(db, user_id)

        if current_count >= max_requests:
            logger.warning(
                f"Rate limit exceeded: user {user_id} made {current_count}/{max_requests} Gemini requests in past 24 hours."
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="You've reached today's AI analysis limit. Try again tomorrow."
            )

    @staticmethod
    async def record_usage(db: AsyncSession, user_id: int, feature: str = "profile_analysis") -> None:
        """Records a completed Gemini invocation for rate-limiting tracking."""
        log_entry = GeminiUsageLog(
            user_id=user_id,
            requested_at=datetime.now(timezone.utc),
            feature=feature
        )
        db.add(log_entry)
        await db.commit()

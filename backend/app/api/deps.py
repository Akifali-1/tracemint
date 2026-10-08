from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.core.security import decode_session_token
from app.core.logging import logger

security_scheme = HTTPBearer(auto_error=False)


async def get_optional_user(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Retrieves authenticated user from HttpOnly cookie or Authorization Bearer header if present."""
    token = None

    # Check cookie first
    cookie_token = request.cookies.get("tracemint_session")
    if cookie_token:
        token = cookie_token
    elif auth_header:
        token = auth_header.credentials

    if not token:
        return None

    user_id = decode_session_token(token)
    if not user_id:
        return None

    stmt = select(User).where(User.id == user_id).options(selectinload(User.github_account))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_current_user(
    user: Optional[User] = Depends(get_optional_user)
) -> User:
    """Guards endpoints requiring an authenticated TraceMint user."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in with Google to continue.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

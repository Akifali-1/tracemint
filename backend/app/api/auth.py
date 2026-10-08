import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.logging import logger
from app.core.security import create_session_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthMeResponse, UserOut
from app.services.google_oauth import get_google_auth_url, exchange_google_code
from app.api.deps import get_optional_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/google/login", summary="Initiate Google OAuth login")
async def google_login(
    request: Request,
    response: Response,
    redirect_url: Optional[str] = None
):
    """Redirects user to Google OAuth 2.0 authorization endpoint with CSRF state protection."""
    state = secrets.token_urlsafe(32)
    auth_url = get_google_auth_url(state)

    redirect = RedirectResponse(url=auth_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    # Store state in cookie for callback verification
    redirect.set_cookie(
        key="oauth_state_google",
        value=state,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=600  # 10 minutes
    )

    # Determine caller's intended frontend origin
    target_origin = None
    candidate = redirect_url or request.headers.get("referer") or request.headers.get("origin")
    if candidate:
        try:
            from urllib.parse import urlparse
            parsed = urlparse(candidate)
            candidate_origin = f"{parsed.scheme}://{parsed.netloc}".rstrip('/')
            allowed = [o.rstrip('/') for o in settings.cors_origin_list]
            if candidate_origin in allowed:
                target_origin = candidate_origin
        except Exception:
            pass

    if target_origin:
        redirect.set_cookie(
            key="oauth_frontend_origin",
            value=target_origin,
            httponly=True,
            secure=settings.is_production,
            samesite="lax",
            max_age=600
        )
    return redirect


@router.get("/google/callback", summary="Google OAuth callback handler")
async def google_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Handles Google OAuth authorization response, creates or updates user, and establishes session."""
    stored_frontend = request.cookies.get("oauth_frontend_origin")
    frontend_base = settings.effective_frontend_url.rstrip('/')
    if stored_frontend:
        allowed = [o.rstrip('/') for o in settings.cors_origin_list]
        if stored_frontend in allowed:
            frontend_base = stored_frontend

    def _cleanup_redirect(url: str, status_code: int = status.HTTP_302_FOUND) -> RedirectResponse:
        r = RedirectResponse(url=url, status_code=status_code)
        r.delete_cookie("oauth_frontend_origin")
        r.delete_cookie("oauth_state_google")
        return r

    if error or not code:
        logger.warning(f"Google OAuth callback received error: {error}")
        return _cleanup_redirect(f"{frontend_base}/?error=google_oauth_denied")

    # Validate state
    stored_state = request.cookies.get("oauth_state_google")
    if not stored_state or stored_state != state:
        logger.warning("Google OAuth state mismatch or expired")
        return _cleanup_redirect(f"{frontend_base}/?error=invalid_oauth_state")

    # Exchange code for user identity
    profile = await exchange_google_code(code)
    if not profile:
        return _cleanup_redirect(f"{frontend_base}/?error=google_exchange_failed")

    # Find or create User
    stmt = select(User).where(User.google_id == profile["google_id"]).options(selectinload(User.github_account))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        user.name = profile["name"]
        user.email = profile["email"]
        user.avatar_url = profile["avatar_url"]
    else:
        user = User(
            google_id=profile["google_id"],
            email=profile["email"],
            name=profile["name"],
            avatar_url=profile["avatar_url"]
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    # Create session token
    session_token = create_session_token(user.id)

    # Redirect to frontend dashboard with success
    redirect = RedirectResponse(
        url=f"{frontend_base}/?auth=success&token={session_token}",
        status_code=status.HTTP_302_FOUND
    )

    # Set secure HttpOnly session cookie
    redirect.set_cookie(
        key="tracemint_session",
        value=session_token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    redirect.delete_cookie("oauth_state_google")
    redirect.delete_cookie("oauth_frontend_origin")
    logger.info(f"User {user.id} logged in successfully via Google, returning to {frontend_base}")
    return redirect


@router.get("/me", response_model=AuthMeResponse, summary="Get current authenticated user")
async def get_current_user_profile(user: Optional[User] = Depends(get_optional_user)):
    """Returns information about currently authenticated user or authenticated=False if unauthenticated."""
    if not user:
        return AuthMeResponse(authenticated=False, user=None)

    github_connected = user.github_account is not None
    github_user = user.github_account.username if github_connected else None
    github_avatar = user.github_account.avatar_url if github_connected else None
    # Prefer GitHub avatar for developers, fallback to Google avatar
    effective_avatar = github_avatar or (f"https://github.com/{github_user}.png" if github_user else user.avatar_url)

    return AuthMeResponse(
        authenticated=True,
        user=UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=effective_avatar,
            created_at=user.created_at,
            has_github=github_connected,
            github_username=github_user,
            github_avatar_url=github_avatar
        )
    )


@router.post("/logout", summary="Log out and destroy session")
async def logout(response: Response):
    """Invalidates session cookie."""
    response.delete_cookie("tracemint_session")
    return {"status": "success", "message": "Logged out successfully"}

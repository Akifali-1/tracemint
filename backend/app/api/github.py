import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.logging import logger
from app.core.security import encrypt_token, decrypt_token
from app.db.session import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.repository import Repository
from app.models.github_metrics import GitHubMetrics
from app.models.developer_profile import DeveloperProfile
from app.schemas.github import GitHubStatusResponse, GitHubSyncResponse, GitHubMetricsOut
from app.services.github_oauth import get_github_auth_url, exchange_github_code, get_github_user
from app.services.profile_service import ProfileService
from app.api.deps import get_current_user, get_optional_user

router = APIRouter(prefix="/github", tags=["GitHub"])


@router.get("/connect", summary="Initiate GitHub OAuth connection")
async def github_connect(
    request: Request,
    user: Optional[User] = Depends(get_optional_user)
):
    """
    Redirects user to GitHub OAuth authorization endpoint.
    If authenticated, connects to existing user; otherwise sets user intent cookie.
    """
    state = secrets.token_urlsafe(32)
    auth_url = get_github_auth_url(state)

    redirect = RedirectResponse(url=auth_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)
    redirect.set_cookie(
        key="oauth_state_github",
        value=state,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=600  # 10 minutes
    )
    if user:
        redirect.set_cookie(
            key="oauth_connect_user_id",
            value=str(user.id),
            httponly=True,
            secure=settings.is_production,
            samesite="lax",
            max_age=600
        )
    return redirect


@router.get("/callback", summary="GitHub OAuth callback handler")
async def github_callback(
    request: Request,
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Handles GitHub OAuth authorization response, obtains access token,
    encrypts it at rest, and links the GitHub account to the active TraceMint user.
    """
    frontend_base = settings.FRONTEND_URL.rstrip('/')

    if error or not code:
        logger.warning(f"GitHub OAuth callback received error: {error}")
        return RedirectResponse(f"{frontend_base}/?error=github_oauth_denied")

    stored_state = request.cookies.get("oauth_state_github")
    if not stored_state or stored_state != state:
        logger.warning("GitHub OAuth state mismatch or expired")
        return RedirectResponse(f"{frontend_base}/?error=invalid_oauth_state")

    # Determine user to connect to
    user_id_str = request.cookies.get("oauth_connect_user_id")
    current_user: Optional[User] = None

    if user_id_str and user_id_str.isdigit():
        stmt = select(User).where(User.id == int(user_id_str)).options(selectinload(User.github_account))
        res = await db.execute(stmt)
        current_user = res.scalar_one_or_none()

    # Fallback to session cookie
    if not current_user:
        current_user = await get_optional_user(request, db)

    if not current_user:
        logger.warning("GitHub OAuth callback without authenticated TraceMint user")
        return RedirectResponse(f"{frontend_base}/?error=login_required_before_github")

    # Exchange authorization code for access token
    access_token = await exchange_github_code(code)
    if not access_token:
        logger.error("Failed to exchange GitHub authorization code")
        return RedirectResponse(f"{frontend_base}/?error=github_exchange_failed")

    # Fetch GitHub user profile
    gh_profile = await get_github_user(access_token)
    if not gh_profile:
        logger.error("Failed to fetch GitHub user details")
        return RedirectResponse(f"{frontend_base}/?error=github_fetch_failed")

    # Encrypt token at rest
    encrypted_token = encrypt_token(access_token)

    # Check if this GitHub account already belongs to another user
    existing_gh_stmt = select(GitHubAccount).where(GitHubAccount.github_id == gh_profile["github_id"])
    existing_gh_res = await db.execute(existing_gh_stmt)
    existing_gh = existing_gh_res.scalar_one_or_none()

    if existing_gh and existing_gh.user_id != current_user.id:
        # Re-link or update ownership
        logger.info(f"Re-linking GitHub {gh_profile['username']} from user {existing_gh.user_id} to user {current_user.id}")
        existing_gh.user_id = current_user.id
        existing_gh.username = gh_profile["username"]
        existing_gh.avatar_url = gh_profile["avatar_url"]
        existing_gh.access_token_encrypted = encrypted_token
    elif existing_gh:
        # Update existing
        existing_gh.username = gh_profile["username"]
        existing_gh.avatar_url = gh_profile["avatar_url"]
        existing_gh.access_token_encrypted = encrypted_token
    else:
        # Create new link
        new_account = GitHubAccount(
            user_id=current_user.id,
            github_id=gh_profile["github_id"],
            username=gh_profile["username"],
            avatar_url=gh_profile["avatar_url"],
            access_token_encrypted=encrypted_token
        )
        db.add(new_account)

    await db.commit()

    redirect = RedirectResponse(
        url=f"{frontend_base}/?github=connected&username={gh_profile['username']}",
        status_code=status.HTTP_302_FOUND
    )
    redirect.delete_cookie("oauth_state_github")
    redirect.delete_cookie("oauth_connect_user_id")
    logger.info(f"User {current_user.id} successfully connected GitHub account @{gh_profile['username']}")
    return redirect


@router.get("/status", response_model=GitHubStatusResponse, summary="Get GitHub connection status")
async def github_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns whether the authenticated user has connected their GitHub account."""
    stmt = (
        select(GitHubAccount)
        .where(GitHubAccount.user_id == user.id)
        .options(selectinload(GitHubAccount.metrics), selectinload(GitHubAccount.repositories))
    )
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()

    if not account:
        return GitHubStatusResponse(connected=False)

    repo_count = len(account.repositories)
    last_synced = None
    if account.metrics:
        last_synced = account.metrics.calculated_at

    return GitHubStatusResponse(
        connected=True,
        username=account.username,
        avatar_url=account.avatar_url,
        repository_count=repo_count,
        last_synced_at=last_synced
    )


@router.post("/sync", response_model=GitHubSyncResponse, summary="Synchronize GitHub repositories and metrics")
async def sync_github(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Pulls public repositories from GitHub API, updates the repository table,
    and recalculates deterministic developer metrics.
    """
    stmt = select(GitHubAccount).where(GitHubAccount.user_id == user.id)
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account is not connected. Connect GitHub first."
        )

    try:
        metrics = await ProfileService.sync_github_data(db, account)
    except Exception as e:
        logger.error(f"Error syncing GitHub data for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to synchronize with GitHub: {str(e)}"
        )

    return GitHubSyncResponse(
        status="success",
        message=f"Synchronized repositories for @{account.username}",
        repositories_synced=metrics.repository_count,
        metrics=GitHubMetricsOut(
            repository_count=metrics.repository_count,
            total_stars=metrics.total_stars,
            total_forks=metrics.total_forks,
            languages=metrics.languages,
            recent_repository_count=metrics.recent_repository_count,
            active_repository_count=metrics.active_repository_count,
            calculated_at=metrics.calculated_at
        )
    )


@router.post("/disconnect", summary="Disconnect GitHub account")
async def disconnect_github(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Removes the GitHub account association and securely discards encrypted tokens.
    """
    stmt = select(GitHubAccount).where(GitHubAccount.user_id == user.id)
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()

    if not account:
        return {"status": "success", "message": "No GitHub account was connected."}

    # Delete GitHub account (cascading deletes repositories & metrics)
    await db.delete(account)
    await db.commit()

    logger.info(f"User {user.id} disconnected GitHub account @{account.username}")
    return {"status": "success", "message": "GitHub account disconnected and credentials safely removed."}

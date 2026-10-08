import secrets
import re
from typing import Optional, Dict, Any
import httpx
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
    redirect_url: Optional[str] = None,
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
            key="oauth_frontend_origin_github",
            value=target_origin,
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
    stored_frontend = request.cookies.get("oauth_frontend_origin_github")
    frontend_base = settings.effective_frontend_url.rstrip('/')
    if stored_frontend:
        allowed = [o.rstrip('/') for o in settings.cors_origin_list]
        if stored_frontend in allowed:
            frontend_base = stored_frontend

    def _cleanup_redirect(url: str, status_code: int = status.HTTP_302_FOUND) -> RedirectResponse:
        r = RedirectResponse(url=url, status_code=status_code)
        r.delete_cookie("oauth_frontend_origin_github")
        r.delete_cookie("oauth_state_github")
        r.delete_cookie("oauth_connect_user_id")
        return r

    if error or not code:
        logger.warning(f"GitHub OAuth callback received error: {error}")
        return _cleanup_redirect(f"{frontend_base}/?error=github_oauth_denied")

    stored_state = request.cookies.get("oauth_state_github")
    if not stored_state or stored_state != state:
        logger.warning("GitHub OAuth state mismatch or expired")
        return _cleanup_redirect(f"{frontend_base}/?error=invalid_oauth_state")

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
    redirect.delete_cookie("oauth_frontend_origin_github")
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
    logger.info(f"User {user.id} disconnected GitHub account @{account.username}")
    return {"status": "success", "message": "GitHub account disconnected and credentials safely removed."}


@router.get("/contributions/{username}", summary="Fetch authentic GitHub contribution matrix and count")
async def get_github_contributions(username: str):
    """
    Scrapes the public GitHub contribution matrix for the given username,
    returning the exact verified total and daily activity levels.
    """
    clean_user = username.strip().lstrip("@")
    url = f"https://github.com/users/{clean_user}/contributions"
    headers = {"User-Agent": "Mozilla/5.0 (TraceMint-Engine/1.0)"}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"GitHub contributions returned {resp.status_code} for {clean_user}")
                return {"username": clean_user, "total": 0, "cells": []}
            text = resp.text

        match = re.search(r"(\d[\d,]*)\s+contributions", text, re.IGNORECASE)
        total = int(match.group(1).replace(",", "")) if match else 0

        pattern = re.compile(r'data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d+)"')
        matches = pattern.findall(text)
        if not matches:
            pattern2 = re.compile(r'data-level="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"')
            matches = [(d, l) for l, d in pattern2.findall(text)]

        cells = [{"date": d, "level": int(l), "score": int(l)} for d, l in matches]
        return {
            "username": clean_user,
            "total": total,
            "cells": cells
        }
    except Exception as exc:
        logger.error(f"Failed to fetch contributions for {clean_user}: {exc}")
        return {"username": clean_user, "total": 0, "cells": []}

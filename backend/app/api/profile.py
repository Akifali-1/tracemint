from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.db.session import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.developer_profile import DeveloperProfile
from app.schemas.profile import ProfileGenerateRequest, DeveloperProfileOut, PublicProfileOut
from app.services.profile_service import ProfileService
from app.api.deps import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/generate", response_model=DeveloperProfileOut, summary="Generate or refresh developer profile")
async def generate_profile(
    body: Optional[ProfileGenerateRequest] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a structured developer profile by:
    1. Verifying GitHub connection
    2. Syncing repositories
    3. Computing deterministic metrics
    4. Interpreting evidence using Google Gemini
    5. Saving and returning the structured DeveloperProfile
    """
    force_refresh = body.force_refresh if body else False
    try:
        profile = await ProfileService.generate_or_get_profile(db, user, force_refresh=force_refresh)
        return profile
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error generating profile for user {user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate developer profile. Please check logs or try again."
        )


@router.get("/me", response_model=DeveloperProfileOut, summary="Get current user's developer profile")
async def get_my_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns the authenticated user's generated profile."""
    stmt = select(DeveloperProfile).where(DeveloperProfile.user_id == user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile generated yet. Connect GitHub and click 'Generate Profile'."
        )

    return DeveloperProfileOut(
        username_slug=profile.username_slug,
        summary=profile.summary,
        skills=profile.skills_json,
        strengths=profile.strengths_json,
        projects=profile.projects_json,
        insights=profile.insights_json,
        metrics=profile.metrics_json,
        is_public=profile.is_public,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.get("/{username}", response_model=PublicProfileOut, summary="Get public developer profile by username")
async def get_public_profile(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns public developer profile.
    Safe endpoint that strips email, Google ID, tokens, and internal database keys.
    """
    clean_username = username.strip().lstrip("@")
    profile = await ProfileService.get_public_profile(db, clean_username)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '@{clean_username}' was not found or is set to private."
        )

    return profile

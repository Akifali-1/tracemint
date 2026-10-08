from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.repository import Repository
from app.schemas.analysis import DeterministicEvidence
from app.services.github_analyzer import GitHubAnalyzer
from app.api.deps import get_current_user

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.get("/evidence", response_model=DeterministicEvidence, summary="Get deterministic GitHub evidence for current user")
async def get_deterministic_evidence(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the deterministic evidence object calculated directly from GitHub repositories.
    This evidence object is the exact factual input fed to Google Gemini for interpretation.
    """
    stmt = select(GitHubAccount).where(GitHubAccount.user_id == user.id)
    res = await db.execute(stmt)
    account = res.scalar_one_or_none()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub account not connected. Connect GitHub to inspect evidence."
        )

    repos_stmt = select(Repository).where(Repository.github_account_id == account.id)
    repos_res = await db.execute(repos_stmt)
    repos = repos_res.scalars().all()

    repo_dicts = [
        {
            "name": r.name,
            "language": r.language,
            "stars": r.stars,
            "forks": r.forks,
            "description": r.description,
            "topics": r.topics,
            "is_fork": r.is_fork,
            "html_url": r.html_url,
            "repo_updated_at": r.repo_updated_at
        }
        for r in repos
    ]

    evidence = GitHubAnalyzer.analyze_repositories(account.username, repo_dicts)
    return evidence

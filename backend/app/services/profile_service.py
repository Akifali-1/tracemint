from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.github_account import GitHubAccount
from app.models.repository import Repository
from app.models.github_metrics import GitHubMetrics
from app.models.developer_profile import DeveloperProfile
from app.core.security import decrypt_token
from app.services.github_client import GitHubClient
from app.services.github_analyzer import GitHubAnalyzer
from app.services.gemini_client import GeminiClient
from app.schemas.profile import DeveloperProfileOut, PublicProfileOut
from app.core.logging import logger


class ProfileService:
    @staticmethod
    async def sync_github_data(db: AsyncSession, github_account: GitHubAccount) -> GitHubMetrics:
        """Fetches raw repositories from GitHub, updates the database, and calculates metrics."""
        plain_token = decrypt_token(github_account.access_token_encrypted)
        if not plain_token:
            raise ValueError("No valid GitHub access token available.")

        client = GitHubClient(plain_token)
        raw_repos = await client.fetch_user_repositories(max_pages=5)

        # 1. Upsert repositories in database
        for r_data in raw_repos:
            stmt = select(Repository).where(Repository.github_repo_id == r_data["github_repo_id"])
            result = await db.execute(stmt)
            existing_repo = result.scalar_one_or_none()

            if existing_repo:
                existing_repo.name = r_data["name"]
                existing_repo.full_name = r_data["full_name"]
                existing_repo.description = r_data["description"]
                existing_repo.html_url = r_data["html_url"]
                existing_repo.language = r_data["language"]
                existing_repo.stars = r_data["stars"]
                existing_repo.forks = r_data["forks"]
                existing_repo.topics = r_data["topics"]
                existing_repo.is_fork = r_data["is_fork"]
                existing_repo.repo_created_at = r_data["repo_created_at"]
                existing_repo.repo_updated_at = r_data["repo_updated_at"]
                existing_repo.last_synced_at = datetime.now(timezone.utc)
            else:
                new_repo = Repository(
                    github_account_id=github_account.id,
                    github_repo_id=r_data["github_repo_id"],
                    name=r_data["name"],
                    full_name=r_data["full_name"],
                    description=r_data["description"],
                    html_url=r_data["html_url"],
                    language=r_data["language"],
                    stars=r_data["stars"],
                    forks=r_data["forks"],
                    topics=r_data["topics"],
                    is_fork=r_data["is_fork"],
                    repo_created_at=r_data["repo_created_at"],
                    repo_updated_at=r_data["repo_updated_at"],
                    last_synced_at=datetime.now(timezone.utc)
                )
                db.add(new_repo)

        # 2. Compute deterministic metrics
        evidence = GitHubAnalyzer.analyze_repositories(github_account.username, raw_repos)

        # 3. Upsert metrics record
        metrics_stmt = select(GitHubMetrics).where(GitHubMetrics.github_account_id == github_account.id)
        metrics_res = await db.execute(metrics_stmt)
        metrics = metrics_res.scalar_one_or_none()

        if metrics:
            metrics.repository_count = evidence.repository_count
            metrics.total_stars = evidence.total_stars
            metrics.total_forks = evidence.total_forks
            metrics.languages = evidence.languages
            metrics.recent_repository_count = evidence.recent_repository_count
            metrics.active_repository_count = evidence.active_repository_count
            metrics.calculated_at = datetime.now(timezone.utc)
        else:
            metrics = GitHubMetrics(
                github_account_id=github_account.id,
                repository_count=evidence.repository_count,
                total_stars=evidence.total_stars,
                total_forks=evidence.total_forks,
                languages=evidence.languages,
                recent_repository_count=evidence.recent_repository_count,
                active_repository_count=evidence.active_repository_count,
                calculated_at=datetime.now(timezone.utc)
            )
            db.add(metrics)

        github_account.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(metrics)
        return metrics

    @staticmethod
    async def generate_or_get_profile(
        db: AsyncSession, 
        user: User, 
        force_refresh: bool = False
    ) -> DeveloperProfileOut:
        """Orchestrates sync, deterministic analysis, Gemini interpretation, and profile storage."""
        # Check GitHub connection
        account_stmt = select(GitHubAccount).where(GitHubAccount.user_id == user.id)
        account_res = await db.execute(account_stmt)
        github_account = account_res.scalar_one_or_none()

        if not github_account:
            raise ValueError("No GitHub account connected. Please connect your GitHub profile first.")

        # Check existing profile cache
        prof_stmt = select(DeveloperProfile).where(DeveloperProfile.user_id == user.id)
        prof_res = await db.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()

        # Cache valid for 2 hours unless force_refresh is requested
        if profile and not force_refresh:
            cache_cutoff = datetime.now(timezone.utc) - timedelta(hours=2)
            if profile.updated_at and profile.updated_at.replace(tzinfo=timezone.utc) > cache_cutoff:
                logger.info(f"Returning cached DeveloperProfile for user {user.id}")
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

        # 1. Sync repositories & metrics
        metrics = await ProfileService.sync_github_data(db, github_account)

        # 2. Load stored repositories
        repos_stmt = select(Repository).where(Repository.github_account_id == github_account.id)
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

        # 3. Deterministic evidence
        evidence = GitHubAnalyzer.analyze_repositories(github_account.username, repo_dicts)

        # 4. Gemini AI interpretation
        gemini = GeminiClient()
        analysis = await gemini.analyze_evidence(evidence)

        # 5. Build metrics payload
        metrics_payload = {
            "repository_count": metrics.repository_count,
            "total_stars": metrics.total_stars,
            "total_forks": metrics.total_forks,
            "languages": metrics.languages,
            "recent_repository_count": metrics.recent_repository_count,
            "active_repository_count": metrics.active_repository_count,
            "calculated_at": metrics.calculated_at.isoformat()
        }

        # 6. Upsert DeveloperProfile
        username_slug = github_account.username.lower()

        if profile:
            profile.summary = analysis.summary
            profile.skills_json = [s.model_dump() for s in analysis.skills]
            profile.strengths_json = [s.model_dump() for s in analysis.strengths]
            profile.projects_json = [p.model_dump() for p in analysis.notable_projects]
            profile.insights_json = analysis.insights
            profile.metrics_json = metrics_payload
            profile.updated_at = datetime.now(timezone.utc)
        else:
            profile = DeveloperProfile(
                user_id=user.id,
                username_slug=username_slug,
                summary=analysis.summary,
                skills_json=[s.model_dump() for s in analysis.skills],
                strengths_json=[s.model_dump() for s in analysis.strengths],
                projects_json=[p.model_dump() for p in analysis.notable_projects],
                insights_json=analysis.insights,
                metrics_json=metrics_payload,
                is_public=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)

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

    @staticmethod
    async def get_public_profile(db: AsyncSession, username_slug: str) -> Optional[PublicProfileOut]:
        """Returns safe public profile view without exposing sensitive internal data."""
        clean_slug = username_slug.strip().lstrip("@").lower()

        stmt = (
            select(DeveloperProfile, User)
            .join(User, DeveloperProfile.user_id == User.id)
            .where(
                DeveloperProfile.username_slug == clean_slug,
                DeveloperProfile.is_public.is_(True)
            )
        )
        res = await db.execute(stmt)
        record = res.first()
        if not record:
            return None

        profile, user = record

        return PublicProfileOut(
            username_slug=profile.username_slug,
            display_name=user.name,
            avatar_url=user.avatar_url,
            summary=profile.summary,
            skills=profile.skills_json,
            strengths=profile.strengths_json,
            projects=profile.projects_json,
            insights=profile.insights_json,
            metrics=profile.metrics_json,
            updated_at=profile.updated_at,
            is_demo=False
        )

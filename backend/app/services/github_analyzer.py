from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from app.schemas.analysis import DeterministicEvidence
from app.core.logging import logger


class GitHubAnalyzer:
    @staticmethod
    def analyze_repositories(username: str, repositories: List[Dict[str, Any]]) -> DeterministicEvidence:
        """Computes deterministic metrics directly from raw repository metadata without speculation."""
        total_repos = len(repositories)
        total_stars = 0
        total_forks = 0
        language_counts: Dict[str, int] = {}
        
        now = datetime.now(timezone.utc)
        recent_threshold = now - timedelta(days=180)  # Active in last 6 months
        active_threshold = now - timedelta(days=90)   # Active in last 3 months
        
        recent_count = 0
        active_count = 0
        
        normalized_repos: List[Dict[str, Any]] = []

        for repo in repositories:
            # Stars and forks aggregation (only non-forked repos to avoid false credit)
            is_fork = repo.get("is_fork", False)
            stars = repo.get("stars", 0) or 0
            forks = repo.get("forks", 0) or 0
            if not is_fork:
                total_stars += stars
                total_forks += forks

            # Language frequency
            lang = repo.get("language")
            if lang and isinstance(lang, str) and lang.strip():
                clean_lang = lang.strip()
                language_counts[clean_lang] = language_counts.get(clean_lang, 0) + 1

            # Recency & activity check
            updated_at = repo.get("repo_updated_at")
            if updated_at:
                if isinstance(updated_at, str):
                    try:
                        updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                    except Exception:
                        updated_at = None
                if updated_at:
                    if updated_at.tzinfo is None:
                        updated_at = updated_at.replace(tzinfo=timezone.utc)
                    if updated_at >= recent_threshold:
                        recent_count += 1
                    if updated_at >= active_threshold:
                        active_count += 1

            normalized_repos.append({
                "name": repo.get("name", ""),
                "language": repo.get("language"),
                "stars": stars,
                "forks": forks,
                "description": repo.get("description") or "",
                "topics": repo.get("topics") or [],
                "is_fork": repo.get("is_fork", False),
                "url": repo.get("html_url", "")
            })

        # Sort languages by frequency descending
        sorted_languages = dict(sorted(language_counts.items(), key=lambda item: item[1], reverse=True))

        # Sort repos by stars descending for high-signal prioritization
        normalized_repos.sort(key=lambda r: r.get("stars", 0), reverse=True)

        logger.info(
            f"Deterministic analysis for {username}: {total_repos} repos, "
            f"{total_stars} stars, {len(sorted_languages)} distinct languages"
        )

        return DeterministicEvidence(
            username=username,
            repository_count=total_repos,
            languages=sorted_languages,
            total_stars=total_stars,
            total_forks=total_forks,
            recent_repository_count=recent_count,
            active_repository_count=active_count,
            repositories=normalized_repos[:50]  # Top 50 repositories for model prompt window
        )

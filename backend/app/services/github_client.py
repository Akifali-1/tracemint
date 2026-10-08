import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.core.logging import logger

GITHUB_API_BASE = "https://api.github.com"


class GitHubClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "TraceMint-Engine/1.0"
        }

    async def get_authenticated_user(self) -> Optional[Dict[str, Any]]:
        """Fetches the authenticated GitHub user profile."""
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{GITHUB_API_BASE}/user", headers=self.headers)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "github_id": str(data["id"]),
                    "username": data["login"],
                    "avatar_url": data.get("avatar_url"),
                    "bio": data.get("bio"),
                    "public_repos": data.get("public_repos", 0),
                    "created_at": data.get("created_at")
                }
            logger.error(f"GitHub /user returned status {resp.status_code}")
            return None

    async def fetch_user_repositories(self, max_pages: int = 5) -> List[Dict[str, Any]]:
        """Fetches repositories belonging to or contributed to by the user, handling pagination and rate limits."""
        all_repos: List[Dict[str, Any]] = []
        page = 1

        async with httpx.AsyncClient(timeout=20.0) as client:
            while page <= max_pages:
                params = {
                    "visibility": "all",
                    "affiliation": "owner,collaborator",
                    "sort": "updated",
                    "direction": "desc",
                    "per_page": 100,
                    "page": page
                }

                # Retry up to 3 times for transient failures
                retries = 3
                resp = None
                while retries > 0:
                    try:
                        resp = await client.get(f"{GITHUB_API_BASE}/user/repos", headers=self.headers, params=params)
                        if resp.status_code == 403 and "rate limit" in resp.text.lower():
                            logger.warning("GitHub rate limit reached, waiting 2s...")
                            await asyncio.sleep(2)
                            retries -= 1
                            continue
                        break
                    except httpx.RequestError as exc:
                        logger.warning(f"GitHub request error on page {page}: {exc}")
                        retries -= 1
                        await asyncio.sleep(1)

                if not resp or resp.status_code != 200:
                    logger.error(f"Failed to fetch repositories on page {page}: status {resp.status_code if resp else 'no response'}")
                    break

                items = resp.json()
                if not items or not isinstance(items, list):
                    break

                for item in items:
                    created_at_dt = None
                    updated_at_dt = None
                    if item.get("created_at"):
                        try:
                            created_at_dt = datetime.fromisoformat(item["created_at"].replace("Z", "+00:00"))
                        except Exception:
                            pass
                    if item.get("updated_at"):
                        try:
                            updated_at_dt = datetime.fromisoformat(item["updated_at"].replace("Z", "+00:00"))
                        except Exception:
                            pass

                    all_repos.append({
                        "github_repo_id": item["id"],
                        "name": item["name"],
                        "full_name": item["full_name"],
                        "description": item.get("description"),
                        "html_url": item.get("html_url", ""),
                        "language": item.get("language"),
                        "stars": item.get("stargazers_count", 0),
                        "forks": item.get("forks_count", 0),
                        "topics": item.get("topics", []),
                        "is_fork": item.get("fork", False),
                        "repo_created_at": created_at_dt,
                        "repo_updated_at": updated_at_dt
                    })

                # Check if last page
                if len(items) < 100:
                    break
                page += 1

        logger.info(f"Fetched {len(all_repos)} repositories from GitHub across {page} pages")
        return all_repos

from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"


def get_github_auth_url(state: str) -> str:
    """Builds GitHub OAuth authorization URL requesting minimal read-only public repository access."""
    redirect_uri = f"{settings.BACKEND_URL.rstrip('/')}/api/github/callback"
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "scope": "read:user repo",
        "state": state,
        "allow_signup": "true"
    }
    import urllib.parse
    encoded = urllib.parse.urlencode(params)
    return f"{GITHUB_AUTH_URL}?{encoded}"


async def exchange_github_code(code: str) -> Optional[str]:
    """Exchanges GitHub authorization code for user access token."""
    redirect_uri = f"{settings.BACKEND_URL.rstrip('/')}/api/github/callback"
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri
        }
        headers = {"Accept": "application/json"}
        resp = await client.post(GITHUB_TOKEN_URL, data=data, headers=headers)
        if resp.status_code != 200:
            logger.error(f"GitHub token exchange returned status {resp.status_code}")
            return None

        body = resp.json()
        token = body.get("access_token")
        if not token:
            logger.error(f"GitHub token exchange failed: {body.get('error_description', 'No access token')}")
            return None

        return token


async def get_github_user(access_token: str) -> Optional[Dict[str, Any]]:
    """Fetches user details using provided GitHub OAuth token."""
    from app.services.github_client import GitHubClient
    client = GitHubClient(access_token)
    return await client.get_authenticated_user()

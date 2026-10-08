import secrets
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def get_google_auth_url(state: str) -> str:
    """Builds the Google OAuth 2.0 authorization URL requesting openid, email, profile."""
    redirect_uri = f"{settings.BACKEND_URL.rstrip('/')}/api/auth/google/callback"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account"
    }
    import urllib.parse
    encoded = urllib.parse.urlencode(params)
    return f"{GOOGLE_AUTH_URL}?{encoded}"


async def exchange_google_code(code: str) -> Optional[Dict[str, Any]]:
    """Exchanges Google authorization code for tokens and retrieves user identity profile."""
    redirect_uri = f"{settings.BACKEND_URL.rstrip('/')}/api/auth/google/callback"
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Exchange authorization code for access token
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }
        token_resp = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        if token_resp.status_code != 200:
            logger.error(f"Google token exchange failed: HTTP {token_resp.status_code}")
            return None
        
        tokens = token_resp.json()
        access_token = tokens.get("access_token")
        if not access_token:
            logger.error("No access token in Google OAuth response")
            return None

        # 2. Retrieve user identity from Google UserInfo endpoint
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_resp = await client.get(GOOGLE_USERINFO_URL, headers=headers)
        if userinfo_resp.status_code != 200:
            logger.error(f"Failed to fetch Google userinfo: HTTP {userinfo_resp.status_code}")
            return None

        userinfo = userinfo_resp.json()
        google_id = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name") or email.split("@")[0]
        avatar_url = userinfo.get("picture")

        if not google_id or not email:
            logger.error("Google user profile missing sub or email")
            return None

        return {
            "google_id": google_id,
            "email": email,
            "name": name,
            "avatar_url": avatar_url
        }

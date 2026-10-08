import base64
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from cryptography.fernet import Fernet
from app.core.config import settings
from app.core.logging import logger

# Algorithm for JWT session signing
ALGORITHM = "HS256"


def _get_fernet_cipher() -> Fernet:
    """Returns a Fernet cipher instance based on TOKEN_ENCRYPTION_KEY or a SHA-256 fallback derived from SESSION_SECRET."""
    raw_key = settings.TOKEN_ENCRYPTION_KEY
    if raw_key and len(raw_key.strip()) == 44:
        try:
            return Fernet(raw_key.strip().encode())
        except Exception:
            logger.warning("Invalid TOKEN_ENCRYPTION_KEY format. Falling back to derived session key.")

    # Derive a deterministic 32-byte urlsafe base64 key from SESSION_SECRET
    derived = hashlib.sha256(settings.SESSION_SECRET.encode()).digest()
    key = base64.urlsafe_b64encode(derived)
    return Fernet(key)


def encrypt_token(plain_token: str) -> str:
    """Encrypts sensitive OAuth access tokens before persisting to the database."""
    if not plain_token:
        return ""
    cipher = _get_fernet_cipher()
    return cipher.encrypt(plain_token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypts stored OAuth access tokens for internal API usage only. Never expose to frontend."""
    if not encrypted_token:
        return ""
    cipher = _get_fernet_cipher()
    try:
        return cipher.decrypt(encrypted_token.encode()).decode()
    except Exception as e:
        logger.error(f"Failed to decrypt stored token: {type(e).__name__}")
        return ""


def create_session_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT session token for authenticated users."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "iss": "tracemint-backend"
    }
    return jwt.encode(payload, settings.SESSION_SECRET, algorithm=ALGORITHM)


def decode_session_token(token: str) -> Optional[int]:
    """Decodes and validates a session JWT, returning the user_id or None if invalid."""
    try:
        payload = jwt.decode(token, settings.SESSION_SECRET, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str:
            return int(user_id_str)
        return None
    except (jwt.PyJWTError, ValueError):
        return None

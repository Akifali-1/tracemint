import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    BACKEND_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/tracemint"

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    GEMINI_REQUESTS_PER_USER_PER_DAY: int = 10

    SESSION_SECRET: str = "dev-secret-key-tracemint-secure-session-change-in-prod-2026"
    TOKEN_ENCRYPTION_KEY: str = ""

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://tracemint.tech,https://www.tracemint.tech"

    # Token and session lifetimes
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def effective_frontend_url(self) -> str:
        """
        Determines the default frontend base URL.
        If FRONTEND_URL is explicitly configured to a custom domain, use it.
        If running in cloud/production or on Render, fallback to https://tracemint.tech.
        Otherwise defaults to http://localhost:5173.
        """
        configured = (self.FRONTEND_URL or "").rstrip("/")
        if configured and "localhost" not in configured and "127.0.0.1" not in configured:
            return configured
        if os.getenv("RENDER") or self.is_production or "onrender.com" in self.BACKEND_URL:
            return "https://tracemint.tech"
        return configured or "http://localhost:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        origins = [orig.strip().rstrip("/") for orig in self.CORS_ORIGINS.split(",") if orig.strip()]
        defaults = [
            "https://tracemint.tech",
            "https://www.tracemint.tech",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            self.effective_frontend_url.rstrip("/")
        ]
        for d in defaults:
            if d and d not in origins:
                origins.append(d)
        return origins

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() in ("production", "prod") or bool(os.getenv("RENDER"))


settings = Settings()

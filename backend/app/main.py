import time
from fastapi import FastAPI, Request, Response, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.db.session import get_db
from app.api import auth, github, profile, analysis

app = FastAPI(
    title="TraceMint API",
    description="TraceMint - Your work. Proven. Deterministic developer metrics with AI interpretation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def logging_and_timing_middleware(request: Request, call_next):
    start_time = time.time()
    response: Response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    # Log request method, path, status, and duration (never log tokens or auth headers)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response


# Standardized error handling
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred." if settings.is_production else str(exc)
            }
        }
    )


# Health checks
@app.get("/health", tags=["Health"], summary="Application health status")
async def health_check():
    """Returns application health and version."""
    return {
        "status": "ok",
        "app": "TraceMint",
        "tagline": "Your work. Proven.",
        "version": "1.0.0",
        "env": settings.APP_ENV
    }


@app.get("/health/db", tags=["Health"], summary="Database connectivity check")
async def db_health_check(db: AsyncSession = Depends(get_db)):
    """Verifies that the database connection pool is alive and responding."""
    try:
        result = await db.execute(text("SELECT 1"))
        val = result.scalar()
        if val == 1:
            return {"status": "ok", "database": "connected"}
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "error", "database": "unexpected response"})
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected", "detail": str(e) if not settings.is_production else "Database unreachable"}
        )


# API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(github.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")

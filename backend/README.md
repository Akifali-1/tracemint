# TraceMint Backend

FastAPI + PostgreSQL + SQLAlchemy 2.x + Alembic + Google OAuth + GitHub REST + Gemini 3.1 Flash Lite.

---

## Architecture

```
app/
├── api/             # HTTP route controllers (auth, github, profile, analysis)
├── core/            # Configuration, logging, Fernet encryption, security
├── db/              # SQLAlchemy async engine, base, session dependency
├── models/          # PostgreSQL tables (User, GitHubAccount, Repository, Metrics, Profile)
├── schemas/         # Pydantic v2 schemas for request validation & API responses
└── services/        # Business logic (Google OAuth, GitHub REST client, Gemini AI, Profile orchestrator)
```

---

## Local Development

```bash
# 1. Create and activate venv
python -m venv .venv
.venv\Scripts\activate   # on Windows
source .venv/bin/activate  # on macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Environment configuration
cp .env.example .env
# Edit .env with your Google, GitHub, and Gemini credentials

# 4. Run migrations
alembic upgrade head

# 5. Run test suite
pytest -v

# 6. Start development server
uvicorn app.main:app --reload --port 8000
```

---

## Endpoints

- `GET /health` - Health status
- `GET /health/db` - Database pool connectivity check
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Complete Google OAuth
- `GET /api/auth/me` - Current session user
- `POST /api/auth/logout` - Invalidate session
- `GET /api/github/connect` - Initiate GitHub connection
- `GET /api/github/callback` - Complete GitHub connection
- `GET /api/github/status` - GitHub connection status
- `POST /api/github/sync` - Sync repositories and calculate metrics
- `POST /api/github/disconnect` - Disconnect GitHub
- `POST /api/profile/generate` - Generate profile with deterministic metrics & Gemini
- `GET /api/profile/me` - Authenticated user's profile
- `GET /api/profile/{username}` - Safe public profile (no private emails or keys exposed)
- `GET /api/analysis/evidence` - Deterministic GitHub evidence inspection

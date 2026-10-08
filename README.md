# TraceMint

**Your work. Proven.**

TraceMint is an open-source developer proof-of-work platform that turns real GitHub engineering activity into a verifiable, credible professional profile.

Website: [https://tracemint.tech](https://tracemint.tech)  
Repository: [https://github.com/Akifali-1/tracemint](https://github.com/Akifali-1/tracemint)

---

## 💡 Core Philosophy

```
Google OAuth  ──►  TraceMint Identity
                         │
GitHub REST   ──►  Factual Evidence (repos, languages, stars, activity)
                         │
Backend       ──►  Deterministic Metrics (language distribution, velocity)
                         │
Gemini 3.1    ──►  Conservative Interpretation (skills grounded in repos)
                         │
TraceMint     ──►  Public Verified Profile (tracemint.tech/@username)
```

**Honest by Design**:
- **GitHub = Evidence**: We observe public code activity directly through GitHub's API.
- **Backend = Deterministic Metrics**: Quantitative metrics (earned stars, language frequency, active repos) are computed directly from code before any AI processing.
- **Gemini = Interpretation**: Google Gemini 3.1 Flash Lite interprets the factual evidence without inventing facts, awards, or phantom technologies. Every generated skill explicitly cites repository evidence.
- **TraceMint = Presentation**: Transparent, verifiable presentation for developers who ship.

---

## 🛠 Tech Stack

| Component | Technology |
|---|---|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) |
| **ORM & Migrations** | [SQLAlchemy 2.x](https://www.sqlalchemy.org/) (Async), [Alembic](https://alembic.sqlalchemy.org/) |
| **Validation** | [Pydantic v2](https://docs.pydantic.dev/) |
| **Authentication** | Google OAuth 2.0 / OpenID Connect |
| **Developer Data** | GitHub OAuth + GitHub REST API (httpx) |
| **AI Interpretation** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.1-flash-lite`) |
| **Token Security** | Fernet symmetric encryption at rest (`cryptography`) |
| **Frontend** | [React 18](https://react.dev/), [Vite](https://vite.dev/), [Tailwind CSS](https://tailwindcss.com/) |
| **Testing** | [pytest](https://docs.pytest.org/), [pytest-asyncio](https://github.com/pytest-dev/pytest-asyncio) |

---

## 🚀 Quickstart & Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/Akifali-1/tracemint.git
cd tracemint
```

### 2. Start PostgreSQL with Docker
```bash
docker-compose up -d postgres
```

### 3. Setup Backend
```bash
cd backend
python -m venv .venv

# Activate virtual environment:
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Configure environment variables:
cp .env.example .env
# Edit .env with your Google OAuth, GitHub OAuth, and Gemini API credentials

# Run database migrations:
alembic upgrade head

# Run backend tests:
pytest -v

# Start FastAPI backend:
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 4. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Configuration

Create `backend/.env` based on `backend/.env.example`:

| Variable | Description | Example (Development) |
|---|---|---|
| `APP_ENV` | Application environment | `development` |
| `BACKEND_URL` | Backend origin URL | `http://localhost:8000` |
| `FRONTEND_URL` | Frontend origin URL | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://postgres:postgrespassword@localhost:5432/tracemint` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your-client-secret` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | `your_github_client_secret` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.1-flash-lite` |
| `SESSION_SECRET` | Secret for signing JWT sessions | `long-random-secret-string` |
| `TOKEN_ENCRYPTION_KEY` | Fernet key for encrypting tokens at rest | `base64-32byte-fernet-key` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,https://tracemint.tech` |

Generate a secure `TOKEN_ENCRYPTION_KEY`:
```python
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Frontend environment variable in `frontend/.env` (optional, defaults to `http://localhost:8000`):
```env
VITE_API_URL=http://localhost:8000
```

> [!CAUTION]
> Never commit `.env` or client secrets. Sensitive tokens are never returned in client API responses or exposed to React.

---

## 📚 Setup Guides

- [Google OAuth 2.0 Setup Guide](docs/google-oauth.md)
- [GitHub OAuth Application Setup Guide](docs/github-oauth.md)
- [Gemini AI Configuration Guide](docs/gemini.md)

---

## 📡 API Endpoints

### Health
- `GET /health` - Overall service status
- `GET /health/db` - Database pool health check

### Authentication
- `GET /api/auth/google/login` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Exchanges code, sets secure HttpOnly cookie
- `GET /api/auth/me` - Current authenticated user
- `POST /api/auth/logout` - Clears session cookie

### GitHub Evidence
- `GET /api/github/connect` - Initiates GitHub OAuth connection
- `GET /api/github/callback` - Stores encrypted GitHub token
- `GET /api/github/status` - Returns connection status and sync metadata
- `POST /api/github/sync` - Syncs repositories and computes deterministic metrics
- `POST /api/github/disconnect` - Safely removes GitHub association and tokens

### Developer Profile
- `POST /api/profile/generate` - Runs deterministic analysis + Gemini interpretation
- `GET /api/profile/me` - Authenticated user's profile
- `GET /api/profile/{username}` - Public developer profile (email & private data stripped)

### Deterministic Analysis
- `GET /api/analysis/evidence` - Inspects raw deterministic evidence fed to Gemini

---

## 🔒 Security & Privacy

1. **Tokens Encrypted at Rest**: GitHub OAuth tokens are encrypted with Fernet symmetric encryption and never returned in API responses.
2. **Read-Only Scopes**: TraceMint never asks for repository write permissions or webhook administration.
3. **Privacy Separation**: Public profiles (`/api/profile/{username}`) omit user emails, Google IDs, database IDs, and tokens.
4. **CORS Security**: Wildcard origins are disabled when credentials are enabled.

---

## 🤝 Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, testing, and pull request workflows.

---

## 📄 License

TraceMint is open-source software licensed under the [MIT License](LICENSE).

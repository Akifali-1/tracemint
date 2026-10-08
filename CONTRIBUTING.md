# Contributing to TraceMint

Thank you for your interest in contributing to TraceMint! We are building an open-source, evidence-based developer proof-of-work platform.

---

## 1. Code of Conduct & Core Principles

TraceMint is built on radical honesty:
1. **GitHub is evidence**: We never invent achievements, certifications, technologies, or contribution counts.
2. **Deterministic calculations**: Metrics (stars, languages, activity) are computed deterministically before AI interpretation.
3. **AI interprets, never invents**: Gemini must ground every skill or insight directly in repository evidence.
4. **Security by design**: OAuth tokens and keys must never be logged, committed, or exposed to the client.

---

## 2. Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.11+
- Docker & Docker Compose (for PostgreSQL)

### Step-by-Step
1. Clone the repository and switch to a feature branch:
   ```bash
   git clone https://github.com/Akifali-1/tracemint.git
   cd tracemint
   git checkout -b feature/your-feature-name
   ```

2. Start PostgreSQL:
   ```bash
   docker-compose up -d postgres
   ```

3. Configure Backend:
   ```bash
   cd backend
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate

   pip install -r requirements.txt
   cp .env.example .env
   # Fill in OAuth and Gemini keys in .env
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```

4. Configure Frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 3. Branch Naming & Pull Requests

- Branch naming conventions:
  - `feat/feature-description`
  - `fix/bug-fix-description`
  - `docs/documentation-update`
  - `test/test-improvements`
- Pull Requests:
  - Provide a clear description of what changed and why.
  - Ensure all backend tests pass before opening a PR (`pytest`).
  - Ensure the frontend builds cleanly (`npm run build`).

---

## 4. Testing

Run backend tests using pytest:
```bash
cd backend
pytest -v
```

All external services (Google OAuth, GitHub REST, Gemini API) must be mocked in tests. Tests should pass without requiring live third-party credentials.

---

## 5. Security & Sensitive Data Rules

- **NEVER** commit `.env` or files containing secret keys (`GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`, `GEMINI_API_KEY`, `SESSION_SECRET`, `TOKEN_ENCRYPTION_KEY`).
- **NEVER** log tokens or OAuth authorization codes.
- All tokens stored in the database must be encrypted at rest using Fernet encryption (`TOKEN_ENCRYPTION_KEY`).
- Public profile endpoints must never leak user emails, Google IDs, access tokens, or database IDs.

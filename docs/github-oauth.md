# GitHub OAuth Application Setup Guide

TraceMint connects to GitHub as a read-only evidence source. It requests only minimal permissions required to index public developer activity.

---

## 1. Register a New OAuth App on GitHub

1. Log in to [GitHub](https://github.com/).
2. In the top-right corner, click your profile photo → **Settings**.
3. In the left sidebar, scroll down and click **Developer settings**.
4. In the left navigation, select **OAuth Apps** → **New OAuth App** (or **Register a new application**).

---

## 2. Fill in Application Details

- **Application name**: `TraceMint Developer Proof Engine`
- **Homepage URL**:
  - Development: `http://localhost:5173`
  - Production: `https://tracemint.tech`
- **Application description**: `Deterministic developer proof-of-work platform.`
- **Authorization callback URL**:
  - Development: `http://localhost:8000/api/github/callback`
  - Production: `https://YOUR-BACKEND-DOMAIN/api/github/callback` (e.g. `https://api.tracemint.tech/api/github/callback`)

Click **Register application**.

---

## 3. Generate Client Secret

1. On your newly created application page, copy the **Client ID**.
2. Click **Generate a new client secret**.
3. Copy the generated secret immediately (GitHub will not show it again).

---

## 4. Required Permissions & Security Principles

TraceMint requests minimal read scopes:
- `read:user` (to verify username and avatar)
- Public repository metadata

TraceMint strictly adheres to read-only analysis:
- **No repository creation or deletion**
- **No code pushing or modification**
- **No issue or pull request creation**
- **No organization modification**

---

## 5. Configure Backend Environment

Add your credentials to `backend/.env`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

Tokens received from GitHub are encrypted at rest using Fernet symmetric encryption (`TOKEN_ENCRYPTION_KEY`) and are never returned in client API responses or logs.

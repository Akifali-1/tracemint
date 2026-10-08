# Google OAuth 2.0 Setup Guide

TraceMint uses Google OAuth 2.0 / OpenID Connect exclusively for developer identity and authentication.

---

## 1. Create a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top of the page and select **New Project**.
3. Name your project (e.g. `tracemint-auth`) and click **Create**.

---

## 2. Configure OAuth Consent Screen

1. In the left-hand navigation, go to **APIs & Services** → **OAuth consent screen**.
2. Select User Type:
   - For public testing/production: Choose **External**.
   - Click **Create**.
3. Fill in the required application details:
   - **App name**: `TraceMint`
   - **User support email**: Your contact email (e.g., `contact@tracemint.tech`)
   - **App domain**: `https://tracemint.tech`
   - **Developer contact information**: Your email
4. Scopes:
   - Click **Add or Remove Scopes**.
   - Select:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **Update** and then **Save and Continue**.
5. Test users (while in "Testing" mode):
   - Add your Google account email to the list of test users.
   - Click **Save and Continue**.

---

## 3. Create OAuth 2.0 Credentials

1. In the left navigation, click **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top, and select **OAuth client ID**.
3. Application type: Select **Web application**.
4. Name: `TraceMint Web Client`.
5. **Authorized JavaScript origins**:
   - Development: `http://localhost:5173`
   - Production: `https://tracemint.tech`
6. **Authorized redirect URIs**:
   - Development: `http://localhost:8000/api/auth/google/callback`
   - Production: `https://YOUR-BACKEND-DOMAIN/api/auth/google/callback` (replace with your deployed API domain, e.g. `https://api.tracemint.tech/api/auth/google/callback`)
7. Click **Create**.
8. A modal will display your:
   - **Client ID**
   - **Client Secret**

---

## 4. Configure Backend Environment

Copy your credentials into `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

> [!WARNING]
> Never commit `GOOGLE_CLIENT_SECRET` or `.env` files to git. These credentials are read only by the FastAPI backend server and are never sent to the browser or frontend bundle.

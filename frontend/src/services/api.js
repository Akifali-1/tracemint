// TraceMint API Client
// Connects the React frontend to the FastAPI backend service

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

function getAuthHeader() {
  const token = localStorage.getItem('tracemint_session_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
  };

  const response = await fetch(url, {
    credentials: 'include', // Ensures HTTP-only cookies are passed
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.detail || response.statusText || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // URLs for OAuth redirects
  getGoogleLoginUrl: () => `${API_BASE}/api/auth/google/login`,
  getGitHubConnectUrl: () => `${API_BASE}/api/github/connect`,

  // Authentication
  getMe: async () => {
    return request('/api/auth/me');
  },

  logout: async () => {
    localStorage.removeItem('tracemint_session_token');
    return request('/api/auth/logout', { method: 'POST' });
  },

  // GitHub
  getGitHubStatus: async () => {
    return request('/api/github/status');
  },

  syncGitHub: async () => {
    return request('/api/github/sync', { method: 'POST' });
  },

  disconnectGitHub: async () => {
    return request('/api/github/disconnect', { method: 'POST' });
  },

  getContributions: async (username) => {
    const clean = username.replace(/^@/, '');
    return request(`/api/github/contributions/${clean}`);
  },

  // Developer Profile
  generateProfile: async (forceRefresh = false) => {
    return request('/api/profile/generate', {
      method: 'POST',
      body: JSON.stringify({ force_refresh: forceRefresh }),
    });
  },

  getMyProfile: async () => {
    return request('/api/profile/me');
  },

  getAiUsage: async () => {
    return request('/api/profile/ai-usage');
  },

  getPublicProfile: async (username) => {
    const clean = username.replace(/^@/, '');
    return request(`/api/profile/${clean}`);
  },

  // Deterministic Evidence
  getEvidence: async () => {
    return request('/api/analysis/evidence');
  },

  // Health
  checkHealth: async () => {
    return request('/health');
  },
};

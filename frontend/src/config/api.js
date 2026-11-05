import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const TOKEN_KEY = 'cms_token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

const api = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Login/registration endpoints legitimately return 401 for bad credentials;
// only an expired session elsewhere should sign the user out.
const AUTH_ENDPOINTS = ['/api/users/login', '/api/users/register', '/api/auth/2fa/validate'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthCall = AUTH_ENDPOINTS.some((path) => url.includes(path));

    if (!isAuthCall && tokenStore.get() && (status === 401 || (status === 403 && /blocked/i.test(error.response?.data?.message || '')))) {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: error.response?.data?.message }));
    }
    return Promise.reject(error);
  }
);

export default api;

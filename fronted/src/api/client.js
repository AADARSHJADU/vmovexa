/**
 * client.js — the single axios instance used by all services.
 * - Request interceptor: attaches Bearer access token.
 * - Response interceptor: on 401, tries ONE refresh via /auth/refresh, retries the request,
 *   and on failure clears tokens + redirects to /login.
 * Base URL comes from VITE_API_URL (falls back to localhost dev API).
 */
import axios from 'axios';
import { storage } from '../utils/storage';
import { ENDPOINTS } from './endpoints';

const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim();

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const hostname = window.location.hostname;

    // Production domain mappings
    if (hostname === 'one.vmovexa.com') {
      return envUrl && !envUrl.includes('localhost') ? envUrl : 'https://api.vmovexa.com/api/v1';
    }
    if (hostname === 'vmovexa.guptatechweb.com') {
      return envUrl && !envUrl.includes('localhost') ? envUrl : 'https://hotpink-llama-677284.hostingersite.com/api/v1';
    }

    // Explicit absolute environment URL configured
    if (envUrl) {
      if (envUrl.includes('localhost') && hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Only map localhost to LAN IP if on unencrypted HTTP (local network development)
        if (!isHttps) {
          return envUrl.replace('localhost', hostname);
        }
        // If on HTTPS, fall back to relative or same-origin /api/v1 to prevent Mixed Content
        return '/api/v1';
      }
      return envUrl;
    }

    // Default for HTTPS production sites without explicit URL
    if (isHttps) {
      return '/api/v1';
    }

    // Default for local development
    return `http://${hostname || 'localhost'}:4000/api/v1`;
  }

  return envUrl || 'http://localhost:4000/api/v1';
};

const baseURL = getApiBaseUrl();
if (typeof window !== 'undefined') {
  console.info(`[VMOVEXA API] Active Base URL: ${baseURL}`);
}

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ---- Request: attach token ----
apiClient.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Response: 401 → refresh once → retry, else logout ----
let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token = null) {
  pendingQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
}

function forceLogout() {
  storage.clear();
  // Hard redirect keeps it simple + guarantees protected state resets.
  if (window.location.pathname !== '/login') window.location.assign('/login');
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response && error.response.status;

    // Don't try to refresh the refresh/login calls themselves.
    const isAuthCall =
      original &&
      (original.url === ENDPOINTS.AUTH.REFRESH ||
        original.url === ENDPOINTS.AUTH.LOGIN_EMAIL ||
        original.url === ENDPOINTS.AUTH.LOGIN_PHONE);

    const errData = error.response && error.response.data;
    const isSuspended =
      status === 403 &&
      (errData?.code === 'AUTH_FORBIDDEN' ||
        errData?.message?.toLowerCase().includes('suspended') ||
        errData?.message?.toLowerCase().includes('frozen'));

    if (isSuspended && !isAuthCall) {
      forceLogout();
      return Promise.reject(error);
    }

    if (status !== 401 || isAuthCall || (original && original._retried)) {
      return Promise.reject(error);
    }

    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue until the in-flight refresh resolves.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        original._retried = true;
        return apiClient(original);
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${baseURL}${ENDPOINTS.AUTH.REFRESH}`, { refreshToken });
      const tokens = data && data.data && data.data.tokens ? data.data.tokens : null;
      const newAccess = tokens && tokens.accessToken;
      const newRefresh = tokens && tokens.refreshToken;
      if (!newAccess) throw new Error('No access token from refresh');
      storage.setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      flushQueue(null, newAccess);
      original.headers.Authorization = `Bearer ${newAccess}`;
      original._retried = true;
      return apiClient(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      forceLogout();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

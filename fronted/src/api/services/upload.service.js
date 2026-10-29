import apiClient from '../client.js';
import { ENDPOINTS } from '../endpoints.js';

/**
 * Helper to determine the true backend base origin (e.g. https://api.vmovexa.com or http://localhost:4000)
 * Works across local dev, LAN IP testing, reverse proxies, and multi-domain production hosting.
 */
export const getBackendBaseUrl = () => {
  // 1. Explicit storage URL env takes highest precedence
  const storageEnv = (import.meta.env?.VITE_STORAGE_URL || '').trim();
  if (storageEnv) {
    return storageEnv.replace(/\/+$/, '');
  }

  // 2. Derive from active apiClient baseURL or env
  const apiBase = (apiClient?.defaults?.baseURL || import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL || '').trim();

  // If apiBase is absolute (starts with http:// or https://)
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    return apiBase.replace(/\/api(\/v\d+)?\/?$/, '').replace(/\/+$/, '');
  }

  // 3. If running in browser, check current hostname and well-known production hosts
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isHttps = window.location.protocol === 'https:';

    if (host === 'one.vmovexa.com') {
      return 'https://api.vmovexa.com';
    }
    if (host === 'vmovexa.guptatechweb.com') {
      return 'https://hotpink-llama-677284.hostingersite.com';
    }

    if (isHttps) {
      // Same-origin reverse proxy
      return window.location.origin;
    }

    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:4000`;
    }
  }

  return 'http://localhost:4000';
};

/**
 * Resolve a relative storage URL (e.g. /uploads/..., /storage/..., /logo/...)
 * to a reachable absolute URL using the active backend base URL.
 * Automatically cleans and heals stale localhost/LAN IPs saved in DB.
 * If already an external absolute URL or local blob/data preview, returns as-is.
 */
export const resolveFileUrl = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string') return '';
  const trimmed = relativeUrl.trim();
  if (!trimmed) return '';

  // Local blob / data URLs immediately (instant file upload previews)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;

  // External video streaming links
  if (/youtube\.com|youtu\.be/i.test(trimmed)) return trimmed;

  // Normalize Windows backslashes
  const normalized = trimmed.replace(/\\/g, '/');

  const backendBase = getBackendBaseUrl();

  // Extract storage, uploads, or branding paths (even if prefixed with old localhost, stale LAN IP, or old domain)
  const storageMatch = normalized.match(/(?:\/)?(uploads|storage|logo)\/.+$/i);
  if (storageMatch) {
    const matchedPath = storageMatch[0].startsWith('/') ? storageMatch[0] : `/${storageMatch[0]}`;
    return `${backendBase}${matchedPath}`;
  }

  // Pure external URLs (ui-avatars, cdn, aws s3, firebase storage, etc.)
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${backendBase}${cleanPath}`;
};

export const getMediaUrl = resolveFileUrl;

export const uploadFile = async (file, purpose = 'support', onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  const endpoint = ENDPOINTS?.UPLOADS?.CREATE || ENDPOINTS?.UPLOADS?.BASE || '/uploads';
  const res = await apiClient.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });
  return res.data?.data || res.data;
};

export const uploadVideo = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('video', file);
  const endpoint = ENDPOINTS?.UPLOADS?.VIDEO || '/uploads/video';
  const res = await apiClient.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
    timeout: 10 * 60 * 1000,
  });
  return res.data?.data || res.data;
};

export default { uploadFile, uploadVideo, resolveFileUrl };
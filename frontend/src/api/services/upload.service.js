import apiClient from '../client.js';
import { ENDPOINTS } from '../endpoints.js';

/**
 * Resolve a relative storage URL (e.g. /uploads/sop_document/xxx.pdf)
 * to an absolute URL using the backend base URL.
 * If the URL is already absolute, returns it as-is.
 */
export const resolveFileUrl = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string') return '';
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) return relativeUrl;
  if (relativeUrl.startsWith('blob:') || relativeUrl.startsWith('data:')) return relativeUrl;

  // Derive backend base from apiClient baseURL (strip /api/v1)
  const apiBase = apiClient.defaults.baseURL || 'http://localhost:4000/api/v1';
  const backendBase = apiBase.replace(/\/api\/v1\/?$/, '');
  const path = relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`;
  return `${backendBase}${path}`;
};

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
  const res = await apiClient.post(ENDPOINTS.UPLOADS.VIDEO, formData, {
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
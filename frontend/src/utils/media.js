/**
 * media.js — Helper utility for resolving upload image/video URLs.
 * Converts localhost/relative upload URLs to dynamic host URL (e.g. 192.168.x.x:4000)
 * so uploaded images load seamlessly on LAN, mobile, and desktop browsers.
 */

export const getMediaUrl = (url) => {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  
  // Data URIs, blob URIs, or external absolute URLs (e.g. https://)
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const apiHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/api\/v1\/?$/, '');
    if (url.includes('localhost:4000') || url.includes('127.0.0.1:4000')) {
      if (apiHost && !apiHost.includes('localhost')) {
        return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):4000/g, apiHost);
      }
      const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
      return url.replace(/localhost:4000|127\.0\.0\.1:4000/g, `${hostname}:4000`);
    }
    return url;
  }

  // Relative path like /uploads/... or uploads/...
  const apiHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  if (apiHost && !apiHost.includes('localhost')) {
    return `${apiHost}${cleanPath}`;
  }
  const hostname = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000${cleanPath}`;
};

export default getMediaUrl;

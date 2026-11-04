/**
 * media.js — Helper utility for resolving uploaded media URLs across all portals.
 * Re-exports and unifies with resolveFileUrl from upload.service.js.
 * Guarantees consistent URL resolution on local, LAN, reverse-proxy, and production cloud servers.
 */
import { resolveFileUrl, getBackendBaseUrl } from '../api/services/upload.service.js';

export const getMediaUrl = (url) => resolveFileUrl(url);

export { resolveFileUrl, getBackendBaseUrl };
export default getMediaUrl;

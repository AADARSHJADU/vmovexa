/**
 * storage.js — single place for auth token persistence (localStorage).
 * Keeps token keys in one spot so the axios client + auth slice agree.
 */
const ACCESS_KEY = 'vmx_access_token';
const REFRESH_KEY = 'vmx_refresh_token';
const ORIGINAL_ACCESS_KEY = 'vmx_orig_access_token';
const ORIGINAL_REFRESH_KEY = 'vmx_orig_refresh_token';
const IMPERSONATING_KEY = 'vmx_is_impersonating';
const IMPERSONATION_TARGET_KEY = 'vmx_impersonation_target';

export const storage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

  setTokens: ({ accessToken, refreshToken } = {}) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  isImpersonating: () => localStorage.getItem(IMPERSONATING_KEY) === 'true',

  getImpersonationTarget: () => {
    try {
      const raw = localStorage.getItem(IMPERSONATION_TARGET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  },

  startImpersonation: (impersonationToken, targetMeta = null) => {
    // Stash original superadmin tokens if not already impersonating
    if (!localStorage.getItem(IMPERSONATING_KEY)) {
      const origAccess = localStorage.getItem(ACCESS_KEY);
      const origRefresh = localStorage.getItem(REFRESH_KEY);
      if (origAccess) localStorage.setItem(ORIGINAL_ACCESS_KEY, origAccess);
      if (origRefresh) localStorage.setItem(ORIGINAL_REFRESH_KEY, origRefresh);
    }
    localStorage.setItem(IMPERSONATING_KEY, 'true');
    localStorage.setItem(ACCESS_KEY, impersonationToken);
    localStorage.removeItem(REFRESH_KEY); // impersonation tokens are non-refreshable
    if (targetMeta) {
      localStorage.setItem(IMPERSONATION_TARGET_KEY, JSON.stringify(targetMeta));
    }
  },

  stopImpersonation: () => {
    const origAccess = localStorage.getItem(ORIGINAL_ACCESS_KEY);
    const origRefresh = localStorage.getItem(ORIGINAL_REFRESH_KEY);
    if (origAccess) {
      localStorage.setItem(ACCESS_KEY, origAccess);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }
    if (origRefresh) {
      localStorage.setItem(REFRESH_KEY, origRefresh);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
    localStorage.removeItem(ORIGINAL_ACCESS_KEY);
    localStorage.removeItem(ORIGINAL_REFRESH_KEY);
    localStorage.removeItem(IMPERSONATING_KEY);
    localStorage.removeItem(IMPERSONATION_TARGET_KEY);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ORIGINAL_ACCESS_KEY);
    localStorage.removeItem(ORIGINAL_REFRESH_KEY);
    localStorage.removeItem(IMPERSONATING_KEY);
    localStorage.removeItem(IMPERSONATION_TARGET_KEY);
  },
};

export default storage;

/**
 * auth.service.js — auth API calls over the shared client.
 * Each method returns the normalized `data` payload (or throws a normalized error).
 * Token persistence is handled here on login/logout so callers stay simple.
 */
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { unwrap, messageOf, normalizeError } from '../../utils/apiResponse';
import { storage } from '../../utils/storage';

async function call(promise) {
  try {
    const res = await promise;
    return { data: unwrap(res.data), message: messageOf(res.data), raw: res.data };
  } catch (err) {
    throw normalizeError(err);
  }
}

export const authService = {
  async login(email, password) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.LOGIN_EMAIL, { email, password })
    );
    // data = { user, permissions, tokens } OR { mfaRequired, identifier }
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async loginWithFirebaseGoogle(idToken) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.FIREBASE_GOOGLE, { idToken })
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async registerWithFirebaseGoogle(payload) {
    const res = await call(apiClient.post(ENDPOINTS.AUTH.FIREBASE_GOOGLE_REGISTER, payload));
    if (res?.data?.tokens?.accessToken) {
      storage.setTokens({
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      });
    }
    return res;
  },

  async getZohoAuthUrl(redirectUri) {
    return call(apiClient.get(ENDPOINTS.AUTH.ZOHO_AUTH_URL, { params: { redirectUri } }));
  },

  async loginWithZoho({ code, redirectUri, mode = 'login' }) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.ZOHO_LOGIN, { code, redirectUri, mode })
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async getAppleAuthUrl(redirectUri) {
    return call(apiClient.get(ENDPOINTS.AUTH.APPLE_AUTH_URL, { params: { redirectUri } }));
  },

  async loginWithApple({ code, idToken, user, redirectUri, mode = 'login' }) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.APPLE_LOGIN, { code, idToken, user, redirectUri, mode })
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async loginWithFirebaseApple(idToken) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.FIREBASE_APPLE, { idToken })
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async registerWithFirebaseApple(payload) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.FIREBASE_APPLE_REGISTER, payload)
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async register(payload) {
    return call(apiClient.post(ENDPOINTS.AUTH.REGISTER, payload));
  },

  async requestSignupOtp({ name, email }) {
    return call(apiClient.post(ENDPOINTS.AUTH.REQUEST_SIGNUP_OTP, { name, email }));
  },

  async verifySignupOtp(payload) {
    const res = await call(apiClient.post(ENDPOINTS.AUTH.VERIFY_SIGNUP_OTP, payload));
    if (res?.data?.tokens?.accessToken) {
      storage.setTokens({
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      });
    }
    return res;
  },

  async verifyOtp({ identifier, code }) {
    const { data, message } = await call(
      apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { identifier, code })
    );
    if (data && data.tokens && data.tokens.accessToken) {
      storage.setTokens({
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
    }
    return { data, message };
  },

  async resubmitRegistration(payload) {
    return call(apiClient.post(ENDPOINTS.AUTH.RESUBMIT_REGISTRATION, payload));
  },

  async me() {
    return call(apiClient.get(ENDPOINTS.AUTH.ME));
  },

  async updateMe(patch) {
    return call(apiClient.patch(ENDPOINTS.AUTH.UPDATE_ME, patch));
  },

  async completeOrganizationProfile(payload) {
    return call(apiClient.post(ENDPOINTS.AUTH.COMPLETE_PROFILE, payload));
  },

  async changePassword(currentPassword, newPassword) {
    const payload = typeof currentPassword === 'object' && currentPassword !== null
      ? currentPassword
      : { currentPassword, newPassword };
    const res = await call(apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload));
    if (res?.data?.tokens?.accessToken) {
      storage.setTokens({
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      });
    }
    return res;
  },

  async forgotPassword(emailAddr) {
    return call(apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: emailAddr }));
  },

  async resetPassword(payload) {
    return call(apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, payload));
  },

  async logout() {
    const refreshToken = storage.getRefreshToken();
    try {
      if (refreshToken) await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch (_) {
      /* ignore — clear locally regardless */
    } finally {
      storage.clear();
    }
    return { data: { ok: true }, message: 'Logged out.' };
  },
};

export default authService;

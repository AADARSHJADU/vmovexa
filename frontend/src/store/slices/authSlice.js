/**
 * authSlice.js — auth STATE only: shape, reducers, selectors.
 * Thunks live in store/thunks/auth.thunks.js and are re-exported
 * here so existing imports (useAuth.js, App.jsx) stay unchanged.
 */
import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';
import {
  loginThunk,
  verifyLoginOtpThunk,
  loginWithGoogleThunk,
  registerThunk,
  registerWithGoogleThunk,
  loginWithZohoThunk,
  loginWithAppleThunk,
  loginWithFirebaseAppleThunk,
  registerWithAppleThunk,
  resubmitRegistrationThunk,
  fetchMeThunk,
  updateMeThunk,
  completeOrganizationProfileThunk,
  requestSignupOtpThunk,
  verifySignupOtpThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  logoutThunk,
} from '../thunks/auth.thunks.js';

// Re-export thunks so callers don't need to change their imports
export { loginThunk, verifyLoginOtpThunk, loginWithGoogleThunk, registerThunk, registerWithGoogleThunk, loginWithZohoThunk, loginWithAppleThunk, loginWithFirebaseAppleThunk, registerWithAppleThunk, resubmitRegistrationThunk, fetchMeThunk, updateMeThunk, completeOrganizationProfileThunk, requestSignupOtpThunk, verifySignupOtpThunk, forgotPasswordThunk, resetPasswordThunk, logoutThunk };

function roleCodeOf(user) {
  return (user && user.role && user.role.code) || null;
}

const initialState = {
  user: null,
  roleCode: null,
  permissions: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  bootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    markBootstrapped(state) {
      state.bootstrapped = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- login ----
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.mfaRequired) return;
        state.user = action.payload.user;
        state.roleCode = roleCodeOf(action.payload.user);
        state.permissions = action.payload.permissions;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Login failed.' };
      })

      // ---- verify login otp (MFA) ----
      .addCase(verifyLoginOtpThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyLoginOtpThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.roleCode = roleCodeOf(action.payload.user);
        state.permissions = action.payload.permissions;
      })
      .addCase(verifyLoginOtpThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'OTP verification failed.' };
      })

      // ---- google login ----
      .addCase(loginWithGoogleThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.roleCode = roleCodeOf(action.payload.user);
        state.permissions = action.payload.permissions;
      })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Google login failed.' };
      })

      // ---- google register ----
      .addCase(registerWithGoogleThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerWithGoogleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = action.payload?.data?.user || action.payload?.user;
        if (user) {
          state.user = user;
          state.roleCode = roleCodeOf(user);
          state.permissions = action.payload?.data?.permissions || action.payload?.permissions || [];
        }
      })
      .addCase(registerWithGoogleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Google registration failed.' };
      })

      // ---- zoho login / register ----
      .addCase(loginWithZohoThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithZohoThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = action.payload?.user;
        if (user) {
          state.user = user;
          state.roleCode = roleCodeOf(user);
          state.permissions = action.payload?.permissions || [];
        }
      })
      .addCase(loginWithZohoThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Zoho authentication failed.' };
      })

      // ---- apple login / register ----
      .addCase(loginWithAppleThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithAppleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = action.payload?.user;
        if (user) {
          state.user = user;
          state.roleCode = roleCodeOf(user);
          state.permissions = action.payload?.permissions || [];
        }
      })
      .addCase(loginWithAppleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Apple authentication failed.' };
      })

      // ---- firebase apple login ----
      .addCase(loginWithFirebaseAppleThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithFirebaseAppleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = action.payload?.user;
        if (user) {
          state.user = user;
          state.roleCode = roleCodeOf(user);
          state.permissions = action.payload?.permissions || [];
        }
      })
      .addCase(loginWithFirebaseAppleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Apple authentication failed.' };
      })

      // ---- apple register ----
      .addCase(registerWithAppleThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerWithAppleThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const user = action.payload?.data?.user || action.payload?.user;
        if (user) {
          state.user = user;
          state.roleCode = roleCodeOf(user);
          state.permissions = action.payload?.data?.permissions || action.payload?.permissions || [];
        }
      })
      .addCase(registerWithAppleThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Apple registration failed.' };
      })

      // ---- verify signup otp ----
      .addCase(verifySignupOtpThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifySignupOtpThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.roleCode = roleCodeOf(action.payload.user);
        state.permissions = action.payload.permissions;
      })
      .addCase(verifySignupOtpThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'OTP verification failed.' };
      })

      // ---- register ----
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Registration failed.' };
      })

      // ---- resubmit registration ----
      .addCase(resubmitRegistrationThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resubmitRegistrationThunk.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resubmitRegistrationThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || { message: 'Resubmission failed.' };
      })

      // ---- me (session bootstrap) ----
      .addCase(fetchMeThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.roleCode = roleCodeOf(action.payload.user);
        state.permissions = action.payload.permissions;
        state.bootstrapped = true;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.status = 'idle';
        state.user = null;
        state.roleCode = null;
        state.permissions = [];
        state.bootstrapped = true;
        storage.clear();
        const msg = action.payload?.message || '';
        if (msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('frozen')) {
          toast.error(msg || 'Your account has been suspended/frozen.');
        }
      })

      // ---- update profile ----
      .addCase(updateMeThunk.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
      })
      .addCase(completeOrganizationProfileThunk.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload.user };
      })

      // ---- logout ----
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.roleCode = null;
        state.permissions = [];
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearAuthError, markBootstrapped } = authSlice.actions;
export default authSlice.reducer;

// ---- Selectors ----
export const selectAuth            = (s) => s.auth;
export const selectUser            = (s) => s.auth.user;
export const selectRole            = (s) => s.auth.roleCode;
export const selectPermissions     = (s) => s.auth.permissions;
export const selectIsAuthenticated = (s) => !!s.auth.user;
export const selectAuthStatus      = (s) => s.auth.status;
export const selectAuthError       = (s) => s.auth.error;
export const selectBootstrapped    = (s) => s.auth.bootstrapped;

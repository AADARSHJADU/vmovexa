/**
 * auth.thunks.js — all async auth operations.
 * Flow: thunk → authService → apiClient → backend.
 * Used by: authSlice (extraReducers) via import.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/services/auth.service';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await authService.login(email, password);
      if (data && data.mfaRequired) {
        return { mfaRequired: true, identifier: data.identifier, devCode: data.devCode };
      }
      return { user: data.user, permissions: data.permissions || [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const verifyLoginOtpThunk = createAsyncThunk(
  'auth/verifyLoginOtp',
  async ({ identifier, code }, { rejectWithValue }) => {
    try {
      const { data } = await authService.verifyOtp({ identifier, code });
      return { user: data.user, permissions: data.permissions || [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithGoogleThunk = createAsyncThunk(
  'auth/loginWithGoogle',
  async (idToken, { rejectWithValue }) => {
    try {
      const { data } = await authService.loginWithFirebaseGoogle(idToken);
      return { user: data.user, permissions: data.permissions || [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerWithGoogleThunk = createAsyncThunk(
  'auth/registerWithGoogle',
  async (payload, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.registerWithFirebaseGoogle(payload);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithZohoThunk = createAsyncThunk(
  'auth/loginWithZoho',
  async ({ code, redirectUri, mode }, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.loginWithZoho({ code, redirectUri, mode });
      return { user: data.user, permissions: data.permissions || [], alreadyRegistered: data.alreadyRegistered, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithAppleThunk = createAsyncThunk(
  'auth/loginWithApple',
  async ({ code, idToken, user, redirectUri, mode }, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.loginWithApple({ code, idToken, user, redirectUri, mode });
      return { user: data.user, permissions: data.permissions || [], alreadyRegistered: data.alreadyRegistered, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithFirebaseAppleThunk = createAsyncThunk(
  'auth/loginWithFirebaseApple',
  async (idToken, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.loginWithFirebaseApple(idToken);
      return { user: data.user, permissions: data.permissions || [], message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerWithAppleThunk = createAsyncThunk(
  'auth/registerWithApple',
  async (payload, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.registerWithFirebaseApple(payload);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.register(payload);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const requestSignupOtpThunk = createAsyncThunk(
  'auth/requestSignupOtp',
  async ({ name, email }, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.requestSignupOtp({ name, email });
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const verifySignupOtpThunk = createAsyncThunk(
  'auth/verifySignupOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.verifySignupOtp(payload);
      return { user: data.user, permissions: data.permissions || [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const resubmitRegistrationThunk = createAsyncThunk(
  'auth/resubmitRegistration',
  async (payload, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.resubmitRegistration(payload);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authService.me();
      return { user: data, permissions: data.permissions || [] };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateMeThunk = createAsyncThunk(
  'auth/updateMe',
  async (patch, { rejectWithValue }) => {
    try {
      const { data } = await authService.updateMe(patch);
      return { user: data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const completeOrganizationProfileThunk = createAsyncThunk(
  'auth/completeOrganizationProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await authService.completeOrganizationProfile(payload);
      return { user: data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.forgotPassword(email);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      const { data, message } = await authService.resetPassword(payload);
      return { data, message };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
    return true;
  }
);

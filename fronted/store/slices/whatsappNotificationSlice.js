import { createSlice } from '@reduxjs/toolkit';
import {
  fetchWhatsappConfigThunk,
  updateWhatsappConfigThunk,
  sendTestWhatsappThunk,
} from '../thunks/whatsappNotification.thunks';

const initialState = {
  config: {
    provider: 'twilio',
    whatsapp_from_number: 'whatsapp:+14155238886',
    whatsapp_business_id: '',
    whatsapp_phone_number_id: '',
    whatsapp_api_token: '',
    whatsapp_webhook_secret: '',
    default_language: 'en',
    whatsapp_fallback_sms: false,
    critical_only: false,
    enabled: false,
    configured: false,
  },
  loading: false,
  saving: false,
  testing: false,
  testResult: null,
  error: null,
};

const whatsappNotificationSlice = createSlice({
  name: 'whatsappNotification',
  initialState,
  reducers: {
    clearTestResult: (state) => {
      state.testResult = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Config
      .addCase(fetchWhatsappConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhatsappConfigThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload || state.config;
      })
      .addCase(fetchWhatsappConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to load WhatsApp configuration';
      })

      // Update Config
      .addCase(updateWhatsappConfigThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateWhatsappConfigThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.config = action.payload || state.config;
      })
      .addCase(updateWhatsappConfigThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to save WhatsApp configuration';
      })

      // Test WhatsApp
      .addCase(sendTestWhatsappThunk.pending, (state) => {
        state.testing = true;
        state.testResult = null;
      })
      .addCase(sendTestWhatsappThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResult = action.payload;
      })
      .addCase(sendTestWhatsappThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload?.message || 'Failed to send test WhatsApp message';
      });
  },
});

export const { clearTestResult, clearError } = whatsappNotificationSlice.actions;

export const selectWhatsappConfig = (state) => state.whatsappNotification.config;
export const selectWhatsappLoading = (state) => state.whatsappNotification.loading;
export const selectWhatsappSaving = (state) => state.whatsappNotification.saving;
export const selectWhatsappTesting = (state) => state.whatsappNotification.testing;
export const selectWhatsappTestResult = (state) => state.whatsappNotification.testResult;
export const selectWhatsappError = (state) => state.whatsappNotification.error;

export default whatsappNotificationSlice.reducer;

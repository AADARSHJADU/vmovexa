import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotificationsThunk,
  fetchNotificationSettingsThunk,
  updateNotificationSettingsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  deleteNotificationThunk,
  clearAllNotificationsThunk,
  toggleNotificationPreferenceThunk,
  fetchSmtpConfigThunk,
  updateSmtpConfigThunk,
  testEmailThunk,
  sendTestPushThunk,
} from '../../thunks/shared/notification.thunks.js';

export {
  fetchNotificationsThunk,
  fetchNotificationSettingsThunk,
  updateNotificationSettingsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  deleteNotificationThunk,
  clearAllNotificationsThunk,
  toggleNotificationPreferenceThunk,
  fetchSmtpConfigThunk,
  updateSmtpConfigThunk,
  testEmailThunk,
  sendTestPushThunk,
};

const initialState = {
  items: [],
  settings: null,
  smtp: null,
  status: 'idle',
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addIncomingNotification: (state, action) => {
      const incoming = action.payload;
      if (!incoming || !incoming.id) return;
      const exists = state.items.some((n) => n && n.id === incoming.id);
      if (!exists) {
        state.items.unshift(incoming);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (Array.isArray(action.payload?.rows) ? action.payload.rows : (Array.isArray(action.payload?.data) ? action.payload.data : []));
      })
      .addCase(fetchNotificationSettingsThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.settings) {
          state.settings = payload.settings;
          state.events = payload.events || [];
        } else {
          state.settings = payload;
        }
      })
      .addCase(updateNotificationSettingsThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload && payload.settings) {
          state.settings = payload.settings;
        } else {
          state.settings = payload;
        }
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items.forEach((n) => {
          if (n && n.id === id) {
            n.read_at = new Date().toISOString();
            n.read = true;
          }
        });
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        const now = new Date().toISOString();
        state.items.forEach((n) => {
          if (n) {
            n.read_at = now;
            n.read = true;
          }
        });
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n && n.id !== action.payload);
      })
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(toggleNotificationPreferenceThunk.fulfilled, (state, action) => {
        const { eventTypeId, enabled } = action.payload;
        if (state.settings?.events) {
          const ev = state.settings.events.find((e) => e.id === eventTypeId);
          if (ev) ev.enabled = enabled;
        }
      })
      .addCase(fetchSmtpConfigThunk.fulfilled, (state, action) => {
        state.smtp = action.payload;
      })
      .addCase(updateSmtpConfigThunk.fulfilled, (state, action) => {
        state.smtp = action.payload;
      });
  },
});

export const { addIncomingNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
export const selectNotifications = (state) => state.notifications.items;
export const selectNotificationSettings = (state) => state.notifications.settings;
export const selectSmtpConfig = (state) => state.notifications.smtp;
export const selectNotificationsStatus = (state) => state.notifications.status;
export const selectUnreadNotificationsCount = (state) =>
  (state.notifications?.items || []).filter((n) => n && !n.read_at && !n.read).length;



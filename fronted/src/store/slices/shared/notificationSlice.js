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
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  stats: { all: 0, unread: 0, critical: 0, warning: 0, info: 0 },
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
        state.stats.all += 1;
        if (!incoming.read_at && !incoming.read) state.stats.unread += 1;
        const severity = String(incoming.severity || 'info').toLowerCase();
        if (['critical', 'error', 'danger', 'emergency'].includes(severity)) state.stats.critical += 1;
        else if (['warning', 'warn'].includes(severity)) state.stats.warning += 1;
        else state.stats.info += 1;
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
        if (action.payload?.meta) {
          state.pagination = action.payload.meta;
          state.stats = action.payload.meta.stats || state.stats;
        }
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
            const wasUnread = !n.read_at && !n.read;
            n.read_at = new Date().toISOString();
            n.read = true;
            if (wasUnread) state.stats.unread = Math.max(0, state.stats.unread - 1);
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
        state.stats.unread = 0;
      })
      .addCase(deleteNotificationThunk.fulfilled, (state, action) => {
        const removed = state.items.find((n) => n && n.id === action.payload);
        state.items = state.items.filter((n) => n && n.id !== action.payload);
        if (removed) {
          state.stats.all = Math.max(0, state.stats.all - 1);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
          if (!removed.read_at && !removed.read) state.stats.unread = Math.max(0, state.stats.unread - 1);
        }
      })
      .addCase(clearAllNotificationsThunk.fulfilled, (state) => {
        state.items = [];
        state.pagination = { ...state.pagination, page: 1, total: 0, totalPages: 1 };
        state.stats = { all: 0, unread: 0, critical: 0, warning: 0, info: 0 };
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
export const selectNotificationPagination = (state) => state.notifications.pagination;
export const selectNotificationStats = (state) => state.notifications.stats;
export const selectUnreadNotificationsCount = (state) =>
  state.notifications?.stats?.unread ?? (state.notifications?.items || []).filter((n) => n && !n.read_at && !n.read).length;



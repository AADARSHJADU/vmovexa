import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../../api/services/shared/notification.service.js';

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetch',
  async (params, { rejectWithValue }) => {
    try { return await notificationService.getNotifications(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchNotificationSettingsThunk = createAsyncThunk(
  'notifications/fetchSettings',
  async (_, { rejectWithValue }) => {
    try { return await notificationService.getSettings(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateNotificationSettingsThunk = createAsyncThunk(
  'notifications/updateSettings',
  async (data, { rejectWithValue }) => {
    try { return await notificationService.updateSettings(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try { await notificationService.markRead(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try { await notificationService.markAllRead(); return true; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteNotificationThunk = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try { await notificationService.deleteNotification(id); return id; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const clearAllNotificationsThunk = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try { await notificationService.clearAll(); return true; }
    catch (err) { return rejectWithValue(err); }
  }
);

export const toggleNotificationPreferenceThunk = createAsyncThunk(
  'notifications/togglePreference',
  async ({ eventTypeId, enabled }, { rejectWithValue }) => {
    try {
      await notificationService.togglePreference(eventTypeId, enabled);
      return { eventTypeId, enabled };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSmtpConfigThunk = createAsyncThunk(
  'notifications/fetchSmtpConfig',
  async (_, { rejectWithValue }) => {
    try { return await notificationService.getSmtpConfig(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateSmtpConfigThunk = createAsyncThunk(
  'notifications/updateSmtpConfig',
  async (data, { rejectWithValue }) => {
    try { return await notificationService.updateSmtpConfig(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const testEmailThunk = createAsyncThunk(
  'notifications/testEmail',
  async (data, { rejectWithValue }) => {
    try { return await notificationService.testEmail(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const sendTestPushThunk = createAsyncThunk(
  'notifications/sendTestPush',
  async (_, { rejectWithValue }) => {
    try { return await notificationService.sendTestPush(); }
    catch (err) { return rejectWithValue(err); }
  }
);


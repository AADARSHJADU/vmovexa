import { createAsyncThunk } from '@reduxjs/toolkit';
import { notificationLogService } from '../../api/services/notificationLog.service';
import { normalizeError } from '../../utils/apiResponse';

export const fetchNotificationLogsThunk = createAsyncThunk(
  'notificationLogs/fetchLogs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await notificationLogService.fetchLogs(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchNotificationLogStatsThunk = createAsyncThunk(
  'notificationLogs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationLogService.fetchStats();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const retryNotificationLogThunk = createAsyncThunk(
  'notificationLogs/retryLog',
  async (id, { rejectWithValue }) => {
    try {
      const res = await notificationLogService.retryLog(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

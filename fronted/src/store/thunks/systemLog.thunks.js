import { createAsyncThunk } from '@reduxjs/toolkit';
import { systemLogService } from '../../api/services/systemLog.service';
import { normalizeError } from '../../utils/apiResponse';

export const fetchServerStatusThunk = createAsyncThunk(
  'systemLogs/fetchServerStatus',
  async (_, { rejectWithValue }) => {
    try {
      const res = await systemLogService.fetchServerStatus();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchLiveLogsThunk = createAsyncThunk(
  'systemLogs/fetchLiveLogs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await systemLogService.fetchLiveLogs(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const triggerCronJobThunk = createAsyncThunk(
  'systemLogs/triggerCron',
  async (jobKey, { rejectWithValue }) => {
    try {
      const res = await systemLogService.triggerCron(jobKey);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const deleteLiveLogsThunk = createAsyncThunk(
  'systemLogs/deleteLiveLogs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await systemLogService.deleteLiveLogs(params);
      return { ...res.data, params };
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const fetchDiskLogsThunk = createAsyncThunk(
  'systemLogs/fetchDiskLogs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await systemLogService.fetchDiskLogs();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const readDiskLogThunk = createAsyncThunk(
  'systemLogs/readDiskLog',
  async (params, { rejectWithValue }) => {
    try {
      const res = await systemLogService.readDiskLogFile(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const deleteDiskLogsThunk = createAsyncThunk(
  'systemLogs/deleteDiskLogs',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await systemLogService.deleteDiskLogs(payload);
      // Automatically refresh disk logs after successful delete
      dispatch(fetchDiskLogsThunk());
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);


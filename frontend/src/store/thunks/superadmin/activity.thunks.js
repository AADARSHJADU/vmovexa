import { createAsyncThunk } from '@reduxjs/toolkit';
import { superActivityService } from '../../../api/services/superadmin/activity.service.js';

export const fetchActivityLogsThunk = createAsyncThunk(
  'superadmin/activity/fetchActivityLogs',
  async (params, { rejectWithValue }) => {
    try { return await superActivityService.getActivityLogs(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchLogCategoriesThunk = createAsyncThunk(
  'superadmin/activity/fetchCategories',
  async (_, { rejectWithValue }) => {
    try { return await superActivityService.getCategories(); }
    catch (err) { return rejectWithValue(err); }
  }
);

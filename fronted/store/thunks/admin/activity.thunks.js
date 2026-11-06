import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminActivityService } from '../../../api/services/admin/activity.service.js';

export const fetchActivityLogsThunk = createAsyncThunk(
  'admin/activity/fetchLogs',
  async (params, { rejectWithValue }) => {
    try { return await adminActivityService.getActivityLogs(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  'admin/activity/fetchCategories',
  async (_, { rejectWithValue }) => {
    try { return await adminActivityService.getCategories(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFiltersThunk = createAsyncThunk(
  'admin/activity/fetchFilters',
  async (_, { rejectWithValue }) => {
    try { return await adminActivityService.getFilters(); }
    catch (err) { return rejectWithValue(err); }
  }
);

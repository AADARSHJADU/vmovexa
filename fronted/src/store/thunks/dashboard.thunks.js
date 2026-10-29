import { createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../../api/services/dashboard.service.js';

export const fetchSuperAdminKpisThunk = createAsyncThunk(
  'dashboard/fetchSuperAdminKpis',
  async (_, { rejectWithValue }) => {
    try { return await dashboardService.getSuperAdminKpis(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchAdminKpisThunk = createAsyncThunk(
  'dashboard/fetchAdminKpis',
  async (params, { rejectWithValue }) => {
    try { return await dashboardService.getAdminKpis(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchLiveSummaryThunk = createAsyncThunk(
  'dashboard/fetchLiveSummary',
  async (_, { rejectWithValue }) => {
    try { return await dashboardService.getLiveSummary(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchSystemHealthThunk = createAsyncThunk(
  'dashboard/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try { return await dashboardService.getSystemHealth(); }
    catch (err) { return rejectWithValue(err); }
  }
);

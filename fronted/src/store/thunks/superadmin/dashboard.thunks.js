import { createAsyncThunk } from '@reduxjs/toolkit';
import { superDashboardService } from '../../../api/services/superadmin/dashboard.service.js';

export const fetchSuperAdminKpisThunk = createAsyncThunk(
  'superadmin/dashboard/fetchSuperAdminKpis',
  async (_, { rejectWithValue }) => {
    try { return await superDashboardService.getSuperAdminKpis(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchLiveSummaryThunk = createAsyncThunk(
  'superadmin/dashboard/fetchLiveSummary',
  async (_, { rejectWithValue }) => {
    try { return await superDashboardService.getLiveSummary(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchSystemHealthThunk = createAsyncThunk(
  'superadmin/dashboard/fetchSystemHealth',
  async (_, { rejectWithValue }) => {
    try { return await superDashboardService.getSystemHealth(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchLiveTrackingThunk = createAsyncThunk(
  'superadmin/dashboard/fetchLiveTracking',
  async (params, { rejectWithValue }) => {
    try { return await superDashboardService.getLiveTracking(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTrackingRoutesThunk = createAsyncThunk(
  'superadmin/dashboard/fetchTrackingRoutes',
  async (_, { rejectWithValue }) => {
    try { return await superDashboardService.getTrackingRoutes(); }
    catch (err) { return rejectWithValue(err); }
  }
);


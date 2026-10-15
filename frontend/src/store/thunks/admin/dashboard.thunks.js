import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminDashboardService } from '../../../api/services/admin/dashboard.service.js';

export const fetchAdminKpisThunk = createAsyncThunk(
  'admin/dashboard/fetchAdminKpis',
  async (params, { rejectWithValue }) => {
    try { return await adminDashboardService.getAdminKpis(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

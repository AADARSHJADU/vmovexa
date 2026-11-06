import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminRevenueService } from '../../../api/services/admin/revenue.service.js';

export const fetchAdminRevenueSummaryThunk = createAsyncThunk(
  'admin/revenue/fetchRevenueSummary',
  async (params, { rejectWithValue }) => {
    try { return await adminRevenueService.getRevenueSummary(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

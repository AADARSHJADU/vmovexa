import { createAsyncThunk } from '@reduxjs/toolkit';
import { superBillingService } from '../../../api/services/superadmin/billing.service.js';

export const fetchRevenueSummaryThunk = createAsyncThunk(
  'superadmin/billing/fetchRevenueSummary',
  async (params, { rejectWithValue }) => {
    try { return await superBillingService.getRevenueSummary(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchSettlementsThunk = createAsyncThunk(
  'superadmin/billing/fetchSettlements',
  async (params, { rejectWithValue }) => {
    try { return await superBillingService.getSettlements(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTopTenantsThunk = createAsyncThunk(
  'superadmin/billing/fetchTopTenants',
  async (params, { rejectWithValue }) => {
    try { return await superBillingService.getTopTenants(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

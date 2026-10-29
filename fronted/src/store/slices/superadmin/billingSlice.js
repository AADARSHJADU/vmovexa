import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRevenueSummaryThunk,
  fetchSettlementsThunk,
  fetchTopTenantsThunk,
} from '../../thunks/superadmin/billing.thunks.js';

export {
  fetchRevenueSummaryThunk,
  fetchSettlementsThunk,
  fetchTopTenantsThunk,
};

const initialState = {
  revenueSummary: null,
  settlements: [],
  topTenants: [],
  status: 'idle',
  error: null,
};

const superBillingSlice = createSlice({
  name: 'superBilling',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueSummaryThunk.fulfilled, (state, action) => {
        state.revenueSummary = action.payload;
      })
      .addCase(fetchSettlementsThunk.fulfilled, (state, action) => {
        state.settlements = Array.isArray(action.payload)
          ? action.payload
          : (Array.isArray(action.payload?.rows)
            ? action.payload.rows
            : (Array.isArray(action.payload?.data) ? action.payload.data : []));
      })
      .addCase(fetchTopTenantsThunk.fulfilled, (state, action) => {
        state.topTenants = Array.isArray(action.payload)
          ? action.payload
          : (Array.isArray(action.payload?.rows)
            ? action.payload.rows
            : (Array.isArray(action.payload?.data) ? action.payload.data : []));
      });
  },
});

export default superBillingSlice.reducer;
export const selectSuperRevenueSummary = (state) => state.superBilling.revenueSummary;
export const selectSuperSettlements = (state) => state.superBilling.settlements;
export const selectSuperTopTenants = (state) => state.superBilling.topTenants;

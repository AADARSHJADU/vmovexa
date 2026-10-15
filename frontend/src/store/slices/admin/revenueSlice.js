import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminRevenueSummaryThunk } from '../../thunks/admin/revenue.thunks.js';

export { fetchAdminRevenueSummaryThunk };

const initialState = {
  revenueSummary: null,
  status: 'idle',
  error: null,
};

const adminRevenueSlice = createSlice({
  name: 'adminRevenue',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRevenueSummaryThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdminRevenueSummaryThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.revenueSummary = action.payload;
      });
  },
});

export default adminRevenueSlice.reducer;
export const selectAdminRevenueSummary = (state) => state.adminRevenue.revenueSummary;

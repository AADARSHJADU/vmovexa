import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminKpisThunk } from '../../thunks/admin/dashboard.thunks.js';

export { fetchAdminKpisThunk };

const initialState = {
  adminKpis: null,
  status: 'idle',
  error: null,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminKpisThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdminKpisThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.adminKpis = action.payload;
      })
      .addCase(fetchAdminKpisThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default adminDashboardSlice.reducer;
export const selectAdminKpisData = (state) => state.adminDashboard.adminKpis;
export const selectAdminDashboardLoading = (state) => state.adminDashboard.status === 'loading';

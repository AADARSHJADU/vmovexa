import { createSlice } from '@reduxjs/toolkit';
import { fetchReportsThunk, generateReportThunk } from '../../thunks/admin/report.thunks.js';

export { fetchReportsThunk, generateReportThunk };

const initialState = {
  reports: [],
  status: 'idle',
  error: null,
};

const adminReportSlice = createSlice({
  name: 'adminReport',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReportsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload;
      });
  },
});

export default adminReportSlice.reducer;
export const selectAdminReports = (state) => state.adminReport.reports;

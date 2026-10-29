import { createSlice } from '@reduxjs/toolkit';
import {
  fetchReportsThunk,
  fetchReportByIdThunk,
  generateReportThunk,
  deleteReportThunk,
  fetchExportsThunk,
  createExportThunk,
} from '../../thunks/shared/report.thunks.js';

export {
  fetchReportsThunk,
  fetchReportByIdThunk,
  generateReportThunk,
  deleteReportThunk,
  fetchExportsThunk,
  createExportThunk,
};

const initialState = {
  reports: [],
  reportsPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  currentReport: null,
  exports: [],
  status: 'idle',
  error: null,
};

const reportSlice = createSlice({
  name: 'reportsShared',
  initialState,
  reducers: {
    clearCurrentReport: (state) => { state.currentReport = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReportsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = Array.isArray(action.payload) ? action.payload : (action.payload?.rows || []);
        if (action.payload?.meta) {
          state.reportsPagination = action.payload.meta;
        }
      })
      .addCase(fetchReportByIdThunk.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      })
      .addCase(generateReportThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const list = Array.isArray(state.reports) ? state.reports : [];
          state.reports = [action.payload, ...list.filter((r) => r.id !== action.payload.id)];
        }
      })
      .addCase(deleteReportThunk.fulfilled, (state, action) => {
        const deletedId = action.payload?.id || action.meta?.arg;
        if (deletedId && Array.isArray(state.reports)) {
          state.reports = state.reports.filter((r) => String(r.id) !== String(deletedId));
        }
      })
      .addCase(fetchExportsThunk.fulfilled, (state, action) => { state.exports = action.payload; });
  },
});

export const { clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer;
export const selectSharedReports = (state) => state.reportsShared.reports;
export const selectSharedReportsPagination = (state) => state.reportsShared.reportsPagination;
export const selectSharedCurrentReport = (state) => state.reportsShared.currentReport;
export const selectSharedExports = (state) => state.reportsShared.exports;

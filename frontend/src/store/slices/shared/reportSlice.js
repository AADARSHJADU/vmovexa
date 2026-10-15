import { createSlice } from '@reduxjs/toolkit';
import {
  fetchReportsThunk,
  generateReportThunk,
  fetchExportsThunk,
  createExportThunk,
} from '../../thunks/shared/report.thunks.js';

export {
  fetchReportsThunk,
  generateReportThunk,
  fetchExportsThunk,
  createExportThunk,
};

const initialState = {
  reports: [],
  exports: [],
  status: 'idle',
  error: null,
};

const reportSlice = createSlice({
  name: 'reportsShared',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReportsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reports = action.payload;
      })
      .addCase(fetchExportsThunk.fulfilled, (state, action) => { state.exports = action.payload; });
  },
});

export default reportSlice.reducer;
export const selectSharedReports = (state) => state.reportsShared.reports;
export const selectSharedExports = (state) => state.reportsShared.exports;

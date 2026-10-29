import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminReportService } from '../../../api/services/admin/report.service.js';

export const fetchReportsThunk = createAsyncThunk(
  'admin/report/fetchReports',
  async (params, { rejectWithValue }) => {
    try { return await adminReportService.getReports(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const generateReportThunk = createAsyncThunk(
  'admin/report/generateReport',
  async (data, { rejectWithValue }) => {
    try { return await adminReportService.generateReport(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

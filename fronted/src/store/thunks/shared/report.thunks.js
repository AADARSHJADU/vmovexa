import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportService } from '../../../api/services/shared/report.service.js';

export const fetchReportsThunk = createAsyncThunk(
  'reports/fetch',
  async (params, { rejectWithValue }) => {
    try { return await reportService.getReports(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchReportByIdThunk = createAsyncThunk(
  'reports/fetchById',
  async (id, { rejectWithValue }) => {
    try { return await reportService.getReport(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const generateReportThunk = createAsyncThunk(
  'reports/generate',
  async ({ reportType, params }, { rejectWithValue }) => {
    try { return await reportService.generateReport(reportType, params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteReportThunk = createAsyncThunk(
  'reports/delete',
  async (id, { rejectWithValue }) => {
    try { return await reportService.deleteReport(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchExportsThunk = createAsyncThunk(
  'reports/fetchExports',
  async (params, { rejectWithValue }) => {
    try { return await reportService.getExports(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createExportThunk = createAsyncThunk(
  'reports/createExport',
  async (data, { rejectWithValue }) => {
    try { return await reportService.createExport(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

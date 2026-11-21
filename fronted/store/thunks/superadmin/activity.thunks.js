import { createAsyncThunk } from '@reduxjs/toolkit';
import { superActivityService } from '../../../api/services/superadmin/activity.service.js';

export const fetchActivityLogsThunk = createAsyncThunk(
  'superadmin/activity/fetchActivityLogs',
  async (params, { rejectWithValue }) => {
    try { return await superActivityService.getActivityLogs(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchLogCategoriesThunk = createAsyncThunk(
  'superadmin/activity/fetchCategories',
  async (_, { rejectWithValue }) => {
    try { return await superActivityService.getCategories(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const exportActivityLogsThunk = createAsyncThunk(
  'superadmin/activity/exportAllLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const pageSize = 100;
      const first = await superActivityService.getActivityLogs({ ...params, page: 1, limit: pageSize });
      const allRows = [...(first?.rows || [])];
      const totalPages = Math.min(Number(first?.meta?.totalPages || 1), 50);
      for (let p = 2; p <= totalPages; p += 1) {
        const next = await superActivityService.getActivityLogs({ ...params, page: p, limit: pageSize });
        if (Array.isArray(next?.rows) && next.rows.length > 0) {
          allRows.push(...next.rows);
        } else {
          break;
        }
      }
      return allRows;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

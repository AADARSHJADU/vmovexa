import { createSlice } from '@reduxjs/toolkit';
import {
  fetchActivityLogsThunk,
  fetchLogCategoriesThunk,
  exportActivityLogsThunk,
} from '../../thunks/superadmin/activity.thunks.js';

export {
  fetchActivityLogsThunk,
  fetchLogCategoriesThunk,
  exportActivityLogsThunk,
};

const initialState = {
  logs: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  counts: null,
  categories: [],
  status: 'idle',
  error: null,
};

const superActivitySlice = createSlice({
  name: 'superActivity',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchActivityLogsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.logs = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
          state.counts = action.payload.meta?.counts || null;
        } else if (action.payload && Array.isArray(action.payload.items)) {
          state.logs = action.payload.items;
          state.pagination = action.payload.meta || state.pagination;
          state.counts = action.payload.meta?.counts || null;
        } else if (Array.isArray(action.payload)) {
          state.logs = action.payload;
        } else {
          state.logs = [];
        }
      })
      .addCase(fetchActivityLogsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || null;
      })
      .addCase(fetchLogCategoriesThunk.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default superActivitySlice.reducer;
export const selectSuperActivityLogs = (state) => state.superActivity.logs;
export const selectSuperActivityPagination = (state) => state.superActivity.pagination;
export const selectSuperActivityCounts = (state) => state.superActivity.counts;
export const selectSuperActivityCategories = (state) => state.superActivity.categories;
export const selectSuperActivityLoading = (state) => state.superActivity.status === 'loading';

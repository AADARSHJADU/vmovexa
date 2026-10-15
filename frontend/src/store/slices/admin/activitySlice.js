import { createSlice } from '@reduxjs/toolkit';
import { fetchActivityLogsThunk, fetchCategoriesThunk, fetchFiltersThunk } from '../../thunks/admin/activity.thunks.js';

export { fetchActivityLogsThunk, fetchCategoriesThunk, fetchFiltersThunk };

const initialState = {
  logs: [],
  categories: [],
  filters: {
    categories: [],
    events: [],
    severities: [],
  },
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminActivitySlice = createSlice({
  name: 'adminActivity',
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
        } else if (Array.isArray(action.payload)) {
          state.logs = action.payload;
        } else {
          state.logs = [];
        }
      })
      .addCase(fetchActivityLogsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFiltersThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.filters = {
            categories: Array.isArray(action.payload.categories) ? action.payload.categories : [],
            events: Array.isArray(action.payload.events) ? action.payload.events : [],
            severities: Array.isArray(action.payload.severities) ? action.payload.severities : [],
          };
          if (Array.isArray(action.payload.categories) && action.payload.categories.length) {
            state.categories = action.payload.categories;
          }
        }
      });
  },
});

export default adminActivitySlice.reducer;
export const selectAdminActivityLogs = (state) => state.adminActivity.logs;
export const selectAdminActivityCategories = (state) => state.adminActivity.categories;
export const selectAdminActivityFilters = (state) => state.adminActivity.filters;
export const selectAdminActivityLoading = (state) => state.adminActivity.status === 'loading';
export const selectAdminActivityPagination = (state) => state.adminActivity.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

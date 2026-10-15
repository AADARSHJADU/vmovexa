import { createSlice } from '@reduxjs/toolkit';
import {
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
} from '../../thunks/superadmin/organization.thunks.js';

export {
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
};

const initialState = {
  organizations: [],
  currentOrganization: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  counts: { all: 0, pending: 0, payment_pending: 0, active: 0, suspended: 0 },
  status: 'idle',
  error: null,
};

const superOrganizationSlice = createSlice({
  name: 'superOrganization',
  initialState,
  reducers: {
    clearSuperOrganizationError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrganizationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.organizations = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
          if (action.payload.meta?.counts) {
            state.counts = action.payload.meta.counts;
          }
        } else if (Array.isArray(action.payload)) {
          state.organizations = action.payload;
        } else {
          state.organizations = [];
        }
      })
      .addCase(fetchOrganizationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchOrganizationThunk.fulfilled, (state, action) => {
        state.currentOrganization = action.payload;
      })
      .addCase(createOrganizationThunk.fulfilled, (state, action) => {
        const newOrg = action.payload?.organization || action.payload?.org || (action.payload?.id ? action.payload : null);
        if (newOrg) {
          state.organizations.unshift(newOrg);
          if (state.counts) {
            state.counts.all = (state.counts.all || 0) + 1;
            if (newOrg.status === 'active') state.counts.active = (state.counts.active || 0) + 1;
            else if (newOrg.status === 'pending_approval') state.counts.pending = (state.counts.pending || 0) + 1;
          }
        }
      })
      .addCase(updateOrganizationThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentOrganization = action.payload;
          const index = state.organizations.findIndex(org => org.id === action.payload.id);
          if (index !== -1) { state.organizations[index] = action.payload; }
        }
      })
      .addCase(updateOrganizationStatusThunk.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(org => org.id === action.payload.id);
        if (index !== -1) { state.organizations[index] = action.payload; }
      });
  },
});

export const { clearSuperOrganizationError } = superOrganizationSlice.actions;
export default superOrganizationSlice.reducer;

export const selectSuperOrganizations = (state) => state.superOrganization.organizations;
export const selectSuperCurrentOrganization = (state) => state.superOrganization.currentOrganization;
export const selectSuperOrganizationLoading = (state) => state.superOrganization.status === 'loading';
export const selectSuperOrganizationPagination = (state) => state.superOrganization.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectSuperOrganizationCounts = (state) => state.superOrganization.counts || { all: 0, pending: 0, active: 0, suspended: 0 };


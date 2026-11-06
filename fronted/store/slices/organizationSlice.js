import { createSlice } from '@reduxjs/toolkit';
import {
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
  fetchOrganizationFeaturesThunk,
  updateOrganizationFeaturesThunk,
} from '../thunks/organization.thunks.js';

export {
  fetchOrganizationsThunk,
  fetchOrganizationThunk,
  createOrganizationThunk,
  updateOrganizationThunk,
  updateOrganizationStatusThunk,
  fetchOrganizationFeaturesThunk,
  updateOrganizationFeaturesThunk,
};

const initialState = {
  organizations: [],
  currentOrganization: null,
  currentFeatures: null,
  status: 'idle', // idle | loading | succeeded | failed
  actionStatus: 'idle',
  error: null,
  actionError: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    clearOrganizationError(state) {
      state.error = null;
      state.actionError = null;
    },
    clearCurrentOrganization(state) {
      state.currentOrganization = null;
      state.currentFeatures = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Organizations List
      .addCase(fetchOrganizationsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrganizationsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.organizations = action.payload; // Assumes array is returned
      })
      .addCase(fetchOrganizationsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Organization
      .addCase(fetchOrganizationThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrganizationThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrganization = action.payload;
      })
      .addCase(fetchOrganizationThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Organization
      .addCase(createOrganizationThunk.pending, (state) => { state.actionStatus = 'loading'; })
      .addCase(createOrganizationThunk.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        const newOrg = action.payload?.organization || action.payload?.org || (action.payload?.id ? action.payload : null);
        if (newOrg) {
          state.organizations.unshift(newOrg);
        }
      })
      .addCase(createOrganizationThunk.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })

      // Update Organization Status
      .addCase(updateOrganizationStatusThunk.pending, (state) => { state.actionStatus = 'loading'; })
      .addCase(updateOrganizationStatusThunk.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        // Update in list
        const index = state.organizations.findIndex(org => org.id === action.payload.id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        // Update current if viewing
        if (state.currentOrganization && state.currentOrganization.id === action.payload.id) {
          state.currentOrganization = action.payload;
        }
      })
      .addCase(updateOrganizationStatusThunk.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload;
      })

      // Fetch Features
      .addCase(fetchOrganizationFeaturesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrganizationFeaturesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentFeatures = action.payload;
      })
      .addCase(fetchOrganizationFeaturesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearOrganizationError, clearCurrentOrganization } = organizationSlice.actions;
export default organizationSlice.reducer;

// Selectors
export const selectOrganizations = (state) => state.organization.organizations;
export const selectCurrentOrganization = (state) => state.organization.currentOrganization;
export const selectCurrentFeatures = (state) => state.organization.currentFeatures;
export const selectOrganizationStatus = (state) => state.organization.status;
export const selectOrganizationError = (state) => state.organization.error;
export const selectOrganizationActionStatus = (state) => state.organization.actionStatus;
export const selectOrganizationActionError = (state) => state.organization.actionError;
export const selectOrganizationLoading = (state) => state.organization.status === 'loading';

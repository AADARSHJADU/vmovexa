import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSuperGovernmentAgenciesThunk,
  fetchSuperGovernmentAgencyThunk,
  createSuperGovernmentAgencyThunk,
  updateSuperGovernmentAgencyThunk,
  deleteSuperGovernmentAgencyThunk,
  updateSuperAgencyStatusThunk,
  deleteSuperGovernmentDocumentThunk,
} from '../../thunks/superadmin/government.thunks.js';

export {
  fetchSuperGovernmentAgenciesThunk,
  fetchSuperGovernmentAgencyThunk,
  createSuperGovernmentAgencyThunk,
  updateSuperGovernmentAgencyThunk,
  deleteSuperGovernmentAgencyThunk,
  updateSuperAgencyStatusThunk,
  deleteSuperGovernmentDocumentThunk,
};

const initialState = {
  agencies: [],
  currentAgency: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const superGovernmentSlice = createSlice({
  name: 'superGovernment',
  initialState,
  reducers: {
    setCurrentAgency: (state, action) => {
      state.currentAgency = action.payload;
    },
    resetCurrentAgency: (state) => {
      state.currentAgency = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchSuperGovernmentAgenciesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperGovernmentAgenciesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.agencies = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.agencies = action.payload;
        } else {
          state.agencies = [];
        }
      })
      .addCase(fetchSuperGovernmentAgenciesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Agency
      .addCase(fetchSuperGovernmentAgencyThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperGovernmentAgencyThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentAgency = action.payload;
      })
      .addCase(fetchSuperGovernmentAgencyThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create
      .addCase(createSuperGovernmentAgencyThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.agencies = [action.payload, ...(state.agencies || [])];
        }
      })

      // Update
      .addCase(updateSuperGovernmentAgencyThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.agencies = (state.agencies || []).map((agency) =>
            agency.id === updated.id ? { ...agency, ...updated } : agency
          );
          if (state.currentAgency?.id === updated.id) {
            state.currentAgency = { ...state.currentAgency, ...updated };
          }
        }
      })

      // Delete
      .addCase(deleteSuperGovernmentAgencyThunk.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;
        state.agencies = (state.agencies || []).filter((agency) => agency.id !== deletedId);
        if (state.currentAgency?.id === deletedId) {
          state.currentAgency = null;
        }
      })

      // Status
      .addCase(updateSuperAgencyStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.agencies = (state.agencies || []).map((agency) =>
            agency.id === updated.id || agency.user_id === updated.id || agency.user?.id === updated.id
              ? { ...agency, status: updated.status, ...(agency.user ? { user: { ...agency.user, status: updated.status } } : {}) }
              : agency
          );
          if (state.currentAgency?.id === updated.id) {
            state.currentAgency = { ...state.currentAgency, status: updated.status };
          }
        }
      })

      // Delete Document
      .addCase(deleteSuperGovernmentDocumentThunk.fulfilled, (state, action) => {
        const deletedDocId = action.meta.arg;
        if (state.currentAgency?.documents) {
          state.currentAgency.documents = state.currentAgency.documents.filter((d) => d.id !== deletedDocId);
        }
      });
  },
});

export const { setCurrentAgency, resetCurrentAgency } = superGovernmentSlice.actions;
export default superGovernmentSlice.reducer;

export const selectSuperAgencies = (state) => state.superGovernment?.agencies || [];
export const selectCurrentAgency = (state) => state.superGovernment?.currentAgency;
export const selectSuperAgencyLoading = (state) => state.superGovernment?.status === 'loading';
export const selectSuperAgenciesPagination = (state) => state.superGovernment?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSuperFinanceOfficersThunk,
  fetchSuperFinanceOfficerThunk,
  registerSuperFinanceOfficerThunk,
  updateSuperFinanceOfficerStatusThunk,
  updateSuperFinanceOfficerThunk,
  deleteSuperFinanceOfficerThunk,
} from '../../thunks/superadmin/financeOfficer.thunks.js';

export {
  fetchSuperFinanceOfficersThunk,
  fetchSuperFinanceOfficerThunk,
  registerSuperFinanceOfficerThunk,
  updateSuperFinanceOfficerStatusThunk,
  updateSuperFinanceOfficerThunk,
  deleteSuperFinanceOfficerThunk,
};

const initialState = {
  financeOfficers: [],
  currentOfficer: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const superFinanceOfficerSlice = createSlice({
  name: 'superFinanceOfficer',
  initialState,
  reducers: {
    setCurrentOfficer: (state, action) => {
      state.currentOfficer = action.payload;
    },
    resetCurrentOfficer: (state) => {
      state.currentOfficer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchSuperFinanceOfficersThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperFinanceOfficersThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.financeOfficers = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.financeOfficers = action.payload;
        } else {
          state.financeOfficers = [];
        }
      })
      .addCase(fetchSuperFinanceOfficersThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Single Officer
      .addCase(fetchSuperFinanceOfficerThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperFinanceOfficerThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOfficer = action.payload;
      })
      .addCase(fetchSuperFinanceOfficerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Register / Create
      .addCase(registerSuperFinanceOfficerThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.financeOfficers = [action.payload, ...(state.financeOfficers || [])];
        }
      })

      // Status
      .addCase(updateSuperFinanceOfficerStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.financeOfficers = (state.financeOfficers || []).map((officer) =>
            officer.id === updated.id
              ? { ...officer, status: updated.status }
              : officer
          );
          if (state.currentOfficer?.id === updated.id) {
            state.currentOfficer = { ...state.currentOfficer, status: updated.status };
          }
        }
      })

      // Update
      .addCase(updateSuperFinanceOfficerThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.financeOfficers = (state.financeOfficers || []).map((officer) =>
            officer.id === updated.id
              ? { ...officer, ...updated }
              : officer
          );
          if (state.currentOfficer?.id === updated.id) {
            state.currentOfficer = { ...state.currentOfficer, ...updated };
          }
        }
      })

      // Delete
      .addCase(deleteSuperFinanceOfficerThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.financeOfficers = (state.financeOfficers || []).filter(
          (officer) => officer.id !== id
        );
        if (state.currentOfficer?.id === id) {
          state.currentOfficer = null;
        }
      });
  },
});

export const { setCurrentOfficer, resetCurrentOfficer } = superFinanceOfficerSlice.actions;
export default superFinanceOfficerSlice.reducer;

export const selectSuperFinanceOfficers = (state) => state.superFinanceOfficer?.financeOfficers || [];
export const selectCurrentFinanceOfficer = (state) => state.superFinanceOfficer?.currentOfficer;
export const selectSuperFinanceOfficerLoading = (state) => state.superFinanceOfficer?.status === 'loading';
export const selectSuperFinanceOfficerPagination = (state) =>
  state.superFinanceOfficer?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
export const selectSuperFinanceOfficerStatus = (state) => state.superFinanceOfficer?.status || 'idle';

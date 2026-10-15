import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDepotsThunk,
  createDepotThunk,
  updateDepotThunk,
  deleteDepotThunk,
  updateDepotStatusThunk,
} from '../../thunks/admin/depot.thunks.js';

export {
  fetchDepotsThunk,
  createDepotThunk,
  updateDepotThunk,
  deleteDepotThunk,
  updateDepotStatusThunk,
};

const initialState = {
  depots: [],
  selectedDepot: null,
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminDepotSlice = createSlice({
  name: 'adminDepot',
  initialState,
  reducers: {
    clearSelectedDepot: (state) => {
      state.selectedDepot = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepotsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDepotsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.depots = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.depots = action.payload;
        } else {
          state.depots = [];
        }
      })
      .addCase(fetchDepotsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createDepotThunk.fulfilled, (state, action) => {
        if (action.payload) state.depots.unshift(action.payload);
      })
      .addCase(updateDepotThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.depots.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) state.depots[index] = { ...state.depots[index], ...action.payload };
        }
      })
      .addCase(deleteDepotThunk.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.depots = state.depots.filter((d) => d.id !== id);
      })
      .addCase(updateDepotStatusThunk.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;
        const target = state.depots.find((d) => d.id === id);
        if (target) target.status = status;
      });
  },
});

export const { clearSelectedDepot } = adminDepotSlice.actions;

export default adminDepotSlice.reducer;
export const selectAdminDepots = (state) => state.adminDepot.depots;
export const selectSelectedDepot = (state) => state.adminDepot.selectedDepot;
export const selectAdminDepotLoading = (state) => state.adminDepot.status === 'loading';
export const selectAdminDepotPagination = (state) => state.adminDepot.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };

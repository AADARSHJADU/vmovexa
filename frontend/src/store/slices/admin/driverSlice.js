import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDriversThunk,
  createDriverThunk,
  updateDriverThunk,
  verifyDriverThunk,
  approveDriverThunk,
  rejectDriverThunk,
  verifyDriverDocumentsThunk,
  updateDriverStatusThunk,
  deleteDriverThunk,
} from '../../thunks/admin/driver.thunks.js';

export {
  fetchDriversThunk,
  createDriverThunk,
  updateDriverThunk,
  verifyDriverThunk,
  approveDriverThunk,
  rejectDriverThunk,
  verifyDriverDocumentsThunk,
  updateDriverStatusThunk,
  deleteDriverThunk,
};


const initialState = {
  drivers: [],
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminDriverSlice = createSlice({
  name: 'adminDriver',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriversThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDriversThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.drivers = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.drivers = action.payload;
        } else {
          state.drivers = [];
        }
      })
      .addCase(fetchDriversThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.drivers.unshift(action.payload);
        }
      })
      .addCase(updateDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload };
          }
        }
      })
      .addCase(verifyDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload, aadhaar_verified: true, documents_verified: true };
          }
        }
      })
      .addCase(approveDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload, status: 'available', documents_verified: true };
          }
        }
      })
      .addCase(rejectDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload, status: 'rejected' };
          }
        }
      })
      .addCase(verifyDriverDocumentsThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload, documents_verified: true, aadhaar_verified: true };
          }
        }
      })
      .addCase(updateDriverStatusThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.drivers.findIndex((d) => d.id === action.payload.id);
          if (index !== -1) {
            state.drivers[index] = { ...state.drivers[index], ...action.payload };
          }
        }
      })
      .addCase(deleteDriverThunk.fulfilled, (state, action) => {
        const deletedId = action.meta?.arg;
        if (deletedId) {
          state.drivers = state.drivers.filter((d) => String(d.id) !== String(deletedId));
          if (state.pagination && typeof state.pagination.total === 'number') {
            state.pagination.total = Math.max(0, state.pagination.total - 1);
          }
        }
      });
  },
});

export default adminDriverSlice.reducer;
export const selectAdminDrivers = (state) => state.adminDriver.drivers;
export const selectAdminDriverLoading = (state) => state.adminDriver.status === 'loading';
export const selectAdminDriverPagination = (state) => state.adminDriver.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };


import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
  assignDriverThunk,
  assignGpsThunk,
  fetchVehicleTelemetryThunk,
  updateVehicleStatusThunk,
  approveVehicleThunk,
  rejectVehicleThunk,
} from '../../thunks/admin/vehicle.thunks.js';

export {
  fetchVehiclesThunk,
  createVehicleThunk,
  updateVehicleThunk,
  deleteVehicleThunk,
  assignDriverThunk,
  assignGpsThunk,
  fetchVehicleTelemetryThunk,
  updateVehicleStatusThunk,
  approveVehicleThunk,
  rejectVehicleThunk,
};

const initialState = {
  vehicles: [],
  selectedVehicle: null,
  vehicleTelemetry: null,
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const adminVehicleSlice = createSlice({
  name: 'adminVehicle',
  initialState,
  reducers: {
    clearSelectedVehicle: (state) => {
      state.selectedVehicle = null;
      state.vehicleTelemetry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehiclesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchVehiclesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.rows) {
          state.vehicles = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.vehicles = action.payload;
        } else {
          state.vehicles = [];
        }
      })
      .addCase(fetchVehiclesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createVehicleThunk.fulfilled, (state, action) => {
        if (action.payload) state.vehicles.unshift(action.payload);
      })
      .addCase(updateVehicleThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
          if (index !== -1) state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
        }
      })
      .addCase(deleteVehicleThunk.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.vehicles = state.vehicles.filter((v) => v.id !== id);
      })
      .addCase(assignDriverThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
          if (index !== -1) state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
        }
      })
      .addCase(assignGpsThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
          if (index !== -1) state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
        }
      })
      .addCase(fetchVehicleTelemetryThunk.fulfilled, (state, action) => {
        state.vehicleTelemetry = action.payload;
      })
      .addCase(updateVehicleStatusThunk.fulfilled, (state, action) => {
        const { id, status } = action.meta.arg;
        const target = state.vehicles.find((v) => v.id === id);
        if (target) target.status = status;
      })
      .addCase(approveVehicleThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
          if (index !== -1) state.vehicles[index] = { ...state.vehicles[index], ...action.payload, status: 'in_depot' };
        }
      })
      .addCase(rejectVehicleThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.vehicles.findIndex((v) => v.id === action.payload.id);
          if (index !== -1) state.vehicles[index] = { ...state.vehicles[index], ...action.payload, status: 'rejected' };
        }
      });
  },
});

export const { clearSelectedVehicle } = adminVehicleSlice.actions;

export default adminVehicleSlice.reducer;
export const selectAdminVehicles = (state) => state.adminVehicle.vehicles;
export const selectSelectedVehicle = (state) => state.adminVehicle.selectedVehicle;
export const selectVehicleTelemetry = (state) => state.adminVehicle.vehicleTelemetry;
export const selectAdminVehicleLoading = (state) => state.adminVehicle.status === 'loading';
export const selectAdminVehiclePagination = (state) => state.adminVehicle.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };

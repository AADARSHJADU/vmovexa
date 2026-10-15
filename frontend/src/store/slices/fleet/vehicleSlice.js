import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFleetVehiclesThunk,
  createFleetVehicleThunk,
  updateFleetVehicleThunk,
  assignVehicleDriverThunk,
  assignVehicleGpsThunk,
  fetchFleetVehicleTelemetryThunk,
} from '../../thunks/fleet/vehicle.thunks.js';

export {
  fetchFleetVehiclesThunk,
  createFleetVehicleThunk,
  updateFleetVehicleThunk,
  assignVehicleDriverThunk,
  assignVehicleGpsThunk,
  fetchFleetVehicleTelemetryThunk,
};

const initialState = {
  vehicles: [],
  pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
  vehicleTelemetry: null,
  status: 'idle',
  error: null,
};

const fleetVehicleSlice = createSlice({
  name: 'fleetVehicle',
  initialState,
  reducers: {
    clearTelemetry: (state) => {
      state.vehicleTelemetry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFleetVehiclesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFleetVehiclesThunk.fulfilled, (state, action) => {
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
      .addCase(fetchFleetVehiclesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchFleetVehicleTelemetryThunk.fulfilled, (state, action) => {
        state.vehicleTelemetry = action.payload;
      });
  },
});

export const { clearTelemetry } = fleetVehicleSlice.actions;
export default fleetVehicleSlice.reducer;
export const selectFleetVehicles = (state) => state.fleetVehicle.vehicles;
export const selectFleetVehiclePagination = (state) => state.fleetVehicle.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };
export const selectFleetVehicleTelemetry = (state) => state.fleetVehicle.vehicleTelemetry;


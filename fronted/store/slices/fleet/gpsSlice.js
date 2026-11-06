import { createSlice } from '@reduxjs/toolkit';
import {
  fetchGpsDevicesThunk,
  fetchGpsDeviceThunk,
  createGpsDeviceThunk,
  updateGpsDeviceThunk,
  assignGpsVehicleThunk,
  deleteGpsDeviceThunk,
  approveGpsDeviceThunk,
  rejectGpsDeviceThunk,
} from '../../thunks/fleet/gps.thunks.js';

export {
  fetchGpsDevicesThunk,
  fetchGpsDeviceThunk,
  createGpsDeviceThunk,
  updateGpsDeviceThunk,
  assignGpsVehicleThunk,
  deleteGpsDeviceThunk,
  approveGpsDeviceThunk,
  rejectGpsDeviceThunk,
};

const initialState = {
  devices: [],
  selectedDevice: null,
  status: 'idle',
  error: null,
};

const fleetGpsSlice = createSlice({
  name: 'fleetGps',
  initialState,
  reducers: {
    clearSelectedDevice: (state) => {
      state.selectedDevice = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGpsDevicesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchGpsDevicesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.devices = action.payload;
      })
      .addCase(fetchGpsDeviceThunk.fulfilled, (state, action) => {
        state.selectedDevice = action.payload;
      })
      .addCase(updateGpsDeviceThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.devices && Array.isArray(state.devices)) {
          state.devices = state.devices.map((d) => (d.id === updated.id ? updated : d));
        }
        if (state.selectedDevice?.id === updated.id) {
          state.selectedDevice = updated;
        }
      })
      .addCase(approveGpsDeviceThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.devices && Array.isArray(state.devices)) {
          state.devices = state.devices.map((d) => (d.id === updated.id ? updated : d));
        }
        if (state.selectedDevice?.id === updated.id) {
          state.selectedDevice = updated;
        }
      })
      .addCase(rejectGpsDeviceThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.devices && Array.isArray(state.devices)) {
          state.devices = state.devices.map((d) => (d.id === updated.id ? updated : d));
        }
        if (state.selectedDevice?.id === updated.id) {
          state.selectedDevice = updated;
        }
      })
      .addCase(deleteGpsDeviceThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        if (state.devices && Array.isArray(state.devices)) {
          state.devices = state.devices.filter((d) => d.id !== deletedId);
        }
        if (state.selectedDevice?.id === deletedId) {
          state.selectedDevice = null;
        }
      });
  },
});

export const { clearSelectedDevice } = fleetGpsSlice.actions;
export default fleetGpsSlice.reducer;
export const selectFleetGpsDevices = (state) => state.fleetGps.devices;
export const selectFleetGpsSelectedDevice = (state) => state.fleetGps.selectedDevice;

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchEdgeDevicesThunk,
  createEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  rebootEdgeDeviceThunk,
  fetchDisplaysThunk,
} from '../../thunks/superadmin/device.thunks.js';

export {
  fetchEdgeDevicesThunk,
  createEdgeDeviceThunk,
  updateEdgeDeviceThunk,
  deleteEdgeDeviceThunk,
  toggleEdgeDeviceActiveThunk,
  rebootEdgeDeviceThunk,
  fetchDisplaysThunk,
};

const initialState = {
  edgeDevices: [],
  displays: [],
  status: 'idle',
  error: null,
};

const superDeviceSlice = createSlice({
  name: 'superDevice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEdgeDevicesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchEdgeDevicesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.edgeDevices = action.payload;
      })
      .addCase(fetchDisplaysThunk.fulfilled, (state, action) => {
        state.displays = action.payload;
      });
  },
});

export default superDeviceSlice.reducer;
export const selectSuperEdgeDevices = (state) => state.superDevice.edgeDevices;
export const selectSuperDisplays = (state) => state.superDevice.displays;

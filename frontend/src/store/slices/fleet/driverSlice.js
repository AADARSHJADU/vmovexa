import { createSlice } from '@reduxjs/toolkit';
import { fetchFleetDriversThunk, createFleetDriverThunk, assignDriverBusThunk } from '../../thunks/fleet/driver.thunks.js';

export { fetchFleetDriversThunk, createFleetDriverThunk, assignDriverBusThunk };

const initialState = {
  drivers: [],
  status: 'idle',
  error: null,
};

const fleetDriverSlice = createSlice({
  name: 'fleetDriver',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFleetDriversThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFleetDriversThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.drivers = action.payload;
      });
  },
});

export default fleetDriverSlice.reducer;
export const selectFleetDrivers = (state) => state.fleetDriver.drivers;

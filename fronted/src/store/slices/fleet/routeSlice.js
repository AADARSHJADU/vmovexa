import { createSlice } from '@reduxjs/toolkit';
import { fetchRoutesThunk, createRouteThunk } from '../../thunks/fleet/route.thunks.js';

export { fetchRoutesThunk, createRouteThunk };

const initialState = {
  routes: [],
  status: 'idle',
  error: null,
};

const fleetRouteSlice = createSlice({
  name: 'fleetRoute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutesThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchRoutesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.routes = action.payload;
      });
  },
});

export default fleetRouteSlice.reducer;
export const selectFleetRoutes = (state) => state.fleetRoute.routes;

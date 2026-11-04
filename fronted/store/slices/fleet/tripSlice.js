import { createSlice } from '@reduxjs/toolkit';
import { fetchTripsThunk } from '../../thunks/fleet/trip.thunks.js';

export { fetchTripsThunk };

const initialState = {
  trips: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
};

const fleetTripSlice = createSlice({
  name: 'fleetTrip',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTripsThunk.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchTripsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload?.rows) {
          state.trips = action.payload.rows;
          state.pagination = action.payload.meta || state.pagination;
        } else if (Array.isArray(action.payload)) {
          state.trips = action.payload;
        }
      })
      .addCase(fetchTripsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch trips';
      });
  },
});

export default fleetTripSlice.reducer;
export const selectFleetTrips = (state) => state.fleetTrip.trips;
export const selectFleetTripsPagination = (state) => state.fleetTrip.pagination;
export const selectFleetTripsStatus = (state) => state.fleetTrip.status;


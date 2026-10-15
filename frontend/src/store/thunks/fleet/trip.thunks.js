import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetTripService } from '../../../api/services/fleet/trip.service.js';

export const fetchTripsThunk = createAsyncThunk(
  'fleet/trip/fetchTrips',
  async (params, { rejectWithValue }) => {
    try { return await fleetTripService.getTrips(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

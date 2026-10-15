import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetRouteService } from '../../../api/services/fleet/route.service.js';

export const fetchRoutesThunk = createAsyncThunk(
  'fleet/route/fetchRoutes',
  async (params, { rejectWithValue }) => {
    try { return await fleetRouteService.getRoutes(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createRouteThunk = createAsyncThunk(
  'fleet/route/createRoute',
  async (data, { rejectWithValue }) => {
    try { return await fleetRouteService.createRoute(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

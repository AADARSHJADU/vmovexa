import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetDriverService } from '../../../api/services/fleet/driver.service.js';

export const fetchFleetDriversThunk = createAsyncThunk(
  'fleet/driver/fetchDrivers',
  async (params, { rejectWithValue }) => {
    try { return await fleetDriverService.getDrivers(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createFleetDriverThunk = createAsyncThunk(
  'fleet/driver/createDriver',
  async (data, { rejectWithValue }) => {
    try { return await fleetDriverService.createDriver(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignDriverBusThunk = createAsyncThunk(
  'fleet/driver/assignBus',
  async ({ id, vehicleId }, { rejectWithValue }) => {
    try { return await fleetDriverService.assignBus(id, vehicleId); }
    catch (err) { return rejectWithValue(err); }
  }
);

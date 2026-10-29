import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetVehicleService } from '../../../api/services/fleet/vehicle.service.js';

export const fetchFleetVehiclesThunk = createAsyncThunk(
  'fleet/vehicle/fetchVehicles',
  async (params, { rejectWithValue }) => {
    try { return await fleetVehicleService.getVehicles(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createFleetVehicleThunk = createAsyncThunk(
  'fleet/vehicle/createVehicle',
  async (data, { rejectWithValue }) => {
    try { return await fleetVehicleService.createVehicle(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignVehicleDriverThunk = createAsyncThunk(
  'fleet/vehicle/assignDriver',
  async ({ id, driverId }, { rejectWithValue }) => {
    try { return await fleetVehicleService.assignDriver(id, driverId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignVehicleGpsThunk = createAsyncThunk(
  'fleet/vehicle/assignGps',
  async ({ id, gpsDeviceId }, { rejectWithValue }) => {
    try { return await fleetVehicleService.assignGps(id, gpsDeviceId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateFleetVehicleThunk = createAsyncThunk(
  'fleet/vehicle/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await fleetVehicleService.updateVehicle(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFleetVehicleTelemetryThunk = createAsyncThunk(
  'fleet/vehicle/fetchVehicleTelemetry',
  async (id, { rejectWithValue }) => {
    try { return await fleetVehicleService.getTelemetry(id); }
    catch (err) { return rejectWithValue(err); }
  }
);


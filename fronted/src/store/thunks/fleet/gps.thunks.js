import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetGpsService } from '../../../api/services/fleet/gps.service.js';

export const fetchGpsDevicesThunk = createAsyncThunk(
  'fleet/gps/fetchDevices',
  async (params, { rejectWithValue }) => {
    try { return await fleetGpsService.getGpsDevices(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/fetchDevice',
  async (id, { rejectWithValue }) => {
    try { return await fleetGpsService.getGpsDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/createDevice',
  async (data, { rejectWithValue }) => {
    try { return await fleetGpsService.createGpsDevice(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/updateDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await fleetGpsService.updateGpsDevice(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignGpsVehicleThunk = createAsyncThunk(
  'fleet/gps/assignVehicle',
  async ({ id, vehicleId }, { rejectWithValue }) => {
    try { return await fleetGpsService.assignVehicle(id, vehicleId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/deleteDevice',
  async (id, { rejectWithValue }) => {
    try {
      await fleetGpsService.deleteGpsDevice(id);
      return id;
    }
    catch (err) { return rejectWithValue(err); }
  }
);

export const approveGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/approveDevice',
  async (id, { rejectWithValue }) => {
    try { return await fleetGpsService.approveGpsDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectGpsDeviceThunk = createAsyncThunk(
  'fleet/gps/rejectDevice',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await fleetGpsService.rejectGpsDevice(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

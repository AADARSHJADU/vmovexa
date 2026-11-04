import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminVehicleService } from '../../../api/services/admin/vehicle.service.js';

export const fetchVehiclesThunk = createAsyncThunk(
  'admin/vehicle/fetchVehicles',
  async (params, { rejectWithValue }) => {
    try { return await adminVehicleService.getVehicles(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createVehicleThunk = createAsyncThunk(
  'admin/vehicle/createVehicle',
  async (data, { rejectWithValue }) => {
    try { return await adminVehicleService.createVehicle(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateVehicleThunk = createAsyncThunk(
  'admin/vehicle/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await adminVehicleService.updateVehicle(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteVehicleThunk = createAsyncThunk(
  'admin/vehicle/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try { return await adminVehicleService.deleteVehicle(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignDriverThunk = createAsyncThunk(
  'admin/vehicle/assignDriver',
  async ({ id, driverId }, { rejectWithValue }) => {
    try { return await adminVehicleService.assignDriver(id, driverId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignGpsThunk = createAsyncThunk(
  'admin/vehicle/assignGps',
  async ({ id, gpsDeviceId }, { rejectWithValue }) => {
    try { return await adminVehicleService.assignGps(id, gpsDeviceId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchVehicleTelemetryThunk = createAsyncThunk(
  'admin/vehicle/fetchVehicleTelemetry',
  async (id, { rejectWithValue }) => {
    try { return await adminVehicleService.getTelemetry(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateVehicleStatusThunk = createAsyncThunk(
  'admin/vehicle/updateVehicleStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await adminVehicleService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const approveVehicleThunk = createAsyncThunk(
  'admin/vehicle/approveVehicle',
  async (id, { rejectWithValue }) => {
    try { return await adminVehicleService.approveVehicle(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectVehicleThunk = createAsyncThunk(
  'admin/vehicle/rejectVehicle',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await adminVehicleService.rejectVehicle(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import { technicianSelfService } from '../../../api/services/technician/technician.service.js';

export const fetchMyWorkOrdersThunk = createAsyncThunk(
  'technician/fetchWorkOrders',
  async (params, { rejectWithValue }) => {
    try { return await technicianSelfService.getWorkOrders(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchWorkOrderDetailThunk = createAsyncThunk(
  'technician/fetchWorkOrderDetail',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.getWorkOrder(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const setWorkOrderStatusThunk = createAsyncThunk(
  'technician/setWorkOrderStatus',
  async ({ id, status, resolutionNotes }, { rejectWithValue }) => {
    try { return await technicianSelfService.setWorkOrderStatus(id, status, resolutionNotes); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchEdgeDevicesThunk = createAsyncThunk(
  'technician/fetchEdgeDevices',
  async (params, { rejectWithValue }) => {
    try { return await technicianSelfService.getEdgeDevices(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const registerEdgeDeviceThunk = createAsyncThunk(
  'technician/registerEdgeDevice',
  async (data, { rejectWithValue }) => {
    try { return await technicianSelfService.registerEdgeDevice(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateEdgeDeviceThunk = createAsyncThunk(
  'technician/updateEdgeDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await technicianSelfService.updateEdgeDevice(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteEdgeDeviceThunk = createAsyncThunk(
  'technician/deleteEdgeDevice',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.deleteEdgeDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const toggleEdgeDeviceActiveThunk = createAsyncThunk(
  'technician/toggleEdgeDeviceActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try { return await technicianSelfService.toggleEdgeDeviceActive(id, isActive); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchEdgeConfigThunk = createAsyncThunk(
  'technician/fetchEdgeConfig',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.getEdgeConfig(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchEdgeTelemetryThunk = createAsyncThunk(
  'technician/fetchEdgeTelemetry',
  async ({ id, params } = {}, { rejectWithValue }) => {
    try { return await technicianSelfService.getTelemetry(id, params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const factoryResetThunk = createAsyncThunk(
  'technician/factoryReset',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.factoryReset(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const pushConfigThunk = createAsyncThunk(
  'technician/pushConfig',
  async ({ id, config }, { rejectWithValue }) => {
    try { return await technicianSelfService.pushConfig(id, config); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rebootDeviceThunk = createAsyncThunk(
  'technician/rebootDevice',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.rebootDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchConnectivityTestsThunk = createAsyncThunk(
  'technician/fetchConnectivityTests',
  async (id, { rejectWithValue }) => {
    try { return await technicianSelfService.getConnectivityTests(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const recordConnectivityTestThunk = createAsyncThunk(
  'technician/recordConnectivityTest',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await technicianSelfService.recordConnectivityTest(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const registerGpsDeviceThunk = createAsyncThunk(
  'technician/registerGpsDevice',
  async (data, { rejectWithValue }) => {
    try { return await technicianSelfService.registerGpsDevice(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const assignGpsThunk = createAsyncThunk(
  'technician/assignGps',
  async ({ id, vehicleId }, { rejectWithValue }) => {
    try { return await technicianSelfService.assignGps(id, vehicleId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchTechVehiclesThunk = createAsyncThunk(
  'technician/fetchVehicles',
  async (params, { rejectWithValue }) => {
    try { return await technicianSelfService.getVehicles(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

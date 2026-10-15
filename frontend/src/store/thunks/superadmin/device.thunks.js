import { createAsyncThunk } from '@reduxjs/toolkit';
import { superDeviceService } from '../../../api/services/superadmin/device.service.js';

export const fetchEdgeDevicesThunk = createAsyncThunk(
  'superadmin/device/fetchEdgeDevices',
  async (params, { rejectWithValue }) => {
    try { return await superDeviceService.getEdgeDevices(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createEdgeDeviceThunk = createAsyncThunk(
  'superadmin/device/createEdgeDevice',
  async (data, { rejectWithValue }) => {
    try { return await superDeviceService.createEdgeDevice(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateEdgeDeviceThunk = createAsyncThunk(
  'superadmin/device/updateEdgeDevice',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superDeviceService.updateEdgeDevice(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteEdgeDeviceThunk = createAsyncThunk(
  'superadmin/device/deleteEdgeDevice',
  async (id, { rejectWithValue }) => {
    try { return await superDeviceService.deleteEdgeDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const toggleEdgeDeviceActiveThunk = createAsyncThunk(
  'superadmin/device/toggleEdgeDeviceActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try { return await superDeviceService.toggleEdgeDeviceActive(id, isActive); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rebootEdgeDeviceThunk = createAsyncThunk(
  'superadmin/device/rebootEdgeDevice',
  async (id, { rejectWithValue }) => {
    try { return await superDeviceService.rebootEdgeDevice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDisplaysThunk = createAsyncThunk(
  'superadmin/device/fetchDisplays',
  async (params, { rejectWithValue }) => {
    try { return await superDeviceService.getDisplays(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminDriverService } from '../../../api/services/admin/driver.service.js';

export const fetchDriversThunk = createAsyncThunk(
  'admin/driver/fetchDrivers',
  async (params, { rejectWithValue }) => {
    try { return await adminDriverService.getDrivers(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createDriverThunk = createAsyncThunk(
  'admin/driver/createDriver',
  async (data, { rejectWithValue }) => {
    try { return await adminDriverService.createDriver(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateDriverThunk = createAsyncThunk(
  'admin/driver/updateDriver',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await adminDriverService.updateDriver(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const verifyDriverThunk = createAsyncThunk(
  'admin/driver/verifyDriver',
  async ({ id, payload }, { rejectWithValue }) => {
    try { return await adminDriverService.verifyDriver(id, payload); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const approveDriverThunk = createAsyncThunk(
  'admin/driver/approveDriver',
  async (id, { rejectWithValue }) => {
    try { return await adminDriverService.approveDriver(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectDriverThunk = createAsyncThunk(
  'admin/driver/rejectDriver',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await adminDriverService.rejectDriver(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const verifyDriverDocumentsThunk = createAsyncThunk(
  'admin/driver/verifyDriverDocuments',
  async ({ id, verified }, { rejectWithValue }) => {
    try { return await adminDriverService.verifyDriverDocuments(id, verified); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateDriverStatusThunk = createAsyncThunk(
  'admin/driver/updateDriverStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await adminDriverService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteDriverThunk = createAsyncThunk(
  'admin/driver/deleteDriver',
  async (id, { rejectWithValue }) => {
    try { return await adminDriverService.deleteDriver(id); }
    catch (err) { return rejectWithValue(err); }
  }
);





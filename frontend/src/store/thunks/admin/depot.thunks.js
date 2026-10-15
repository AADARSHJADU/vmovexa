import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminDepotService } from '../../../api/services/admin/depot.service.js';

export const fetchDepotsThunk = createAsyncThunk(
  'admin/depot/fetchDepots',
  async (params, { rejectWithValue }) => {
    try { return await adminDepotService.getDepots(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createDepotThunk = createAsyncThunk(
  'admin/depot/createDepot',
  async (data, { rejectWithValue }) => {
    try { return await adminDepotService.createDepot(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateDepotThunk = createAsyncThunk(
  'admin/depot/updateDepot',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await adminDepotService.updateDepot(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteDepotThunk = createAsyncThunk(
  'admin/depot/deleteDepot',
  async (id, { rejectWithValue }) => {
    try { return await adminDepotService.deleteDepot(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateDepotStatusThunk = createAsyncThunk(
  'admin/depot/updateDepotStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await adminDepotService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

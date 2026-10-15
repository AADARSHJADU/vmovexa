import { createAsyncThunk } from '@reduxjs/toolkit';
import { adminFleetOperatorService } from '../../../api/services/admin/fleetOperator.service.js';

export const fetchFleetOperatorsThunk = createAsyncThunk(
  'admin/fleetOperator/fetchFleetOperators',
  async (params, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.getFleetOperators(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFleetOperatorThunk = createAsyncThunk(
  'admin/fleetOperator/fetchFleetOperator',
  async (id, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.getFleetOperator(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createFleetOperatorThunk = createAsyncThunk(
  'admin/fleetOperator/createFleetOperator',
  async (data, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.createFleetOperator(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateFleetOperatorThunk = createAsyncThunk(
  'admin/fleetOperator/updateFleetOperator',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.updateFleetOperator(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOperatorStatusThunk = createAsyncThunk(
  'admin/fleetOperator/updateOperatorStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteFleetOperatorThunk = createAsyncThunk(
  'admin/fleetOperator/deleteFleetOperator',
  async (id, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.deleteFleetOperator(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOperatorActivityThunk = createAsyncThunk(
  'admin/fleetOperator/fetchOperatorActivity',
  async ({ id, params }, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.getActivity(id, params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOperatorPermissionsThunk = createAsyncThunk(
  'admin/fleetOperator/fetchOperatorPermissions',
  async (id, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.getPermissions(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOperatorPermissionsThunk = createAsyncThunk(
  'admin/fleetOperator/updateOperatorPermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try { return await adminFleetOperatorService.updatePermissions(id, permissions); }
    catch (err) { return rejectWithValue(err); }
  }
);


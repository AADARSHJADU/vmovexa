import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetManagerService } from '../../../api/services/fleet/fleet.service.js';

export const fetchFleetsThunk = createAsyncThunk(
  'fleet/fetchFleets',
  async (params, { rejectWithValue }) => {
    try { return await fleetManagerService.getFleets(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createFleetThunk = createAsyncThunk(
  'fleet/createFleet',
  async (data, { rejectWithValue }) => {
    try { return await fleetManagerService.createFleet(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFleetThunk = createAsyncThunk(
  'fleet/fetchFleet',
  async (id, { rejectWithValue }) => {
    try { return await fleetManagerService.getFleet(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateFleetThunk = createAsyncThunk(
  'fleet/updateFleet',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await fleetManagerService.updateFleet(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteFleetThunk = createAsyncThunk(
  'fleet/deleteFleet',
  async (id, { rejectWithValue }) => {
    try {
      await fleetManagerService.deleteFleet(id);
      return id;
    } catch (err) { return rejectWithValue(err); }
  }
);

export const approveFleetThunk = createAsyncThunk(
  'fleet/approveFleet',
  async (id, { rejectWithValue }) => {
    try { return await fleetManagerService.approveFleet(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectFleetThunk = createAsyncThunk(
  'fleet/rejectFleet',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await fleetManagerService.rejectFleet(id, reason); }
    catch (err) { return rejectWithValue(err); }
  }
);

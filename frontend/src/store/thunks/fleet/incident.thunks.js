import { createAsyncThunk } from '@reduxjs/toolkit';
import { fleetIncidentService } from '../../../api/services/fleet/incident.service.js';

export const fetchIncidentsThunk = createAsyncThunk(
  'fleet/incident/fetchIncidents',
  async (params, { rejectWithValue }) => {
    try { return await fleetIncidentService.getIncidents(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createIncidentThunk = createAsyncThunk(
  'fleet/incident/createIncident',
  async (data, { rejectWithValue }) => {
    try { return await fleetIncidentService.createIncident(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const setIncidentStatusThunk = createAsyncThunk(
  'fleet/incident/setStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await fleetIncidentService.setStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateIncidentResolutionThunk = createAsyncThunk(
  'fleet/incident/updateResolution',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await fleetIncidentService.updateResolution(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchIncidentByIdThunk = createAsyncThunk(
  'fleet/incident/fetchIncidentById',
  async (id, { rejectWithValue }) => {
    try { return await fleetIncidentService.getIncident(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

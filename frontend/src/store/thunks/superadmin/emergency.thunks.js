import { createAsyncThunk } from '@reduxjs/toolkit';
import { superEmergencyService } from '../../../api/services/superadmin/emergency.service.js';

export const fetchEmergencyBroadcastsThunk = createAsyncThunk(
  'superadmin/emergency/fetchBroadcasts',
  async (params, { rejectWithValue }) => {
    try { return await superEmergencyService.getBroadcasts(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createEmergencyBroadcastThunk = createAsyncThunk(
  'superadmin/emergency/createBroadcast',
  async (data, { rejectWithValue }) => {
    try { return await superEmergencyService.createBroadcast(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const revokeEmergencyBroadcastThunk = createAsyncThunk(
  'superadmin/emergency/revokeBroadcast',
  async (id, { rejectWithValue }) => {
    try { return await superEmergencyService.revokeBroadcast(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

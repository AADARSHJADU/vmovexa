import { createAsyncThunk } from '@reduxjs/toolkit';
import { driverSelfService } from '../../../api/services/driver/driver.service.js';

export const fetchDriverProfileThunk = createAsyncThunk(
  'driver/fetchProfile',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getProfile(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverScheduleThunk = createAsyncThunk(
  'driver/fetchSchedule',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getSchedule(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverActiveRouteThunk = createAsyncThunk(
  'driver/fetchActiveRoute',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getActiveRoute(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverTripsThunk = createAsyncThunk(
  'driver/fetchTrips',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getTrips(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverDocumentsThunk = createAsyncThunk(
  'driver/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getDocuments(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const uploadDriverDocumentThunk = createAsyncThunk(
  'driver/uploadDocument',
  async (data, { rejectWithValue }) => {
    try { return await driverSelfService.uploadDocument(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const deleteDriverDocumentThunk = createAsyncThunk(
  'driver/deleteDocument',
  async (id, { rejectWithValue }) => {
    try { return await driverSelfService.deleteDocument(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverIncidentsThunk = createAsyncThunk(
  'driver/fetchIncidents',
  async (_, { rejectWithValue }) => {
    try { return await driverSelfService.getIncidents(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchDriverIncidentByIdThunk = createAsyncThunk(
  'driver/fetchIncidentById',
  async (id, { rejectWithValue }) => {
    try { return await driverSelfService.getIncidentById(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const reportDriverIncidentThunk = createAsyncThunk(
  'driver/reportIncident',
  async (data, { rejectWithValue }) => {
    try { return await driverSelfService.reportIncident(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateDriverDutyStatusThunk = createAsyncThunk(
  'driver/updateDutyStatus',
  async (status, { rejectWithValue }) => {
    try { return await driverSelfService.updateDutyStatus(status); }
    catch (err) { return rejectWithValue(err); }
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import { organizationService } from '../../api/services/organization.service.js';

export const fetchOrganizationsThunk = createAsyncThunk(
  'organization/fetchOrganizations',
  async (params, { rejectWithValue }) => {
    try { return await organizationService.getOrganizations(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOrganizationThunk = createAsyncThunk(
  'organization/fetchOrganization',
  async (id, { rejectWithValue }) => {
    try { return await organizationService.getOrganization(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createOrganizationThunk = createAsyncThunk(
  'organization/createOrganization',
  async (data, { rejectWithValue }) => {
    try { return await organizationService.createOrganization(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOrganizationThunk = createAsyncThunk(
  'organization/updateOrganization',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await organizationService.updateOrganization(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOrganizationStatusThunk = createAsyncThunk(
  'organization/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await organizationService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOrganizationFeaturesThunk = createAsyncThunk(
  'organization/fetchFeatures',
  async (id, { rejectWithValue }) => {
    try { return await organizationService.getFeatures(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOrganizationFeaturesThunk = createAsyncThunk(
  'organization/updateFeatures',
  async ({ id, features }, { rejectWithValue }) => {
    try { return await organizationService.updateFeatures(id, features); }
    catch (err) { return rejectWithValue(err); }
  }
);

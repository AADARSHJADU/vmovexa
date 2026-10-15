import { createAsyncThunk } from '@reduxjs/toolkit';
import { superOrganizationService } from '../../../api/services/superadmin/organization.service.js';

export const fetchOrganizationsThunk = createAsyncThunk(
  'superadmin/organization/fetchOrganizations',
  async (params, { rejectWithValue }) => {
    try { return await superOrganizationService.getOrganizations(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchOrganizationThunk = createAsyncThunk(
  'superadmin/organization/fetchOrganization',
  async (id, { rejectWithValue }) => {
    try { return await superOrganizationService.getOrganization(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const createOrganizationThunk = createAsyncThunk(
  'superadmin/organization/createOrganization',
  async (data, { rejectWithValue }) => {
    try { return await superOrganizationService.createOrganization(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOrganizationThunk = createAsyncThunk(
  'superadmin/organization/updateOrganization',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superOrganizationService.updateOrganization(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateOrganizationStatusThunk = createAsyncThunk(
  'superadmin/organization/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try { return await superOrganizationService.updateStatus(id, status); }
    catch (err) { return rejectWithValue(err); }
  }
);

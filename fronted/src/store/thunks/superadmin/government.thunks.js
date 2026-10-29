import { createAsyncThunk } from '@reduxjs/toolkit';
import { superGovernmentService } from '../../../api/services/superadmin/government.service.js';

export const fetchSuperGovernmentAgenciesThunk = createAsyncThunk(
  'superadmin/government/fetchAgencies',
  async (params, { rejectWithValue }) => {
    try {
      return await superGovernmentService.getGovernmentAgencies(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSuperGovernmentAgencyThunk = createAsyncThunk(
  'superadmin/government/fetchAgency',
  async (id, { rejectWithValue }) => {
    try {
      return await superGovernmentService.getGovernmentAgency(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createSuperGovernmentAgencyThunk = createAsyncThunk(
  'superadmin/government/createAgency',
  async (data, { rejectWithValue }) => {
    try {
      return await superGovernmentService.createGovernmentAgency(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperGovernmentAgencyThunk = createAsyncThunk(
  'superadmin/government/updateAgency',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await superGovernmentService.updateGovernmentAgency(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteSuperGovernmentAgencyThunk = createAsyncThunk(
  'superadmin/government/deleteAgency',
  async (id, { rejectWithValue }) => {
    try {
      return await superGovernmentService.deleteGovernmentAgency(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperAgencyStatusThunk = createAsyncThunk(
  'superadmin/government/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await superGovernmentService.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteSuperGovernmentDocumentThunk = createAsyncThunk(
  'superadmin/government/deleteDocument',
  async (docId, { rejectWithValue }) => {
    try {
      return await superGovernmentService.deleteDocument(docId);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

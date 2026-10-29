import { createAsyncThunk } from '@reduxjs/toolkit';
import { superFinanceOfficerService } from '../../../api/services/superadmin/financeOfficer.service.js';

export const fetchSuperFinanceOfficersThunk = createAsyncThunk(
  'superadmin/financeOfficer/fetchFinanceOfficers',
  async (params, { rejectWithValue }) => {
    try {
      return await superFinanceOfficerService.getFinanceOfficers(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSuperFinanceOfficerThunk = createAsyncThunk(
  'superadmin/financeOfficer/fetchFinanceOfficer',
  async (id, { rejectWithValue }) => {
    try {
      return await superFinanceOfficerService.getFinanceOfficer(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const registerSuperFinanceOfficerThunk = createAsyncThunk(
  'superadmin/financeOfficer/registerFinanceOfficer',
  async (data, { rejectWithValue }) => {
    try {
      return await superFinanceOfficerService.registerFinanceOfficer(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperFinanceOfficerStatusThunk = createAsyncThunk(
  'superadmin/financeOfficer/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await superFinanceOfficerService.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperFinanceOfficerThunk = createAsyncThunk(
  'superadmin/financeOfficer/updateFinanceOfficer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await superFinanceOfficerService.updateFinanceOfficer(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteSuperFinanceOfficerThunk = createAsyncThunk(
  'superadmin/financeOfficer/deleteFinanceOfficer',
  async (id, { rejectWithValue }) => {
    try {
      await superFinanceOfficerService.deleteFinanceOfficer(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

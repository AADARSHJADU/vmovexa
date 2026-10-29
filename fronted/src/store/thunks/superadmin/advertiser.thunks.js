import { createAsyncThunk } from '@reduxjs/toolkit';
import { superAdvertiserService } from '../../../api/services/superadmin/advertiser.service.js';

export const fetchSuperAdvertisersThunk = createAsyncThunk(
  'superadmin/advertiser/fetchAdvertisers',
  async (params, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.getAdvertisers(params);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSuperAdvertiserThunk = createAsyncThunk(
  'superadmin/advertiser/fetchAdvertiser',
  async (id, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.getAdvertiser(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createSuperAdvertiserThunk = createAsyncThunk(
  'superadmin/advertiser/createAdvertiser',
  async (data, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.createAdvertiser(data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperAdvertiserThunk = createAsyncThunk(
  'superadmin/advertiser/updateAdvertiser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.updateAdvertiser(id, data);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const deleteSuperAdvertiserThunk = createAsyncThunk(
  'superadmin/advertiser/deleteAdvertiser',
  async (id, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.deleteAdvertiser(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSuperAdvertiserStatusThunk = createAsyncThunk(
  'superadmin/advertiser/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await superAdvertiserService.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

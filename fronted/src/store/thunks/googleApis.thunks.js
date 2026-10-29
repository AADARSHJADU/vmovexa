import { createAsyncThunk } from '@reduxjs/toolkit';
import { googleApisService } from '../../api/services/googleApis.service';
import { normalizeError } from '../../utils/apiResponse';

export const fetchGoogleApiSettingsThunk = createAsyncThunk(
  'googleApis/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await googleApisService.getSettings();
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const updateGoogleApiSettingsThunk = createAsyncThunk(
  'googleApis/updateSettings',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await googleApisService.updateSettings(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

export const testGoogleApisThunk = createAsyncThunk(
  'googleApis/testApis',
  async (apiKey, { rejectWithValue }) => {
    try {
      const res = await googleApisService.testApis(apiKey);
      return res.data;
    } catch (err) {
      return rejectWithValue(normalizeError(err));
    }
  }
);

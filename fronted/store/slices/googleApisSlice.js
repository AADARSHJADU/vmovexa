import { createSlice } from '@reduxjs/toolkit';
import {
  fetchGoogleApiSettingsThunk,
  updateGoogleApiSettingsThunk,
  testGoogleApisThunk,
} from '../thunks/googleApis.thunks';

const initialState = {
  settings: {
    id: 1,
    api_key: 'AIzaSyBqlBrjGRXwr0b2gEq8R0d_BlPBH4FcPSw',
    api_key_masked: 'AIzaSyBq••••••••••••••••••••••••FcPSw',
    is_active: true,
    environment: 'production',
    project_id: '1007241948280',
    geocoding_api_url: 'https://maps.googleapis.com/maps/api/geocode/json',
    routes_api_url: 'https://routes.googleapis.com/directions/v2:computeRoutes',
    places_api_url: 'https://places.googleapis.com/v1/places:searchText',
    places_autocomplete_url: 'https://places.googleapis.com/v1/places:autocomplete',
    roads_api_url: 'https://roads.googleapis.com/v1/snapToRoads',
    roads_speed_limits_url: 'https://roads.googleapis.com/v1/speedLimits',
    maps_static_api_url: 'https://maps.googleapis.com/maps/api/staticmap',
    maps_sdk_android_enabled: true,
    notes: '',
  },
  testResults: null,
  loading: false,
  saving: false,
  testing: false,
  error: null,
};

const googleApisSlice = createSlice({
  name: 'googleApis',
  initialState,
  reducers: {
    setLocalField: (state, action) => {
      const { field, value } = action.payload;
      state.settings[field] = value;
    },
    resetTestResults: (state) => {
      state.testResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchGoogleApiSettingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoogleApiSettingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.settings = { ...state.settings, ...action.payload };
        }
      })
      .addCase(fetchGoogleApiSettingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch Google API settings';
      })

      // Update settings
      .addCase(updateGoogleApiSettingsThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateGoogleApiSettingsThunk.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          state.settings = { ...state.settings, ...action.payload };
        }
      })
      .addCase(updateGoogleApiSettingsThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload?.message || 'Failed to update Google API settings';
      })

      // Test APIs
      .addCase(testGoogleApisThunk.pending, (state) => {
        state.testing = true;
        state.error = null;
      })
      .addCase(testGoogleApisThunk.fulfilled, (state, action) => {
        state.testing = false;
        state.testResults = action.payload;
      })
      .addCase(testGoogleApisThunk.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload?.message || 'Failed to run Google APIs telemetry test';
      });
  },
});

export const { setLocalField, resetTestResults } = googleApisSlice.actions;

// Selectors
export const selectGoogleApiSettings = (state) => state.googleApis.settings;
export const selectGoogleApiLoading = (state) => state.googleApis.loading;
export const selectGoogleApiSaving = (state) => state.googleApis.saving;
export const selectGoogleApiTesting = (state) => state.googleApis.testing;
export const selectGoogleApiTestResults = (state) => state.googleApis.testResults;
export const selectGoogleApiError = (state) => state.googleApis.error;

export default googleApisSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchIncidentsThunk,
  createIncidentThunk,
  setIncidentStatusThunk,
  updateIncidentResolutionThunk,
  fetchIncidentByIdThunk,
} from '../../thunks/fleet/incident.thunks.js';

export {
  fetchIncidentsThunk,
  createIncidentThunk,
  setIncidentStatusThunk,
  updateIncidentResolutionThunk,
  fetchIncidentByIdThunk,
};

const initialState = {
  incidents: [],
  selectedIncident: null,
  selectedIncidentStatus: 'idle',
  status: 'idle',
  error: null,
};

function upsertIncident(state, updated) {
  if (!updated || !updated.id) return;
  const list = Array.isArray(state.incidents) ? state.incidents : [];
  const idx = list.findIndex((i) => i.id === updated.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updated };
  } else {
    state.incidents = [updated, ...list];
  }
  if (state.selectedIncident && state.selectedIncident.id === updated.id) {
    state.selectedIncident = { ...state.selectedIncident, ...updated };
  }
}

const fleetIncidentSlice = createSlice({
  name: 'fleetIncident',
  initialState,
  reducers: {
    clearSelectedIncident: (state) => {
      state.selectedIncident = null;
      state.selectedIncidentStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidentsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchIncidentsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const list = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.rows || action.payload?.data || action.payload?.incidents || [];
        state.incidents = list;
      })
      .addCase(fetchIncidentsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createIncidentThunk.fulfilled, (state, action) => {
        upsertIncident(state, action.payload);
      })
      .addCase(setIncidentStatusThunk.fulfilled, (state, action) => {
        upsertIncident(state, action.payload);
      })
      .addCase(updateIncidentResolutionThunk.fulfilled, (state, action) => {
        upsertIncident(state, action.payload);
      })
      .addCase(fetchIncidentByIdThunk.pending, (state) => {
        state.selectedIncidentStatus = 'loading';
      })
      .addCase(fetchIncidentByIdThunk.fulfilled, (state, action) => {
        state.selectedIncidentStatus = 'succeeded';
        state.selectedIncident = action.payload;
        upsertIncident(state, action.payload);
      })
      .addCase(fetchIncidentByIdThunk.rejected, (state, action) => {
        state.selectedIncidentStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSelectedIncident } = fleetIncidentSlice.actions;
export default fleetIncidentSlice.reducer;
export const selectFleetIncidents = (state) => state.fleetIncident.incidents || [];
export const selectSelectedIncident = (state) => state.fleetIncident.selectedIncident;
export const selectIncidentLoading = (state) => state.fleetIncident.status === 'loading';
export const selectSelectedIncidentLoading = (state) => state.fleetIncident.selectedIncidentStatus === 'loading';


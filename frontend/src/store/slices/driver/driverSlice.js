import { createSlice } from '@reduxjs/toolkit';
import {
  fetchDriverProfileThunk,
  fetchDriverScheduleThunk,
  fetchDriverActiveRouteThunk,
  fetchDriverTripsThunk,
  fetchDriverDocumentsThunk,
  uploadDriverDocumentThunk,
  deleteDriverDocumentThunk,
  fetchDriverIncidentsThunk,
  fetchDriverIncidentByIdThunk,
  reportDriverIncidentThunk,
  updateDriverDutyStatusThunk,
} from '../../thunks/driver/driver.thunks.js';

export {
  fetchDriverProfileThunk,
  fetchDriverScheduleThunk,
  fetchDriverActiveRouteThunk,
  fetchDriverTripsThunk,
  fetchDriverDocumentsThunk,
  uploadDriverDocumentThunk,
  deleteDriverDocumentThunk,
  fetchDriverIncidentsThunk,
  fetchDriverIncidentByIdThunk,
  reportDriverIncidentThunk,
  updateDriverDutyStatusThunk,
};

const initialState = {
  profile: null,
  schedule: [],
  activeRoute: null,
  trips: [],
  documents: [],
  incidents: [],
  status: 'idle',
  error: null,
};

const driverAppSlice = createSlice({
  name: 'driverApp',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDriverProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload?.profile || action.payload;
      })
      .addCase(fetchDriverScheduleThunk.fulfilled, (state, action) => {
        state.schedule = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.schedules || action.payload?.items || action.payload?.rows || []);
      })
      .addCase(fetchDriverActiveRouteThunk.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload?.activeTrip) {
          state.activeRoute = {
            ...payload,
            ...payload.activeTrip,
            activeTrip: payload.activeTrip,
            assignedBus: payload.assignedBus || payload.activeTrip.vehicle,
            assignedRoute: payload.assignedRoute || payload.activeTrip.route,
          };
        } else if (payload?.assignedBus || payload?.assignedRoute) {
          state.activeRoute = {
            ...payload,
            busNumber: payload.assignedBus?.bus_number,
            vehicle: payload.assignedBus,
            route: payload.assignedRoute,
          };
        } else {
          state.activeRoute = payload?.activeTrip !== undefined ? payload.activeTrip : payload;
        }
      })
      .addCase(fetchDriverTripsThunk.fulfilled, (state, action) => {
        state.trips = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.rows || action.payload?.items || action.payload?.trips || []);
      })
      .addCase(fetchDriverDocumentsThunk.fulfilled, (state, action) => {
        state.documents = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.documents || action.payload?.items || action.payload?.rows || []);
      })
      .addCase(uploadDriverDocumentThunk.fulfilled, (state, action) => {
        const doc = action.payload;
        if (doc) {
          if (!Array.isArray(state.documents)) state.documents = [];
          const idx = state.documents.findIndex((d) => d.id === doc.id || (doc.doc_name && d.doc_name === doc.doc_name));
          if (idx >= 0) {
            state.documents[idx] = { ...state.documents[idx], ...doc };
          } else {
            state.documents.unshift(doc);
          }
        }
      })
      .addCase(deleteDriverDocumentThunk.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;
        if (Array.isArray(state.documents)) {
          state.documents = state.documents.filter((d) => d.id !== deletedId);
        }
      })
      .addCase(fetchDriverIncidentsThunk.fulfilled, (state, action) => {
        state.incidents = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.incidents || action.payload?.items || action.payload?.rows || []);
      })
      .addCase(updateDriverDutyStatusThunk.fulfilled, (state, action) => {
        if (state.profile) state.profile = { ...state.profile, ...action.payload };
      });
  },
});

export default driverAppSlice.reducer;
export const selectDriverProfile = (state) => state.driverApp.profile;
export const selectDriverSchedule = (state) => state.driverApp.schedule;
export const selectDriverActiveRoute = (state) => state.driverApp.activeRoute;
export const selectDriverTrips = (state) => state.driverApp.trips;
export const selectDriverDocuments = (state) => state.driverApp.documents;
export const selectDriverIncidents = (state) => state.driverApp.incidents;

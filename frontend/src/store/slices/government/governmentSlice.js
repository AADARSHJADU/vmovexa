import { createSlice } from '@reduxjs/toolkit';
import {
  fetchGovCampaignsThunk,
  fetchGovCampaignByIdThunk,
  createGovCampaignThunk,
  updateGovCampaignThunk,
  deleteGovCampaignThunk,
  approveGovCampaignThunk,
  rejectGovCampaignThunk,
  fetchGovEmergencyBroadcastsThunk,
  createGovBroadcastThunk,
  revokeGovBroadcastThunk,
  approveGovBroadcastThunk,
  rejectGovBroadcastThunk,
  fetchGovAnalyticsThunk,
} from '../../thunks/government/government.thunks.js';

export {
  fetchGovCampaignsThunk,
  fetchGovCampaignByIdThunk,
  createGovCampaignThunk,
  updateGovCampaignThunk,
  deleteGovCampaignThunk,
  approveGovCampaignThunk,
  rejectGovCampaignThunk,
  fetchGovEmergencyBroadcastsThunk,
  createGovBroadcastThunk,
  revokeGovBroadcastThunk,
  approveGovBroadcastThunk,
  rejectGovBroadcastThunk,
  fetchGovAnalyticsThunk,
};

const initialState = {
  campaigns: [],
  currentCampaign: null,
  broadcasts: [],
  analytics: null,
  meta: null,
  broadcastsMeta: null,
  loading: false,
  error: null,
};

const governmentSlice = createSlice({
  name: 'government',
  initialState,
  reducers: {
    clearCurrentGovCampaign: (state) => {
      state.currentCampaign = null;
    },
    clearGovError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Campaigns
      .addCase(fetchGovCampaignsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGovCampaignsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.items || action.payload.rows || action.payload || [];
        state.meta = action.payload.meta || null;
      })
      .addCase(fetchGovCampaignsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Campaign By ID
      .addCase(fetchGovCampaignByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGovCampaignByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchGovCampaignByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Campaign
      .addCase(createGovCampaignThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGovCampaignThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createGovCampaignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve / Reject / Update Campaign
      .addCase(approveGovCampaignThunk.fulfilled, (state, action) => {
        const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
        if (state.currentCampaign?.id === action.payload.id) state.currentCampaign = action.payload;
      })
      .addCase(rejectGovCampaignThunk.fulfilled, (state, action) => {
        const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
        if (state.currentCampaign?.id === action.payload.id) state.currentCampaign = action.payload;
      })
      .addCase(updateGovCampaignThunk.fulfilled, (state, action) => {
        const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
        if (state.currentCampaign?.id === action.payload.id) state.currentCampaign = action.payload;
      })
      // Fetch Emergency Broadcasts
      .addCase(fetchGovEmergencyBroadcastsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGovEmergencyBroadcastsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.broadcasts = action.payload.items || action.payload.rows || action.payload || [];
        state.broadcastsMeta = action.payload.meta || null;
      })
      .addCase(fetchGovEmergencyBroadcastsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Broadcast
      .addCase(createGovBroadcastThunk.fulfilled, (state) => {
        state.loading = false;
      })
      // Revoke Broadcast
      .addCase(revokeGovBroadcastThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      // Fetch Agency Analytics
      .addCase(fetchGovAnalyticsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGovAnalyticsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchGovAnalyticsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentGovCampaign, clearGovError } = governmentSlice.actions;
export default governmentSlice.reducer;

const selectGovState = (state) => state.government || state.governmentRole || {};
export const selectGovCampaigns = (state) => selectGovState(state).campaigns || [];
export const selectGovCurrentCampaign = (state) => selectGovState(state).currentCampaign;
export const selectGovBroadcasts = (state) => selectGovState(state).broadcasts || [];
export const selectGovAnalytics = (state) => selectGovState(state).analytics;
export const selectGovMeta = (state) => selectGovState(state).meta;
export const selectGovBroadcastsMeta = (state) => selectGovState(state).broadcastsMeta;
export const selectGovLoading = (state) => selectGovState(state).loading || false;
export const selectGovError = (state) => selectGovState(state).error;

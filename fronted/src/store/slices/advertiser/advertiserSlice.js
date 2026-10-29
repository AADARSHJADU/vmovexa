import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAdvertiserCampaignsThunk,
  fetchFleetOptionsThunk,
  fetchAdvertiserCampaignDetailsThunk,
  fetchAdvertiserCampaignAnalyticsThunk,
  createAdvertiserCampaignThunk,
  updateAdvertiserCampaignThunk,
  deleteAdvertiserCampaignThunk,
  submitAdvertiserCampaignThunk,
  verifyAdvertiserCampaignThunk,
  initiateCampaignPaymentThunk,
  confirmCampaignPaymentThunk,
  recordOfflinePaymentThunk,
  startAdvertiserCampaignThunk,
  stopAdvertiserCampaignThunk,
  endAdvertiserCampaignThunk,
  shareCampaignPaymentLinkThunk,
  fetchAdvertiserWalletThunk,
  fetchAdvertiserInvoicesThunk,
  fetchAdvertiserTransactionsThunk,
  fetchAdvertiserReportsThunk,
  generateAdvertiserReportThunk,
  fetchMqttStatusThunk,
  fetchSlotAvailabilityThunk,
  fetchCampaignReviewsThunk,
} from '../../thunks/advertiser/advertiser.thunks.js';

export {
  fetchAdvertiserCampaignsThunk,
  fetchFleetOptionsThunk,
  fetchAdvertiserCampaignDetailsThunk,
  fetchAdvertiserCampaignAnalyticsThunk,
  createAdvertiserCampaignThunk,
  updateAdvertiserCampaignThunk,
  deleteAdvertiserCampaignThunk,
  submitAdvertiserCampaignThunk,
  verifyAdvertiserCampaignThunk,
  initiateCampaignPaymentThunk,
  confirmCampaignPaymentThunk,
  recordOfflinePaymentThunk,
  startAdvertiserCampaignThunk,
  stopAdvertiserCampaignThunk,
  endAdvertiserCampaignThunk,
  shareCampaignPaymentLinkThunk,
  fetchAdvertiserWalletThunk,
  fetchAdvertiserInvoicesThunk,
  fetchAdvertiserTransactionsThunk,
  fetchAdvertiserReportsThunk,
  generateAdvertiserReportThunk,
  fetchMqttStatusThunk,
  fetchSlotAvailabilityThunk,
  fetchCampaignReviewsThunk,
};

const initialState = {
  campaigns: [],
  fleetOptions: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  activeCampaign: null,
  campaignAnalytics: null,
  mqttStatus: null,
  wallet: { walletBalance: 0, companyName: null, currency: 'INR' },
  invoices: [],
  transactions: [],
  reports: [],
  paymentOrder: null,
  slotAvailability: null,
  slotLoading: false,
  reviews: null,
  status: 'idle',
  loading: false,
  error: null,
};

const advertiserRoleSlice = createSlice({
  name: 'advertiserRole',
  initialState,
  reducers: {
    clearActiveCampaign: (state) => {
      state.activeCampaign = null;
      state.campaignAnalytics = null;
      state.paymentOrder = null;
    },
    clearAdvertiserError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Campaigns
      .addCase(fetchAdvertiserCampaignsThunk.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchAdvertiserCampaignsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        if (action.payload && Array.isArray(action.payload.rows)) {
          state.campaigns = action.payload.rows;
          state.meta = action.payload.meta || state.meta;
        } else if (Array.isArray(action.payload)) {
          state.campaigns = action.payload;
        } else {
          state.campaigns = [];
        }
      })
      .addCase(fetchAdvertiserCampaignsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch campaigns.';
      })

      // Fetch Fleet Options
      .addCase(fetchFleetOptionsThunk.fulfilled, (state, action) => {
        state.fleetOptions = Array.isArray(action.payload) ? action.payload : [];
      })

      // Fetch Campaign Details
      .addCase(fetchAdvertiserCampaignDetailsThunk.fulfilled, (state, action) => {
        state.activeCampaign = action.payload;
      })

      // Fetch Campaign Analytics
      .addCase(fetchAdvertiserCampaignAnalyticsThunk.fulfilled, (state, action) => {
        state.campaignAnalytics = action.payload;
      })

      // Create Campaign
      .addCase(createAdvertiserCampaignThunk.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAdvertiserCampaignThunk.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to create campaign';
      })
      .addCase(createAdvertiserCampaignThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        if (action.payload) {
          state.campaigns.unshift(action.payload);
        }
      })

      // Slot availability
      .addCase(fetchSlotAvailabilityThunk.pending, (state) => { state.slotLoading = true; })
      .addCase(fetchSlotAvailabilityThunk.rejected, (state, action) => {
        state.slotLoading = false;
        state.slotAvailability = null;
        state.error = action.payload?.message || 'Failed to load slot availability';
      })
      .addCase(fetchSlotAvailabilityThunk.fulfilled, (state, action) => {
        state.slotLoading = false;
        state.slotAvailability = action.payload || null;
      })

      // Campaign reviews
      .addCase(fetchCampaignReviewsThunk.fulfilled, (state, action) => {
        state.reviews = action.payload || null;
      })

      // Update Campaign
      .addCase(updateAdvertiserCampaignThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
        }
      })

      // Delete Campaign
      .addCase(deleteAdvertiserCampaignThunk.fulfilled, (state, action) => {
        const deletedId = action.meta?.arg;
        state.campaigns = state.campaigns.filter((c) => c.id !== deletedId && c.id !== Number(deletedId));
        if (state.activeCampaign?.id === deletedId) state.activeCampaign = null;
      })

      // Submit / Verify / Confirm Payment Campaign
      .addCase(submitAdvertiserCampaignThunk.fulfilled, (state, action) => {
        if (action.payload && action.payload.campaignId) {
          const c = state.campaigns.find((item) => item.id === action.payload.campaignId);
          if (c) c.status = 'pending_approval';
        }
      })
      .addCase(verifyAdvertiserCampaignThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
        }
      })
      .addCase(initiateCampaignPaymentThunk.fulfilled, (state, action) => {
        state.paymentOrder = action.payload;
      })
      .addCase(confirmCampaignPaymentThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
          state.paymentOrder = null;
        }
      })
      .addCase(recordOfflinePaymentThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
          state.paymentOrder = null;
        }
      })
      .addCase(startAdvertiserCampaignThunk.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(startAdvertiserCampaignThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
        }
      })
      .addCase(startAdvertiserCampaignThunk.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to start campaign.';
      })

      .addCase(stopAdvertiserCampaignThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(stopAdvertiserCampaignThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
        }
      })
      .addCase(stopAdvertiserCampaignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to stop campaign.';
      })

      .addCase(endAdvertiserCampaignThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(endAdvertiserCampaignThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const idx = state.campaigns.findIndex((c) => c.id === action.payload.id);
          if (idx !== -1) state.campaigns[idx] = action.payload;
          if (state.activeCampaign?.id === action.payload.id) state.activeCampaign = action.payload;
        }
      })
      .addCase(endAdvertiserCampaignThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to end campaign.';
      })

      // Wallet / Invoices / Transactions
      .addCase(fetchAdvertiserWalletThunk.fulfilled, (state, action) => {
        state.wallet = action.payload || state.wallet;
      })
      .addCase(fetchAdvertiserInvoicesThunk.fulfilled, (state, action) => {
        state.invoices = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAdvertiserTransactionsThunk.fulfilled, (state, action) => {
        if (action.payload && Array.isArray(action.payload.rows)) {
          state.transactions = action.payload.rows;
        } else if (Array.isArray(action.payload)) {
          state.transactions = action.payload;
        }
      })

      // Reports
      .addCase(fetchAdvertiserReportsThunk.fulfilled, (state, action) => {
        state.reports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(generateAdvertiserReportThunk.fulfilled, (state, action) => {
        if (action.payload) state.reports.unshift(action.payload);
      })
      // MQTT Live Status
      .addCase(fetchMqttStatusThunk.fulfilled, (state, action) => {
        state.mqttStatus = action.payload;
      });
  },
});

export const { clearActiveCampaign, clearAdvertiserError } = advertiserRoleSlice.actions;

export default advertiserRoleSlice.reducer;

export const selectAdvertiserCampaigns = (state) => state.advertiserRole.campaigns;
export const selectAdvertiserFleetOptions = (state) => state.advertiserRole.fleetOptions;
export const selectAdvertiserMeta = (state) => state.advertiserRole.meta;
export const selectAdvertiserActiveCampaign = (state) => state.advertiserRole.activeCampaign;
export const selectAdvertiserCampaignAnalytics = (state) => state.advertiserRole.campaignAnalytics;
export const selectAdvertiserMqttStatus = (state) => state.advertiserRole.mqttStatus;
export const selectAdvertiserWallet = (state) => state.advertiserRole.wallet;
export const selectAdvertiserInvoices = (state) => state.advertiserRole.invoices;
export const selectAdvertiserTransactions = (state) => state.advertiserRole.transactions;
export const selectAdvertiserReports = (state) => state.advertiserRole.reports;
export const selectAdvertiserPaymentOrder = (state) => state.advertiserRole.paymentOrder;
export const selectAdvertiserLoading = (state) => state.advertiserRole.loading;
export const selectAdvertiserStatus = (state) => state.advertiserRole.status;
export const selectAdvertiserSlotAvailability = (state) => state.advertiserRole.slotAvailability;
export const selectAdvertiserReviews = (state) => state.advertiserRole.reviews;

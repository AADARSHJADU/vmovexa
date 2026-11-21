import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCampaignsThunk,
  fetchSuperCampaignThunk,
  fetchApprovalsThunk,
  approveCampaignThunk,
  rejectCampaignThunk,
  shareSuperCampaignPaymentLinkThunk,
} from '../../thunks/superadmin/campaign.thunks.js';

export {
  fetchCampaignsThunk,
  fetchSuperCampaignThunk,
  fetchApprovalsThunk,
  approveCampaignThunk,
  rejectCampaignThunk,
  shareSuperCampaignPaymentLinkThunk,
};

const initialState = {
  campaigns: [],
  campaignsPagination: null,
  selectedCampaign: null,
  approvals: [],
  status: 'idle',
  error: null,
};

const superCampaignSlice = createSlice({
  name: 'superCampaign',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignsThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCampaignsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.campaigns = Array.isArray(action.payload) ? action.payload : (action.payload?.rows || []);
        if (action.payload?.meta) state.campaignsPagination = action.payload.meta;
      })
      .addCase(fetchSuperCampaignThunk.fulfilled, (state, action) => {
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchApprovalsThunk.fulfilled, (state, action) => {
        state.approvals = action.payload;
      });
  },
});

export default superCampaignSlice.reducer;
export const selectSuperCampaigns = (state) => state.superCampaign.campaigns;
export const selectSuperCampaignsPagination = (state) => state.superCampaign.campaignsPagination;
export const selectSuperApprovals = (state) => state.superCampaign.approvals;
export const selectSuperSelectedCampaign = (state) => state.superCampaign.selectedCampaign;

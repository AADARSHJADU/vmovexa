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
        state.campaigns = action.payload;
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
export const selectSuperApprovals = (state) => state.superCampaign.approvals;
export const selectSuperSelectedCampaign = (state) => state.superCampaign.selectedCampaign;

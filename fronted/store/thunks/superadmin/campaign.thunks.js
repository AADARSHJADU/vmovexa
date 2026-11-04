import { createAsyncThunk } from '@reduxjs/toolkit';
import { superCampaignService } from '../../../api/services/superadmin/campaign.service.js';

export const fetchCampaignsThunk = createAsyncThunk(
  'superadmin/campaign/fetchCampaigns',
  async (params, { rejectWithValue }) => {
    try { return await superCampaignService.getCampaigns(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchSuperCampaignThunk = createAsyncThunk(
  'superadmin/campaign/fetchOne',
  async (id, { rejectWithValue }) => {
    try { return await superCampaignService.getCampaign(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchApprovalsThunk = createAsyncThunk(
  'superadmin/campaign/fetchApprovals',
  async (params, { rejectWithValue }) => {
    try { return await superCampaignService.getApprovals(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const approveCampaignThunk = createAsyncThunk(
  'superadmin/campaign/approveCampaign',
  async ({ approvalId, reason, campaignId }, { rejectWithValue }) => {
    try { return await superCampaignService.approveCampaign(approvalId, reason, campaignId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const rejectCampaignThunk = createAsyncThunk(
  'superadmin/campaign/rejectCampaign',
  async ({ approvalId, reason, campaignId }, { rejectWithValue }) => {
    try { return await superCampaignService.rejectCampaign(approvalId, reason, campaignId); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const shareSuperCampaignPaymentLinkThunk = createAsyncThunk(
  'superadmin/campaign/sharePaymentLink',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await superCampaignService.sharePaymentLink(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);


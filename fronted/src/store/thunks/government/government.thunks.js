import { createAsyncThunk } from '@reduxjs/toolkit';
import { governmentService } from '../../../api/services/government/government.service.js';
import { normalizeError } from '../../../utils/apiResponse.js';

export const fetchGovCampaignsThunk = createAsyncThunk(
  'government/fetchCampaigns',
  async (params, { rejectWithValue }) => {
    try { return await governmentService.getCampaigns(params); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchGovCampaignByIdThunk = createAsyncThunk(
  'government/fetchCampaignById',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.getCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const createGovCampaignThunk = createAsyncThunk(
  'government/createCampaign',
  async (data, { rejectWithValue }) => {
    try { return await governmentService.createCampaign(data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const updateGovCampaignThunk = createAsyncThunk(
  'government/updateCampaign',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await governmentService.updateCampaign(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const deleteGovCampaignThunk = createAsyncThunk(
  'government/deleteCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.deleteCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const approveGovCampaignThunk = createAsyncThunk(
  'government/approveCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.approveCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const rejectGovCampaignThunk = createAsyncThunk(
  'government/rejectCampaign',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await governmentService.rejectCampaign(id, reason); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const startGovCampaignThunk = createAsyncThunk(
  'government/startCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.startCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const stopGovCampaignThunk = createAsyncThunk(
  'government/stopCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.stopCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const endGovCampaignThunk = createAsyncThunk(
  'government/endCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.endCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const verifyGovCampaignThunk = createAsyncThunk(
  'government/verifyCampaign',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.verifyCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchGovMqttStatusThunk = createAsyncThunk(
  'government/fetchMqttStatus',
  async (_, { rejectWithValue }) => {
    try { return await governmentService.getMqttStatus(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const shareGovPaymentLinkThunk = createAsyncThunk(
  'government/sharePaymentLink',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await governmentService.sharePaymentLink(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const recordGovOfflinePaymentThunk = createAsyncThunk(
  'government/recordOfflinePayment',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await governmentService.recordOfflinePayment(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchGovEmergencyBroadcastsThunk = createAsyncThunk(
  'government/fetchBroadcasts',
  async (params, { rejectWithValue }) => {
    try { return await governmentService.getEmergencyBroadcasts(params); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchGovEmergencyBroadcastByIdThunk = createAsyncThunk(
  'government/fetchBroadcastById',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.getEmergencyBroadcast(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const createGovBroadcastThunk = createAsyncThunk(
  'government/createBroadcast',
  async (data, { rejectWithValue }) => {
    try { return await governmentService.createEmergencyBroadcast(data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const updateGovBroadcastThunk = createAsyncThunk(
  'government/updateBroadcast',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await governmentService.updateEmergencyBroadcast(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const deleteGovBroadcastThunk = createAsyncThunk(
  'government/deleteBroadcast',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.deleteEmergencyBroadcast(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const revokeGovBroadcastThunk = createAsyncThunk(
  'government/revokeBroadcast',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.revokeEmergencyBroadcast(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const approveGovBroadcastThunk = createAsyncThunk(
  'government/approveBroadcast',
  async (id, { rejectWithValue }) => {
    try { return await governmentService.approveEmergencyBroadcast(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const rejectGovBroadcastThunk = createAsyncThunk(
  'government/rejectBroadcast',
  async ({ id, reason }, { rejectWithValue }) => {
    try { return await governmentService.rejectEmergencyBroadcast(id, reason); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchGovAnalyticsThunk = createAsyncThunk(
  'government/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try { return await governmentService.getAgencyAnalytics(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

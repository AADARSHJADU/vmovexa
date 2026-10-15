import { createAsyncThunk } from '@reduxjs/toolkit';
import { advertiserService } from '../../../api/services/advertiser/advertiser.service.js';
import { normalizeError } from '../../../utils/apiResponse.js';

export const fetchAdvertiserCampaignsThunk = createAsyncThunk(
  'advertiser/fetchCampaigns',
  async (params, { rejectWithValue }) => {
    try { return await advertiserService.getCampaigns(params); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchFleetOptionsThunk = createAsyncThunk(
  'advertiser/fetchFleetOptions',
  async (_, { rejectWithValue }) => {
    try { return await advertiserService.getFleetOptions(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserCampaignDetailsThunk = createAsyncThunk(
  'advertiser/fetchCampaignDetails',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.getCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserCampaignAnalyticsThunk = createAsyncThunk(
  'advertiser/fetchCampaignAnalytics',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.getCampaignAnalytics(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const createAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/createCampaign',
  async (data, { rejectWithValue }) => {
    try { return await advertiserService.createCampaign(data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const updateAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/updateCampaign',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await advertiserService.updateCampaign(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const deleteAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/deleteCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.deleteCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const submitAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/submitCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.submitCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const verifyAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/verifyCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.verifyCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const initiateCampaignPaymentThunk = createAsyncThunk(
  'advertiser/initiatePayment',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.initiatePayment(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const confirmCampaignPaymentThunk = createAsyncThunk(
  'advertiser/confirmPayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try { return await advertiserService.confirmPayment(id, paymentData); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const startAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/startCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.startCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const stopAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/stopCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.stopCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const endAdvertiserCampaignThunk = createAsyncThunk(
  'advertiser/endCampaign',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.endCampaign(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const shareCampaignPaymentLinkThunk = createAsyncThunk(
  'advertiser/sharePaymentLink',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await advertiserService.sharePaymentLink(id, data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserWalletThunk = createAsyncThunk(
  'advertiser/fetchWallet',
  async (_, { rejectWithValue }) => {
    try { return await advertiserService.getWalletBalance(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserInvoicesThunk = createAsyncThunk(
  'advertiser/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try { return await advertiserService.getInvoices(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserTransactionsThunk = createAsyncThunk(
  'advertiser/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try { return await advertiserService.getTransactions(params); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchAdvertiserReportsThunk = createAsyncThunk(
  'advertiser/fetchReports',
  async (_, { rejectWithValue }) => {
    try { return await advertiserService.getReports(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const generateAdvertiserReportThunk = createAsyncThunk(
  'advertiser/generateReport',
  async (data, { rejectWithValue }) => {
    try { return await advertiserService.generateReport(data); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchMqttStatusThunk = createAsyncThunk(
  'advertiser/fetchMqttStatus',
  async (_, { rejectWithValue }) => {
    try { return await advertiserService.getMqttStatus(); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);


export const fetchSlotAvailabilityThunk = createAsyncThunk(
  'advertiser/fetchSlotAvailability',
  async (params, { rejectWithValue }) => {
    try { return await advertiserService.getSlotAvailability(params); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);

export const fetchCampaignReviewsThunk = createAsyncThunk(
  'advertiser/fetchCampaignReviews',
  async (id, { rejectWithValue }) => {
    try { return await advertiserService.getCampaignReviews(id); }
    catch (err) { return rejectWithValue(normalizeError(err)); }
  }
);



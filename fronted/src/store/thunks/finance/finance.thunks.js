import { createAsyncThunk } from '@reduxjs/toolkit';
import { financeService } from '../../../api/services/finance/finance.service.js';

export const fetchFinanceKpisThunk = createAsyncThunk(
  'finance/fetchKpis',
  async (_, { rejectWithValue }) => {
    try { return await financeService.getKpis(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceSubscriptionsThunk = createAsyncThunk(
  'finance/fetchSubscriptions',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getSubscriptions(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceInvoicesThunk = createAsyncThunk(
  'finance/fetchInvoices',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getInvoices(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceInvoiceByIdThunk = createAsyncThunk(
  'finance/fetchInvoiceById',
  async (id, { rejectWithValue }) => {
    try { return await financeService.getInvoice(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const generateFinanceInvoiceThunk = createAsyncThunk(
  'finance/generateInvoice',
  async (data, { rejectWithValue }) => {
    try { return await financeService.generateInvoice(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const markFinanceInvoicePaidThunk = createAsyncThunk(
  'finance/markInvoicePaid',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await financeService.markInvoicePaid(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinancePaymentsThunk = createAsyncThunk(
  'finance/fetchPayments',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getPayments(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinancePaymentByIdThunk = createAsyncThunk(
  'finance/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try { return await financeService.getPayment(id); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const sendFinancePaymentReminderThunk = createAsyncThunk(
  'finance/sendPaymentReminder',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await financeService.sendPaymentReminder(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceCampaignPaymentsThunk = createAsyncThunk(
  'finance/fetchCampaignPayments',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getCampaignPayments(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const shareFinanceCampaignPaymentLinkThunk = createAsyncThunk(
  'finance/shareCampaignPaymentLink',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await financeService.shareCampaignPaymentLink(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const recordFinanceManualPaymentThunk = createAsyncThunk(
  'finance/recordManualPayment',
  async ({ id, data }, { rejectWithValue }) => {
    try { return await financeService.recordManualCampaignPayment(id, data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceReconciliationSummaryThunk = createAsyncThunk(
  'finance/fetchReconciliationSummary',
  async (_, { rejectWithValue }) => {
    try { return await financeService.getReconciliationSummary(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceReconciliationTransactionsThunk = createAsyncThunk(
  'finance/fetchReconciliationTransactions',
  async (_, { rejectWithValue }) => {
    try { return await financeService.getReconciliationTransactions(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const autoMatchFinanceReconciliationThunk = createAsyncThunk(
  'finance/autoMatchReconciliation',
  async (_, { rejectWithValue }) => {
    try { return await financeService.autoMatchReconciliation(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const finalizeFinanceReconciliationThunk = createAsyncThunk(
  'finance/finalizeReconciliation',
  async (data, { rejectWithValue }) => {
    try { return await financeService.finalizeReconciliation(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceGstSummaryThunk = createAsyncThunk(
  'finance/fetchGstSummary',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getGstSummary(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceGstr1JsonThunk = createAsyncThunk(
  'finance/fetchGstr1Json',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getGstr1Json(params); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceSettingsThunk = createAsyncThunk(
  'finance/fetchSettings',
  async (_, { rejectWithValue }) => {
    try { return await financeService.getSettings(); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const updateFinanceSettingsThunk = createAsyncThunk(
  'finance/updateSettings',
  async (data, { rejectWithValue }) => {
    try { return await financeService.updateSettings(data); }
    catch (err) { return rejectWithValue(err); }
  }
);

export const fetchFinanceReportSummaryThunk = createAsyncThunk(
  'finance/fetchReportSummary',
  async (params, { rejectWithValue }) => {
    try { return await financeService.getReportSummary(params); }
    catch (err) { return rejectWithValue(err); }
  }
);



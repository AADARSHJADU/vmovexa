import { createSlice } from '@reduxjs/toolkit';
import {
  fetchFinanceKpisThunk,
  fetchFinanceSubscriptionsThunk,
  fetchFinanceInvoicesThunk,
  fetchFinanceInvoiceByIdThunk,
  generateFinanceInvoiceThunk,
  markFinanceInvoicePaidThunk,
  fetchFinancePaymentsThunk,
  fetchFinancePaymentByIdThunk,
  sendFinancePaymentReminderThunk,
  fetchFinanceCampaignPaymentsThunk,
  shareFinanceCampaignPaymentLinkThunk,
  recordFinanceManualPaymentThunk,
  fetchFinanceReconciliationSummaryThunk,
  fetchFinanceReconciliationTransactionsThunk,
  autoMatchFinanceReconciliationThunk,
  finalizeFinanceReconciliationThunk,
  fetchFinanceGstSummaryThunk,
  fetchFinanceGstr1JsonThunk,
  fetchFinanceSettingsThunk,
  updateFinanceSettingsThunk,
  fetchFinanceReportSummaryThunk,
} from '../../thunks/finance/finance.thunks.js';

export {
  fetchFinanceKpisThunk,
  fetchFinanceSubscriptionsThunk,
  fetchFinanceInvoicesThunk,
  fetchFinanceInvoiceByIdThunk,
  generateFinanceInvoiceThunk,
  markFinanceInvoicePaidThunk,
  fetchFinancePaymentsThunk,
  fetchFinancePaymentByIdThunk,
  sendFinancePaymentReminderThunk,
  fetchFinanceCampaignPaymentsThunk,
  shareFinanceCampaignPaymentLinkThunk,
  recordFinanceManualPaymentThunk,
  fetchFinanceReconciliationSummaryThunk,
  fetchFinanceReconciliationTransactionsThunk,
  autoMatchFinanceReconciliationThunk,
  finalizeFinanceReconciliationThunk,
  fetchFinanceGstSummaryThunk,
  fetchFinanceGstr1JsonThunk,
  fetchFinanceSettingsThunk,
  updateFinanceSettingsThunk,
  fetchFinanceReportSummaryThunk,
};

const initialState = {
  kpis: null,
  subscriptions: [],
  invoices: [],
  currentInvoice: null,
  payments: [],
  currentPayment: null,
  campaignPayments: [],
  reconciliationSummary: null,
  reconciliationTransactions: [],
  gstSummary: null,
  gstr1Json: null,
  settings: null,
  reportSummary: { activeSubs: 0, activeCampaigns: 0, campaignRevenue: 0, subRevenue: 0, totalRevenue: 0, taxTotal: 0 },
  status: 'idle',
  error: null,
};

const financeRoleSlice = createSlice({
  name: 'financeRole',
  initialState,
  reducers: {
    clearCurrentInvoice: (state) => { state.currentInvoice = null; },
    clearCurrentPayment: (state) => { state.currentPayment = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceKpisThunk.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchFinanceKpisThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.kpis = action.payload;
      })
      .addCase(fetchFinanceSubscriptionsThunk.fulfilled, (state, action) => {
        state.subscriptions = action.payload;
      })
      .addCase(fetchFinanceInvoicesThunk.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })
      .addCase(fetchFinanceInvoiceByIdThunk.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
      })
      .addCase(markFinanceInvoicePaidThunk.fulfilled, (state, action) => {
        state.currentInvoice = action.payload;
      })
      .addCase(fetchFinancePaymentsThunk.fulfilled, (state, action) => {
        state.payments = action.payload;
      })
      .addCase(fetchFinancePaymentByIdThunk.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })
      .addCase(fetchFinanceCampaignPaymentsThunk.fulfilled, (state, action) => {
        state.campaignPayments = action.payload;
      })
      .addCase(recordFinanceManualPaymentThunk.fulfilled, (state, action) => {
        if (action.payload?.invoice) {
          state.currentInvoice = action.payload.invoice;
        }
      })
      .addCase(fetchFinanceReconciliationSummaryThunk.fulfilled, (state, action) => {
        state.reconciliationSummary = action.payload;
      })
      .addCase(fetchFinanceReconciliationTransactionsThunk.fulfilled, (state, action) => {
        state.reconciliationTransactions = action.payload;
      })
      .addCase(fetchFinanceGstSummaryThunk.fulfilled, (state, action) => {
        state.gstSummary = action.payload;
      })
      .addCase(fetchFinanceGstr1JsonThunk.fulfilled, (state, action) => {
        state.gstr1Json = action.payload;
      })
      .addCase(fetchFinanceSettingsThunk.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateFinanceSettingsThunk.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(fetchFinanceReportSummaryThunk.fulfilled, (state, action) => {
        state.reportSummary = action.payload;
      });
  },
});

export const { clearCurrentInvoice, clearCurrentPayment } = financeRoleSlice.actions;
export default financeRoleSlice.reducer;

export const selectFinanceKpis = (state) => state.financeRole.kpis;
export const selectFinanceSubscriptions = (state) => state.financeRole.subscriptions;
export const selectFinanceInvoices = (state) => state.financeRole.invoices;
export const selectFinanceCurrentInvoice = (state) => state.financeRole.currentInvoice;
export const selectFinancePayments = (state) => state.financeRole.payments;
export const selectFinanceCurrentPayment = (state) => state.financeRole.currentPayment;
export const selectFinanceCampaignPayments = (state) => state.financeRole.campaignPayments;
export const selectFinanceReconciliationSummary = (state) => state.financeRole.reconciliationSummary;
export const selectFinanceReconciliationTransactions = (state) => state.financeRole.reconciliationTransactions;
export const selectFinanceGstSummary = (state) => state.financeRole.gstSummary;
export const selectFinanceGstr1Json = (state) => state.financeRole.gstr1Json;
export const selectFinanceSettings = (state) => state.financeRole.settings;
export const selectFinanceStatus = (state) => state.financeRole.status;
export const selectFinanceReportSummary = (state) => state.financeRole.reportSummary;



import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFinanceKpis,
  selectFinanceSubscriptions,
  selectFinanceSubscriptionsPagination,
  selectFinanceInvoices,
  selectFinanceInvoicesPagination,
  selectFinanceCurrentInvoice,
  selectFinancePayments,
  selectFinancePaymentsPagination,
  selectFinanceCurrentPayment,
  selectFinanceCampaignPayments,
  selectFinanceCampaignPaymentsPagination,
  selectFinanceCampaignPaymentsCounts,
  selectFinanceCampaignPaymentsSummary,
  selectFinanceCurrentCampaignPayment,
  selectFinanceReconciliationSummary,
  selectFinanceReconciliationTransactions,
  selectFinanceGstSummary,
  selectFinanceGstr1Json,
  selectFinanceSettings,
  selectFinanceStatus,
  selectFinanceReportSummary,
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
  fetchFinanceCampaignPaymentByIdThunk,
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
  clearCurrentInvoice,
  clearCurrentPayment,
  clearCurrentCampaignPayment,
  fetchFinanceReportSummaryThunk,
} from '../../store/slices/finance/financeSlice.js';
import { useAuth } from '../useAuth.js';

export const useFinanceRole = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useAuth();

  // Granular Finance Permission Helpers
  const canManageGst = hasPermission('finance.gst.export');
  const canCreateGst = hasPermission('finance.gst.export');
  const canUpdateGst = hasPermission('finance.gst.export');

  const canManageInvoices = hasPermission('finance.invoices.create') || hasPermission('finance.invoices.update');
  const canCreateInvoices = hasPermission('finance.invoices.create');
  const canUpdateInvoices = hasPermission('finance.invoices.update');
  const canDeleteInvoices = false;

  const canManagePayments = hasPermission('finance.payments.remind') || hasPermission('finance.campaign_payments.collect');
  const canCreatePayments = hasPermission('finance.payments.remind') || hasPermission('finance.campaign_payments.collect');
  const canUpdatePayments = hasPermission('finance.payments.remind') || hasPermission('finance.campaign_payments.collect');
  const canDeletePayments = false;

  const canManageReconciliation = hasPermission('finance.reconciliation.run');
  const canCreateReconciliation = hasPermission('finance.reconciliation.run');
  const canUpdateReconciliation = hasPermission('finance.reconciliation.run');

  const canManageReports = hasPermission('finance.reports.create') || hasPermission('finance.reports.export') || hasPermission('finance.reports.delete');
  const canCreateReports = hasPermission('finance.reports.create');

  const canManageSettlements = hasPermission('finance.reconciliation.run');
  const canCreateSettlements = hasPermission('finance.reconciliation.run');
  const canUpdateSettlements = hasPermission('finance.reconciliation.run');
  const canViewSettlements = hasPermission('finance.settlements.view');

  const canManageSubscriptions = hasPermission('finance.tenants.create') || hasPermission('finance.tenants.update');
  const canCreateSubscriptions = hasPermission('finance.tenants.create');
  const canUpdateSubscriptions = hasPermission('finance.tenants.update');
  const canDeleteSubscriptions = false;

  const kpis = useAppSelector(selectFinanceKpis);
  const subscriptions = useAppSelector(selectFinanceSubscriptions);
  const subscriptionsPagination = useAppSelector(selectFinanceSubscriptionsPagination);
  const invoices = useAppSelector(selectFinanceInvoices);
  const invoicesPagination = useAppSelector(selectFinanceInvoicesPagination);
  const currentInvoice = useAppSelector(selectFinanceCurrentInvoice);
  const payments = useAppSelector(selectFinancePayments);
  const paymentsPagination = useAppSelector(selectFinancePaymentsPagination);
  const currentPayment = useAppSelector(selectFinanceCurrentPayment);
  const campaignPayments = useAppSelector(selectFinanceCampaignPayments);
  const campaignPaymentsPagination = useAppSelector(selectFinanceCampaignPaymentsPagination);
  const campaignPaymentsCounts = useAppSelector(selectFinanceCampaignPaymentsCounts);
  const campaignPaymentsSummary = useAppSelector(selectFinanceCampaignPaymentsSummary);
  const currentCampaignPayment = useAppSelector(selectFinanceCurrentCampaignPayment);
  const reconciliationSummary = useAppSelector(selectFinanceReconciliationSummary);
  const reconciliationTransactions = useAppSelector(selectFinanceReconciliationTransactions);
  const gstSummary = useAppSelector(selectFinanceGstSummary);
  const gstr1Json = useAppSelector(selectFinanceGstr1Json);
  const settings = useAppSelector(selectFinanceSettings);
  const status = useAppSelector(selectFinanceStatus);
  const reportSummary = useAppSelector(selectFinanceReportSummary);

  const loadKpis = useCallback((params) => dispatch(fetchFinanceKpisThunk(params)).unwrap(), [dispatch]);
  const loadSubscriptions = useCallback((params) => dispatch(fetchFinanceSubscriptionsThunk(params)).unwrap(), [dispatch]);
  const loadInvoices = useCallback((params) => dispatch(fetchFinanceInvoicesThunk(params)).unwrap(), [dispatch]);
  const loadInvoice = useCallback((id) => dispatch(fetchFinanceInvoiceByIdThunk(id)).unwrap(), [dispatch]);
  const generateInvoice = useCallback((data) => dispatch(generateFinanceInvoiceThunk(data)).unwrap(), [dispatch]);
  const markInvoicePaid = useCallback((id, data) => dispatch(markFinanceInvoicePaidThunk({ id, data })).unwrap(), [dispatch]);

  const loadPayments = useCallback((params) => dispatch(fetchFinancePaymentsThunk(params)).unwrap(), [dispatch]);
  const loadPayment = useCallback((id) => dispatch(fetchFinancePaymentByIdThunk(id)).unwrap(), [dispatch]);
  const sendPaymentReminder = useCallback((id, data) => dispatch(sendFinancePaymentReminderThunk({ id, data })).unwrap(), [dispatch]);

  const loadCampaignPayments = useCallback((params) => dispatch(fetchFinanceCampaignPaymentsThunk(params)).unwrap(), [dispatch]);
  const shareCampaignPaymentLink = useCallback((id, data) => dispatch(shareFinanceCampaignPaymentLinkThunk({ id, data })).unwrap(), [dispatch]);
  const recordManualPayment = useCallback((id, data) => dispatch(recordFinanceManualPaymentThunk({ id, data })).unwrap(), [dispatch]);
  const loadCampaignPayment = useCallback((id) => dispatch(fetchFinanceCampaignPaymentByIdThunk(id)).unwrap(), [dispatch]);
  const resetCurrentCampaignPayment = useCallback(() => dispatch(clearCurrentCampaignPayment()), [dispatch]);

  const loadReconciliationSummary = useCallback(() => dispatch(fetchFinanceReconciliationSummaryThunk()).unwrap(), [dispatch]);
  const loadReconciliationTransactions = useCallback(() => dispatch(fetchFinanceReconciliationTransactionsThunk()).unwrap(), [dispatch]);
  const autoMatchReconciliation = useCallback(() => dispatch(autoMatchFinanceReconciliationThunk()).unwrap(), [dispatch]);
  const finalizeReconciliation = useCallback((data) => dispatch(finalizeFinanceReconciliationThunk(data)).unwrap(), [dispatch]);

  const loadGstSummary = useCallback((params) => dispatch(fetchFinanceGstSummaryThunk(params)).unwrap(), [dispatch]);
  const loadGstr1Json = useCallback((params) => dispatch(fetchFinanceGstr1JsonThunk(params)).unwrap(), [dispatch]);

  const loadSettings = useCallback(() => dispatch(fetchFinanceSettingsThunk()).unwrap(), [dispatch]);
  const updateSettings = useCallback((data) => dispatch(updateFinanceSettingsThunk(data)).unwrap(), [dispatch]);
  const loadReportSummary = useCallback((params) => dispatch(fetchFinanceReportSummaryThunk(params)).unwrap(), [dispatch]);

  const resetCurrentInvoice = useCallback(() => dispatch(clearCurrentInvoice()), [dispatch]);
  const resetCurrentPayment = useCallback(() => dispatch(clearCurrentPayment()), [dispatch]);

  return {
    kpis, subscriptions, subscriptionsPagination, invoices, invoicesPagination, currentInvoice,
    payments, paymentsPagination, currentPayment,
    campaignPayments, campaignPaymentsPagination, campaignPaymentsCounts, campaignPaymentsSummary, currentCampaignPayment, reconciliationSummary, reconciliationTransactions,
    gstSummary, gstr1Json, settings, status, reportSummary,
    loadKpis, loadSubscriptions, loadInvoices, loadInvoice, generateInvoice, markInvoicePaid,
    loadPayments, loadPayment, sendPaymentReminder,
    loadCampaignPayments, loadCampaignPayment, shareCampaignPaymentLink, recordManualPayment, resetCurrentCampaignPayment,
    loadReconciliationSummary, loadReconciliationTransactions, autoMatchReconciliation, finalizeReconciliation,
    loadGstSummary, loadGstr1Json, loadSettings, updateSettings, resetCurrentInvoice, resetCurrentPayment,
    loadReportSummary,
    canManageGst, canCreateGst, canUpdateGst,
    canManageInvoices, canCreateInvoices, canUpdateInvoices, canDeleteInvoices,
    canManagePayments, canCreatePayments, canUpdatePayments, canDeletePayments,
    canManageReconciliation, canCreateReconciliation, canUpdateReconciliation,
    canManageReports, canCreateReports,
    canManageSettlements, canCreateSettlements, canUpdateSettlements, canViewSettlements,
    canManageSubscriptions, canCreateSubscriptions, canUpdateSubscriptions, canDeleteSubscriptions,
    can: hasPermission,
  };
};

export default useFinanceRole;


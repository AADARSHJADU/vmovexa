import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFinanceKpis,
  selectFinanceSubscriptions,
  selectFinanceInvoices,
  selectFinanceCurrentInvoice,
  selectFinancePayments,
  selectFinanceCurrentPayment,
  selectFinanceCampaignPayments,
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
  fetchFinanceReportSummaryThunk,
} from '../../store/slices/finance/financeSlice.js';
import { useAuth } from '../useAuth.js';

export const useFinanceRole = () => {
  const dispatch = useAppDispatch();
  const { hasPermission, user } = useAuth();

  // Granular Finance Permission Helpers
  const canManageGst = hasPermission('finance.gst.manage') || hasPermission('finance.gst.update') || hasPermission('finance.gst.create');
  const canCreateGst = hasPermission('finance.gst.create');
  const canUpdateGst = hasPermission('finance.gst.update');

  const canManageInvoices = hasPermission('finance.invoices.manage');
  const canCreateInvoices = hasPermission('finance.invoices.create');
  const canUpdateInvoices = hasPermission('finance.invoices.update');
  const canDeleteInvoices = hasPermission('finance.invoices.delete');

  const canManagePayments = hasPermission('finance.payments.manage');
  const canCreatePayments = hasPermission('finance.payments.create');
  const canUpdatePayments = hasPermission('finance.payments.update');
  const canDeletePayments = hasPermission('finance.payments.delete');

  const canManageReconciliation = hasPermission('finance.reconciliation.manage') || hasPermission('finance.reconciliation.create') || hasPermission('finance.reconciliation.update');
  const canCreateReconciliation = hasPermission('finance.reconciliation.create');
  const canUpdateReconciliation = hasPermission('finance.reconciliation.update');

  const canManageReports = hasPermission('finance.reports.manage');
  const canCreateReports = hasPermission('finance.reports.create');

  const canManageSettlements = hasPermission('finance.settlements.manage');
  const canCreateSettlements = hasPermission('finance.settlements.create');
  const canUpdateSettlements = hasPermission('finance.settlements.update');
  const canViewSettlements = hasPermission('finance.settlements.view');

  const canManageSubscriptions = hasPermission('finance.subscriptions.manage');
  const canCreateSubscriptions = hasPermission('finance.subscriptions.create');
  const canUpdateSubscriptions = hasPermission('finance.subscriptions.update');
  const canDeleteSubscriptions = hasPermission('finance.subscriptions.delete');

  const kpis = useAppSelector(selectFinanceKpis);
  const subscriptions = useAppSelector(selectFinanceSubscriptions);
  const invoices = useAppSelector(selectFinanceInvoices);
  const currentInvoice = useAppSelector(selectFinanceCurrentInvoice);
  const payments = useAppSelector(selectFinancePayments);
  const currentPayment = useAppSelector(selectFinanceCurrentPayment);
  const campaignPayments = useAppSelector(selectFinanceCampaignPayments);
  const reconciliationSummary = useAppSelector(selectFinanceReconciliationSummary);
  const reconciliationTransactions = useAppSelector(selectFinanceReconciliationTransactions);
  const gstSummary = useAppSelector(selectFinanceGstSummary);
  const gstr1Json = useAppSelector(selectFinanceGstr1Json);
  const settings = useAppSelector(selectFinanceSettings);
  const status = useAppSelector(selectFinanceStatus);
  const reportSummary = useAppSelector(selectFinanceReportSummary);

  const loadKpis = useCallback(() => dispatch(fetchFinanceKpisThunk()).unwrap(), [dispatch]);
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
    kpis, subscriptions, invoices, currentInvoice, payments, currentPayment,
    campaignPayments, reconciliationSummary, reconciliationTransactions,
    gstSummary, gstr1Json, settings, status, reportSummary,
    loadKpis, loadSubscriptions, loadInvoices, loadInvoice, generateInvoice, markInvoicePaid,
    loadPayments, loadPayment, sendPaymentReminder,
    loadCampaignPayments, shareCampaignPaymentLink, recordManualPayment,
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


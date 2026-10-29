import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

async function callPaginated(promise) {
  try { return unwrapPaginated((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const financeService = {
  getKpis: () => call(apiClient.get(ENDPOINTS.FINANCE.KPIS)),
  getSubscriptions: (params) => callPaginated(apiClient.get(ENDPOINTS.FINANCE.SUBSCRIPTIONS, { params })),
  getSubscription: (id) => call(apiClient.get(ENDPOINTS.FINANCE.SUBSCRIPTION(id))),
  getInvoices: (params) => callPaginated(apiClient.get(ENDPOINTS.FINANCE.INVOICES, { params })),
  getInvoice: (id) => call(apiClient.get(ENDPOINTS.FINANCE.INVOICE(id))),
  generateInvoice: (data) => call(apiClient.post(ENDPOINTS.FINANCE.INVOICES, data)),
  markInvoicePaid: (id, data) => call(apiClient.post(ENDPOINTS.FINANCE.MARK_INVOICE_PAID(id), data)),
  getPayments: (params) => callPaginated(apiClient.get(ENDPOINTS.FINANCE.PAYMENTS, { params })),
  getPayment: (id) => call(apiClient.get(ENDPOINTS.FINANCE.PAYMENT(id))),
  sendPaymentReminder: (id, data) => call(apiClient.post(ENDPOINTS.FINANCE.PAYMENT_REMINDER(id), data)),
  getCampaignPayments: (params) => callPaginated(apiClient.get(ENDPOINTS.FINANCE.CAMPAIGN_PAYMENTS, { params })),
  shareCampaignPaymentLink: (id, data) => call(apiClient.post(ENDPOINTS.FINANCE.CAMPAIGN_PAYMENT_SHARE(id), data)),
  recordManualCampaignPayment: (id, data) => call(apiClient.post(ENDPOINTS.FINANCE.CAMPAIGN_PAYMENT_MANUAL(id), data)),
  getReconciliationSummary: () => call(apiClient.get(ENDPOINTS.FINANCE.RECONCILIATION_SUMMARY)),
  getReconciliationTransactions: () => call(apiClient.get(ENDPOINTS.FINANCE.RECONCILIATION_TRANSACTIONS)),
  autoMatchReconciliation: () => call(apiClient.post(ENDPOINTS.FINANCE.RECONCILIATION_AUTO_MATCH)),
  finalizeReconciliation: (data) => call(apiClient.post(ENDPOINTS.FINANCE.RECONCILIATION_FINALIZE, data)),
  getGstSummary: (params) => call(apiClient.get(ENDPOINTS.FINANCE.GST_SUMMARY, { params })),
  getGstr1Json: (params) => call(apiClient.get(ENDPOINTS.FINANCE.GST_GSTR1_JSON, { params })),
  getSettings: () => call(apiClient.get(ENDPOINTS.FINANCE.SETTINGS)),
  updateSettings: (data) => call(apiClient.put(ENDPOINTS.FINANCE.SETTINGS, data)),
  getReportSummary: (params) => call(apiClient.get(ENDPOINTS.FINANCE.REPORT_SUMMARY, { params })),
};

export default financeService;


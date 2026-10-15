import { apiClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap, normalizeError } from '../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta?.pagination) {
      return { rows: res.data.data, meta: res.data.meta.pagination };
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const billingService = {
  getPlans: (params = {}) => call(apiClient.get(ENDPOINTS.BILLING.PLANS, { params })),
  getAllPlans: () => call(apiClient.get(`${ENDPOINTS.BILLING.PLANS}?all=true`)),
  createPlan: (data) => call(apiClient.post(ENDPOINTS.BILLING.PLANS, data)),
  updatePlan: (id, data) => call(apiClient.put(ENDPOINTS.BILLING.PLAN(id), data)),
  deletePlan: (id) => call(apiClient.delete(ENDPOINTS.BILLING.PLAN(id))),

  getSubscription: (params = {}) => call(apiClient.get(ENDPOINTS.BILLING.SUBSCRIPTION, { params })),
  createSubscriptionOrder: (data) => call(apiClient.post(ENDPOINTS.BILLING.SUBSCRIPTION_ORDER, data)),
  confirmSubscription: (data) => call(apiClient.post(ENDPOINTS.BILLING.SUBSCRIPTION_CONFIRM, data)),
  verifySession: (data) => call(apiClient.post(ENDPOINTS.BILLING.VERIFY_SESSION, data)),
  checkPaymentStatus: (data = {}) => call(apiClient.post(ENDPOINTS.BILLING.CHECK_STATUS, data)),

  getTransactions: (params = {}) => call(apiClient.get(ENDPOINTS.BILLING.TRANSACTIONS, { params })),
  recordOfflinePayment: (data) => call(apiClient.post(ENDPOINTS.BILLING.MANUAL_OFFLINE, data)),
  runExpiryScan: () => call(apiClient.post(ENDPOINTS.BILLING.CHECK_EXPIRIES)),

  getInvoices: () => call(apiClient.get(ENDPOINTS.BILLING.INVOICES)),
  getInvoice: (id) => call(apiClient.get(ENDPOINTS.BILLING.INVOICE(id))),
  payInvoice: (id, data) => call(apiClient.post(`/billing/invoices/${id}/pay`, data)),
  getInvoiceHtmlUrl: (id) => `${apiClient.defaults.baseURL || '/api/v1'}${ENDPOINTS.BILLING.INVOICE_HTML(id)}`,
};

export default billingService;

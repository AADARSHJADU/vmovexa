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
  getInvoiceHtmlUrl: (id, options = {}) => {
    const base = `${apiClient.defaults.baseURL || '/api/v1'}${ENDPOINTS.BILLING.INVOICE_HTML(id)}`;
    const params = new URLSearchParams();
    if (options.print !== false) params.set('print', 'true');
    if (options.token) params.set('token', options.token);
    const q = params.toString();
    return q ? `${base}?${q}` : base;
  },
  openInvoice: async (id, options = {}) => {
    if (!id) throw new Error('Invoice ID is required');
    const win = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    if (!win) throw new Error('Pop-up window blocked. Please allow pop-ups for this site.');
    try {
      const response = await apiClient.get(ENDPOINTS.BILLING.INVOICE_HTML(id), {
        params: { ...(options.print !== false ? { print: 'true' } : {}) },
        responseType: 'text',
      });
      const html = typeof response.data === 'string' ? response.data : String(response.data || '');
      if (!html.trim()) throw new Error('Invoice document was empty');
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      return billingService.getInvoiceHtmlUrl(id, options);
    } catch (error) {
      win.close();
      throw error;
    }
  },
};

export default billingService;

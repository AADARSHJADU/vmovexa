import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superBillingService = {
  getRevenueSummary: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_SUMMARY, { params })),
  getSettlements: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_SETTLEMENTS, { params })),
  getTopTenants: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_TOP_TENANTS, { params })),
  getShares: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_SHARES, { params })),
  getInvoices: (params) => call(apiClient.get(ENDPOINTS.BILLING.INVOICES, { params })),
  getSubscription: (params) => call(apiClient.get(ENDPOINTS.BILLING.SUBSCRIPTION, { params })),
};

export default superBillingService;

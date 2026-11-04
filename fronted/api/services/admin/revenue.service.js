import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const adminRevenueService = {
  getRevenueSummary: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_SUMMARY, { params })),
  getSettlements: (params) => call(apiClient.get(ENDPOINTS.BILLING.REVENUE_SETTLEMENTS, { params })),
  getInvoices: (params) => call(apiClient.get(ENDPOINTS.BILLING.INVOICES, { params })),
};

export default adminRevenueService;

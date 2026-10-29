import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const adminDashboardService = {
  getAdminKpis: (params) => call(apiClient.get(ENDPOINTS.DASHBOARD.ADMIN_KPIS, { params })),
  getLiveSummary: () => call(apiClient.get(ENDPOINTS.DASHBOARD.LIVE_SUMMARY)),
};

export default adminDashboardService;

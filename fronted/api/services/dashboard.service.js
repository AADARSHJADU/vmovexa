import { apiClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap, normalizeError } from '../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const dashboardService = {
  getSuperAdminKpis: () => call(apiClient.get(ENDPOINTS.DASHBOARD.SUPERADMIN_KPIS)),
  getAdminKpis: (params) => call(apiClient.get(ENDPOINTS.DASHBOARD.ADMIN_KPIS, { params })),
  getLiveSummary: () => call(apiClient.get(ENDPOINTS.DASHBOARD.LIVE_SUMMARY)),
  getSystemHealth: () => call(apiClient.get(ENDPOINTS.SYSTEM.HEALTH)),
};

export default dashboardService;

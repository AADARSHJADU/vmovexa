import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superDashboardService = {
  getSuperAdminKpis: () => call(apiClient.get(ENDPOINTS.DASHBOARD.SUPERADMIN_KPIS)),
  getLiveSummary: () => call(apiClient.get(ENDPOINTS.DASHBOARD.LIVE_SUMMARY)),
  getSystemHealth: () => call(apiClient.get(ENDPOINTS.SYSTEM.HEALTH)),
  getSystemDevices: () => call(apiClient.get(ENDPOINTS.SYSTEM.DEVICES)),
  getLiveTracking: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.TRACKING_LIVE, { params })),
  getTrackingRoutes: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.TRACKING_ROUTES)),
};

export default superDashboardService;

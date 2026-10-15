import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta?.pagination) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  }
  catch (err) { throw normalizeError(err); }
}

export const adminActivityService = {
  getActivityLogs: (params) => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.LIST, { params })),
  getCategories: () => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.CATEGORIES)),
  getFilters: () => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.FILTERS)),
  getLogDetails: (id) => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.ONE(id))),
};

export default adminActivityService;


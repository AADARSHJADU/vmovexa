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

export const superActivityService = {
  getActivityLogs: (params) => callPaginated(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.LIST, { params })),
  getCategories: () => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.CATEGORIES)),
  getLogDetails: (id) => call(apiClient.get(ENDPOINTS.ACTIVITY_LOGS.ONE(id))),
};

export default superActivityService;

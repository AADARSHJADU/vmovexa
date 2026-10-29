import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superEmergencyService = {
  getBroadcasts: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.EMERGENCY, { params })),
  createBroadcast: (data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.EMERGENCY, data)),
  revokeBroadcast: (id) => call(apiClient.post(`${ENDPOINTS.CAMPAIGNS.EMERGENCY}/${id}/revoke`)),
};

export default superEmergencyService;

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

export const adminDepotService = {
  getDepots: (params) => call(apiClient.get(ENDPOINTS.FLEET.DEPOTS, { params })),
  getDepot: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.DEPOTS}/${id}`)),
  createDepot: (data) => call(apiClient.post(ENDPOINTS.FLEET.DEPOTS, data)),
  updateDepot: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.DEPOTS}/${id}`, data)),
  deleteDepot: (id) => call(apiClient.delete(`${ENDPOINTS.FLEET.DEPOTS}/${id}`)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.FLEET.DEPOTS}/${id}`, { status })),
};

export default adminDepotService;



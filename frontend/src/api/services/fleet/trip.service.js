import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta && (res.data.meta.totalPages !== undefined || res.data.meta.total !== undefined || Array.isArray(res.data.data))) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const fleetTripService = {
  getTrips: (params) => call(apiClient.get(ENDPOINTS.FLEET.TRIPS, { params })),
  getTrip: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.TRIPS}/${id}`)),
  createTrip: (data) => call(apiClient.post(ENDPOINTS.FLEET.TRIPS, data)),
  endTrip: (id) => call(apiClient.patch(`${ENDPOINTS.FLEET.TRIPS}/${id}/end`)),
};

export default fleetTripService;

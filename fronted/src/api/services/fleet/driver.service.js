import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const fleetDriverService = {
  getDrivers: (params) => call(apiClient.get(ENDPOINTS.FLEET.DRIVERS, { params })),
  getDriver: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.DRIVERS}/${id}`)),
  createDriver: (data) => call(apiClient.post(ENDPOINTS.FLEET.DRIVERS, data)),
  updateDriver: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}`, data)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/status`, { status })),
  assignBus: (id, vehicleId) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/assign-bus`, { vehicleId })),
};

export default fleetDriverService;

import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const fleetGpsService = {
  getGpsDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.GPS, { params })),
  getGpsDevice: (id) => call(apiClient.get(`${ENDPOINTS.DEVICES.GPS}/${id}`)),
  createGpsDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.GPS, data)),
  updateGpsDevice: (id, data) => call(apiClient.patch(`${ENDPOINTS.DEVICES.GPS}/${id}`, data)),
  assignVehicle: (id, vehicleId) => call(apiClient.post(`${ENDPOINTS.DEVICES.GPS}/${id}/assign`, { vehicleId })),
  deleteGpsDevice: (id) => call(apiClient.delete(`${ENDPOINTS.DEVICES.GPS}/${id}`)),
  approveGpsDevice: (id) => call(apiClient.post(`${ENDPOINTS.DEVICES.GPS}/${id}/approve`)),
  rejectGpsDevice: (id, reason) => call(apiClient.post(`${ENDPOINTS.DEVICES.GPS}/${id}/reject`, { reason })),
};

export default fleetGpsService;

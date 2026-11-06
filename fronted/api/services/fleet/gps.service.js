import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const fleetGpsService = {
  getGpsDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE, { params })),
  getGpsDevice: (id) => call(apiClient.get(`${ENDPOINTS.DEVICES.EDGE}/${id}`)),
  createGpsDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE, data)),
  updateGpsDevice: (id, data) => call(apiClient.patch(`${ENDPOINTS.DEVICES.EDGE}/${id}`, data)),
  assignVehicle: (id, vehicleId) => call(apiClient.post(`${ENDPOINTS.DEVICES.EDGE}/${id}/assign`, { vehicleId })),
  deleteGpsDevice: (id) => call(apiClient.delete(`${ENDPOINTS.DEVICES.EDGE}/${id}`)),
  approveGpsDevice: (id) => call(apiClient.patch(`${ENDPOINTS.DEVICES.EDGE}/${id}/toggle`, { isActive: true })),
  rejectGpsDevice: (id) => call(apiClient.patch(`${ENDPOINTS.DEVICES.EDGE}/${id}/toggle`, { isActive: false })),

  // Direct Edge Device alias functions
  getEdgeDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE, { params })),
  getEdgeDevice: (id) => call(apiClient.get(`${ENDPOINTS.DEVICES.EDGE}/${id}`)),
  createEdgeDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE, data)),
  updateEdgeDevice: (id, data) => call(apiClient.patch(`${ENDPOINTS.DEVICES.EDGE}/${id}`, data)),
  assignEdgeVehicle: (id, vehicleId) => call(apiClient.post(`${ENDPOINTS.DEVICES.EDGE}/${id}/assign`, { vehicleId })),
  deleteEdgeDevice: (id) => call(apiClient.delete(`${ENDPOINTS.DEVICES.EDGE}/${id}`)),
};

export const fleetEdgeDeviceService = fleetGpsService;
export default fleetGpsService;

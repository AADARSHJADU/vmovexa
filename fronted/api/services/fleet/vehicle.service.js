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

export const fleetVehicleService = {
  getVehicles: (params) => call(apiClient.get(ENDPOINTS.FLEET.VEHICLES, { params })),
  getVehicle: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}`)),
  createVehicle: (data) => call(apiClient.post(ENDPOINTS.FLEET.VEHICLES, data)),
  updateVehicle: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}`, data)),
  assignDriver: (id, driverId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/assign-driver`, { driverId })),
  assignGps: (id, gpsDeviceId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/assign-gps`, { gpsDeviceId })),
  getTelemetry: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}/telemetry`)),
  getDocuments: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}/documents`)),
  approveDocument: (id, docId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/documents/${docId}/approve`)),
  rejectDocument: (id, docId, reason) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/documents/${docId}/reject`, { reason })),
};

export default fleetVehicleService;

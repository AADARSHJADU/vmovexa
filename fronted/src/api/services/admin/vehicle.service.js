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

export const adminVehicleService = {
  getVehicles: (params) => call(apiClient.get(ENDPOINTS.FLEET.VEHICLES, { params })),
  getVehicle: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}`)),
  createVehicle: (data) => call(apiClient.post(ENDPOINTS.FLEET.VEHICLES, data)),
  updateVehicle: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}`, data)),
  deleteVehicle: (id) => call(apiClient.delete(`${ENDPOINTS.FLEET.VEHICLES}/${id}`)),
  assignDriver: (id, driverId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/assign-driver`, { driverId })),
  assignGps: (id, gpsDeviceId) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/assign-gps`, { gpsDeviceId })),
  getTelemetry: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}/${id}/telemetry`)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}`, { status })),
  approveVehicle: (id) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/approve`)),
  rejectVehicle: (id, reason) => call(apiClient.patch(`${ENDPOINTS.FLEET.VEHICLES}/${id}/reject`, { reason })),
};

export default adminVehicleService;



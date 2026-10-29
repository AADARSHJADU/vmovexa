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

export const adminDriverService = {
  getDrivers: (params) => call(apiClient.get(ENDPOINTS.FLEET.DRIVERS, { params })),
  getDriver: (id) => call(apiClient.get(`${ENDPOINTS.FLEET.DRIVERS}/${id}`)),
  createDriver: (data) => call(apiClient.post(ENDPOINTS.FLEET.DRIVERS, data)),
  updateDriver: (id, data) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}`, data)),
  deleteDriver: (id) => call(apiClient.delete(`${ENDPOINTS.FLEET.DRIVERS}/${id}`)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/status`, { status })),
  approveDriver: (id) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/approve`)),
  rejectDriver: (id, reason) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/reject`, { reason })),
  verifyDriverDocuments: (id, verified = true) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/verify-documents`, { verified })),
  assignVehicle: (id, vehicleId) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}/assign-bus`, { vehicleId })),
  verifyDriver: (id, payload = {}) => call(apiClient.patch(`${ENDPOINTS.FLEET.DRIVERS}/${id}`, { aadhaar_verified: true, ...payload })),
  uploadDocument: async (file, purpose = 'driver_document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);
    const res = await apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'driver_avatar');
    const res = await apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },
};

export default adminDriverService;



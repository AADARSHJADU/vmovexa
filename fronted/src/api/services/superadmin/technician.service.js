import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    // Check for pagination specifically — every response has `meta.requestId`, only list responses have `meta.pagination`
    if (res?.data?.meta?.pagination) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  }
  catch (err) { throw normalizeError(err); }
}

export const superTechnicianService = {
  getCentralTechnicians: (params = {}) => call(apiClient.get(ENDPOINTS.USERS.LIST, { params: { ...params, roleCode: 'ROLE-CENTRAL-TECH' } })),
  getTechnician: (id) => call(apiClient.get(ENDPOINTS.USERS.ONE(id))),
  updateStatus: (id, status) => call(apiClient.patch(ENDPOINTS.USERS.STATUS(id), { status })),
  getWorkOrders: (params) => call(apiClient.get(ENDPOINTS.WORK_ORDERS.LIST, { params })),
  getWorkOrder: (id) => call(apiClient.get(ENDPOINTS.WORK_ORDERS.ONE(id))),
  createWorkOrder: (data) => call(apiClient.post(ENDPOINTS.WORK_ORDERS.LIST, data)),
  assignTechnician: (id, data) => call(apiClient.patch(ENDPOINTS.WORK_ORDERS.ASSIGN(id), data)),
  approveWorkOrder: (id) => call(apiClient.patch(ENDPOINTS.WORK_ORDERS.APPROVE(id))),
  rejectWorkOrder: (id, reason) => call(apiClient.patch(ENDPOINTS.WORK_ORDERS.REJECT(id), { reason })),
  updateWorkOrderStatus: (id, status, resolutionNotes) => call(apiClient.patch(ENDPOINTS.WORK_ORDERS.STATUS(id), { status, resolutionNotes })),
  registerTechnician: (data) => call(apiClient.post(ENDPOINTS.USERS.LIST, { ...data, roleCode: 'ROLE-CENTRAL-TECH' })),
  updateTechnician: (id, data) => call(apiClient.patch(ENDPOINTS.USERS.ONE(id), data)),
  deleteTechnician: (id) => call(apiClient.delete(ENDPOINTS.USERS.ONE(id))),
  uploadDocument: async (file, { purpose, entityId } = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', 'technician');
    if (purpose) formData.append('purpose', purpose);
    if (entityId) formData.append('entityId', entityId);
    const res = await apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'avatars');
    const res = await apiClient.post(ENDPOINTS.UPLOADS.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },
  deleteDocument: (id) => call(apiClient.delete(`${ENDPOINTS.UPLOADS.DOCUMENT}/${id}`)),
  dispatchWorkOrder: async (data) => {
    if (data && (data.vehicleId || data.vehicle_id)) {
      return call(apiClient.post(ENDPOINTS.WORK_ORDERS.DISPATCH, data));
    }
    const payload = {
      organizationId: Number(data.tenantId || data.organizationId),
      fleetId: data.fleetId ? Number(data.fleetId) : null,
      vehicleId: Number(data.vehicleId || data.busId),
      issueCategory: data.jobType || data.issueCategory,
      urgency: data.urgency || (data.slaDue?.toLowerCase().includes('emergency') ? 'critical' : data.slaDue?.toLowerCase().includes('critical') ? 'high' : 'normal'),
      description: data.instructions || data.description || null,
      technicianId: Number(data.technicianId),
      slaDueAt: data.slaDueAt || null,
      slaHours: data.slaHours || 24,
      eta: data.eta || null,
    };
    return call(apiClient.post(ENDPOINTS.WORK_ORDERS.DISPATCH, payload));
  },
};

export default superTechnicianService;

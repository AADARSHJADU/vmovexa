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
  dispatchWorkOrder: async ({ technicianId, tenantId, depot, busId, jobType, slaDue, instructions }) => {
    const wo = await call(apiClient.post(ENDPOINTS.WORK_ORDERS.LIST, {
      organizationId: tenantId ? Number(tenantId) : null,
      depotName: depot || 'Main Depot',
      busNumber: busId || null,
      issueCategory: jobType || 'Hardware Maintenance',
      urgency: slaDue?.toLowerCase().includes('emergency') ? 'critical' : slaDue?.toLowerCase().includes('critical') ? 'high' : 'normal',
      description: instructions || `Dispatched for ${jobType}`,
    }));
    const woId = wo?.id || wo?.data?.id;
    if (woId && technicianId) {
      const slaHours = slaDue?.includes('2 Hours') ? 2 : slaDue?.includes('4 Hours') ? 4 : slaDue?.includes('48 Hours') ? 48 : 24;
      return await call(apiClient.patch(ENDPOINTS.WORK_ORDERS.ASSIGN(woId), {
        technicianId: Number(technicianId),
        slaHours,
        eta: 'Dispatched to Depot',
      }));
    }
    return wo;
  },
};

export default superTechnicianService;

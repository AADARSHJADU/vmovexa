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
  } catch (err) {
    throw normalizeError(err);
  }
}

export const superFinanceOfficerService = {
  getFinanceOfficers: async (params = {}) => {
    try {
      const res = await apiClient.get(ENDPOINTS.USERS.LIST, { params: { ...params, roleCode: 'ROLE-FINANCE-OFFICER' } });
      return unwrapPaginated(res.data);
    } catch (err) {
      throw normalizeError(err);
    }
  },
  getFinanceOfficer: (id) =>
    call(apiClient.get(ENDPOINTS.USERS.ONE(id))),
  registerFinanceOfficer: (data) =>
    call(apiClient.post(ENDPOINTS.USERS.LIST, { ...data, roleCode: 'ROLE-FINANCE-OFFICER' })),
  updateStatus: (id, status) =>
    call(apiClient.patch(ENDPOINTS.USERS.STATUS(id), { status })),
  updateFinanceOfficer: (id, data) =>
    call(apiClient.patch(ENDPOINTS.USERS.ONE(id), data)),
  deleteFinanceOfficer: (id) =>
    call(apiClient.delete(ENDPOINTS.USERS.ONE(id))),
  getUserPermissions: (id) =>
    call(apiClient.get(ENDPOINTS.USERS.USER_PERMISSIONS(id))),
  updateUserPermissions: (id, permissions) =>
    call(apiClient.put(ENDPOINTS.USERS.USER_PERMISSIONS(id), { permissions })),
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'finance-officer-photo');
    return call(apiClient.post(ENDPOINTS.UPLOADS.BASE, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  uploadDocument: (file, { entityId = null, purpose = 'Official Appointment Letter' } = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('entityType', 'finance_officer');
    if (entityId) fd.append('entityId', entityId);
    fd.append('purpose', purpose);
    return call(apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  deleteDocument: (docId) => call(apiClient.delete(`${ENDPOINTS.UPLOADS.DOCUMENT}/${docId}`)),
};
export default superFinanceOfficerService;
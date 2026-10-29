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

export const adminFleetOperatorService = {
  getFleetOperators: (params) => call(apiClient.get(ENDPOINTS.USERS.LIST, { params: { roleCode: 'ROLE-FLEET-OPERATOR', ...params } })),
  getQuotas: (params) => call(apiClient.get(ENDPOINTS.USERS.FLEET_OPERATOR_QUOTAS, { params })),
  getFleetOperator: (id) => call(apiClient.get(ENDPOINTS.USERS.ONE(id))),
  createFleetOperator: (data) => call(apiClient.post(ENDPOINTS.USERS.LIST, { ...data, roleCode: 'ROLE-FLEET-OPERATOR' })),
  updateFleetOperator: (id, data) => call(apiClient.patch(ENDPOINTS.USERS.ONE(id), data)),
  updateStatus: (id, status) => call(apiClient.patch(ENDPOINTS.USERS.STATUS(id), { status })),
  deleteFleetOperator: (id) => call(apiClient.delete(ENDPOINTS.USERS.ONE(id))),
  getActivity: (id, params) => call(apiClient.get(ENDPOINTS.USERS.ACTIVITY(id), { params })),
  getPermissions: (id) => call(apiClient.get(ENDPOINTS.USERS.USER_PERMISSIONS(id))),
  updatePermissions: (id, permissions) => call(apiClient.put(ENDPOINTS.USERS.USER_PERMISSIONS(id), { permissions })),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'avatar');
    const res = await apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(res.data);
  },
};

export default adminFleetOperatorService;



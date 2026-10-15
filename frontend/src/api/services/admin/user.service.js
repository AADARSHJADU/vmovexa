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

export const adminUserService = {
  getUsers: (params) => call(apiClient.get(ENDPOINTS.USERS.LIST, { params })),
  getUser: (id) => call(apiClient.get(ENDPOINTS.USERS.ONE(id))),
  createUser: (data) => call(apiClient.post(ENDPOINTS.USERS.LIST, data)),
  updateUser: (id, data) => call(apiClient.patch(ENDPOINTS.USERS.ONE(id), data)),
  updateStatus: (id, status) => call(apiClient.patch(ENDPOINTS.USERS.STATUS(id), { status })),
  deleteUser: (id) => call(apiClient.delete(ENDPOINTS.USERS.ONE(id))),
  inviteUser: (data) => call(apiClient.post(ENDPOINTS.INVITATIONS.LIST, data)),
  getUserPermissions: (id) => call(apiClient.get(ENDPOINTS.USERS.USER_PERMISSIONS(id))),
  updateUserPermissions: (id, permissions) => call(apiClient.put(ENDPOINTS.USERS.USER_PERMISSIONS(id), { permissions })),
};

export default adminUserService;


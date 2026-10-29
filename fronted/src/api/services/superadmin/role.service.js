import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superRoleService = {
  getRoles:             ()              => call(apiClient.get(ENDPOINTS.RBAC.ROLES)),
  getRole:              (id)            => call(apiClient.get(ENDPOINTS.RBAC.ROLE(id))),
  createRole:           (data)          => call(apiClient.post(ENDPOINTS.RBAC.ROLES, data)),
  updateRole:           (id, data)      => call(apiClient.patch(ENDPOINTS.RBAC.ROLE(id), data)),
  deleteRole:           (id)            => call(apiClient.delete(ENDPOINTS.RBAC.ROLE(id))),
  updateRolePermissions:(id, permIds)   => call(apiClient.patch(ENDPOINTS.RBAC.ROLE_PERMISSIONS(id), { permissionIds: permIds })),
  getPermissions:       ()              => call(apiClient.get(ENDPOINTS.RBAC.PERMISSIONS)),
  getPermissionModules: ()              => call(apiClient.get(ENDPOINTS.RBAC.PERMISSION_MODULES)),
};

export default superRoleService;

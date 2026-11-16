import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** The system has exactly 8 fixed roles: they can be listed and have their permissions edited, nothing else. */
export const superRoleService = {
  getRoles:              ()           => call(apiClient.get(ENDPOINTS.RBAC.ROLES)),
  getRole:               (id)         => call(apiClient.get(ENDPOINTS.RBAC.ROLE(id))),
  updateRolePermissions: (id, keys)   => call(apiClient.put(ENDPOINTS.RBAC.ROLE_PERMISSIONS(id), { permissions: keys })),
  getRegistry:           ()           => call(apiClient.get(ENDPOINTS.RBAC.REGISTRY)),
};

export default superRoleService;

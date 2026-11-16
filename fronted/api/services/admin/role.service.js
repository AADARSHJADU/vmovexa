import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** Tenant Admin: read-only. Roles they may assign (Fleet Operator / Driver) + the permission registry. */
export const adminRoleService = {
  getRoles:    () => call(apiClient.get(ENDPOINTS.RBAC.ROLES, { params: { assignable: 1 } })),
  getRegistry: () => call(apiClient.get(ENDPOINTS.RBAC.REGISTRY)),
};

export default adminRoleService;

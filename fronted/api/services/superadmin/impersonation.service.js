import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const impersonationService = {
  /**
   * Directly log in as a Tenant Admin for a specific organization without credentials
   * @param {number|string} organizationId
   * @param {string} [reason]
   */
  impersonateTenant: (organizationId, reason = '') =>
    call(apiClient.post(ENDPOINTS.ADMIN.IMPERSONATE_TENANT(organizationId), { reason })),

  /**
   * Log in as any specific user
   * @param {number|string} userId
   * @param {string} [reason]
   */
  impersonateUser: (userId, reason = '') =>
    call(apiClient.post(ENDPOINTS.ADMIN.IMPERSONATE(userId), { reason })),

  /**
   * Directly log in as a Commercial Advertiser for a specific advertiser profile
   * @param {number|string} advertiserId
   * @param {string} [reason]
   */
  impersonateAdvertiser: (advertiserId, reason = '') =>
    call(apiClient.post(ENDPOINTS.ADMIN.IMPERSONATE_ADVERTISER(advertiserId), { reason })),

  /**
   * End current impersonation session
   */
  stopImpersonation: () =>
    call(apiClient.post(ENDPOINTS.ADMIN.IMPERSONATE_STOP)),
};

export default impersonationService;

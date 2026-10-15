import { apiClient } from '../client.js';
import { ENDPOINTS } from '../endpoints.js';
import { unwrap, normalizeError } from '../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const organizationService = {
  list: (params) => call(apiClient.get(ENDPOINTS.ORGANIZATIONS.LIST, { params })),
  getOrganizations: (params) => call(apiClient.get(ENDPOINTS.ORGANIZATIONS.LIST, { params })),
  getOrganization: (id) => call(apiClient.get(ENDPOINTS.ORGANIZATIONS.ONE(id))),
  createOrganization: (data) => call(apiClient.post(ENDPOINTS.ORGANIZATIONS.LIST, data)),
  updateOrganization: (id, data) => call(apiClient.patch(ENDPOINTS.ORGANIZATIONS.ONE(id), data)),
  updateStatus: (id, status) => call(apiClient.patch(ENDPOINTS.ORGANIZATIONS.STATUS(id), { status })),
  approveOrganization: (id, data) => call(apiClient.post(ENDPOINTS.ORGANIZATIONS.APPROVE(id), data)),
  rejectOrganization: (id, data) => call(apiClient.post(ENDPOINTS.ORGANIZATIONS.REJECT(id), data)),
  getFeatures: (id) => call(apiClient.get(ENDPOINTS.ORGANIZATIONS.FEATURES(id))),
  updateFeatures: (id, features) => call(apiClient.patch(ENDPOINTS.ORGANIZATIONS.FEATURES(id), { features })),
};

export default organizationService;

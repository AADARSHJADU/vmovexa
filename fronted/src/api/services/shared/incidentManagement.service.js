import { apiClient } from '../../client.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/**
 * Shared Incident Management Service — used by SuperAdmin, Admin (Tenant Admin), and Fleet Manager.
 */
export const incidentManagementService = {
  getIncidents: (params) => call(apiClient.get('/incidents', { params })),
  getIncidentById: (id) => call(apiClient.get(`/incidents/${id}`)),
  updateResolution: (id, data) => call(apiClient.patch(`/incidents/${id}/resolution`, data)),
  updateStatus: (id, status) => call(apiClient.patch(`/incidents/${id}/status`, { status })),
};

export default incidentManagementService;

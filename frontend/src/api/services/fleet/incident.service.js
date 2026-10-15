import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const fleetIncidentService = {
  getIncidents: (params) => call(apiClient.get(ENDPOINTS.FLEET.INCIDENTS, { params })),
  getIncident: (id) => call(apiClient.get(ENDPOINTS.FLEET.INCIDENT_ONE(id))),
  createIncident: (data) => call(apiClient.post(ENDPOINTS.FLEET.INCIDENTS, data)),
  updateIncident: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.INCIDENT_ONE(id), data)),
  setStatus: (id, status) => call(apiClient.patch(ENDPOINTS.FLEET.INCIDENT_STATUS(id), { status })),
  updateResolution: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.INCIDENT_RESOLUTION(id), data)),
  deleteIncident: (id) => call(apiClient.delete(ENDPOINTS.FLEET.INCIDENT_ONE(id))),
};

export default fleetIncidentService;

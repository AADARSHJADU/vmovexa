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

export const superGovernmentService = {
  getGovernmentAgencies: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.GOVERNMENT, { params })),
  getGovernmentAgency: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id))),
  getGovernment: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id))),
  createGovernmentAgency: (data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.GOVERNMENT, data)),
  createGovernment: (data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.GOVERNMENT, data)),
  updateGovernmentAgency: (id, data) => call(apiClient.patch(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id), data)),
  updateGovernment: (id, data) => call(apiClient.patch(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id), data)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id)}/status`, { status })),
  deleteGovernmentAgency: (id) => call(apiClient.delete(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id))),
  deleteGovernment: (id) => call(apiClient.delete(ENDPOINTS.CAMPAIGNS.GOVERNMENT_ONE(id))),
  uploadEmblem: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'government-emblems');
    return call(apiClient.post(ENDPOINTS.UPLOADS.BASE, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  uploadDocument: (file, { entityId = null, purpose = 'Official Authorization / Gazette' } = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('entityType', 'government');
    if (entityId) fd.append('entityId', entityId);
    fd.append('purpose', purpose);
    return call(apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  deleteDocument: (docId) => call(apiClient.delete(`${ENDPOINTS.UPLOADS.DOCUMENT}/${docId}`)),
};
export default superGovernmentService;
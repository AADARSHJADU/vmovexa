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
  } catch (err) {
    throw normalizeError(err);
  }
}

export const superAdvertiserService = {
  getAdvertisers: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ADVERTISERS, { params })),
  getAdvertiser: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ADVERTISER(id))),
  createAdvertiser: (data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.ADVERTISERS, data)),
  updateAdvertiser: (id, data) => call(apiClient.patch(`${ENDPOINTS.CAMPAIGNS.ADVERTISERS}/${id}`, data)),
  updateStatus: (id, status) => call(apiClient.patch(`${ENDPOINTS.CAMPAIGNS.ADVERTISERS}/${id}/status`, { status })),
  deleteAdvertiser: (id) => call(apiClient.delete(`${ENDPOINTS.CAMPAIGNS.ADVERTISERS}/${id}`)),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('purpose', 'brand-logos');
    return call(apiClient.post(ENDPOINTS.UPLOADS.BASE, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  uploadDocument: (file, { entityId = null, purpose = 'Contract / KYC Document' } = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('entityType', 'advertiser');
    if (entityId) fd.append('entityId', entityId);
    fd.append('purpose', purpose);
    return call(apiClient.post(ENDPOINTS.UPLOADS.DOCUMENT, fd, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  deleteDocument: (docId) => call(apiClient.delete(`${ENDPOINTS.UPLOADS.DOCUMENT}/${docId}`)),
};
export default superAdvertiserService;
import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superCampaignService = {
  getCampaigns: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.LIST, { params })),
  getCampaign: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ONE(id))),
  getAnalytics: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ANALYTICS(id))),
  getApprovals: (params) => call(apiClient.get('/approvals', { params: { entityType: 'campaign', ...params } })),
  approveCampaign: async (approvalId, reason, campaignId) => {
    if (approvalId) {
      try {
        return await call(apiClient.post(`/approvals/${approvalId}/approve`, { reason }));
      } catch (err) {
        if (campaignId) {
          return await call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(campaignId), { decision: 'approved', reason }));
        }
        throw err;
      }
    }
    if (campaignId) {
      return await call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(campaignId), { decision: 'approved', reason }));
    }
    throw new Error('Missing approval or campaign ID');
  },
  rejectCampaign: async (approvalId, reason, campaignId) => {
    if (approvalId) {
      try {
        return await call(apiClient.post(`/approvals/${approvalId}/reject`, { reason }));
      } catch (err) {
        if (campaignId) {
          return await call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(campaignId), { decision: 'rejected', reason }));
        }
        throw err;
      }
    }
    if (campaignId) {
      return await call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(campaignId), { decision: 'rejected', reason }));
    }
    throw new Error('Missing approval or campaign ID');
  },
  sharePaymentLink: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.SHARE_PAYMENT(id), data)),
};

export default superCampaignService;

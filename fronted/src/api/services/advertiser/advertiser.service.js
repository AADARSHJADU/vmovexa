import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const advertiserService = {
  getCampaigns: (params = {}) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.LIST, { params: { ownerType: 'advertiser', ...params } })),
  getFleetOptions: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.FLEET_OPTIONS)),
  getMqttStatus: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.MQTT_STATUS)),
  getCampaign: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ONE(id))),
  getCampaignAnalytics: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ANALYTICS(id))),
  createCampaign: (data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.LIST, data)),
  updateCampaign: (id, data) => call(apiClient.put(ENDPOINTS.CAMPAIGNS.ONE(id), data)),
  deleteCampaign: (id) => call(apiClient.delete(ENDPOINTS.CAMPAIGNS.ONE(id))),
  submitCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.SUBMIT(id))),
  verifyCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(id))),
  initiatePayment: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.PAY(id))),
  confirmPayment: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.PAY_CONFIRM(id), data)),
  recordOfflinePayment: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.RECORD_OFFLINE_PAYMENT(id), data)),
  startCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.START(id))),
  stopCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.STOP(id))),
  endCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.END(id))),
  sharePaymentLink: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.SHARE_PAYMENT(id), data)),
  getWalletBalance: () => call(apiClient.get(ENDPOINTS.BILLING.WALLET)),
  getInvoices: () => call(apiClient.get(ENDPOINTS.BILLING.INVOICES)),
  payInvoice: (id, data) => call(apiClient.post(`/billing/invoices/${id}/pay`, data)),
  getTransactions: (params) => call(apiClient.get(ENDPOINTS.BILLING.TRANSACTIONS, { params })),
  // Slot availability
  getSlotAvailability: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.SLOT_AVAILABILITY, { params })),
  // Campaign reviews (advertiser view)
  getCampaignReviews: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.REVIEWS(id))),
  generateReport: (data) => call(apiClient.post(ENDPOINTS.REPORTS.GENERATE, data)),
  getReports: () => call(apiClient.get(ENDPOINTS.REPORTS.LIST)),
};

export default advertiserService;

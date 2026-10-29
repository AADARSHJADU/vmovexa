import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const governmentService = {
  // Campaign management (ownerType='government')
  getCampaigns: (params = {}) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.LIST, { params: { ownerType: 'government', ...params } })),
  getCampaign: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.ONE(id))),
  createCampaign: (data) => {
    const payload = {
      owner_type: 'government',
      ownerType: 'government',
      title: data.name || data.title,
      description: data.description || null,
      priority: (data.priority || 'Normal').toLowerCase(),
      activeDays: data.activeDays || data.active_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      broadcastStartTime: data.broadcastStartTime || data.broadcast_start_time || '08:00',
      broadcastEndTime: data.broadcastEndTime || data.broadcast_end_time || '20:00',
      mediaUrl: data.videoUrl || data.video_url || data.mediaUrl || data.media_url,
      contentType: data.contentType || data.mediaType || 'video',
      targets: data.targets || (data.targetCities ? data.targetCities.map((city) => ({ city, displayType: 'main' })) : []),
    };
    return call(apiClient.post(ENDPOINTS.CAMPAIGNS.LIST, payload));
  },
  updateCampaign: (id, data) => call(apiClient.put(ENDPOINTS.CAMPAIGNS.ONE(id), data)),
  deleteCampaign: (id) => call(apiClient.delete(ENDPOINTS.CAMPAIGNS.ONE(id))),
  submitCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.SUBMIT(id))),
  approveCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.APPROVE(id))),
  rejectCampaign: (id, reason) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.REJECT(id), { reason })),
  startCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.START(id))),
  stopCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.STOP(id))),
  endCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.END(id))),
  verifyCampaign: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.VERIFY(id))),
  getMqttStatus: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.MQTT_STATUS)),
  sharePaymentLink: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.SHARE_PAYMENT(id), data)),
  recordOfflinePayment: (id, data) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.RECORD_OFFLINE_PAYMENT(id), data)),

  // Emergency broadcasts
  getEmergencyBroadcasts: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.EMERGENCY, { params })),
  getEmergencyBroadcast: (id) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.EMERGENCY_ONE(id))),
  createEmergencyBroadcast: (data) => {
    const payload = {
      title: data.title || data.headline,
      headline: data.headline || data.title,
      message: data.message || data.bodyText || data.body_text,
      bodyText: data.bodyText || data.message || data.body_text,
      authority: data.authority || 'Department of Public Safety',
      severity: (data.severity || 'high').toLowerCase(),
      targetScope: data.targetScope || data.target_scope || 'all',
      targetArea: data.targetArea || data.target_area || null,
      tickerText: data.tickerText || data.ticker_text || data.message || null,
      mediaUrl: data.mediaUrl || data.media_url || null,
      mediaType: data.mediaType || data.media_type || null,
      targets: Array.isArray(data.targets) ? data.targets : [],
      pushNotification: typeof data.pushNotification === 'boolean' ? data.pushNotification : true,
      sirenSound: !!(data.sirenSound || data.siren_sound),
      audioChime: !!(data.audioChime || data.audio_chime_enabled),
      autoExpireMinutes: data.autoExpireMinutes || (data.durationHours ? Number(data.durationHours) * 60 : 120),
    };
    return call(apiClient.post(ENDPOINTS.CAMPAIGNS.EMERGENCY, payload));
  },
  updateEmergencyBroadcast: (id, data) => call(apiClient.patch(ENDPOINTS.CAMPAIGNS.EMERGENCY_ONE(id), data)),
  deleteEmergencyBroadcast: (id) => call(apiClient.delete(ENDPOINTS.CAMPAIGNS.EMERGENCY_ONE(id))),
  approveEmergencyBroadcast: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.EMERGENCY_APPROVE(id))),
  rejectEmergencyBroadcast: (id, reason) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.EMERGENCY_REJECT(id), { reason })),
  revokeEmergencyBroadcast: (id) => call(apiClient.post(ENDPOINTS.CAMPAIGNS.EMERGENCY_REVOKE(id))),

  // Agency Analytics
  getAgencyAnalytics: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.GOV_ANALYTICS)),

  // Live transit tracking (real vehicles + GPS)
  getLiveTracking: (params) => call(apiClient.get(ENDPOINTS.CAMPAIGNS.TRACKING_LIVE, { params })),
  getTrackingRoutes: () => call(apiClient.get(ENDPOINTS.CAMPAIGNS.TRACKING_ROUTES)),
};

export default governmentService;

import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

/** Shared notification service — used by every role's NotificationsPage / NotificationSettingsPage. */
export const notificationService = {
  getNotifications: async (params) => {
    try { return unwrapPaginated((await apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params })).data); }
    catch (err) { throw normalizeError(err); }
  },
  getSettings: () => call(apiClient.get(ENDPOINTS.NOTIFICATIONS.SETTINGS)),
  updateSettings: (data) => call(apiClient.patch(ENDPOINTS.NOTIFICATIONS.SETTINGS, data)),
  togglePreference: (eventTypeId, enabled) => call(apiClient.patch(ENDPOINTS.NOTIFICATIONS.PREFERENCE(eventTypeId), { enabled })),
  markRead: (id) => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.READ(id))),
  markAllRead: () => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.READ_ALL)),
  deleteNotification: (id) => call(apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE(id))),
  clearAll: () => call(apiClient.delete(ENDPOINTS.NOTIFICATIONS.CLEAR_ALL)),
  registerPushToken: (data) => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.PUSH_REGISTER, data)),
  sendTestPush: () => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.PUSH_TEST)),
  getSmtpConfig: () => call(apiClient.get(ENDPOINTS.NOTIFICATIONS.SMTP)),
  updateSmtpConfig: (data) => call(apiClient.put(ENDPOINTS.NOTIFICATIONS.SMTP, data)),
  testEmail: (data) => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.TEST_EMAIL, data)),
};

export default notificationService;

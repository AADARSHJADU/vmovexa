import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';
import { unwrap, normalizeError } from '../../utils/apiResponse';

async function call(promise) {
  try {
    const res = await promise;
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * whatsappNotification.service.js — API client calls for WhatsApp Gateway & Notification Settings.
 */
export const whatsappNotificationService = {
  getWhatsappConfig: () => call(apiClient.get(ENDPOINTS.NOTIFICATIONS.WHATSAPP)),
  updateWhatsappConfig: (data) => call(apiClient.put(ENDPOINTS.NOTIFICATIONS.WHATSAPP, data)),
  sendTestWhatsapp: (data) => call(apiClient.post(ENDPOINTS.NOTIFICATIONS.TEST_WHATSAPP, data)),
};

export default whatsappNotificationService;

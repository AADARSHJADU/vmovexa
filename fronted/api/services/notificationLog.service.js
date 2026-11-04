import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * notificationLog.service.js — API client calls ONLY for notification delivery logs.
 */
export const notificationLogService = {
  fetchLogs: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATION_LOGS.LIST, { params });
    return response.data;
  },

  fetchStats: async () => {
    const response = await apiClient.get(ENDPOINTS.NOTIFICATION_LOGS.STATS);
    return response.data;
  },

  retryLog: async (id) => {
    const response = await apiClient.post(ENDPOINTS.NOTIFICATION_LOGS.RETRY(id));
    return response.data;
  },
};

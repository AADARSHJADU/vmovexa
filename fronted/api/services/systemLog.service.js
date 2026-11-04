import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * systemLog.service.js — API client calls ONLY for live server & cron job telemetry logs.
 */
export const systemLogService = {
  fetchServerStatus: async () => {
    const response = await apiClient.get(ENDPOINTS.SYSTEM_LOGS.SERVER_STATUS);
    return response.data;
  },

  fetchLiveLogs: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.SYSTEM_LOGS.LIVE_LOGS, { params });
    return response.data;
  },

  triggerCron: async (jobKey) => {
    const response = await apiClient.post(ENDPOINTS.SYSTEM_LOGS.TRIGGER_CRON, { jobKey });
    return response.data;
  },

  deleteLiveLogs: async ({ ids = [], all = false } = {}) => {
    const response = await apiClient.delete(ENDPOINTS.SYSTEM_LOGS.DELETE_LOGS, {
      data: { ids, all },
    });
    return response.data;
  },

  fetchDiskLogs: async () => {
    const response = await apiClient.get(ENDPOINTS.SYSTEM_LOGS.DISK_LOGS);
    return response.data;
  },

  readDiskLogFile: async ({ channel, filename, lines = 250 } = {}) => {
    const response = await apiClient.get(ENDPOINTS.SYSTEM_LOGS.READ_DISK_LOG, {
      params: { channel, filename, lines },
    });
    return response.data;
  },

  deleteDiskLogs: async (payload = {}) => {
    const response = await apiClient.delete(ENDPOINTS.SYSTEM_LOGS.DELETE_DISK_LOGS, {
      data: payload,
    });
    return response.data;
  },
};

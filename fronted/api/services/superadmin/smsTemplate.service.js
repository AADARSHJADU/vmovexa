import apiClient from '../../client';
import { ENDPOINTS } from '../../endpoints';

/**
 * smsTemplate.service.js — API client calls for SuperAdmin SMS Template Management
 */
export const smsTemplateService = {
  fetchTemplates: async () => {
    const response = await apiClient.get(ENDPOINTS.SMS_TEMPLATES.LIST);
    return response.data;
  },

  getTemplateById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.SMS_TEMPLATES.ONE(id));
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await apiClient.put(ENDPOINTS.SMS_TEMPLATES.UPDATE(id), data);
    return response.data;
  },

  sendTestSms: async (id, { recipient, variables }) => {
    const response = await apiClient.post(ENDPOINTS.SMS_TEMPLATES.TEST(id), { recipient, variables });
    return response.data;
  },
};

export default smsTemplateService;

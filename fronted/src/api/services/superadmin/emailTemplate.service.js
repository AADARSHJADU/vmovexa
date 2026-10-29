import apiClient from '../../client';
import { ENDPOINTS } from '../../endpoints';

/**
 * emailTemplate.service.js — API client calls for SuperAdmin Email Template Management
 */
export const emailTemplateService = {
  fetchTemplates: async () => {
    const response = await apiClient.get(ENDPOINTS.EMAIL_TEMPLATES.LIST);
    return response.data;
  },

  getTemplateById: async (id) => {
    const response = await apiClient.get(ENDPOINTS.EMAIL_TEMPLATES.ONE(id));
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await apiClient.put(ENDPOINTS.EMAIL_TEMPLATES.UPDATE(id), data);
    return response.data;
  },

  sendTestEmail: async (id, { recipient, variables }) => {
    const response = await apiClient.post(ENDPOINTS.EMAIL_TEMPLATES.TEST(id), { recipient, variables });
    return response.data;
  },
};

export default emailTemplateService;

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * googleApis.service.js — API client calls ONLY for Google APIs & Maps settings.
 */
export const googleApisService = {
  getSettings: async () => {
    const response = await apiClient.get(ENDPOINTS.GOOGLE_APIS.SETTINGS);
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await apiClient.put(ENDPOINTS.GOOGLE_APIS.UPDATE, data);
    return response.data;
  },

  testApis: async (apiKey = null) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_APIS.TEST, { apiKey });
    return response.data;
  },

  demoGeocode: async (data) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_APIS.DEMO_GEOCODE, data);
    return response.data;
  },

  demoRoutes: async (data) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_APIS.DEMO_ROUTES, data);
    return response.data;
  },

  demoPlaces: async (data) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_APIS.DEMO_PLACES, data);
    return response.data;
  },

  demoRoads: async (data) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_APIS.DEMO_ROADS, data);
    return response.data;
  },

  demoStaticMap: async (params) => {
    const response = await apiClient.get(ENDPOINTS.GOOGLE_APIS.DEMO_STATIC_MAP, { params });
    return response.data;
  },
};

export default googleApisService;

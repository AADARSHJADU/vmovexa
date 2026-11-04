import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const driverSelfService = {
  getProfile: () => call(apiClient.get(ENDPOINTS.ME.DRIVER.PROFILE)),
  getSchedule: (params = {}) => call(apiClient.get(ENDPOINTS.ME.DRIVER.SCHEDULE, { params })),
  getActiveRoute: (params = {}) => call(apiClient.get(ENDPOINTS.ME.DRIVER.ACTIVE_ROUTE, { params })),
  getTrips: (params = {}) => call(apiClient.get(ENDPOINTS.ME.DRIVER.TRIPS, { params })),
  getDocuments: () => call(apiClient.get(ENDPOINTS.ME.DRIVER.DOCUMENTS)),
  uploadDocument: (data) => call(apiClient.post(ENDPOINTS.ME.DRIVER.DOCUMENTS, data)),
  deleteDocument: (id) => call(apiClient.delete(ENDPOINTS.ME.DRIVER.DELETE_DOCUMENT(id))),
  getIncidents: () => call(apiClient.get(ENDPOINTS.ME.DRIVER.INCIDENTS)),
  getIncidentById: (id) => call(apiClient.get(ENDPOINTS.ME.DRIVER.INCIDENT_BY_ID(id))),
  reportIncident: (data) => call(apiClient.post(ENDPOINTS.ME.DRIVER.INCIDENTS, data)),
  updateDutyStatus: (status) => call(apiClient.patch(ENDPOINTS.ME.DRIVER.DUTY_STATUS, { status })),
  startTrip: (data = {}) => call(apiClient.post(ENDPOINTS.ME.DRIVER.START_TRIP, data)),
  endTrip: (data = {}) => call(apiClient.post(ENDPOINTS.ME.DRIVER.END_TRIP, data)),
  getWorkOrders: (params = {}) => call(apiClient.get(ENDPOINTS.ME.DRIVER.WORK_ORDERS, { params })),
  getWorkOrder: (id) => call(apiClient.get(ENDPOINTS.ME.DRIVER.WORK_ORDER_ONE(id))),
  createWorkOrder: (data) => call(apiClient.post(ENDPOINTS.ME.DRIVER.WORK_ORDERS, data)),
};

export default driverSelfService;

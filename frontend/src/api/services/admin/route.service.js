import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta?.total !== undefined || res?.data?.meta?.pagination) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const adminRouteService = {
  getRoutes: (params) => call(apiClient.get(ENDPOINTS.FLEET.ROUTES, { params })),
  getRoute: (id) => call(apiClient.get(ENDPOINTS.FLEET.ROUTE_ONE(id))),
  createRoute: (data) => call(apiClient.post(ENDPOINTS.FLEET.ROUTES, data)),
  updateRoute: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.ROUTE_ONE(id), data)),
  deleteRoute: (id) => call(apiClient.delete(ENDPOINTS.FLEET.ROUTE_ONE(id))),
  approveRoute: (id) => call(apiClient.post(ENDPOINTS.FLEET.ROUTE_APPROVE(id))),
  rejectRoute: (id, reason) => call(apiClient.post(ENDPOINTS.FLEET.ROUTE_REJECT(id), { reason })),
  assignVehicle: (id, data) => call(apiClient.post(ENDPOINTS.FLEET.ROUTE_ASSIGN_VEHICLE(id), data)),
  getRouteVehicles: (id) => call(apiClient.get(ENDPOINTS.FLEET.ROUTE_VEHICLES(id))),
  approveAssignment: (id) => call(apiClient.post(ENDPOINTS.FLEET.ROUTE_ASSIGNMENT_APPROVE(id))),
  rejectAssignment: (id, reason) => call(apiClient.post(ENDPOINTS.FLEET.ROUTE_ASSIGNMENT_REJECT(id), { reason })),
  deleteAssignment: (id) => call(apiClient.delete(ENDPOINTS.FLEET.ROUTE_ASSIGNMENT_DELETE(id))),
};

export default adminRouteService;

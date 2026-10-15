import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const fleetRouteService = {
  getRoutes: (params) => call(apiClient.get(ENDPOINTS.FLEET.ROUTES, { params })),
  getRoute: (id) => call(apiClient.get(ENDPOINTS.FLEET.ROUTE_ONE(id))),
  createRoute: (data) => call(apiClient.post(ENDPOINTS.FLEET.ROUTES, data)),
  updateRoute: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.ROUTE_ONE(id), data)),
  deleteRoute: (id) => call(apiClient.delete(ENDPOINTS.FLEET.ROUTE_ONE(id))),
};

export default fleetRouteService;

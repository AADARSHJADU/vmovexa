import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta?.pagination) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  }
  catch (err) { throw normalizeError(err); }
}

export const adminTechnicianRequestService = {
  getWorkOrders: (params) => call(apiClient.get(ENDPOINTS.WORK_ORDERS.LIST, { params })),
  getWorkOrder: (id) => call(apiClient.get(ENDPOINTS.WORK_ORDERS.ONE(id))),
  createWorkOrder: (data) => call(apiClient.post(ENDPOINTS.WORK_ORDERS.LIST, data)),
  updateWorkOrder: (id, data) => call(apiClient.patch(ENDPOINTS.WORK_ORDERS.ONE(id), data)),
  rateTechnician: (id, data) => call(apiClient.post(ENDPOINTS.WORK_ORDERS.RATE(id), data)),
};

export default adminTechnicianRequestService;


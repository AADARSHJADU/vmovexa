import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, unwrapPaginated, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    const res = await promise;
    if (res?.data?.meta && (res.data.meta.totalPages !== undefined || res.data.meta.total !== undefined || Array.isArray(res.data.data))) {
      return unwrapPaginated(res.data);
    }
    return unwrap(res.data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const vehicleSlotService = {
  getSlots: (params) => call(apiClient.get(ENDPOINTS.FLEET.SLOTS, { params })),
  getSlot: (id) => call(apiClient.get(ENDPOINTS.FLEET.SLOT_ONE(id))),
  createSlot: (data) => call(apiClient.post(ENDPOINTS.FLEET.SLOTS, data)),
  updateSlot: (id, data) => call(apiClient.patch(ENDPOINTS.FLEET.SLOT_ONE(id), data)),
  deleteSlot: (id) => call(apiClient.delete(ENDPOINTS.FLEET.SLOT_ONE(id))),
  checkConflict: (payload) => call(apiClient.post(ENDPOINTS.FLEET.SLOT_CONFLICT, payload)),
  getTimetable: (params) => call(apiClient.get(ENDPOINTS.FLEET.SLOT_TIMETABLE, { params })),
};

export default vehicleSlotService;

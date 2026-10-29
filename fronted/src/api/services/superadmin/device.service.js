import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try { return unwrap((await promise).data); }
  catch (err) { throw normalizeError(err); }
}

export const superDeviceService = {
  getEdgeDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE, { params })),
  getEdgeDevice: (id) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_ONE(id))),
  createEdgeDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE, data)),
  updateEdgeDevice: (id, data) => call(apiClient.patch(ENDPOINTS.DEVICES.EDGE_ONE(id), data)),
  deleteEdgeDevice: (id) => call(apiClient.delete(ENDPOINTS.DEVICES.EDGE_DELETE(id))),
  toggleEdgeDeviceActive: (id, isActive) => call(apiClient.patch(ENDPOINTS.DEVICES.EDGE_TOGGLE(id), { isActive })),
  getTelemetry: (id) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_TELEMETRY(id))),
  rebootEdgeDevice: (id) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_REBOOT(id))),
  pushConfig: (id, config) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_CONFIG(id), { config })),
  getDisplays: (params) => call(apiClient.get(ENDPOINTS.DEVICES.DISPLAYS, { params })),
  updateDisplayConfig: (id, config) => call(apiClient.patch(ENDPOINTS.DEVICES.DISPLAY_CONFIG(id), { config })),
};

export default superDeviceService;

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

export const technicianSelfService = {
  // --- stats / profile metrics ---
  getStats: () => call(apiClient.get(ENDPOINTS.ME.TECHNICIAN.STATS)),

  // --- my work orders (today's tasks) ---
  getWorkOrders: (params = {}) => call(apiClient.get(ENDPOINTS.ME.TECHNICIAN.WORK_ORDERS, { params })),
  getWorkOrder: (id) => call(apiClient.get(ENDPOINTS.ME.TECHNICIAN.WORK_ORDER_ONE(id))),
  setWorkOrderStatus: (id, status, resolutionNotes) =>
    call(apiClient.patch(ENDPOINTS.ME.TECHNICIAN.WORK_ORDER_STATUS(id), { status, resolutionNotes })),

  // --- edge devices (hardware) ---
  getEdgeDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE, { params })),
  getEdgeDevice: (id) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_ONE(id))),
  registerEdgeDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE, data)),
  updateEdgeDevice: (id, data) => call(apiClient.patch(ENDPOINTS.DEVICES.EDGE_ONE(id), data)),
  deleteEdgeDevice: (id) => call(apiClient.delete(ENDPOINTS.DEVICES.EDGE_DELETE(id))),
  toggleEdgeDeviceActive: (id, isActive) => call(apiClient.patch(ENDPOINTS.DEVICES.EDGE_TOGGLE(id), { isActive })),
  getEdgeConfig: (id) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_CONFIG(id))),
  pushConfig: (id, config) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_CONFIG(id), { config })),
  factoryReset: (id) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_FACTORY_RESET(id))),
  getTelemetry: (id, params) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_TELEMETRY(id), { params })),
  rebootDevice: (id) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_REBOOT(id))),
  getConnectivityTests: (id) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_CONNECTIVITY_TESTS(id))),
  recordConnectivityTest: (id, data) => call(apiClient.post(ENDPOINTS.DEVICES.EDGE_CONNECTIVITY_TESTS(id), data)),

  // --- edge provisioning & usb setup ---
  downloadCorePackage: async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.DEVICES.EDGE_PACKAGE_DOWNLOAD, { responseType: 'blob' });
      return res.data;
    } catch (err) {
      throw normalizeError(err);
    }
  },
  getSetupScript: () => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_SETUP_SCRIPT)),
  verifyLiveHandshake: (boxId) => call(apiClient.get(ENDPOINTS.DEVICES.EDGE_HANDSHAKE(boxId))),

  // --- gps devices ---
  getGpsDevices: (params) => call(apiClient.get(ENDPOINTS.DEVICES.GPS, { params })),
  registerGpsDevice: (data) => call(apiClient.post(ENDPOINTS.DEVICES.GPS, data)),
  assignGps: (id, vehicleId) => call(apiClient.post(ENDPOINTS.DEVICES.GPS_ASSIGN(id), { vehicleId })),

  // --- vehicles (target selection for installs) ---
  getVehicles: (params) => call(apiClient.get(ENDPOINTS.FLEET.VEHICLES, { params })),
};

export default technicianSelfService;

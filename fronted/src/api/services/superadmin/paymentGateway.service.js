import { apiClient } from '../../client.js';
import { ENDPOINTS } from '../../endpoints.js';
import { unwrap, normalizeError } from '../../../utils/apiResponse.js';

async function call(promise) {
  try {
    return unwrap((await promise).data);
  } catch (err) {
    throw normalizeError(err);
  }
}

export const paymentGatewayService = {
  getGateways: () => call(apiClient.get(ENDPOINTS.BILLING.GATEWAYS)),
  updateGateway: (id, payload) => call(apiClient.put(ENDPOINTS.BILLING.GATEWAY_ONE(id), payload)),
  testGatewayConnection: (id, payload = {}) => call(apiClient.post(ENDPOINTS.BILLING.GATEWAY_TEST(id), payload)),
  simulateTestOrder: (id, payload = {}) => call(apiClient.post(ENDPOINTS.BILLING.GATEWAY_SIMULATE(id), payload)),
};

export default paymentGatewayService;

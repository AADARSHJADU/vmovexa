import { describe, expect, it } from 'vitest';
import { ENDPOINTS } from './endpoints';

describe('device endpoint contract', () => {
  it('keeps all edge-device action builders available', () => {
    expect(ENDPOINTS.DEVICES.EDGE).toBe('/edge-devices');
    expect(ENDPOINTS.DEVICES.EDGE_ONE(1)).toBe('/edge-devices/1');
    expect(ENDPOINTS.DEVICES.EDGE_REBOOT(1)).toBe('/edge-devices/1/reboot');
    expect(ENDPOINTS.DEVICES.EDGE_TELEMETRY(1)).toBe('/edge-devices/1/telemetry');
    expect(ENDPOINTS.DEVICES.EDGE_CONFIG(1)).toBe('/edge-devices/1/config');
    expect(ENDPOINTS.DEVICES.EDGE_FACTORY_RESET(1)).toBe('/edge-devices/1/factory-reset');
    expect(ENDPOINTS.DEVICES.EDGE_CONNECTIVITY_TESTS(1)).toBe('/edge-devices/1/connectivity-tests');
  });
});

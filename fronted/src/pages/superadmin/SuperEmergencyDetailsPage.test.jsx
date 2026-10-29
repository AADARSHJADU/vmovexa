import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SuperEmergencyDetailsPage } from './SuperEmergencyDetailsPage';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), promise: (p) => p },
}));

const loadBroadcastById = vi.fn().mockResolvedValue({});
const approveBroadcast = vi.fn().mockResolvedValue({});
const rejectBroadcast = vi.fn().mockResolvedValue({});
const revokeBroadcast = vi.fn().mockResolvedValue({});
const updateBroadcast = vi.fn().mockResolvedValue({});

let currentBroadcastData = null;
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    currentBroadcast: currentBroadcastData,
    loadBroadcastById,
    approveBroadcast,
    rejectBroadcast,
    revokeBroadcast,
    updateBroadcast,
    loading: false,
  }),
}));

vi.mock('../../api/services/fleet/route.service.js', () => ({
  fleetRouteService: {
    getRoutes: vi.fn().mockResolvedValue([
      { id: 1, name: 'Pardeshi pura', code: 'RTE-8413', start_point: 'G.Sachanand Vijay Nagar', end_point: 'Rajwada', distance_km: '7.74' }
    ]),
  },
}));

vi.mock('../../api/services/advertiser/advertiser.service.js', () => ({
  advertiserService: {
    getFleetOptions: vi.fn().mockResolvedValue([]),
    getMqttStatus: vi.fn().mockResolvedValue({ mqttConnected: true, onlineEdgeDevices: 10, totalEdgeDevices: 12 }),
  },
}));

describe('SuperEmergencyDetailsPage', () => {
  beforeEach(() => {
    loadBroadcastById.mockClear();
    approveBroadcast.mockClear();
    rejectBroadcast.mockClear();
    revokeBroadcast.mockClear();
    currentBroadcastData = {
      id: 10,
      code: 'EMG-TST-10',
      headline: 'Severe Cyclone Alert',
      body_text: 'Avoid Highway 44. Emergency vehicles priority.',
      severity: 'critical',
      status: 'pending_approval',
      target_scope: 'all',
      target_area: 'Coastal Corridor',
      ticker_text: 'FLASH CYCLONE WARNING',
      issued_by: 'State Disaster Authority',
      push_notification: true,
      siren_sound: true,
      affected_buses_count: 24,
    };
  });

  it('loads broadcast by ID on mount and renders details', async () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/emergency-approvals/10']}>
        <Routes>
          <Route path="/superadmin/emergency-approvals/:id" element={<SuperEmergencyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(loadBroadcastById).toHaveBeenCalledWith('10');
    expect(await screen.findByRole('heading', { level: 1, name: /Severe Cyclone Alert/i })).toBeInTheDocument();
    expect(screen.getAllByText('EMG-TST-10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Avoid Highway 44/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows Approve & Reject buttons for pending broadcast and triggers approve', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/emergency-approvals/10']}>
        <Routes>
          <Route path="/superadmin/emergency-approvals/:id" element={<SuperEmergencyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const approveBtn = await screen.findByRole('button', { name: /Approve & Broadcast/i });
    expect(approveBtn).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject Advisory/i })).toBeInTheDocument();

    await user.click(approveBtn);
    await waitFor(() => expect(approveBroadcast).toHaveBeenCalledWith(10));
  });

  it('shows Revoke button for live approved broadcast and opens revoke modal', async () => {
    currentBroadcastData = {
      ...currentBroadcastData,
      status: 'approved',
      active: true,
    };

    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/emergency-approvals/10']}>
        <Routes>
          <Route path="/superadmin/emergency-approvals/:id" element={<SuperEmergencyDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const revokeBtn = await screen.findByRole('button', { name: /Revoke Override/i });
    expect(revokeBtn).toBeInTheDocument();

    await user.click(revokeBtn);
    const confirmBtn = await screen.findByRole('button', { name: /Yes, Revoke Now/i });
    expect(confirmBtn).toBeInTheDocument();

    await user.click(confirmBtn);
    await waitFor(() => expect(revokeBroadcast).toHaveBeenCalledWith(10));
  });
});

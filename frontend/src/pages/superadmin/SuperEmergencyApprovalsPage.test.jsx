import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn(), promise: (p) => p },
}));

const loadBroadcasts = vi.fn().mockResolvedValue([]);
const approveBroadcast = vi.fn().mockResolvedValue({});
const rejectBroadcast = vi.fn().mockResolvedValue({});
const revokeBroadcast = vi.fn().mockResolvedValue({});

let broadcastsData = [];
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    broadcasts: broadcastsData,
    loadBroadcasts,
    approveBroadcast,
    rejectBroadcast,
    revokeBroadcast,
  }),
}));

import { SuperEmergencyApprovalsPage } from './SuperEmergencyApprovalsPage';

describe('SuperEmergencyApprovalsPage', () => {
  beforeEach(() => {
    loadBroadcasts.mockClear();
    approveBroadcast.mockClear();
    rejectBroadcast.mockClear();
    broadcastsData = [
      { id: 1, code: 'EMG-1', headline: 'Flood Warning', message: 'Avoid roads', severity: 'critical', status: 'pending_approval', target_area: 'Metro' },
      { id: 2, code: 'EMG-2', headline: 'Live One', message: 'Live alert', severity: 'high', status: 'approved', affected_buses_count: 10 },
    ];
  });

  it('loads broadcasts on mount', () => {
    render(<SuperEmergencyApprovalsPage />);
    expect(loadBroadcasts).toHaveBeenCalled();
  });

  it('shows pending broadcasts with Approve & Reject actions', async () => {
    render(<SuperEmergencyApprovalsPage />);
    expect(await screen.findByText('Flood Warning')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve & Broadcast/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Reject$/i })).toBeInTheDocument();
  });

  it('approve triggers approveBroadcast', async () => {
    const user = userEvent.setup();
    render(<SuperEmergencyApprovalsPage />);
    await screen.findByText('Flood Warning');
    await user.click(screen.getByRole('button', { name: /Approve & Broadcast/i }));
    await waitFor(() => expect(approveBroadcast).toHaveBeenCalledWith(1));
  });

  it('Live filter shows approved broadcasts with a Revoke action', async () => {
    const user = userEvent.setup();
    render(<SuperEmergencyApprovalsPage />);
    await screen.findByText('Flood Warning');
    await user.click(screen.getByRole('button', { name: /^Live/ }));
    expect(screen.getByText('Live One')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Revoke/i })).toBeInTheDocument();
  });
});

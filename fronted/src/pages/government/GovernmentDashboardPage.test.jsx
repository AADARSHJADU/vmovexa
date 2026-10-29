import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock leaflet (jsdom has no real map).
vi.mock('leaflet', () => {
  const map = { remove: vi.fn(), fitBounds: vi.fn() };
  const marker = { addTo: () => marker, remove: vi.fn(), on: vi.fn() };
  return {
    default: {
      map: () => map,
      tileLayer: () => ({ addTo: () => ({}) }),
      marker: () => marker,
      divIcon: () => ({}),
      latLngBounds: () => ({}),
      polyline: () => ({ addTo: () => ({}) }),
    },
  };
});
vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'State Transit Dept' }, hasPermission: () => true }),
}));

const loadBroadcasts = vi.fn().mockResolvedValue([]);
const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadAgencyAnalytics = vi.fn().mockResolvedValue({});

let hookState = {};
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    broadcasts: hookState.broadcasts,
    campaigns: hookState.campaigns,
    analytics: hookState.analytics,
    loadBroadcasts, loadCampaigns, loadAgencyAnalytics,
  }),
}));

const getLiveTracking = vi.fn();
vi.mock('../../api/services/government/government.service', () => ({
  governmentService: { getLiveTracking: (...a) => getLiveTracking(...a) },
}));

import { GovernmentDashboardPage } from './GovernmentDashboardPage';

function renderPage() {
  return render(<MemoryRouter><GovernmentDashboardPage /></MemoryRouter>);
}

describe('GovernmentDashboardPage', () => {
  beforeEach(() => {
    loadBroadcasts.mockClear(); loadCampaigns.mockClear(); loadAgencyAnalytics.mockClear();
    getLiveTracking.mockReset().mockResolvedValue({ vehicles: [], stats: { total: 12, broadcasting: 7, withGps: 9 } });
    hookState = {
      broadcasts: [{ id: 1, status: 'approved', active: true }],
      campaigns: [
        { id: 1, code: 'CMP-G1', title: 'Road Safety PSA', status: 'live', category: 'Road Safety', impressions_delivered: 5000 },
        { id: 2, code: 'CMP-G2', title: 'Draft PSA', status: 'draft' },
      ],
      analytics: { kpis: { activeCampaigns: 3, pendingApprovals: 2, emergencyBroadcasts: 1, totalImpressions: 5000 } },
    };
  });

  it('loads campaigns, broadcasts, analytics, and live tracking on mount', async () => {
    renderPage();
    expect(loadCampaigns).toHaveBeenCalled();
    expect(loadBroadcasts).toHaveBeenCalled();
    expect(loadAgencyAnalytics).toHaveBeenCalled();
    await waitFor(() => expect(getLiveTracking).toHaveBeenCalledWith({ routeId: 'all' }));
  });

  it('renders real KPI labels and the analytics active count', async () => {
    renderPage();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Vehicles On GPS')).toBeInTheDocument();
    expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // activeCampaigns from analytics
  });

  it('lists recent non-draft campaigns only', async () => {
    renderPage();
    expect(await screen.findByText('Road Safety PSA')).toBeInTheDocument();
    expect(screen.queryByText('Draft PSA')).not.toBeInTheDocument();
  });

  it('shows no-GPS overlay when no vehicles report positions', async () => {
    getLiveTracking.mockResolvedValue({ vehicles: [], stats: { total: 0, broadcasting: 0, withGps: 0 } });
    renderPage();
    expect(await screen.findByText(/No live GPS positions yet/i)).toBeInTheDocument();
  });
});

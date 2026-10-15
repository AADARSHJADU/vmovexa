import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Brand Co' }, hasPermission: () => true }),
}));

const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadMqttStatus = vi.fn().mockResolvedValue({});
const loadCampaignAnalytics = vi.fn().mockResolvedValue({});

let hookState = {};
vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: hookState.campaigns,
    mqttStatus: hookState.mqttStatus,
    campaignAnalytics: hookState.campaignAnalytics,
    loadCampaigns,
    loadMqttStatus,
    loadCampaignAnalytics,
  }),
}));

import { AdvertiserDashboardPage } from './AdvertiserDashboardPage';

function renderPage() {
  return render(<MemoryRouter><AdvertiserDashboardPage /></MemoryRouter>);
}

describe('AdvertiserDashboardPage', () => {
  beforeEach(() => {
    loadCampaigns.mockClear();
    loadMqttStatus.mockClear();
    loadCampaignAnalytics.mockClear();
    hookState = {
      campaigns: [
        { id: 1, code: 'CMP-1', title: 'Metro Ad', status: 'live', budget: 100000, start_date: '2026-03-01', end_date: '2026-03-10' },
      ],
      mqttStatus: { mqttConnected: true, onlineEdgeDevices: 3 },
      campaignAnalytics: {
        isOverview: true,
        totalCampaigns: 5,
        activeCampaigns: 2,
        budget: 500000,
        spent: 125000,
        impressionsDelivered: 8400,
        totalPlaybacks: 320,
        totalScans: 180,
        daily: [
          { date: '2026-03-01', impressions: 1000, screens_played: 40 },
          { date: '2026-03-02', impressions: 1400, screens_played: 55 },
        ],
      },
    };
  });

  it('loads campaigns, mqtt status, and aggregate analytics on mount', () => {
    renderPage();
    expect(loadCampaigns).toHaveBeenCalled();
    expect(loadMqttStatus).toHaveBeenCalled();
    expect(loadCampaignAnalytics).toHaveBeenCalledWith('all');
  });

  it('renders real KPI values from analytics overview', () => {
    renderPage();
    expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
    expect(screen.getByText('8,400')).toBeInTheDocument();      // impressions
    expect(screen.getByText('180')).toBeInTheDocument();         // QR scan leads
    expect(screen.getByText('Impressions Delivered')).toBeInTheDocument();
    expect(screen.getByText('QR Scan Leads')).toBeInTheDocument();
    expect(screen.getByText('Budget Spent')).toBeInTheDocument();
  });

  it('renders a real performance chart from daily telemetry (no permanent empty placeholder)', () => {
    renderPage();
    expect(screen.getByText(/Daily verified impressions/i)).toBeInTheDocument();
    expect(screen.queryByText(/No performance data yet/i)).not.toBeInTheDocument();
  });

  it('shows empty performance state when no daily data', () => {
    hookState.campaignAnalytics = { isOverview: true, totalCampaigns: 0, activeCampaigns: 0, daily: [] };
    hookState.campaigns = [];
    renderPage();
    expect(screen.getByText(/No performance data yet/i)).toBeInTheDocument();
  });

  it('lists recent campaigns from real data', () => {
    renderPage();
    expect(screen.getByText('Metro Ad')).toBeInTheDocument();
  });

  it('shows MQTT telemetry status pill', () => {
    renderPage();
    expect(screen.getByText(/Fleet Telemetry/i)).toBeInTheDocument();
  });
});

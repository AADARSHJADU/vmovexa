import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Brand Co' }, hasPermission: () => true }),
}));

const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadCampaignAnalytics = vi.fn().mockResolvedValue({});

let hookState = {};
vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: hookState.campaigns,
    campaignAnalytics: hookState.campaignAnalytics,
    loadCampaigns,
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
    loadCampaignAnalytics.mockClear();
    hookState = {
      campaigns: [
        { id: 1, code: 'CMP-1', title: 'Metro Ad', status: 'live', budget: 100000, start_date: '2026-03-01', end_date: '2026-03-10' },
      ],
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

  it('loads campaigns and aggregate analytics on mount', () => {
    renderPage();
    expect(loadCampaigns).toHaveBeenCalled();
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
    expect(screen.getByTitle(/Mar 1: 1000 impressions, 40 playbacks/i)).toBeInTheDocument();
    expect(screen.queryByText('advertiser.dashboard.no_performance')).not.toBeInTheDocument();
  });

  it('shows empty performance state when no daily data', () => {
    hookState.campaignAnalytics = { isOverview: true, totalCampaigns: 0, activeCampaigns: 0, daily: [] };
    hookState.campaigns = [];
    renderPage();
    expect(screen.getByText('advertiser.dashboard.no_performance')).toBeInTheDocument();
  });

  it('lists recent campaigns from real data', () => {
    renderPage();
    expect(screen.getByText('Metro Ad')).toBeInTheDocument();
  });

  it('does not show unrelated fleet telemetry', () => {
    renderPage();
    expect(screen.queryByText(/Fleet Telemetry/i)).not.toBeInTheDocument();
  });
});

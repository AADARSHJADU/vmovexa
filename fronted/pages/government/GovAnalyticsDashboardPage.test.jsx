import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';
import { GovAnalyticsDashboardPage } from './GovAnalyticsDashboardPage';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (k, d) => LOCAL_TRANSLATIONS?.en?.[k] || d || k,
  }),
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
    loadBroadcasts,
    loadCampaigns,
    loadAgencyAnalytics,
  }),
}));

describe('GovAnalyticsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState = {
      broadcasts: [{ id: 1, title: 'Heatwave Alert' }],
      campaigns: [
        {
          id: 10,
          title: 'Road Safety Drive',
          category: 'Traffic',
          status: 'live',
          impressions_delivered: 5000,
          target_impressions: 10000,
          qr_scans_count: 250,
        },
        {
          id: 11,
          title: 'Health Awareness',
          category: 'Healthcare',
          status: 'completed',
          impressions_delivered: 12000,
          target_impressions: 12000,
          qr_scans_count: 50,
        },
      ],
      analytics: {
        kpis: {
          totalCampaigns: 2,
          activeCampaigns: 1,
          pendingApprovals: 0,
          completedCampaigns: 1,
          emergencyBroadcasts: 1,
          totalImpressions: 17000,
          totalScans: 300,
          uniqueScans: 280,
          networkReachPct: 67,
          activeVehiclesCount: 8,
          totalVehiclesCount: 12,
        },
        daysTrend: [
          { day: '23 Oct', date: '2026-10-23', count: 120 },
          { day: '24 Oct', date: '2026-10-24', count: 340 },
          { day: '25 Oct', date: '2026-10-25', count: 850 },
        ],
        qrDeviceBreakdown: { mobile: 240, tablet: 45, web: 15 },
        availableCategories: ['Traffic', 'Healthcare'],
        topCampaigns: [
          {
            id: 10,
            rank: 1,
            name: 'Road Safety Drive',
            category: 'Traffic',
            status: 'live',
            impressions: 5000,
            targetImpressions: 10000,
            completionPct: 50,
            busesCount: 5,
            qrScans: 250,
          },
        ],
      },
    };
  });

  it('renders overview KPIs with 100% mathematically real database figures', async () => {
    render(
      <MemoryRouter initialEntries={['/government/analytics']}>
        <GovAnalyticsDashboardPage />
      </MemoryRouter>
    );

    // Initial fetch check
    expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '7days', category: undefined });

    // Verify KPI metric values
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument();
    expect(screen.getByText('1 completed')).toBeInTheDocument();

    expect(screen.getByText('Transit Fleet Reach')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('8 of 12 active buses')).toBeInTheDocument();
  });

  it('filters by category and triggers backend refetch with selected category', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/government/analytics']}>
        <GovAnalyticsDashboardPage />
      </MemoryRouter>
    );

    // Find the category select element (first select in the filter row)
    const selects = container.querySelectorAll('select');
    const categorySelect = selects[0];
    fireEvent.change(categorySelect, { target: { value: 'Traffic' } });

    await waitFor(() => {
      expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '7days', category: 'Traffic' });
    });
  });

  it('filters by date range and triggers backend refetch with new dateRange', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/government/analytics']}>
        <GovAnalyticsDashboardPage />
      </MemoryRouter>
    );

    // Find the date range select element (second select in the filter row)
    const selects = container.querySelectorAll('select');
    const dateRangeSelect = selects[1];
    fireEvent.change(dateRangeSelect, { target: { value: '30days' } });

    await waitFor(() => {
      expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '30days', category: undefined });
    });
  });

  it('switches to QR Citizen Analytics tab and renders real device breakdown and scan counts', async () => {
    render(
      <MemoryRouter initialEntries={['/government/analytics']}>
        <GovAnalyticsDashboardPage />
      </MemoryRouter>
    );

    // Switch to QR tab
    const qrTabBtn = screen.getByText(/QR Citizen Analytics/i);
    fireEvent.click(qrTabBtn);

    // Verify 4 QR metrics
    expect(screen.getByText('300')).toBeInTheDocument(); // total scans
    expect(screen.getByText('280')).toBeInTheDocument(); // unique scanners (from DB uniqueScans)

    // Verify Device type breakdown derived mathematically
    // sum = 240 + 45 + 15 = 300
    // mobile = 240 / 300 = 80%
    // tablet = 45 / 300 = 15%
    // web = 15 / 300 = 5%
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/240 Scans/i)).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText(/45 Scans/i)).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument();
    expect(screen.getByText(/15 Scans/i)).toBeInTheDocument();
  });

  it('supports superadmin route with correct breadcrumb base path', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/analytics']}>
        <GovAnalyticsDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
    expect(screen.getByText('Transit Analytics & Telematics')).toBeInTheDocument();
  });
});

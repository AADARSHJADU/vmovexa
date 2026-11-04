import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';
import { GovReportsPage } from './GovReportsPage';

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (k, d) => LOCAL_TRANSLATIONS?.en?.[k] || d || k,
  }),
}));

const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadAgencyAnalytics = vi.fn().mockResolvedValue({});
const createExport = vi.fn().mockResolvedValue({ id: 1 });

let hookState = {};
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    campaigns: hookState.campaigns,
    analytics: hookState.analytics,
    loadCampaigns,
    loadAgencyAnalytics,
  }),
}));

vi.mock('../../hooks/shared/useReports', () => ({
  useReports: () => ({
    createExport,
  }),
}));

describe('GovReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState = {
      campaigns: [
        {
          id: 10,
          code: 'CMP-GOV-10',
          title: 'Road Safety Drive',
          category: 'Traffic',
          status: 'live',
          impressions_delivered: 8000,
          target_impressions: 10000,
          qr_scans_count: 400,
        },
      ],
      analytics: {
        kpis: {
          totalCampaigns: 1,
          activeCampaigns: 1,
          totalImpressions: 8000,
          targetImpressionsTotal: 10000,
          totalScans: 400,
          uniqueScans: 380,
          networkReachPct: 75,
          activeVehiclesCount: 9,
          totalVehiclesCount: 12,
        },
        daysTrend: [
          { day: '23 Oct', date: '2026-10-23', count: 120 },
          { day: '24 Oct', date: '2026-10-24', count: 480 },
        ],
        availableCategories: ['Traffic', 'Public Safety'],
        topCampaigns: [
          {
            id: 10,
            code: 'CMP-GOV-10',
            name: 'Road Safety Drive',
            category: 'Traffic',
            status: 'live',
            impressions: 8000,
            targetImpressions: 10000,
            completionPct: 80,
            busesCount: 6,
            qrScans: 400,
            uniqueScans: 380,
            location: 'Indore Corridor',
          },
        ],
      },
    };
  });

  it('renders mathematically real KPIs and reports cards', async () => {
    render(
      <MemoryRouter initialEntries={['/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    // Initial load check
    expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '7days', category: undefined });

    // Verify KPI headers
    expect(screen.getByText('Total Playback Loops')).toBeInTheDocument();
    expect(screen.getByText('8,000')).toBeInTheDocument();

    expect(screen.getByText('Target Citizen Reach')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();

    expect(screen.getByText('Citizen QR Engagements')).toBeInTheDocument();
    expect(screen.getAllByText('400').length).toBeGreaterThanOrEqual(1);

    // Verify Campaign Card Content
    expect(screen.getByText('Road Safety Drive')).toBeInTheDocument();
    expect(screen.getByText('CMP-GOV-10')).toBeInTheDocument();
    expect(screen.getByText('Indore Corridor')).toBeInTheDocument();
  });

  it('handles category and date range changes', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    const selects = container.querySelectorAll('select');
    const categorySelect = selects[0];
    const dateRangeSelect = selects[1];

    // Change category
    fireEvent.change(categorySelect, { target: { value: 'Traffic' } });
    await waitFor(() => {
      expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '7days', category: 'Traffic' });
    });

    // Change date range
    fireEvent.change(dateRangeSelect, { target: { value: '30days' } });
    await waitFor(() => {
      expect(loadAgencyAnalytics).toHaveBeenCalledWith({ dateRange: '30days', category: 'Traffic' });
    });
  });

  it('filters reports in real time when searching', async () => {
    render(
      <MemoryRouter initialEntries={['/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search reports/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    await waitFor(() => {
      expect(screen.getByText(/No campaign telemetry reports matched/i)).toBeInTheDocument();
    });
  });

  it('toggles view mode between card and table', async () => {
    render(
      <MemoryRouter initialEntries={['/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    const tableBtn = screen.getByTitle(/Table View/i) || screen.getByRole('button', { name: /table/i });
    if (tableBtn) {
      fireEvent.click(tableBtn);
    }
  });

  it('triggers report export when Export button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    const exportBtn = screen.getByText(/Export Report/i);
    fireEvent.click(exportBtn);

    expect(createExport).toHaveBeenCalledWith({
      type: 'government_reports',
      format: 'csv',
      filters: { dateRange: '7days', category: 'all', search: '' },
    });
  });

  it('supports superadmin route with correct base path', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/reports']}>
        <GovReportsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('SuperAdmin')).toBeInTheDocument();
    expect(screen.getAllByText('Public Authority Reports').length).toBe(2);
  });
});

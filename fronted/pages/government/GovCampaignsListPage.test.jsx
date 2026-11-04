import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    promise: (p) => p,
  },
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (_k, def) => def,
  }),
}));

const loadCampaigns = vi.fn().mockResolvedValue([]);
const approveCampaign = vi.fn().mockResolvedValue({});
const rejectCampaign = vi.fn().mockResolvedValue({});
const deleteCampaign = vi.fn().mockResolvedValue({});

let mockCampaigns = [];

vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    campaigns: mockCampaigns,
    loadCampaigns,
    approveCampaign,
    rejectCampaign,
    deleteCampaign,
    loading: false,
  }),
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'ROLE-SUPER-ADMIN', clearance: 'ROOT' },
  }),
}));

import { GovCampaignsListPage } from './GovCampaignsListPage';

describe('GovCampaignsListPage', () => {
  beforeEach(() => {
    loadCampaigns.mockClear();
    approveCampaign.mockClear();
    rejectCampaign.mockClear();
    deleteCampaign.mockClear();
    mockCampaigns = [
      {
        id: 101,
        code: 'CMP-GOV-001',
        title: 'Road Safety Awareness 2026',
        client_company: 'Ministry of Road Transport',
        client_name: 'Dr. Ramesh Kumar',
        category: 'Public Safety',
        status: 'pending_approval',
        start_date: '2026-03-01',
        end_date: '2026-03-31',
        targets: [{ screens_count: 50, city: 'Delhi' }],
      },
      {
        id: 102,
        code: 'CMP-GOV-002',
        title: 'Clean City Green City',
        client_company: 'Municipal Corporation',
        client_name: 'Sunita Sharma',
        category: 'Environment',
        status: 'live',
        start_date: '2026-02-15',
        end_date: '2026-04-15',
        targets: [{ screens_count: 120, city: 'Mumbai' }],
      },
    ];
  });

  it('loads government campaigns on mount and renders breadcrumb and title', async () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns']}>
        <GovCampaignsListPage />
      </MemoryRouter>
    );

    expect(loadCampaigns).toHaveBeenCalled();
    expect(await screen.findByText('Government Campaigns')).toBeInTheDocument();
    expect(screen.getByText('Road Safety Awareness 2026')).toBeInTheDocument();
    expect(screen.getByText('Clean City Green City')).toBeInTheDocument();
  });

  it('renders create campaign button with correct link path', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns']}>
        <GovCampaignsListPage />
      </MemoryRouter>
    );

    const createBtn = screen.getByRole('link', { name: /Create Campaign/i });
    expect(createBtn).toHaveAttribute('href', '/superadmin/government/campaigns/create');
  });

  it('renders View Details link pointing to campaign ID', async () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns']}>
        <GovCampaignsListPage />
      </MemoryRouter>
    );

    const links = await screen.findAllByRole('link', { name: /View Details/i });
    expect(links.length).toBeGreaterThan(0);
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('/superadmin/government/campaigns/CMP-GOV-001');
    expect(hrefs).toContain('/superadmin/government/campaigns/CMP-GOV-002');
  });

  it('filters campaigns when search term is typed', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns']}>
        <GovCampaignsListPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search by campaign name/i);
    await user.type(searchInput, 'Road Safety');

    expect(screen.getByText('Road Safety Awareness 2026')).toBeInTheDocument();
    expect(screen.queryByText('Clean City Green City')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

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

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin', role: 'ROLE-SUPER-ADMIN' },
    hasPermission: () => true,
  }),
}));

vi.mock('../../components/ui/RecordOfflinePaymentModal', () => ({
  RecordOfflinePaymentModal: () => null,
}));

const loadCampaignById = vi.fn().mockResolvedValue({});
const loadCampaigns = vi.fn().mockResolvedValue([]);
const approveCampaign = vi.fn().mockResolvedValue({});
const rejectCampaign = vi.fn().mockResolvedValue({});
const startCampaign = vi.fn().mockResolvedValue({});
const stopCampaign = vi.fn().mockResolvedValue({});

let mockCampaign = null;

vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    campaigns: mockCampaign ? [mockCampaign] : [],
    currentCampaign: mockCampaign,
    loadCampaignById,
    loadCampaigns,
    approveCampaign,
    rejectCampaign,
    startCampaign,
    stopCampaign,
    loading: false,
  }),
}));

vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: [],
    activeCampaign: null,
    loadCampaignDetails: vi.fn().mockResolvedValue({}),
    loadCampaigns: vi.fn().mockResolvedValue([]),
    loadMqttStatus: vi.fn().mockResolvedValue({}),
    submitCampaign: vi.fn().mockResolvedValue({}),
    verifyCampaign: vi.fn().mockResolvedValue({}),
    deleteCampaign: vi.fn().mockResolvedValue({}),
    startCampaign: vi.fn().mockResolvedValue({}),
    stopCampaign: vi.fn().mockResolvedValue({}),
    endCampaign: vi.fn().mockResolvedValue({}),
    sharePaymentLink: vi.fn().mockResolvedValue({}),
    loading: false,
  }),
}));

import { GovCampaignDetailsPage } from './GovCampaignDetailsPage';

describe('GovCampaignDetailsPage', () => {
  beforeEach(() => {
    loadCampaignById.mockClear();
    loadCampaigns.mockClear();
    approveCampaign.mockClear();
    rejectCampaign.mockClear();
    startCampaign.mockClear();
    stopCampaign.mockClear();

    mockCampaign = {
      id: 205,
      code: 'CMP-GOV-205',
      title: 'Polio Vaccination Drive',
      client_company: 'Ministry of Health & Family Welfare',
      client_name: 'Dr. Anita Roy',
      client_phone: '+91 98765 00000',
      client_email: 'anita.roy@mohfw.gov.in',
      client_city: 'New Delhi',
      category: 'Healthcare',
      priority: 'High',
      status: 'pending_approval',
      start_date: '2026-04-01',
      end_date: '2026-04-30',
      broadcast_start_time: '08:00',
      broadcast_end_time: '20:00',
      active_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      description: 'National immunization awareness campaign on public transit screens.',
      targets: [
        { id: 1, route_name: 'Route 101 - Central Corridor', screens_count: 80, vehicles_count: 40, city: 'Delhi' }
      ],
      qrCodes: [{ code: 'VMX-GOV-QR-205', scan_count: 45, redirect_url: 'https://mohfw.gov.in' }],
    };
  });

  it('calls loadCampaignById with route param on mount and renders details', async () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns/CMP-GOV-205']}>
        <Routes>
          <Route path="/superadmin/government/campaigns/:id" element={<GovCampaignDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(loadCampaignById).toHaveBeenCalledWith('CMP-GOV-205');
    expect((await screen.findAllByText('Polio Vaccination Drive')).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText('Ministry of Health & Family Welfare')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('CMP-GOV-205').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Approve Broadcast button for pending campaigns and calls approveCampaign on click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns/CMP-GOV-205']}>
        <Routes>
          <Route path="/superadmin/government/campaigns/:id" element={<GovCampaignDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const approveBtn = await screen.findByRole('button', { name: /Approve Broadcast/i });
    expect(approveBtn).toBeInTheDocument();

    await user.click(approveBtn);
    expect(approveCampaign).toHaveBeenCalledWith(205);
  });

  it('renders navigation tabs and switches content correctly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns/CMP-GOV-205']}>
        <Routes>
          <Route path="/superadmin/government/campaigns/:id" element={<GovCampaignDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Switch to Creatives & Fleet tab
    const targetsTab = await screen.findByRole('button', { name: /Creatives & Fleet/i });
    await user.click(targetsTab);

    expect(screen.getByText('Route 101 - Central Corridor')).toBeInTheDocument();
    expect(screen.getAllByText(/80 Screens/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Breadcrumb with valid back link to government campaigns list', async () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/campaigns/CMP-GOV-205']}>
        <Routes>
          <Route path="/superadmin/government/campaigns/:id" element={<GovCampaignDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const campaignsLink = await screen.findByRole('link', { name: /^Campaigns$/i });
    expect(campaignsLink).toHaveAttribute('href', '/superadmin/government/campaigns');
  });
});

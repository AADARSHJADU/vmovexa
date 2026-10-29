import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'ROLE-SUPER-ADMIN', name: 'Super Admin' },
    hasPermission: () => true,
  }),
}));

vi.mock('../../components/ui/RecordOfflinePaymentModal', () => ({
  RecordOfflinePaymentModal: () => null,
}));

const loadCampaignDetails = vi.fn().mockResolvedValue({});
const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadMqttStatus = vi.fn().mockResolvedValue({});
const startCampaign = vi.fn().mockResolvedValue({});
const stopCampaign = vi.fn().mockResolvedValue({});
const endCampaign = vi.fn().mockResolvedValue({});
const verifyCampaign = vi.fn().mockResolvedValue({});
const sharePaymentLink = vi.fn().mockResolvedValue({});

let mockCampaign = null;

vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: mockCampaign ? [mockCampaign] : [],
    activeCampaign: mockCampaign,
    loadingDetails: false,
    user: { id: 1, role: 'ROLE-SUPER-ADMIN', name: 'Super Admin' },
    loadCampaignDetails,
    loadCampaigns,
    loadMqttStatus,
    startCampaign,
    stopCampaign,
    endCampaign,
    verifyCampaign,
    sharePaymentLink,
    canSubmitCampaign: true,
    canVerifyCampaign: true,
    canPayCampaign: true,
    canEditCampaign: true,
    canDeleteCampaign: true,
  }),
}));

vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    campaigns: [],
    currentCampaign: null,
    loading: false,
    user: { id: 1, role: 'ROLE-SUPER-ADMIN', name: 'Super Admin' },
    loadCampaignById: vi.fn().mockResolvedValue({}),
    loadCampaigns: vi.fn().mockResolvedValue([]),
    loadMqttStatus: vi.fn().mockResolvedValue({}),
    startCampaign: vi.fn().mockResolvedValue({}),
    stopCampaign: vi.fn().mockResolvedValue({}),
    endCampaign: vi.fn().mockResolvedValue({}),
    verifyCampaign: vi.fn().mockResolvedValue({}),
    approveCampaign: vi.fn().mockResolvedValue({}),
    sharePaymentLink: vi.fn().mockResolvedValue({}),
    canSubmitCampaign: true,
    canVerifyCampaign: true,
    canPayCampaign: true,
    canEditCampaign: true,
    canDeleteCampaign: true,
  }),
}));

import CampaignDetailsPage from './CampaignDetailsPage';

function renderPage(campaignId = 'CMP-MVAKH1KV-BB49') {
  return render(
    <MemoryRouter initialEntries={[`/superadmin/advertiser/campaigns/${campaignId}`]}>
      <Routes>
        <Route path="/superadmin/advertiser/campaigns/:id" element={<CampaignDetailsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CampaignDetailsPage (Dark Mode & Responsive Buttons)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCampaign = {
      id: 49,
      code: 'CMP-MVAKH1KV-BB49',
      name: 'GTW camp',
      status: 'pending_approval',
      payment_status: 'paid',
      brand_name: 'Government Department',
      client_name: 'Amarth',
      client_company: 'GTW',
      budget: 1200,
      total_amount: 1200,
      targets: [
        { id: 1, screens_count: 10, vehicles_count: 5, route_name: 'Route 101' },
      ],
      media: [
        { id: 1, media_type: 'video', file_url: '/uploads/sample.mp4' },
      ],
      qrCodes: [{ code: 'QR-49', scan_count: 12 }],
    };
    loadCampaignDetails.mockResolvedValue(mockCampaign);
  });

  it('renders campaign details header with code, name, and status', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: /GTW camp/i })).toBeInTheDocument();
    expect(screen.getAllByText('CMP-MVAKH1KV-BB49').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Under Review').length).toBeGreaterThan(0);
  });

  it('renders all header action buttons with uniform h-10, shrink-0 and whitespace-nowrap', async () => {
    renderPage();
    await screen.findByRole('heading', { level: 1, name: /GTW camp/i });

    const verifyBtn = screen.getByRole('button', { name: /Verify & Approve Campaign/i });
    const startBtn = screen.getByRole('button', { name: /Start Ad \(Launch Live\)/i });
    const editBtn = screen.getByRole('button', { name: /Edit/i });
    const deleteBtn = screen.getByRole('button', { name: /Delete/i });
    const analyticsLink = screen.getByRole('link', { name: /Analytics/i });

    // Verify all buttons have uniform height, whitespace-nowrap, shrink-0
    [verifyBtn, startBtn, editBtn, deleteBtn, analyticsLink].forEach((btn) => {
      expect(btn.className).toContain('h-10');
      expect(btn.className).toContain('whitespace-nowrap');
      expect(btn.className).toContain('shrink-0');
      expect(btn.className).toContain('rounded-xl');
      expect(btn.className).toContain('inline-flex');
    });
  });

  it('renders customer payment checkout box with dark mode classes', async () => {
    renderPage();
    await screen.findByRole('heading', { level: 1, name: /GTW camp/i });

    const checkoutHeader = screen.getByText(/Customer Payment Checkout & Link Dispatch/i);
    const checkoutContainer = checkoutHeader.closest('div[class*="rounded-2xl"]');
    expect(checkoutContainer).not.toBeNull();
    expect(checkoutContainer.className).toContain('dark:from-zinc-900');
    expect(checkoutContainer.className).toContain('dark:border-zinc-700');
  });

  it('renders settled payment banner with launch live button when paid', async () => {
    renderPage();
    await screen.findByRole('heading', { level: 1, name: /GTW camp/i });

    expect(screen.getByText(/Payment of ₹1,200 has been cleared/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Launch Live$/i })).toBeInTheDocument();
  });
});

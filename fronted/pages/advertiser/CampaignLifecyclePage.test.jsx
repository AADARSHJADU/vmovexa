import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../components/campaign/CampaignLifecycleFlow', () => ({
  CampaignLifecycleFlow: () => <div data-testid="flow-diagram" />,
}));

const loadCampaigns = vi.fn();
const startCampaign = vi.fn();
const stopCampaign = vi.fn();
const endCampaign = vi.fn();
const sharePaymentLink = vi.fn();

let campaignsData = [];
vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: campaignsData,
    loadCampaigns,
    startCampaign,
    stopCampaign,
    endCampaign,
    sharePaymentLink,
  }),
}));

import { CampaignLifecyclePage } from './CampaignLifecyclePage';

function renderPage() {
  return render(<MemoryRouter initialEntries={['/advertiser/campaigns/flow']}><CampaignLifecyclePage /></MemoryRouter>);
}

describe('CampaignLifecyclePage (flow board)', () => {
  beforeEach(() => {
    loadCampaigns.mockReset().mockResolvedValue([]);
    startCampaign.mockReset().mockResolvedValue({});
    stopCampaign.mockReset().mockResolvedValue({});
    endCampaign.mockReset().mockResolvedValue({});
    sharePaymentLink.mockReset().mockResolvedValue({});
    campaignsData = [
      { id: 1, code: 'CMP-1', title: 'Live One', status: 'live', payment_status: 'paid', budget: 1000, spent: 100, impressions_delivered: 50 },
      { id: 2, code: 'CMP-2', title: 'Approved Unpaid', status: 'approved', payment_status: 'unpaid', budget: 2000, spent: 0, impressions_delivered: 0 },
      { id: 3, code: 'CMP-3', title: 'Paid Ready', status: 'approved', payment_status: 'paid', budget: 3000, spent: 0, impressions_delivered: 0 },
    ];
  });

  it('loads campaigns on mount and lists them', async () => {
    renderPage();
    expect(loadCampaigns).toHaveBeenCalled();
    expect(await screen.findByText('Live One')).toBeInTheDocument();
    expect(screen.getByText('Approved Unpaid')).toBeInTheDocument();
  });

  it('stage filter narrows the list', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Live One');
    // Click the "Live" stage filter.
    await user.click(screen.getByRole('button', { name: /^Live/ }));
    expect(screen.getByText('Live One')).toBeInTheDocument();
    expect(screen.queryByText('Approved Unpaid')).not.toBeInTheDocument();
  });

  it('shows Pause + End for a live campaign and triggers stopCampaign', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Live One');
    await user.click(screen.getByRole('button', { name: /Pause Ad/ }));
    await waitFor(() => expect(stopCampaign).toHaveBeenCalledWith(1));
  });

  it('shows Send Payment Link for approved+unpaid and triggers sharePaymentLink', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Approved Unpaid');
    await user.click(screen.getByRole('button', { name: /Send Payment Link/ }));
    await waitFor(() => expect(sharePaymentLink).toHaveBeenCalledWith(2, { channel: 'all' }));
  });

  it('shows Start Ad for paid+approved and triggers startCampaign', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Paid Ready');
    const startButtons = screen.getAllByRole('button', { name: /Start Ad/ });
    await user.click(startButtons[0]);
    await waitFor(() => expect(startCampaign).toHaveBeenCalledWith(3));
  });
});

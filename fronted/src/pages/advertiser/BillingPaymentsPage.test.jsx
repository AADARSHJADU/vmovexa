import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (_k, d) => d }) }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { name: 'Adv User' } }) }));
vi.mock('../../utils/storage', () => ({ storage: { getAccessToken: () => 'tok' } }));

// Capture PaymentProcessingModal props to assert it opens on Pay Bill.
let modalProps = null;
vi.mock('../../components/PaymentProcessingModal', () => ({
  PaymentProcessingModal: (props) => { modalProps = props; return props.isOpen ? <div data-testid="pay-modal" /> : null; },
}));

const loadCampaigns = vi.fn().mockResolvedValue([]);
const loadWallet = vi.fn().mockResolvedValue({});
const loadInvoices = vi.fn().mockResolvedValue([]);
const loadTransactions = vi.fn().mockResolvedValue([]);
const confirmPayment = vi.fn().mockResolvedValue({});
const payInvoice = vi.fn().mockResolvedValue({});

let campaignsData = [];
let invoicesData = [];
let transactionsData = [];
vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    campaigns: campaignsData,
    loadCampaigns,
    invoices: invoicesData,
    transactions: transactionsData,
    loadWallet,
    loadInvoices,
    loadTransactions,
    confirmPayment,
    payInvoice,
  }),
}));

const loadGovCampaigns = vi.fn().mockResolvedValue([]);
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    campaigns: [],
    loadCampaigns: loadGovCampaigns,
  }),
}));

import { BillingPaymentsPage } from './BillingPaymentsPage';

function renderPage() {
  return render(<MemoryRouter initialEntries={['/advertiser/billing']}><BillingPaymentsPage /></MemoryRouter>);
}

describe('BillingPaymentsPage (cleaned)', () => {
  beforeEach(() => {
    modalProps = null;
    campaignsData = [
      { id: 10, code: 'CMP-10', title: 'Approved Pending', status: 'approved', payment_status: 'unpaid', budget: 10000, targets: [] },
    ];
    invoicesData = [];
    transactionsData = [];
  });

  it('does NOT show any Add Payment Method button or Saved Payment Methods section', async () => {
    renderPage();
    await screen.findByText('Approved Pending');
    expect(screen.queryByText(/Add Payment Method/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Saved Payment Methods/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Set Primary/i)).not.toBeInTheDocument();
  });

  it('shows no dummy data — empty invoices and transactions render honest empty states', async () => {
    campaignsData = [];
    renderPage();
    expect(await screen.findByText(/No Matching Invoices Found/i)).toBeInTheDocument();
    expect(screen.getByText(/No Transaction Records/i)).toBeInTheDocument();
  });

  it('renders View Details link for pending campaigns pointing to the campaign details page', async () => {
    renderPage();
    await screen.findByText('Approved Pending');
    const detailsLink = screen.getByRole('link', { name: /View Details/i });
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink).toHaveAttribute('href', '/advertiser/campaigns/CMP-10');
  });

  it('renders View Details link for invoice items matching campaign', async () => {
    invoicesData = [{ id: 5, code: 'INV-5', total: 5900, status: 'issued', issued_at: new Date().toISOString(), po_reference: 'CMP-10' }];
    renderPage();
    await screen.findByText('Approved Pending');
    const detailsLinks = await screen.findAllByRole('link', { name: /View Details/i });
    expect(detailsLinks.length).toBeGreaterThan(0);
    expect(detailsLinks[0]).toHaveAttribute('href', '/advertiser/campaigns/CMP-10');
  });
});

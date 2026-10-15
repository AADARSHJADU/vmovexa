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
    renderPage();
    await screen.findByText('Approved Pending');
    expect(screen.getByText(/No Invoices Generated Yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No Transaction Records/i)).toBeInTheDocument();
  });

  it('opens the payment modal when Pay Bill Now is clicked', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Approved Pending');
    await user.click(screen.getByRole('button', { name: /Pay Bill Now/i }));
    await waitFor(() => expect(screen.getByTestId('pay-modal')).toBeInTheDocument());
    expect(modalProps.data.type).toBe('campaign');
    // Total = budget + 18% GST = 11800
    expect(modalProps.data.amount).toBe(11800);
  });

  it('wires payInvoice through the payment success handler for invoice items', async () => {
    invoicesData = [{ id: 5, code: 'INV-5', total: 5900, status: 'issued', issued_at: new Date().toISOString(), po_reference: 'CMP-10' }];
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Approved Pending');
    // Invoice "Pay Bill" button
    const payButtons = await screen.findAllByRole('button', { name: /Pay Bill/i });
    await user.click(payButtons[payButtons.length - 1]);
    await waitFor(() => expect(screen.getByTestId('pay-modal')).toBeInTheDocument());
    // Simulate the modal firing success for an invoice.
    await modalProps.onPaymentSuccess({ method: 'upi', transactionId: 'TXN-1' });
    await waitFor(() => expect(payInvoice).toHaveBeenCalled());
  });
});

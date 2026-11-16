import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FinanceCampaignPaymentsPage } from './FinanceCampaignPaymentsPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    language: 'en',
  }),
}));

vi.mock('../../api/services/finance/finance.service', () => ({
  financeService: {
    getCampaignPayment: vi.fn().mockResolvedValue({
      id: 101,
      code: 'CMP-TEST-101',
      title: 'Summer Sale DOOH',
      brand_name: 'Metro Brand',
      client_name: 'Rahul Sharma',
      client_company: 'Sharma Traders',
      client_phone: '+91 98765 00000',
      client_email: 'rahul@sharma.in',
      client_city: 'Indore',
      budget: 50000,
      total_payable: 59000,
      taxable_amount: 50000,
      tax_amount: 9000,
      payment_status: 'unpaid',
      status: 'approved',
      media: [],
      targets: [],
      qrCodes: [],
    }),
  },
}));

const mockLoadCampaignPayments = vi.fn().mockResolvedValue([]);
const mockShareCampaignPaymentLink = vi.fn().mockResolvedValue({});

const sampleCampaign = {
  id: 101,
  code: 'CMP-TEST-101',
  title: 'Summer Sale DOOH',
  brand_name: 'Metro Brand',
  client_name: 'Rahul Sharma',
  client_company: 'Sharma Traders',
  client_phone: '+91 98765 00000',
  client_email: 'rahul@sharma.in',
  budget: 50000,
  taxable_amount: 50000,
  tax_amount: 9000,
  total_payable: 59000,
  payment_status: 'unpaid',
  status: 'approved',
  targets: [{ route_id: 1, screens_count: 5 }],
};

vi.mock('../../hooks/finance/useFinanceRole', () => ({
  useFinanceRole: () => ({
    campaignPayments: [sampleCampaign],
    campaignPaymentsPagination: { page: 1, limit: 10, total: 4, totalPages: 1 },
    campaignPaymentsCounts: { all: 4, pending: 1, paid: 3, live: 0 },
    campaignPaymentsSummary: { totalPendingAmount: 2000, totalCollectedAmount: 5000, totalAmount: 7000 },
    loadCampaignPayments: mockLoadCampaignPayments,
    shareCampaignPaymentLink: mockShareCampaignPaymentLink,
  }),
}));

describe('FinanceCampaignPaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table without screens & routes column and without base/gst subtext', async () => {
    render(
      <MemoryRouter>
        <FinanceCampaignPaymentsPage />
      </MemoryRouter>
    );

    // Verify Campaign title & client rendered
    expect(await screen.findByText('Summer Sale DOOH')).toBeInTheDocument();
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();

    // Verify SCREENS & ROUTES header is NOT present
    expect(screen.queryByText(/screens & routes/i)).not.toBeInTheDocument();

    // Verify Base / GST breakdown text is NOT present
    expect(screen.queryByText(/base: ₹/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/· gst: ₹/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+ gst \(18%\): ₹/i)).not.toBeInTheDocument();

    // Verify Total Payable amount is rendered (both in KPI card and in table row)
    const amounts = screen.getAllByText('₹59,000');
    expect(amounts.length).toBeGreaterThanOrEqual(1);

    // Verify Actions column exists
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders title as link and navigates to View Details route via 3-dots action menu', async () => {
    render(
      <MemoryRouter initialEntries={['/finance/campaign-payments']}>
        <FinanceCampaignPaymentsPage />
      </MemoryRouter>
    );

    const titleEl = await screen.findByText('Summer Sale DOOH');
    expect(titleEl).toBeInTheDocument();
    const titleLink = titleEl.closest('a');
    expect(titleLink).not.toBeNull();
    expect(titleLink).toHaveAttribute('href', '/finance/campaign-payments/101');

    // Click 3-dots action button
    const actionBtn = screen.getByLabelText('Actions');
    fireEvent.click(actionBtn);

    // Menu should show "View Details"
    const viewDetailsBtn = await screen.findByText('View Details');
    expect(viewDetailsBtn).toBeInTheDocument();

    // Click "View Details"
    fireEvent.click(viewDetailsBtn);

    // Should navigate to campaign details route
    expect(mockNavigate).toHaveBeenCalledWith('/finance/campaign-payments/101');
  });

  it('renders stable filter tab counts and calls loadCampaignPayments on tab switch', async () => {
    render(
      <MemoryRouter>
        <FinanceCampaignPaymentsPage />
      </MemoryRouter>
    );

    // Verify filter tab badges render correct server counts
    expect(screen.getByText('All').closest('button')).toHaveTextContent('4');
    expect(screen.getByText('Pending').closest('button')).toHaveTextContent('1');
    expect(screen.getByText('Paid').closest('button')).toHaveTextContent('3');
    expect(screen.getByText('Live').closest('button')).toHaveTextContent('0');

    // Click Pending tab
    fireEvent.click(screen.getByText('Pending'));

    await waitFor(() => {
      expect(mockLoadCampaignPayments).toHaveBeenCalledWith(
        expect.objectContaining({ paymentStatus: 'pending' })
      );
    });

    // Counts remain stable and do not drop to 0
    expect(screen.getByText('All').closest('button')).toHaveTextContent('4');
    expect(screen.getByText('Paid').closest('button')).toHaveTextContent('3');
  });
});

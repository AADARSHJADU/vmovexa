import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { FinanceCampaignDetailsPage } from './FinanceCampaignDetailsPage';

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

const mockCampaignData = {
  id: 101,
  code: 'CMP-DET-101',
  title: 'Diwali Transit Ad',
  brand_name: 'Festive Retail',
  client_name: 'Vikram Mehta',
  client_company: 'Mehta Textiles',
  client_phone: '+91 99887 76655',
  client_email: 'vikram@mehta.in',
  client_city: 'Indore',
  client_state: 'MP',
  client_address: 'MG Road, Main Market',
  budget: 75000,
  taxable_amount: 75000,
  tax_amount: 13500,
  total_payable: 88500,
  payment_status: 'paid',
  payment_method: 'neft',
  status: 'live',
  schedule_status: 'scheduled',
  start_date: '2026-11-01',
  end_date: '2026-11-15',
  broadcast_start_time: '08:00:00',
  broadcast_end_time: '20:00:00',
  duration_per_play_sec: 20,
  active_days: ['Monday', 'Tuesday', 'Wednesday'],
  media: [
    {
      id: 1,
      file_url: 'https://example.com/video.mp4',
      media_type: 'video',
      display_duration_sec: 20,
      resolution: '1080p',
    },
  ],
  qrCodes: [
    {
      id: 1,
      code: 'QR-TEST-1',
      target_url: 'https://example.com/festive-deal',
      scan_count: 42,
    },
  ],
  payment: {
    code: 'PAY-101',
    gateway_ref: 'UTR9988776655',
    method: 'neft',
  },
};

const mockLoadCampaignPayment = vi.fn().mockResolvedValue(mockCampaignData);

vi.mock('../../hooks/finance/useFinanceRole', () => ({
  useFinanceRole: () => ({
    loadCampaignPayment: mockLoadCampaignPayment,
    currentCampaignPayment: mockCampaignData,
    shareCampaignPaymentLink: vi.fn().mockResolvedValue({}),
  }),
}));

describe('FinanceCampaignDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders campaign details using real DB fields with zero dummy data', async () => {
    render(
      <MemoryRouter initialEntries={['/finance/campaign-payments/101']}>
        <Routes>
          <Route path="/finance/campaign-payments/:id" element={<FinanceCampaignDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title and Code
    expect(await screen.findByText('Diwali Transit Ad')).toBeInTheDocument();
    expect(screen.getAllByText('CMP-DET-101').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Festive Retail')).toBeInTheDocument();

    // Client Info
    expect(screen.getByText('Vikram Mehta')).toBeInTheDocument();
    expect(screen.getByText('Mehta Textiles')).toBeInTheDocument();
    expect(screen.getByText('+91 99887 76655')).toBeInTheDocument();
    expect(screen.getByText('vikram@mehta.in')).toBeInTheDocument();
    expect(screen.getByText('Indore, MP')).toBeInTheDocument();
    expect(screen.getByText('MG Road, Main Market')).toBeInTheDocument();

    // Financials
    expect(screen.getAllByText('₹88,500').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('₹75,000')).toBeInTheDocument();
    expect(screen.getByText('₹13,500')).toBeInTheDocument();
    expect(screen.getByText('UTR9988776655')).toBeInTheDocument();

    // QR Code
    expect(screen.getByText('QR-TEST-1')).toBeInTheDocument();
    expect(screen.getByText('Scans: 42')).toBeInTheDocument();
  });
});

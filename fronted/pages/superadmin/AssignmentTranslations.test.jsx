import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';
import { AssignedWorkOrdersPage } from './AssignedWorkOrdersPage';
import { RegisterFinanceOfficerPage } from './RegisterFinanceOfficerPage';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { formatSlaCountdown } from '../../features/workOrders/workOrderPresentation';

const mocks = vi.hoisted(() => ({ loadCentralTechnicians: vi.fn(), loadWorkOrders: vi.fn() }));
const translate = (key, fallback, params = {}) => (LOCAL_TRANSLATIONS.hi[key] || fallback)
  .replace(/{{(\w+)}}/g, (_, name) => params[name] ?? '');

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ t: translate, currentLanguage: 'hi' }),
}));
vi.mock('../../hooks/superadmin/useSuperTechnician', () => ({
  useSuperTechnician: () => ({
    ...mocks, centralTechnicians: [], workOrders: [],
    technicianPagination: { total: 0 }, workOrderPagination: { total: 0 },
  }),
}));
vi.mock('../../hooks/superadmin/useSuperFinanceOfficer', () => ({ useSuperFinanceOfficer: () => ({}) }));
vi.mock('../../components/driver/DriverAddressPicker', () => ({ DriverAddressPicker: () => null }));

beforeEach(() => {
  cleanup();
  // This project's Vitest transform uses the classic JSX runtime.
  vi.stubGlobal('React', React);
  vi.clearAllMocks();
  mocks.loadCentralTechnicians.mockResolvedValue([]);
  mocks.loadWorkOrders.mockResolvedValue([]);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('Hindi assignment translations', () => {
  it('translates finance options and validation without changing stored values', () => {
    const { container } = render(<MemoryRouter><RegisterFinanceOfficerPage /></MemoryRouter>);
    expect(screen.getByRole('option', { name: 'वरिष्ठ वित्तीय नियंत्रक' }).value).toBe('Senior Financial Controller');
    expect(screen.getByRole('option', { name: 'कॉर्पोरेट कोष और पूंजी' }).value).toBe('Corporate Treasury & Capital');
    fireEvent.submit(container.querySelector('form'));
    expect(screen.getByText('वित्त अधिकारी का पूरा नाम आवश्यक है।')).toBeTruthy();
  });
  it('sends canonical urgency values when the translated critical filter is toggled', async () => {
    render(<MemoryRouter initialEntries={['/?tab=work-orders']}><AssignedWorkOrdersPage /></MemoryRouter>);
    const critical = screen.getByRole('button', { name: translate('ag.superadmin.assignedworkorderspage.critical_only', 'Critical Only') });
    fireEvent.click(critical);
    await waitFor(() => expect(mocks.loadWorkOrders).toHaveBeenLastCalledWith(expect.objectContaining({ urgency: 'critical' })));
    fireEvent.click(critical);
    await waitFor(() => expect(mocks.loadWorkOrders.mock.lastCall[0].urgency).toBeUndefined());
  });

  it('shows translated document categories while retaining the stored category value', () => {
    render(<MultipleDocumentUploader categories={['Official Appointment Letter']} categoryLabels={{ 'Official Appointment Letter': 'आधिकारिक नियुक्ति पत्र' }} onChange={vi.fn()} deferUpload />);
    expect(screen.getByRole('option', { name: 'आधिकारिक नियुक्ति पत्र' }).value).toBe('Official Appointment Letter');
    expect(screen.getByRole('combobox').value).toBe('Official Appointment Letter');
    expect(screen.getByRole('button', { name: 'दस्तावेज़ संलग्न करें' })).toBeTruthy();
  });

  it('translates SLA durations and preserves the English behavior for existing callers', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-10T10:00:00Z'));
    try {
      expect(formatSlaCountdown('2026-11-10T11:30:00Z', 'submitted', translate).text).toBe('1 घंटे 30 मिनट शेष');
      expect(formatSlaCountdown('2026-11-10T09:45:00Z', 'submitted', translate).text).toBe('15 मिनट की देरी');
      expect(formatSlaCountdown('2026-11-10T11:30:00Z', 'submitted').text).toBe('1h 30m left');
      expect(formatSlaCountdown(null, 'submitted', translate)).toBeNull();
      expect(formatSlaCountdown(null, 'resolved', translate).text).toBe(LOCAL_TRANSLATIONS.hi['admin.tech_requests.status_resolved']);
    } finally { now.mockRestore(); }
  });
});

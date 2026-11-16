import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';
import { translateCampaignLabel } from '../../utils/campaignTranslations';
import { CampaignsListPage } from './CampaignsListPage';
import { CreateCampaignPage } from './CreateCampaignPage';
import { CampaignAnalyticsPage } from './CampaignAnalyticsPage';
import { CampaignInventorySelector } from '../../components/campaigns/CampaignInventorySelector';

const mocks = vi.hoisted(() => ({
  loadCampaigns: vi.fn(), loadCampaignAnalytics: vi.fn(), loadCampaignReviews: vi.fn(),
  loadFleetOptions: vi.fn(), loadSlotAvailability: vi.fn(), loadCampaignDetails: vi.fn(),
  error: vi.fn(), success: vi.fn(), campaigns: [], fleetOptions: [],
}));
const t = (key, fallback = key, params = {}) => (LOCAL_TRANSLATIONS.hi[key] || fallback)
  .replace(/{{(\w+)}}/g, (_, name) => params[name] ?? '');

vi.mock('../../hooks/useTranslation', () => ({ useTranslation: () => ({ t, currentLanguage: 'hi' }) }));
vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({ useAdvertiserRole: () => ({
  ...mocks, user: { role: 'ROLE-SUPER-ADMIN' },
  canCreateCampaign: true, canEditCampaign: true, canSubmitCampaign: true,
  campaignAnalytics: { isOverview: true, impressionsDelivered: 120, totalPlaybacks: 40, totalScans: 3, totalAmount: 2000 },
}) }));
vi.mock('../../hooks/government/useGovernmentRole', () => ({ useGovernmentRole: () => ({ campaigns: [], loadCampaigns: mocks.loadCampaigns }) }));
vi.mock('../../components/driver/DriverAddressPicker', () => ({ DriverAddressPicker: () => null }));
vi.mock('./CampaignSuccessPage', () => ({ CampaignSuccessModal: () => null }));
vi.mock('react-hot-toast', () => ({ default: { error: mocks.error, success: mocks.success, loading: vi.fn(), dismiss: vi.fn() } }));

beforeEach(() => {
  cleanup();
  const storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
  });
  vi.clearAllMocks();
  vi.stubGlobal('React', React);
  window.scrollTo = vi.fn();
  document.documentElement.scrollTo = vi.fn();
  mocks.campaigns = [];
  for (const name of ['loadCampaigns', 'loadCampaignAnalytics', 'loadCampaignReviews', 'loadFleetOptions', 'loadSlotAvailability', 'loadCampaignDetails']) mocks[name].mockResolvedValue([]);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const mount = (page, route) => render(<MemoryRouter initialEntries={[route]}>{page}</MemoryRouter>);

describe('Hindi campaign pages', () => {
  it('filters by the canonical status after clicking a Hindi status tab', () => {
    mocks.campaigns = [
      { id: 1, title: 'Live test campaign', status: 'live', targets: [] },
      { id: 2, title: 'Draft test campaign', status: 'draft', targets: [] },
      { id: 3, title: 'Paused test campaign', status: 'paused', targets: [] },
    ];
    mount(<CampaignsListPage />, '/superadmin/advertiser/campaigns');
    expect(screen.queryByRole('button', { name: /^Running\s/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^paused\s/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'प्रसारित 1' }));
    expect(screen.getByText('Live test campaign')).toBeTruthy();
    expect(screen.queryByText('Draft test campaign')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'रोक दिया गया 1' }));
    expect(screen.getByText('Paused test campaign')).toBeTruthy();
    expect(screen.queryByText('Live test campaign')).toBeNull();
    expect(translateCampaignLabel(t, 'live')).toBe('प्रसारित');
    expect(translateCampaignLabel(t, 'paused')).toBe('रोक दिया गया');
  });

  it('translates wizard validation errors', () => {
    mount(<CreateCampaignPage />, '/superadmin/advertiser/campaigns/create');
    fireEvent.click(screen.getByRole('button', { name: t('campaign_create.next_step', 'Next Step') }));
    expect(mocks.error).toHaveBeenCalledWith('कृपया अभियान का नाम दर्ज करें');
  });

  it('restores a schedule draft and saves canonical weekday values from Hindi presets', () => {
    localStorage.setItem('vmovexa_draft_campaign', JSON.stringify({ name: 'Schedule test', savedStep: 4 }));
    mount(<CreateCampaignPage />, '/superadmin/advertiser/campaigns/create');
    fireEvent.click(screen.getByRole('button', { name: t('campaign_create.restore_draft') }));
    fireEvent.click(screen.getByText(t('ag.fleet.addvehicleslotmodal.weekdays_only', 'Weekdays Only')).closest('button'));
    fireEvent.click(screen.getByRole('button', { name: t('campaign_create.save_draft') }));
    const saved = JSON.parse(localStorage.getItem('vmovexa_draft_campaign'));
    expect(saved.repeat).toBe('Weekdays');
    expect(saved.selectedDays).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  });

  it('loads analytics using the all identifier and renders translated metrics', async () => {
    mount(<CampaignAnalyticsPage />, '/superadmin/advertiser/analytics');
    await waitFor(() => expect(mocks.loadCampaignAnalytics).toHaveBeenCalledWith('all'));
    expect(screen.getByRole('combobox').value).toBe('all');
    expect(screen.getByText('कुल अभियान राशि')).toBeTruthy();
    expect(screen.getByText('120')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: t('advertiser.analytics.tab_routes') }));
    expect(screen.getByText('लक्षित परिवहन मार्ग देखने के लिए कोई विशिष्ट अभियान चुनें।')).toBeTruthy();
  });

  it('keeps city option values stable while translating the All option', () => {
    mount(<CampaignInventorySelector routes={[{ id: 1, name: 'Test route', city: 'Pune', vehicles: [] }]} onChange={vi.fn()} />, '/');
    const cities = screen.getByRole('combobox');
    expect(cities.value).toBe('All');
    expect(screen.getByRole('option', { name: translateCampaignLabel(t, 'All') }).value).toBe('All');
    fireEvent.change(cities, { target: { value: 'Pune' } });
    expect(screen.getByText('Test route')).toBeTruthy();
  });
});

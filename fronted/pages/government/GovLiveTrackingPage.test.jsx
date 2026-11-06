import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';

// Mock leaflet
vi.mock('leaflet', () => {
  const map = {
    remove: vi.fn(),
    fitBounds: vi.fn(),
    flyTo: vi.fn(),
    setView: vi.fn(),
    invalidateSize: vi.fn(),
  };
  const marker = { addTo: () => marker, remove: vi.fn(), on: vi.fn() };
  return {
    default: {
      map: () => map,
      tileLayer: () => ({ addTo: () => ({ setUrl: vi.fn() }) }),
      marker: () => marker,
      divIcon: () => ({}),
      latLngBounds: () => ({}),
    },
  };
});
vi.mock('leaflet/dist/leaflet.css', () => ({}));

vi.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (k, d) => LOCAL_TRANSLATIONS?.en?.[k] || d || k,
  }),
}));

const getLiveTracking = vi.fn();
const getTrackingRoutes = vi.fn();
vi.mock('../../api/services/government/government.service', () => ({
  governmentService: {
    getLiveTracking: (...a) => getLiveTracking(...a),
    getTrackingRoutes: (...a) => getTrackingRoutes(...a),
  },
}));

import { GovLiveTrackingPage } from './GovLiveTrackingPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/government/tracking']}>
      <GovLiveTrackingPage />
    </MemoryRouter>
  );
}

describe('GovLiveTrackingPage', () => {
  const sampleVehicles = [
    {
      id: 'BUS-01',
      vehicleId: 1,
      route: 'Indore - Ujjain Highway',
      routeId: 1,
      driver: 'Ramesh Kumar',
      screenStatus: 'Broadcasting',
      campaign: 'Swachh Bharat PSA',
      speed: '45 km/h',
      signal: 'good',
      battery: '88%',
      hub: 'Depot #1',
      lat: 23.01,
      lng: 75.83,
      hasGps: true,
    },
    {
      id: 'BUS-02',
      vehicleId: 2,
      route: 'Bhopal City Loop',
      routeId: 2,
      driver: 'Suresh Singh',
      screenStatus: 'Standby',
      campaign: '—',
      speed: '0 km/h',
      signal: 'no_fix',
      battery: '95%',
      hub: 'Depot #2',
      lat: 23.25,
      lng: 77.41,
      hasGps: true,
    },
  ];

  beforeEach(() => {
    getLiveTracking.mockReset().mockImplementation((params = {}) => {
      let list = [...sampleVehicles];
      if (params.status && params.status !== 'All') {
        list = list.filter((v) => v.screenStatus.toLowerCase() === String(params.status).toLowerCase());
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter((v) => v.id.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q));
      }
      return Promise.resolve({
        vehicles: list,
        mapPins: sampleVehicles,
        pagination: {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: list.length,
          pageSize: params.limit || 6,
        },
        stats: { total: 2, broadcasting: 1, standby: 1, offline: 0, withGps: 2 },
      });
    });

    getTrackingRoutes.mockReset().mockResolvedValue([
      { id: 1, name: 'Indore - Ujjain Highway', code: 'RTE-101' },
      { id: 2, name: 'Bhopal City Loop', code: 'RTE-102' },
    ]);
  });

  it('loads tracking telemetry dynamically with pagination on mount', async () => {
    renderPage();
    await waitFor(() =>
      expect(getLiveTracking).toHaveBeenCalledWith(
        expect.objectContaining({
          routeId: 'all',
          page: 1,
          limit: 6,
        })
      )
    );
    expect(getTrackingRoutes).toHaveBeenCalled();
    expect(await screen.findByText('Live Transit Telemetry')).toBeInTheDocument();
    expect(screen.getByText('2 on live GPS')).toBeInTheDocument();
  });

  it('renders KPI stats correctly', async () => {
    renderPage();
    await screen.findByText('Live Transit Telemetry');
    expect(screen.getAllByText('1 Vehicles').length).toBe(2); // broadcasting & standby
    expect(screen.getByText('Broadcasting Live')).toBeInTheDocument();
    expect(screen.getByText('Standby / Idle')).toBeInTheDocument();
  });

  it('renders routes in route dropdown selector', async () => {
    renderPage();
    await screen.findByText('Live Transit Telemetry');
    expect(screen.getAllByText(/Indore - Ujjain Highway/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bhopal City Loop/i).length).toBeGreaterThan(0);
  });

  it('filters vehicles dynamically by search query', async () => {
    renderPage();
    expect(await screen.findByText('BUS-01')).toBeInTheDocument();
    expect(screen.getByText('BUS-02')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search by/i);
    fireEvent.change(searchInput, { target: { value: 'Ramesh' } });

    await waitFor(() => {
      expect(getLiveTracking).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Ramesh',
          page: 1,
        })
      );
    });

    expect(screen.getByText('BUS-01')).toBeInTheDocument();
    expect(screen.queryByText('BUS-02')).not.toBeInTheDocument();
  });

  it('filters vehicles dynamically by status tab', async () => {
    renderPage();
    expect(await screen.findByText('BUS-01')).toBeInTheDocument();

    const standbyBtn = screen.getByRole('button', { name: 'Standby' });
    fireEvent.click(standbyBtn);

    await waitFor(() => {
      expect(getLiveTracking).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Standby',
          page: 1,
        })
      );
    });

    expect(screen.queryByText('BUS-01')).not.toBeInTheDocument();
    expect(screen.getByText('BUS-02')).toBeInTheDocument();
  });

  it('switches between card and table view modes', async () => {
    renderPage();
    expect(await screen.findByText('BUS-01')).toBeInTheDocument();

    const tableBtn = screen.getByTitle(/table/i) || screen.getByLabelText(/table/i);
    if (tableBtn) {
      fireEvent.click(tableBtn);
      expect(screen.getByRole('table')).toBeInTheDocument();
    }
  });

  it('supports selecting a vehicle card to inspect in map', async () => {
    renderPage();
    const busCard = await screen.findByText('BUS-01');
    fireEvent.click(busCard);

    // Active vehicle details box appears
    expect(screen.getAllByText('Swachh Bharat PSA').length).toBeGreaterThan(0);
  });
});

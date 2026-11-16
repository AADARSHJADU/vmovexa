import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { DriverRoutesPage } from './DriverRoutesPage';

const state = vi.hoisted(() => ({ activeRoute: null, profile: null, load: vi.fn().mockResolvedValue(null) }));
vi.mock('../../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (_, fallback) => fallback }) }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: { status: 'active' }, hasPermission: () => true }) }));
vi.mock('../../hooks/driver/useDriverApp', () => ({ useDriverApp: () => ({
  activeRoute: state.activeRoute, profile: state.profile, trips: [],
  loadActiveRoute: state.load, loadProfile: state.load, loadTrips: state.load,
  startTrip: state.load, endTrip: state.load,
}) }));
beforeEach(() => {
  vi.stubGlobal('React', React);
  state.profile = { status: 'available', documents_verified: true };
  const slot = {
    id: 2, shift_type: 'morning_peak', status: 'scheduled',
    bus_number: 'BUS-22', route_name: 'Central to North', route_code: 'RTE-2',
    time_window: '07:00 AM - 12:00 PM', formatted_start_time: '07:00 AM', formatted_end_time: '12:00 PM',
    distance_km: '23.10', frequency: 'Every 15 mins',
  };
  state.activeRoute = {
    selectedSlot: slot, todaySlots: [slot],
    activeTrip: { rawStatus: 'scheduled', busNumber: 'BUS-22', routeName: 'Central to North',
      totalDistance: '23.10 km', stops: [{ id: 1, name: 'Central', eta: null }], slot },
  };
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function showPage() {
  render(<MemoryRouter initialEntries={['/driver/routes?slotId=2']}><DriverRoutesPage /></MemoryRouter>);
  await screen.findByRole('button', { name: 'Start Trip' });
}

it('keeps actual slot data and removes headway, fabricated progress and decorative dispatch icons', async () => {
  await showPage();
  fireEvent.click(screen.getByRole('button', { name: /View Hardware & Display Specs/ }));
  expect(screen.getAllByText('BUS-22').length).toBeGreaterThan(0);
  expect(screen.getAllByText('23.10 km').length).toBeGreaterThan(0);
  expect(screen.getByText('Slot End Time')).toBeInTheDocument();
  for (const text of [/Every 15 mins/, /Headway/, /Ready to Dispatch/, /Active in Cockpit/, /Progress \/ Status/, /0%/, /Active Telematics/, /On Schedule/]) {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  }
  expect(screen.getByRole('button', { name: 'Start Trip' }).querySelector('svg')).toBeNull();
  expect(screen.getByRole('button', { pressed: true })).toHaveTextContent('Central to North');
});

it('does not claim a scheduled slot is live just because the driver is on duty', async () => {
  state.profile.status = 'on_duty';
  await showPage();
  expect(screen.queryByText('Live in Transit')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start Trip' })).toBeEnabled();
});

it('shows saved stop timing only when present', async () => {
  state.activeRoute.activeTrip.stops.push({ id: 2, name: 'North', eta: '11:45 AM' });
  await showPage();
  expect(screen.getByText(/11:45 AM/)).toBeInTheDocument();
  expect(screen.getAllByText(/ETA:/)).toHaveLength(1);
});

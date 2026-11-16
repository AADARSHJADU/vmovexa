import React from 'react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DriverDashboard } from './DriverDashboard';
import { LOCAL_TRANSLATIONS } from '../../constants/translations';

const state = vi.hoisted(() => ({
  profile: null,
  user: {},
  language: 'en',
  load: vi.fn().mockResolvedValue(null),
  toastError: vi.fn(),
}));
vi.mock('../../hooks/driver/useDriverApp', () => ({ useDriverApp: () => ({
  profile: state.profile, schedule: [], activeRoute: null,
  loadProfile: state.load, loadActiveRoute: state.load, loadSchedule: state.load,
  loadDocuments: state.load, loadIncidents: state.load,
}) }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => ({ user: state.user, hasPermission: () => false }) }));
vi.mock('../../hooks/useTranslation', () => ({ useTranslation: () => ({
  t: (key, fallback) => LOCAL_TRANSLATIONS[state.language]?.[key] || fallback || key,
}) }));
vi.mock('react-hot-toast', () => ({ default: { error: state.toastError } }));

beforeEach(() => {
  vi.stubGlobal('React', React);
  state.language = 'en';
  state.profile = { name: 'Test Driver', documents_verified: true, status: 'pending_approval', aadhaar_verified: true };
  state.user = { status: 'active', driver: { documents_verified: false, status: 'pending_approval' } };
  state.toastError.mockClear();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function showDashboard() {
  render(<MemoryRouter><DriverDashboard /></MemoryRouter>);
  await screen.findByText(/Test Driver/);
}

it('shows verified documents separately from pending driver approval, despite stale login data', async () => {
  await showDashboard();
  expect(screen.getByText('KYC Verified')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Documents Verified - Driver Approval Pending' })).toBeInTheDocument();
  expect(screen.queryByText('Compliance Documents Pending Admin Verification')).not.toBeInTheDocument();
  expect(screen.queryByText('Pending verification review')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View Documents' })).toHaveAttribute('href', '/driver/documents');
  expect(document.querySelector('a[href="/driver/schedule"]')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: LOCAL_TRANSLATIONS.en['common.view_details'] }));
  expect(state.toastError).toHaveBeenCalledWith(expect.stringContaining('do not need to upload'));
});

it('still requests document review if the current profile is unverified', async () => {
  state.profile.documents_verified = false;
  state.profile.verified = true; // An old alias must not override an explicit false.
  state.user.driver.documents_verified = true;
  await showDashboard();
  expect(screen.getByText('Compliance Documents Pending Admin Verification')).toBeInTheDocument();
  expect(screen.queryByText('KYC Verified')).not.toBeInTheDocument();
});

it('unlocks the dashboard after the current profile is approved', async () => {
  state.profile.status = 'available';
  await showDashboard();
  expect(screen.queryByText('Documents Verified - Driver Approval Pending')).not.toBeInTheDocument();
  expect(document.querySelector('a[href="/driver/schedule"]')).toBeInTheDocument();
});

it('keeps a verified but blocked driver restricted', async () => {
  state.profile.status = 'compliance_blocked';
  await showDashboard();
  expect(screen.getByText('Documents Verified - Driver Access Restricted')).toBeInTheDocument();
  expect(document.querySelector('a[href="/driver/schedule"]')).toBeNull();
});

it('shows the separate approval message in Hindi', async () => {
  state.language = 'hi';
  await showDashboard();
  expect(screen.getByRole('heading', { name: LOCAL_TRANSLATIONS.hi['driver.dashboard.documents_verified_pending_title'] })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'दस्तावेज़ देखें' })).toBeInTheDocument();
});

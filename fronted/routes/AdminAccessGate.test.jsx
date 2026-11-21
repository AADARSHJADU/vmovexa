import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminAccessGate } from './AdminAccessGate';

const authState = vi.hoisted(() => ({ user: null }));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}));

function renderGate(initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<AdminAccessGate />}>
          <Route path="/admin/dashboard" element={<div>Dashboard</div>} />
          <Route path="/admin/pending-approval" element={<div>Onboarding</div>} />
          <Route path="/admin/notifications" element={<div>Notifications</div>} />
          <Route path="/admin/subscription" element={<div>Subscription</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AdminAccessGate', () => {
  beforeEach(() => {
    authState.user = null;
  });

  it('returns a rejected tenant admin to onboarding instead of the portal', () => {
    authState.user = {
      status: 'rejected',
      organization: { status: 'rejected' },
    };

    renderGate('/admin/dashboard');

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('also locks the portal when only the organization is rejected', () => {
    authState.user = {
      status: 'active',
      organization: { status: 'rejected' },
    };

    renderGate('/admin/dashboard');

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
  });

  it('allows a rejected tenant to remain on the onboarding route', () => {
    authState.user = {
      status: 'rejected',
      organization: { status: 'rejected' },
    };

    renderGate('/admin/pending-approval');

    expect(screen.getByText('Onboarding')).toBeInTheDocument();
  });

  it('allows a rejected tenant to open the notification inbox', () => {
    authState.user = {
      status: 'rejected',
      organization: { status: 'rejected' },
    };

    renderGate('/admin/notifications');

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mocks
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const getMock = vi.fn();
const postMock = vi.fn();
vi.mock('../../api/client', () => ({
  apiClient: { get: (...a) => getMock(...a), post: (...a) => postMock(...a) },
}));

import { QrScanLandingPage } from './QrScanLandingPage';
import toast from 'react-hot-toast';

function renderAt(code) {
  return render(
    <MemoryRouter initialEntries={[`/qr/${code}`]}>
      <Routes>
        <Route path="/qr/:code" element={<QrScanLandingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QrScanLandingPage', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it('renders driver/bus/service rating inputs for an active QR', async () => {
    getMock.mockResolvedValue({ data: { data: { qrCodeId: 1, qrScanId: 10, campaign: { id: 1, title: 'Ride X' }, aspects: ['driver', 'bus', 'service'] } } });
    renderAt('VMX-QR-1');
    expect(await screen.findByText('Driver')).toBeInTheDocument();
    expect(screen.getByText('Bus')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('shows an error for an inactive/invalid QR', async () => {
    getMock.mockRejectedValue({ response: { data: { message: 'This QR code is inactive.' } } });
    renderAt('bad-code');
    expect(await screen.findByText(/inactive/i)).toBeInTheDocument();
    expect(screen.queryByText('Driver')).not.toBeInTheDocument();
  });

  it('blocks submit until all three aspects are rated', async () => {
    getMock.mockResolvedValue({ data: { data: { qrCodeId: 1, qrScanId: 10, campaign: { id: 1, title: 'Ride X' }, aspects: ['driver', 'bus', 'service'] } } });
    const user = userEvent.setup();
    renderAt('VMX-QR-1');
    await screen.findByText('Driver');
    await user.click(screen.getByRole('button', { name: 'Submit Rating' }));
    expect(postMock).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('submits a complete review and shows confirmation', async () => {
    getMock.mockResolvedValue({ data: { data: { qrCodeId: 1, qrScanId: 10, campaign: { id: 1, title: 'Ride X' }, aspects: ['driver', 'bus', 'service'] } } });
    postMock.mockResolvedValue({ data: { data: { id: 99, success: true } } });
    const user = userEvent.setup();
    renderAt('VMX-QR-1');
    await screen.findByText('Driver');

    // Click the 5th star for each aspect (3 radiogroups x 5 stars).
    const radios = screen.getAllByRole('radio');
    await user.click(radios[4]);   // driver 5
    await user.click(radios[9]);   // bus 5
    await user.click(radios[14]);  // service 5
    await user.click(screen.getByRole('button', { name: 'Submit Rating' }));

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/Thank you/i)).toBeInTheDocument();
  });
});

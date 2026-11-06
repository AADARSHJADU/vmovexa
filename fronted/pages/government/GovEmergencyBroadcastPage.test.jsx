// Vitest's JSX transform for this suite expects React in module scope.
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { GovEmergencyBroadcastPage } from './GovEmergencyBroadcastPage';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn((p) => p),
  },
}));

const mockCreateBroadcast = vi.fn().mockResolvedValue({ id: 99, code: 'EMG-TEST-99' });
vi.mock('../../hooks/government/useGovernmentRole', () => ({
  useGovernmentRole: () => ({
    createBroadcast: mockCreateBroadcast,
  }),
}));

vi.mock('../../hooks/advertiser/useAdvertiserRole', () => ({
  useAdvertiserRole: () => ({
    fleetOptions: [],
    loadFleetOptions: vi.fn().mockResolvedValue([]),
  }),
}));

const mockUploadFile = vi.fn().mockResolvedValue({ url: '/uploads/emergency/test-image.png' });
const mockUploadVideo = vi.fn().mockResolvedValue({ url: '/uploads/videos/test-video.mp4' });
vi.mock('../../api/services/upload.service.js', () => ({
  uploadFile: (...args) => mockUploadFile(...args),
  uploadVideo: (...args) => mockUploadVideo(...args),
  resolveFileUrl: (url) => (url ? `http://localhost:4000${url}` : ''),
}));

describe('GovEmergencyBroadcastPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the media-only emergency broadcast form (headline + emergency number + upload)', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'common.emergency_broadcast' })).toBeInTheDocument();
    // Headline input (required) + emergency number input exist
    expect(screen.getByPlaceholderText(/e\.g\. Cyclone Warning/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/1800-123-4567/i)).toBeInTheDocument();
    // Media upload supports image / video / PDF
    expect(screen.getByText(/Upload Creative Assets \(Select Multiple Files\)/i)).toBeInTheDocument();
    // Presets & text simulator are removed
    expect(screen.queryByText(/Instant Official Visual Presets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/16:9 Simulator/i)).not.toBeInTheDocument();
  });

  it('uploads an image and submits broadcast with headline, mediaUrl and mediaType', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    // Enter headline (required) + emergency number
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Cyclone Warning/i), {
      target: { value: 'Bridge Collapse Advisory' },
    });
    fireEvent.change(screen.getByPlaceholderText(/1800-123-4567/i), {
      target: { value: '112' },
    });

    // Upload an image file
    const file = new File(['dummy image content'], 'alert-graphic.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockUploadFile).not.toHaveBeenCalled();
    expect(await screen.findByText('alert-graphic.png')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.headline).toBe('Bridge Collapse Advisory');
    expect(callPayload.emergencyNumber).toBe('112');
    expect(callPayload.mediaUrl).toBe('http://localhost:4000/uploads/emergency/test-image.png');
    expect(callPayload.mediaType).toBe('image');
  });

  it('uploads a PDF document and submits with mediaType pdf', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Cyclone Warning/i), {
      target: { value: 'Evacuation Notice' },
    });

    const pdf = new File(['%PDF-1.4 dummy'], 'advisory.pdf', { type: 'application/pdf' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [pdf] } });

    expect(mockUploadFile).not.toHaveBeenCalled();
    expect(await screen.findByText('advisory.pdf')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.mediaType).toBe('pdf');
  });

  it('attaches direct URL and submits with custom mediaUrl', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Cyclone Warning/i), {
      target: { value: 'Weather Alert Broadcast' },
    });

    const toggleUrlBtn = screen.getByText(/URL \(YouTube \/ Web\)/i);
    await user.click(toggleUrlBtn);

    const urlInput = screen.getByPlaceholderText('Paste HTTPS image, video, PDF or YouTube URL');
    await user.type(urlInput, 'https://cdn.example.com/alerts/cyclone.mp4');

    const attachBtn = screen.getByRole('button', { name: /Add to Creatives List/i });
    await user.click(attachBtn);

    expect(await screen.findByText('Motion Video Feed')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.mediaUrl).toBe('https://cdn.example.com/alerts/cyclone.mp4');
    expect(callPayload.mediaType).toBe('video');
  }, 15000);
  it('submits all creatives in order with independent durations and removes assets', async () => {
    render(<MemoryRouter initialEntries={['/superadmin/government/emergency']}><GovEmergencyBroadcastPage /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Cyclone Warning/i), { target: { value: 'Multi creative alert' } });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [
      new File(['a'], 'first.png', { type: 'image/png' }),
      new File(['b'], 'second.pdf', { type: 'application/pdf' }),
      new File(['c'], 'remove.png', { type: 'image/png' }),
    ] } });
    fireEvent.click(screen.getAllByTitle('Remove asset')[2]);
    fireEvent.change(screen.getByLabelText('Display seconds for first.png'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Display seconds for second.pdf'), { target: { value: '9' } });
    expect(screen.queryByText('gov.emergency.target_geo_area')).not.toBeInTheDocument();
    expect(mockUploadFile).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i }));
    await waitFor(() => expect(mockCreateBroadcast).toHaveBeenCalledTimes(1));
    expect(mockCreateBroadcast.mock.calls[0][0].media).toEqual([
      expect.objectContaining({ name: 'first.png', mediaType: 'image', displayDurationSec: 4 }),
      expect.objectContaining({ name: 'second.pdf', mediaType: 'pdf', displayDurationSec: 9 }),
    ]);
  });

});

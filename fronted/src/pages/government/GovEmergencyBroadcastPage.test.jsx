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

  it('renders the emergency broadcast form with media upload section and presets', () => {
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Emergency Broadcast' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type emergency alert message/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Image or Video/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Official Visual Presets/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical Siren Alert/i)).toBeInTheDocument();
  });

  it('uploads a file and submits broadcast with mediaUrl and mediaType', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    // Enter alert message
    const textarea = screen.getByPlaceholderText(/Type emergency alert message/i);
    await user.type(textarea, 'Bridge collapse near Ring Road. Avoid area.');

    // Upload an image file
    const file = new File(['dummy image content'], 'alert-graphic.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
    });

    // Check that media is attached and shown
    expect(await screen.findByText('alert-graphic.png')).toBeInTheDocument();

    // Submit broadcast
    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.headline).toContain('Alert');
    expect(callPayload.message).toBe('Bridge collapse near Ring Road. Avoid area.');
    expect(callPayload.mediaUrl).toBe('http://localhost:4000/uploads/emergency/test-image.png');
    expect(callPayload.mediaType).toBe('image');
  });

  it('selects 1-click official preset and submits with preset SVG', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    // Enter alert message
    const textarea = screen.getByPlaceholderText(/Type emergency alert message/i);
    await user.type(textarea, 'Severe Flooding Alert');

    // Click on Critical Siren Alert preset card
    const presetCard = screen.getByText('Critical Siren Alert');
    await user.click(presetCard);

    // Verify preset visual attached
    expect(await screen.findByText('Active Visual (IMAGE)')).toBeInTheDocument();

    // Submit broadcast
    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.message).toBe('Severe Flooding Alert');
    expect(callPayload.mediaUrl).toContain('data:image/svg+xml');
    expect(callPayload.mediaType).toBe('image');
  });

  it('attaches direct URL and submits with custom mediaUrl', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/superadmin/government/emergency']}>
        <GovEmergencyBroadcastPage />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/Type emergency alert message/i);
    await user.type(textarea, 'Weather Alert Broadcast');

    // Click toggle direct URL input
    const toggleUrlBtn = screen.getByText(/Attach Direct HTTPS or Stream URL/i);
    await user.click(toggleUrlBtn);

    const urlInput = screen.getByPlaceholderText(/Paste direct HTTPS image/i);
    await user.type(urlInput, 'https://cdn.example.com/alerts/cyclone.mp4');

    const attachBtn = screen.getByRole('button', { name: /Attach URL/i });
    await user.click(attachBtn);

    expect(await screen.findByText('Active Visual (VIDEO)')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /SUBMIT EMERGENCY BROADCAST/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateBroadcast).toHaveBeenCalledTimes(1);
    });

    const callPayload = mockCreateBroadcast.mock.calls[0][0];
    expect(callPayload.mediaUrl).toBe('https://cdn.example.com/alerts/cyclone.mp4');
    expect(callPayload.mediaType).toBe('video');
  }, 15000);
});

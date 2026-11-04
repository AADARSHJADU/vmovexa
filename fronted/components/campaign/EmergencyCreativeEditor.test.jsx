import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmergencyPlaylistViewer, readEmergencyMedia } from './EmergencyCreativeEditor';

vi.mock('../../api/services/upload.service', () => ({ resolveFileUrl: u => u, uploadFile: vi.fn(), uploadVideo: vi.fn() }));

const media = [
  { mediaUrl: '/a.jpg', mediaType: 'image', name: 'First poster', displayDurationSec: 15 },
  { mediaUrl: '/b.mp4', mediaType: 'video', name: 'Second video', displayDurationSec: 5 },
  { mediaUrl: '/c.pdf', mediaType: 'pdf', name: 'Third document', displayDurationSec: 20 },
];
describe('saved emergency creatives', () => {
  it('lists all uploaded assets and previews the selected video and PDF', () => {
    const { container } = render(<EmergencyPlaylistViewer broadcast={{ media, emergency_number: '112' }} />);
    expect(screen.getByText('Creative Assets (3)')).toBeInTheDocument();
    expect(screen.getByText('EMERGENCY: 112')).toBeInTheDocument();
    expect(screen.getByAltText('First poster')).toHaveAttribute('src', '/a.jpg');
    fireEvent.click(screen.getByRole('button', { name: /Second video/ }));
    expect(container.querySelector('video')).toHaveAttribute('src', '/b.mp4');
    fireEvent.click(screen.getByRole('button', { name: /Third document/ }));
    expect(screen.getByTitle('Third document')).toHaveAttribute('src', '/c.pdf');
    expect(screen.queryByText(/Follow official/)).not.toBeInTheDocument();
  });
  it('reads JSON playlists and legacy single assets', () => {
    expect(readEmergencyMedia({ media: JSON.stringify(media) })).toHaveLength(3);
    expect(readEmergencyMedia({ mediaUrl: '/a.jpg', mediaType: 'image' })).toHaveLength(1);
  });
});

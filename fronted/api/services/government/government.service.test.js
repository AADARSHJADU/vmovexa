import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '../../client';
import { governmentService } from './government.service';

vi.mock('../../client', () => ({ apiClient: { post: vi.fn() } }));

describe('emergency submission', () => {
  it('sends every creative, its duration and the emergency number to the backend', async () => {
    const media = [
      { mediaUrl: '/uploads/first.jpg', mediaType: 'image', displayDurationSec: 9 },
      { mediaUrl: '/uploads/second.mp4', mediaType: 'video', displayDurationSec: 5 },
      { mediaUrl: '/uploads/third.pdf', mediaType: 'pdf', displayDurationSec: 20 },
    ];
    apiClient.post.mockResolvedValue({ data: { data: { id: 3, media } } });
    await governmentService.createEmergencyBroadcast({ headline: 'Alert', media, emergencyNumber: '112' });
    expect(apiClient.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ media, emergencyNumber: '112' }));
  });
});

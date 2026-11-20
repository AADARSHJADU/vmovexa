import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { VideoTutorialsModal } from './VideoTutorialsModal';

vi.mock('../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (_, fallback) => fallback }) }));
vi.mock('../api/client.js', () => ({ default: { defaults: { baseURL: 'http://localhost:4000/api/v1' } } }));
beforeEach(() => vi.stubGlobal('React', React));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it.each([
  ['/uploads/videos/lesson.mp4', 'http://localhost:4000/uploads/videos/lesson.mp4'],
  ['/uploads/videos/lesson.webm?token=test', 'http://localhost:4000/uploads/videos/lesson.webm?token=test'],
  ['blob:http://localhost:5173/preview', 'blob:http://localhost:5173/preview'],
])('plays uploaded or local video %s', (url, expected) => {
  render(<VideoTutorialsModal isOpen onClose={vi.fn()} academyData={{ videos: [{ title: 'Lesson', url }] }} />);
  expect(document.querySelector('video')).toHaveAttribute('src', expected);
  expect(document.querySelector('iframe')).toBeNull();
  fireEvent.error(document.querySelector('video'));
  expect(screen.getByRole('alert')).toHaveTextContent('could not be played');
  expect(screen.getByRole('link', { name: 'Open video file' })).toHaveAttribute('href', expected);
});

it('preserves YouTube playback and switches playlist lessons', () => {
  render(<VideoTutorialsModal isOpen onClose={vi.fn()} academyData={{ videos: [
    { id: 'youtube', title: 'YouTube lesson', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { id: 'upload', title: 'Uploaded lesson', url: '/uploads/videos/lesson.mp4' },
  ] }} />);
  expect(document.querySelector('iframe').src).toContain('/embed/dQw4w9WgXcQ');
  fireEvent.click(screen.getByRole('button', { name: /Uploaded lesson/ }));
  expect(document.querySelector('video').src).toContain('/uploads/videos/lesson.mp4');
});

it('locks background scroll and closes with Escape', () => {
  const onClose = vi.fn();
  const { unmount } = render(<VideoTutorialsModal isOpen onClose={onClose} />);
  expect(screen.getByRole('dialog')).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledOnce();
  unmount();
  expect(document.body.style.overflow).toBe('');
});

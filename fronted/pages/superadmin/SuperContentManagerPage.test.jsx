import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { SuperContentManagerPage } from './SuperContentManagerPage';

const mocks = vi.hoisted(() => ({ loadList: vi.fn(), createPage: vi.fn(), updatePage: vi.fn(), publishPage: vi.fn(), uploadVideo: vi.fn() }));
vi.mock('../../hooks/useTranslation', () => ({ useTranslation: () => ({ t: (_, fallback) => fallback }) }));
vi.mock('../../hooks/shared/useContent', () => ({ useContent: () => mocks }));
vi.mock('../../components/ui/Breadcrumb', () => ({ Breadcrumb: () => null }));
vi.mock('../../components/VideoTutorialsModal', () => ({ VideoTutorialsModal: () => null }));
vi.mock('../../api/services/upload.service.js', () => ({ uploadVideo: mocks.uploadVideo, uploadFile: vi.fn(), resolveFileUrl: (url) => url }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn(), loading: vi.fn(), dismiss: vi.fn(), promise: (promise) => promise } }));

beforeEach(() => {
  vi.stubGlobal('React', React);
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
  mocks.loadList.mockResolvedValue([]);
  mocks.createPage.mockResolvedValue({ id: 42 });
  mocks.publishPage.mockResolvedValue({ id: 42 });
  mocks.uploadVideo.mockResolvedValue({ url: '/uploads/videos/lesson.mp4', fileName: 'lesson.mp4' });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

async function selectVideo() {
  render(<SuperContentManagerPage />);
  fireEvent.click(screen.getByRole('button', { name: 'Help & Documentation' }));
  await waitFor(() => expect(mocks.loadList).toHaveBeenCalledWith({ type: 'help', role: 'GLOBAL' }));
  fireEvent.change(screen.getByRole('option', { name: 'Fleet Manager / Operator' }).closest('select'), { target: { value: 'ROLE-FLEET-OPERATOR' } });
  await waitFor(() => expect(mocks.loadList).toHaveBeenLastCalledWith({ type: 'help', role: 'ROLE-FLEET-OPERATOR' }));
  fireEvent.click(screen.getByRole('button', { name: /Videos \(0\)/ }));
  fireEvent.click(screen.getByRole('button', { name: /Add First Video Lesson/ }));
  fireEvent.click(screen.getByRole('button', { name: /Upload File/ }));
  fireEvent.change(screen.getByLabelText('Choose video file for lesson 1'), {
    target: { files: [new File(['video'], 'lesson.mp4', { type: 'video/mp4' })] },
  });
}

it('uploads only on submit and publishes the returned URL and filename to the selected role', async () => {
  await selectVideo();
  expect(mocks.uploadVideo).not.toHaveBeenCalled();
  expect(screen.getByText(/Pending save/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(mocks.publishPage).toHaveBeenCalledWith(42));
  expect(mocks.uploadVideo).toHaveBeenCalledOnce();
  expect(mocks.createPage.mock.calls[0][0]).toMatchObject({
    role_code: 'ROLE-FLEET-OPERATOR',
    sections: { videoAcademy: { videos: [{ url: '/uploads/videos/lesson.mp4', fileName: 'lesson.mp4' }] } },
  });
});

it('does not save or publish when the upload fails and allows retry', async () => {
  await selectVideo();
  mocks.uploadVideo.mockRejectedValueOnce(new Error('Upload failed'));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save & Publish Live' })).toBeEnabled());
  expect(mocks.createPage).not.toHaveBeenCalled();
  expect(mocks.publishPage).not.toHaveBeenCalled();
  expect(screen.getByText(/Pending save/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(mocks.publishPage).toHaveBeenCalledWith(42));
});

it('discards pending uploads when switching to URL mode', async () => {
  await selectVideo();
  fireEvent.click(screen.getByRole('button', { name: /YouTube \/ URL/ }));
  expect(screen.queryByText(/Pending save/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(mocks.publishPage).toHaveBeenCalledWith(42));
  expect(mocks.uploadVideo).not.toHaveBeenCalled();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-preview');
});

it('does not upload removed lessons', async () => {
  await selectVideo();
  fireEvent.click(screen.getByTitle('Remove Video'));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(mocks.publishPage).toHaveBeenCalledWith(42));
  expect(mocks.uploadVideo).not.toHaveBeenCalled();
  expect(mocks.createPage.mock.calls[0][0].sections.videoAcademy.videos).toEqual([]);
});

it('discards a pending video when changing the target portal', async () => {
  await selectVideo();
  fireEvent.change(screen.getByRole('option', { name: 'Transit Driver' }).closest('select'), { target: { value: 'ROLE-DRIVER' } });
  await waitFor(() => expect(mocks.loadList).toHaveBeenLastCalledWith({ type: 'help', role: 'ROLE-DRIVER' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Publish Live' }));
  await waitFor(() => expect(mocks.publishPage).toHaveBeenCalledWith(42));
  expect(mocks.uploadVideo).not.toHaveBeenCalled();
  expect(mocks.createPage.mock.calls[0][0].role_code).toBe('ROLE-DRIVER');
});

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchServerStatusThunk,
  fetchLiveLogsThunk,
  triggerCronJobThunk,
  deleteLiveLogsThunk,
  fetchDiskLogsThunk,
  readDiskLogThunk,
  deleteDiskLogsThunk,
} from '../store/thunks/systemLog.thunks';
import {
  selectServerStatus,
  selectLiveLogs,
  selectSystemLogsLoading,
  selectCronTriggerLoading,
  selectDeleteLogsLoading,
  selectDiskLogsData,
  selectDiskLogsLoading,
  selectActiveLogPreview,
  selectPreviewLoading,
  selectDiskActionLoading,
  clearLogs,
  clearActiveLogPreview,
} from '../store/slices/systemLogSlice';

export function useSystemLogs() {
  const dispatch = useAppDispatch();

  const serverStatus = useAppSelector(selectServerStatus);
  const liveLogs = useAppSelector(selectLiveLogs);
  const loading = useAppSelector(selectSystemLogsLoading);
  const triggerLoading = useAppSelector(selectCronTriggerLoading);
  const deleteLoading = useAppSelector(selectDeleteLogsLoading);

  // Disk logs state
  const diskLogsData = useAppSelector(selectDiskLogsData);
  const diskLogsLoading = useAppSelector(selectDiskLogsLoading);
  const activeLogPreview = useAppSelector(selectActiveLogPreview);
  const previewLoading = useAppSelector(selectPreviewLoading);
  const diskActionLoading = useAppSelector(selectDiskActionLoading);

  const fetchServerStatus = useCallback(
    () => dispatch(fetchServerStatusThunk()),
    [dispatch]
  );

  const fetchLiveLogs = useCallback(
    (params = {}) => dispatch(fetchLiveLogsThunk(params)),
    [dispatch]
  );

  const triggerCronJob = useCallback(
    (jobKey) => dispatch(triggerCronJobThunk(jobKey)),
    [dispatch]
  );

  const deleteLiveLogs = useCallback(
    (params = {}) => dispatch(deleteLiveLogsThunk(params)),
    [dispatch]
  );

  const fetchDiskLogs = useCallback(
    () => dispatch(fetchDiskLogsThunk()),
    [dispatch]
  );

  const readDiskLogFile = useCallback(
    (params = {}) => dispatch(readDiskLogThunk(params)),
    [dispatch]
  );

  const deleteDiskLogs = useCallback(
    (payload = {}) => dispatch(deleteDiskLogsThunk(payload)),
    [dispatch]
  );

  const closeLogPreview = useCallback(
    () => dispatch(clearActiveLogPreview()),
    [dispatch]
  );

  const resetLogs = useCallback(() => dispatch(clearLogs()), [dispatch]);

  return {
    serverStatus,
    liveLogs,
    loading,
    triggerLoading,
    deleteLoading,
    diskLogsData,
    diskLogsLoading,
    activeLogPreview,
    previewLoading,
    diskActionLoading,
    fetchServerStatus,
    fetchLiveLogs,
    triggerCronJob,
    deleteLiveLogs,
    fetchDiskLogs,
    readDiskLogFile,
    deleteDiskLogs,
    closeLogPreview,
    resetLogs,
  };
}


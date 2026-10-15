import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getSocket } from '../api/socket';
import {
  fetchNotificationLogsThunk,
  fetchNotificationLogStatsThunk,
  retryNotificationLogThunk,
} from '../store/thunks/notificationLog.thunks';
import {
  selectNotificationLogs,
  selectNotificationLogsPagination,
  selectNotificationLogStats,
  selectNotificationLogsLoading,
  addIncomingNotificationLog,
  updateNotificationLogItem,
} from '../store/slices/notificationLogSlice';

export function useNotificationLogs() {
  const dispatch = useAppDispatch();
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const logs = useAppSelector(selectNotificationLogs);
  const pagination = useAppSelector(selectNotificationLogsPagination);
  const stats = useAppSelector(selectNotificationLogStats);
  const loading = useAppSelector(selectNotificationLogsLoading);

  const fetchLogs = useCallback(
    (params = {}) => dispatch(fetchNotificationLogsThunk(params)),
    [dispatch]
  );

  const fetchStats = useCallback(
    () => dispatch(fetchNotificationLogStatsThunk()),
    [dispatch]
  );

  const retryLog = useCallback(
    (id) => dispatch(retryNotificationLogThunk(id)),
    [dispatch]
  );

  // Live real-time WebSocket telemetry listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (socket.connected) {
      setIsLiveConnected(true);
    }

    const onConnect = () => setIsLiveConnected(true);
    const onDisconnect = () => setIsLiveConnected(false);

    const handleNewLog = (newLog) => {
      if (newLog) {
        dispatch(addIncomingNotificationLog(newLog));
      }
    };

    const handleUpdatedLog = (updatedLog) => {
      if (updatedLog) {
        dispatch(updateNotificationLogItem(updatedLog));
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification:log:new', handleNewLog);
    socket.on('notification:log:updated', handleUpdatedLog);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:log:new', handleNewLog);
      socket.off('notification:log:updated', handleUpdatedLog);
    };
  }, [dispatch]);

  return {
    logs,
    pagination,
    stats,
    loading,
    isLiveConnected,
    fetchLogs,
    fetchStats,
    retryLog,
  };
}

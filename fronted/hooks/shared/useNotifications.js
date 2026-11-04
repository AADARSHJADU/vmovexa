import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { getSocket } from '../../api/socket.js';
import { getFirebaseMessagingToken } from '../../config/firebase.js';
import { notificationService } from '../../api/services/shared/notification.service.js';
import {
  selectNotifications,
  selectNotificationSettings,
  selectNotificationsStatus,
  selectUnreadNotificationsCount,
  selectNotificationPagination,
  selectNotificationStats,
  addIncomingNotification,
  fetchNotificationsThunk,
  fetchNotificationSettingsThunk,
  updateNotificationSettingsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  deleteNotificationThunk,
  clearAllNotificationsThunk,
  toggleNotificationPreferenceThunk,
  fetchSmtpConfigThunk,
  updateSmtpConfigThunk,
  testEmailThunk,
  sendTestPushThunk,
  selectSmtpConfig,
} from '../../store/slices/shared/notificationSlice.js';

/** Shared notifications hook — used by every role's header dropdown and notifications page. */
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications) || [];
  const settings = useAppSelector(selectNotificationSettings);
  const smtpConfig = useAppSelector(selectSmtpConfig);
  const status = useAppSelector(selectNotificationsStatus);
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const pagination = useAppSelector(selectNotificationPagination);
  const stats = useAppSelector(selectNotificationStats);

  // Track user clicks on interactive elements (buttons, forms) to identify self-initiated actions
  useEffect(() => {
    const handleUserClick = (e) => {
      const target = e.target;
      if (target && (target.closest('button') || target.closest('form') || target.closest('a'))) {
        window.__lastUserActionTime = Date.now();
      }
    };
    document.addEventListener('click', handleUserClick, true);
    return () => document.removeEventListener('click', handleUserClick, true);
  }, []);

  // Live real-time WebSocket listener for instant push alerts without page refresh
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (incoming) => {
      if (incoming && incoming.id) {
        dispatch(addIncomingNotification(incoming));

        // Skip popping up a duplicate socket toast if the user just initiated a local action (e.g. create, edit, delete, suspend)
        const isRecentUserAction = typeof window !== 'undefined' && window.__lastUserActionTime && (Date.now() - window.__lastUserActionTime < 4000);

        if (!isRecentUserAction) {
          toast(
            `${incoming.title}${incoming.body ? `: ${incoming.body}` : ''}`,
            { id: `notif-${incoming.id}`, icon: '🔔', duration: 4500, position: 'top-right' }
          );
        }

        // Native Browser Web Notification (Desktop / Mobile browser banner)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(incoming.title, {
              body: incoming.body || 'New notification received in VMOVEXA ONE',
              icon: '/favicon.ico',
            });
          } catch {
            // Non-blocking fallback
          }
        }
      }
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [dispatch]);

  // Prompt for desktop browser notification permissions if not yet determined
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Persist the current browser's FCM token after notification permission is
  // granted. The backend upserts tokens, so reconnects and token refreshes are safe.
  useEffect(() => {
    let cancelled = false;
    const registerBrowserPush = async () => {
      try {
        const token = await getFirebaseMessagingToken();
        if (!cancelled && token) {
          await notificationService.registerPushToken({
            token,
            platform: 'web',
            deviceInfo: navigator.userAgent,
          });
        }
      } catch {
        // Push is optional; in-app/WebSocket notifications remain available.
      }
    };
    registerBrowserPush();
    return () => { cancelled = true; };
  }, []);

  const loadNotifications = useCallback((params) => dispatch(fetchNotificationsThunk(params)).unwrap(), [dispatch]);
  const loadSettings = useCallback(() => dispatch(fetchNotificationSettingsThunk()).unwrap(), [dispatch]);
  const updateSettings = useCallback((data) => dispatch(updateNotificationSettingsThunk(data)).unwrap(), [dispatch]);
  const togglePreference = useCallback((eventTypeId, enabled) => dispatch(toggleNotificationPreferenceThunk({ eventTypeId, enabled })).unwrap(), [dispatch]);
  const markRead = useCallback((id) => dispatch(markNotificationReadThunk(id)).unwrap(), [dispatch]);
  const markAllRead = useCallback(() => dispatch(markAllNotificationsReadThunk()).unwrap(), [dispatch]);
  const deleteNotification = useCallback((id) => dispatch(deleteNotificationThunk(id)).unwrap(), [dispatch]);
  const clearAll = useCallback(() => dispatch(clearAllNotificationsThunk()).unwrap(), [dispatch]);
  const loadSmtpConfig = useCallback(() => dispatch(fetchSmtpConfigThunk()).unwrap(), [dispatch]);
  const saveSmtpConfig = useCallback((data) => dispatch(updateSmtpConfigThunk(data)).unwrap(), [dispatch]);
  const sendTestEmail = useCallback((data) => dispatch(testEmailThunk(data)).unwrap(), [dispatch]);
  const sendTestPush = useCallback(() => dispatch(sendTestPushThunk()).unwrap(), [dispatch]);

  return {
    notifications,
    settings,
    smtpConfig,
    status,
    unreadCount,
    pagination,
    stats,
    loadNotifications,
    loadSettings,
    updateSettings,
    togglePreference,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    loadSmtpConfig,
    saveSmtpConfig,
    sendTestEmail,
    sendTestPush,
  };
};

export default useNotifications;


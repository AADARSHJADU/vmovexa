import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from './FleetIcons.jsx';
import { useNotifications } from '../hooks/shared/useNotifications.js';
import { useTranslation } from '../hooks/useTranslation.js';

/**
 * Format timestamp into human-readable relative time (e.g. "Just now", "5m ago", "2h ago", "1d ago")
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const diffInSeconds = Math.floor((new Date() - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Map role title to notification route targets
 */
function getRoleNotificationRoutes(roleTitle) {
  const norm = (roleTitle || '').trim().toLowerCase();
  if (norm.includes('super')) {
    return {
      settings: '/superadmin/settings/notifications',
      fullList: '/superadmin/notifications',
    };
  }
  if (norm.includes('org') || norm === 'admin') {
    return {
      settings: '/admin/settings/notifications',
      fullList: '/admin/notifications',
    };
  }
  if (norm.includes('gov')) {
    return {
      settings: '/government/settings/notifications',
      fullList: '/government/notifications',
    };
  }
  if (norm.includes('advert')) {
    return {
      settings: '/advertiser/notification-settings',
      fullList: '/advertiser/notifications',
    };
  }
  if (norm.includes('tech')) {
    return {
      settings: '/technician/settings/notifications',
      fullList: '/technician/notifications',
    };
  }
  if (norm.includes('driver')) {
    return {
      settings: '/driver/settings/notifications',
      fullList: '/driver/notifications',
    };
  }
  if (norm.includes('finance')) {
    return {
      settings: '/finance/settings/notifications',
      fullList: '/finance/notifications',
    };
  }
  return {
    settings: '/fleet-operator/profile/notifications',
    fullList: '/fleet-operator/notifications',
  };
}

export const NotificationDropdown = ({ roleTitle = 'Super Admin', className = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread'
  const [isProcessing, setIsProcessing] = useState(false);
  const dropdownRef = useRef(null);
  const panelRef = useRef(null);

  const {
    notifications = [],
    unreadCount = 0,
    status,
    loadNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const routes = useMemo(() => getRoleNotificationRoutes(roleTitle), [roleTitle]);

  // Initial load of notifications
  useEffect(() => {
    loadNotifications({ page: 1, limit: 10 }).catch(() => {});
  }, [loadNotifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedTrigger = dropdownRef.current?.contains(e.target);
      const clickedPanel = panelRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filtered notifications list
  const filteredItems = useMemo(() => {
    const list = Array.isArray(notifications) ? notifications : [];
    if (filterTab === 'unread') {
      return list.filter((n) => n && !n.read_at && !n.read);
    }
    return list;
  }, [notifications, filterTab]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markRead(id);
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      await markAllRead();
      toast.success(t('notifications.all_marked_read', 'All notifications marked as read'));
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0 || isProcessing) return;
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    setIsProcessing(true);
    try {
      await clearAll();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleItemClick = (item, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    const isUnread = !item.read_at && !item.read;
    if (isUnread) handleMarkAsRead(item.id);
    setIsOpen(false);
    navigate(routes.fullList);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
      case 'danger':
        return (
          <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <FleetIcons.Emergency className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <FleetIcons.CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <FleetIcons.Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        );
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`relative p-2 rounded-xl border transition-all duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isOpen
            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
        }`}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FleetIcons.Bell className={`w-4 h-4 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-zinc-200'}`} />

        {/* Dynamic Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-zinc-900 animate-in zoom-in duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications panel"
          className="fixed inset-x-2 top-[calc(env(safe-area-inset-top)+4.25rem)] mx-auto w-auto max-w-md sm:inset-x-auto sm:right-4 sm:mx-0 sm:w-[410px] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
          style={{ maxHeight: 'calc(100dvh - 5.25rem - env(safe-area-inset-bottom))' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                {t('notifications.title', 'Notifications')}
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                  {unreadCount} {t('common.new', 'new')}
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                  {t('notifications.caught_up', 'All read')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isProcessing}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Mark all as read"
                >
                  <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[11px] font-medium hidden sm:inline">Mark read</span>
                </button>
              )}

              {/* Notification Settings link */}
              <Link
                to={routes.settings}
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Notification Settings"
              >
                <FleetIcons.Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                filterTab === 'unread'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                  filterTab === 'unread' ? 'bg-blue-700 text-white' : 'bg-red-500 text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-100 dark:divide-zinc-800/60">
            {status === 'loading' && notifications.length === 0 ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 dark:bg-zinc-800/60 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3">
                  {filterTab === 'unread' ? (
                    <FleetIcons.CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <FleetIcons.Bell className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {filterTab === 'unread'
                    ? t('notifications.no_unread', 'You\'re all caught up!')
                    : t('notifications.empty', 'No notifications yet')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-[260px]">
                  {filterTab === 'unread'
                    ? 'All notifications have been read. Check the "All" tab for past alerts.'
                    : 'System alerts, platform updates, and emergency broadcasts will appear here.'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const isUnread = !item.read_at && !item.read;
                return (
                  <div
                    key={item.id}
                    onClick={(event) => handleItemClick(item, event)}
                    className={`group relative p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      isUnread
                        ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30'
                        : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Severity Icon */}
                    {getSeverityIcon(item.severity)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs sm:text-sm tracking-tight truncate ${
                          isUnread ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-700 dark:text-zinc-300'
                        }`}>
                          {item.title}
                        </p>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                        )}
                      </div>

                      {item.body && (
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.body}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                        <span>{formatRelativeTime(item.created_at)}</span>
                        {item.channel && item.channel !== 'in_app' && (
                          <>
                            <span>•</span>
                            <span className="uppercase font-semibold tracking-wider text-[9px] px-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
                              {item.channel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Item Hover Actions */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          title="Mark as read"
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        >
                          <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        title="Delete notification"
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <FleetIcons.Trash className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/80 flex items-center justify-between text-xs">
            {notifications.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isProcessing}
                className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <Link
                to={routes.settings}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
              >
                Settings
              </Link>
              <Link
                to={routes.fullList}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotificationDropdown;

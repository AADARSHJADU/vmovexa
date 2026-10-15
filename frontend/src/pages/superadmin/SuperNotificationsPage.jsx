import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useNotifications } from '../../hooks/shared/useNotifications.js';
import { useTranslation } from '../../hooks/useTranslation.js';
import { notificationService } from '../../api/services/shared/notification.service.js';

export const SuperNotificationsPage = () => {
  const { t } = useTranslation();
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

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Critical' | 'Warning' | 'Info' | 'Unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [loadNotifications]);

  const items = useMemo(() => {
    return Array.isArray(notifications) ? notifications : [];
  }, [notifications]);

  const counts = useMemo(() => {
    const norm = (v) => String(v || '').toLowerCase();
    return {
      all: items.length,
      critical: items.filter((n) => ['critical', 'error', 'danger'].includes(norm(n?.severity))).length,
      warning: items.filter((n) => ['warning', 'warn'].includes(norm(n?.severity))).length,
      info: items.filter((n) => ['info', 'success'].includes(norm(n?.severity))).length,
      unread: items.filter((n) => !n.read_at && !n.read).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((n) => {
      if (!n) return false;
      const titleMatch = (n.title || '').toLowerCase().includes(q);
      const bodyMatch = (n.body || '').toLowerCase().includes(q);
      const matchesSearch = !q || titleMatch || bodyMatch;
      const sev = String(n.severity || '').toLowerCase();

      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Critical') return matchesSearch && ['critical', 'error', 'danger'].includes(sev);
      if (activeTab === 'Warning') return matchesSearch && ['warning', 'warn'].includes(sev);
      if (activeTab === 'Info') return matchesSearch && ['info', 'success'].includes(sev);
      if (activeTab === 'Unread') return matchesSearch && !n.read_at && !n.read;
      return matchesSearch;
    });
  }, [items, searchQuery, activeTab]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleTabChange = (tabLabel) => {
    setActiveTab(tabLabel);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markRead(id);
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (items.length === 0) return;
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await clearAll();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleSendTestPush = async () => {
    setSendingTest(true);
    try {
      await notificationService.sendTestPush();
      await loadNotifications();
      toast.success('Test notification sent successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to send test push');
    } finally {
      setSendingTest(false);
    }
  };

  const filterTabs = [
    { label: 'All', count: counts.all },
    { label: 'Unread', count: counts.unread },
    { label: 'Critical', count: counts.critical },
    { label: 'Warning', count: counts.warning },
    { label: 'Info', count: counts.info },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Super Admin', path: '/superadmin/dashboard' },
              { label: 'Platform & NOC Notifications' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
              Platform & NOC Notifications
            </h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                {counts.unread} Unread
              </span>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleSendTestPush}
            disabled={sendingTest}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
          >
            <FleetIcons.Refresh className={`w-3.5 h-3.5 text-blue-500 ${sendingTest ? 'animate-spin' : ''}`} />
            <span>Send Test Alert</span>
          </button>

          {counts.unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
              <span>Mark All Read</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all"
            >
              Clear All
            </button>
          )}

          <Link
            to="/superadmin/settings/notifications"
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all"
            title="Notification Settings"
          >
            <FleetIcons.Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title or description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => handleTabChange(tab.label)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.label ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-3">
              <FleetIcons.Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200">
              No notifications found
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm">
              {searchQuery
                ? 'No alerts match your search filter. Try clearing your search query.'
                : 'All platform alert channels are healthy and running within nominal thresholds.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {paginatedItems.map((item) => {
              const isUnread = !item.read_at && !item.read;
              const sev = String(item.severity || 'info').toLowerCase();
              const isCritical = ['critical', 'error', 'danger'].includes(sev);
              const isWarning = ['warning', 'warn'].includes(sev);
              const isSuccess = sev === 'success';

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                    isUnread
                      ? 'bg-blue-50/40 dark:bg-blue-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Severity Badge */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCritical ? (
                      <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                        <FleetIcons.Emergency className="w-5 h-5 animate-pulse text-red-600 dark:text-red-400" />
                      </div>
                    ) : isWarning ? (
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <FleetIcons.Alert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    ) : isSuccess ? (
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FleetIcons.CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <FleetIcons.Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm tracking-tight ${
                        isUnread ? 'font-black text-slate-900 dark:text-zinc-100' : 'font-bold text-slate-800 dark:text-zinc-200'
                      }`}>
                        {item.title}
                      </h4>
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          New
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium ml-auto">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                      </span>
                    </div>

                    {item.body && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        {item.body}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                      <span className="uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                        Channel: {item.channel || 'in_app'}
                      </span>
                      {item.event_key && (
                        <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                          event: {item.event_key}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUnread && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <FleetIcons.Trash className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Pagination */}
        {totalItems > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperNotificationsPage;

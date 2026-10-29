import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from './FleetIcons';
import { Breadcrumb } from './ui/Breadcrumb';
import { Pagination } from './ui/Pagination';
import { useNotifications } from '../hooks/shared/useNotifications';

export const SharedNotificationsView = ({
  title = 'Alerts & Notifications',
  subtitle = 'Real-time audit log of emergency incidents, telematics events, and operational updates',
  settingsPath = '/admin/settings/notifications',
  dashboardPath = '/admin/dashboard',
}) => {
  const {
    notifications = [],
    unreadCount = 0,
    pagination = {},
    stats = {},
    status,
    loadNotifications,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Unread' | 'Critical' | 'Warning' | 'Info'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const dashboardLabel = useMemo(() => {
    if (dashboardPath.includes('superadmin')) return 'Super Admin';
    if (dashboardPath.includes('fleet')) return 'Fleet Operator';
    if (dashboardPath.includes('driver')) return 'Driver Portal';
    if (dashboardPath.includes('technician')) return 'Technician';
    if (dashboardPath.includes('finance')) return 'Finance';
    if (dashboardPath.includes('government')) return 'Government';
    if (dashboardPath.includes('advertiser')) return 'Advertiser';
    return 'Tenant Admin';
  }, [dashboardPath]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab === 'Unread') params.read = 'unread';
    else if (activeTab !== 'All') params.severity = activeTab.toLowerCase();
    loadNotifications(params).catch(() => {});
  }, [loadNotifications, currentPage, pageSize, debouncedSearch, activeTab]);

  const items = useMemo(() => {
    return Array.isArray(notifications) ? notifications : [];
  }, [notifications]);

  const counts = useMemo(() => {
    return {
      all: stats.all ?? items.length,
      critical: stats.critical ?? 0,
      warning: stats.warning ?? 0,
      info: stats.info ?? 0,
      unread: stats.unread ?? unreadCount,
    };
  }, [items.length, stats, unreadCount]);

  const filteredItems = items;

  const totalItems = pagination.total ?? filteredItems.length;
  const totalPages = pagination.totalPages || Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = filteredItems;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await clearAll();
      toast.success('All notifications cleared');
    } catch {
      toast.error('Failed to clear notifications');
    }
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markRead(id);
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to remove notification');
    }
  };

  const getSeverityBadge = (severity) => {
    const norm = String(severity || '').toLowerCase();
    if (['critical', 'error', 'danger', 'emergency'].includes(norm)) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60">
          Critical
        </span>
      );
    }
    if (['warning', 'warn'].includes(norm)) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60">
          Warning
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60">
        Info
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: dashboardLabel, path: dashboardPath },
              { label: title },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold rounded-full border border-red-200 dark:border-red-800">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col xs:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {settingsPath && (
            <Link
              to={settingsPath}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <FleetIcons.Settings className="w-3.5 h-3.5" />
              <span>Alert Preferences</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'All', label: `All (${counts.all})` },
            { id: 'Unread', label: `Unread (${counts.unread})` },
            { id: 'Critical', label: `Critical (${counts.critical})` },
            { id: 'Warning', label: `Warning (${counts.warning})` },
            { id: 'Info', label: `Info (${counts.info})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative shrink-0 sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search alerts..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
          />
          <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {status === 'loading' && filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading notifications...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
              <FleetIcons.Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
              {searchQuery
                ? `No alerts matched "${searchQuery}"`
                : 'Your notifications inbox is completely clean.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {paginatedItems.map((item) => {
              const isUnread = !item.read_at && !item.read && !item.is_read;
              return (
                <div
                  key={item.id}
                  onClick={() => isUnread && handleMarkRead(item.id)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 cursor-pointer ${
                    isUnread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isUnread
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      <FleetIcons.Bell className="w-4 h-4" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.title || 'System Notification'}
                        </h4>
                        {getSeverityBadge(item.severity)}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium line-clamp-2 leading-relaxed">
                        {item.body || item.message || '—'}
                      </p>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono pt-0.5">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString('en-IN')
                          : 'Just now'}
                      </div>
                      {(() => {
                        let meta = item.data;
                        if (typeof meta === 'string') {
                          try { meta = JSON.parse(meta); } catch { meta = {}; }
                        }
                        const actionUrl = meta?.action_url || (item.event_key?.startsWith('support_') ? (dashboardPath.includes('superadmin') ? '/superadmin/help/desk' : '/help/history') : null);
                        const actionText = meta?.action_text || (item.event_key?.startsWith('support_') ? 'View Ticket' : 'View Details');
                        if (!actionUrl) return null;
                        return (
                          <div className="pt-1.5">
                            <Link
                              to={actionUrl}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <span>{actionText}</span>
                              <FleetIcons.ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkRead(item.id, e)}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <FleetIcons.Check className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <FleetIcons.Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Pagination and Clear All Footer */}
        {items.length > 0 && (
          <div className="px-4 py-2 bg-slate-50/60 dark:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[6, 10, 20, 50]}
            />
            <div className="pt-1 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear All Notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedNotificationsView;

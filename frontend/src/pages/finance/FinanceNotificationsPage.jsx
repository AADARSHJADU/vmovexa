import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const FinanceNotificationsPage = () => {
  const { notifications: rawNotifications, loadNotifications, markRead } = useNotifications();

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [loadNotifications]);

  const notifications = useMemo(() => {
    const list = Array.isArray(rawNotifications)
      ? rawNotifications
      : (rawNotifications?.rows || rawNotifications?.items || []);
    return list.map((n) => ({
      id: n.id,
      title: n.title ?? '—',
      description: n.body ?? n.message ?? '—',
      category: n.category ?? 'System',
      type: n.type ?? 'info',
      time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : (n.time ?? '—'),
      read: n.is_read ?? n.read ?? false,
    }));
  }, [rawNotifications]);

  const markNotificationAsRead = async (id) => {
    try {
      await markRead(id);
      await loadNotifications();
      toast.success('Marked as read');
    } catch (e) {
      toast.error(e?.message || 'Failed to mark as read');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await Promise.all(
        notifications.filter((n) => !n.read).map((n) => markRead(n.id).catch(() => {}))
      );
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
      toast.success('Notifications refreshed!');
    } catch {
      toast.error('Failed to refresh notifications.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterTabs = [
    { label: 'All', count: notifications.length },
    { label: 'Unread', count: notifications.filter((n) => !n.read).length },
    { label: 'Invoices', count: notifications.filter((n) => n.category === 'Invoices').length },
    { label: 'Payments', count: notifications.filter((n) => n.category === 'Payments').length },
    { label: 'Subscriptions', count: notifications.filter((n) => n.category === 'Subscriptions').length },
  ];

  const filteredNotifs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notifications.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Unread') return matchesSearch && !item.read;
      if (activeTab === 'Invoices') return matchesSearch && item.category === 'Invoices';
      if (activeTab === 'Payments') return matchesSearch && item.category === 'Payments';
      if (activeTab === 'Subscriptions') return matchesSearch && item.category === 'Subscriptions';
      return matchesSearch;
    });
  }, [notifications, searchQuery, activeTab]);

  const totalItems = filteredNotifs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentNotifs = filteredNotifs.slice(startIndex, startIndex + pageSize);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Invoices':
        return <FleetIcons.Document className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Payments':
        return <FleetIcons.Analytics className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Subscriptions':
        return <FleetIcons.Fleets className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <FleetIcons.Bell className="w-4 h-4 text-slate-600 dark:text-zinc-400" />;
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Finance Portal', path: '/finance/dashboard' },
              { label: 'Notifications' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Stay updated with automated invoice dispatches, gateway settlements, and subscription expiries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.label ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search financial notifications..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="py-12 text-center p-5">
            <FleetIcons.Bell className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">No notifications found</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-5">
            {currentNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3 transition-colors ${
                  !notif.read ? 'bg-slate-50/60 dark:bg-zinc-800/40 p-3 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        {notif.category}
                      </span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1">{notif.description}</p>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1 block">{notif.time}</span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Mark as read"
                  >
                    <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Global Pagination Component */}
        {totalItems > 0 && (
          <div className="px-5 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900">
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

export default FinanceNotificationsPage;

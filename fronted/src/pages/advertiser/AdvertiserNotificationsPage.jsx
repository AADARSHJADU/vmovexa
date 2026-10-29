import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useNotifications } from '../../hooks/shared/useNotifications';

const iconMap = {
  check: (
    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
      <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    </div>
  ),
  live: (
    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
      <FleetIcons.Rocket className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
    </div>
  ),
  payment: (
    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
      <FleetIcons.CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    </div>
  ),
  invoice: (
    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
      <FleetIcons.Document className="w-4 h-4 text-blue-600 dark:text-blue-400" />
    </div>
  ),
  alert: (
    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
      <FleetIcons.Alert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    </div>
  ),
  report: (
    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
      <FleetIcons.BarChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
    </div>
  ),
  complete: (
    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
      <FleetIcons.CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
    </div>
  ),
};

export const AdvertiserNotificationsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
      desc: n.body ?? n.message ?? '—',
      category: n.category ?? 'System',
      icon: n.type ?? 'alert',
      time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : (n.time ?? '—'),
      read: n.is_read ?? n.read ?? false,
    }));
  }, [rawNotifications]);

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      campaigns: notifications.filter((n) => n.category === 'Campaigns').length,
      payments: notifications.filter((n) => n.category === 'Payments').length,
      system: notifications.filter((n) => n.category === 'System').length,
    };
  }, [notifications]);

  const filterTabs = useMemo(() => [
    { label: 'All', count: counts.all },
    { label: 'Campaigns', count: counts.campaigns },
    { label: 'Payments', count: counts.payments },
    { label: 'System', count: counts.system },
  ], [counts]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notifications.filter((n) => {
      const matchTab = activeTab === 'All' || n.category === activeTab;
      const matchSearch =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.desc || '').toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [notifications, activeTab, searchQuery]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const markNotificationRead = async (id) => {
    try {
      await markRead(id);
      await loadNotifications();
      toast.success('Notification marked as read');
    } catch (e) {
      toast.error(e?.message || 'Failed to mark as read');
    }
  };

  const markAllNotificationsRead = async () => {
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

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/advertiser/dashboard' },
              { label: 'Notifications & Alerts' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Notifications & Alerts
            </h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                {counts.unread} New
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Stay updated on campaign approvals, playback status, and invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/advertiser/notification-settings"
            className="flex-1 sm:flex-initial text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-colors text-center inline-flex items-center justify-center gap-1.5"
          >
            <FleetIcons.Settings className="w-3.5 h-3.5" />
            <span>{t('advertiser.notifications.preferences')}</span>
          </Link>
          {counts.unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex-1 sm:flex-initial text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-xs transition-colors text-center inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('advertiser.notifications.mark_all_read')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Tabs & Search Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.label)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.label
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative shrink-0 sm:w-64">
          <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('advertiser.notifications.search_ph')}
            className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* List / Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-zinc-500">
            <FleetIcons.Bell className="w-6 h-6" />
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">{t('advertiser.notifications.no_notifications')}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No alerts match your search query "${searchQuery}".`
              : "You're all caught up. Campaign, payment, and system alerts will show up here."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {paginatedItems.map((n) => (
              <div
                key={n.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  n.read
                    ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                    : 'bg-indigo-50/40 dark:bg-indigo-950/20'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {iconMap[n.icon] || iconMap.alert}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                        {n.category}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">{n.desc}</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-mono">{n.time}</p>
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markNotificationRead(n.id)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title={t('advertiser.notifications.mark_read_title')}
                  >
                    <FleetIcons.Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Standard Global Pagination Component */}
          <div className="px-4 py-1 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
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
        </div>
      )}
    </div>
  );
};

export default AdvertiserNotificationsPage;

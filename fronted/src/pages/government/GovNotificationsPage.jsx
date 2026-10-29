import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const GovNotificationsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
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
      type: n.category ?? n.type ?? 'System',
      severity: n.severity ?? 'slate',
      time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : (n.time ?? '—'),
      read: n.is_read ?? n.read ?? false,
    }));
  }, [rawNotifications]);

  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      alert: notifications.filter((n) => n.type === 'Alert').length,
      updates: notifications.filter((n) => n.type === 'Updates').length,
      reports: notifications.filter((n) => n.type === 'Reports').length,
      system: notifications.filter((n) => n.type === 'System').length,
    };
  }, [notifications]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return notifications.filter((n) => {
      const matchTab = activeTab === 'All' || n.type === activeTab;
      const matchSearch =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.desc || '').toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [notifications, activeTab, search]);

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
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const markAllRead = async () => {
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

  const getSeverityIcon = (severity, type) => {
    if (type === 'Alert') return <FleetIcons.Alert className="w-4 h-4 text-red-600 dark:text-red-400" />;
    if (type === 'Updates') return <FleetIcons.Analytics className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    if (type === 'Reports') return <FleetIcons.Document className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    return <FleetIcons.Settings className="w-4 h-4 text-slate-600 dark:text-zinc-400" />;
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'red':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/60';
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <Breadcrumb
            items={[
              { label: 'Government', path: '/government/dashboard' },
              { label: 'Notifications & Broadcast Alerts' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Authority Alerts & Events
            </h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold">
                {counts.unread} New
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time system notices, campaign milestones, and emergency broadcasts
          </p>
        </div>

        {counts.unread > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* 2. Search & Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
            <FleetIcons.Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder={t('gov.notifications.search_ph')}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {[
            { id: 'All', label: 'All', count: counts.all },
            { id: 'Alert', label: 'Alert', count: counts.alert },
            { id: 'Updates', label: 'Updates', count: counts.updates },
            { id: 'Reports', label: 'Reports', count: counts.reports },
            { id: 'System', label: 'System', count: counts.system },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notifications List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-zinc-400 text-xs">
            No notifications matching the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  item.read
                    ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                    : 'bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 shrink-0">{getSeverityIcon(item.severity, item.type)}</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getSeverityBadge(item.severity)}`}>
                        {item.type}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-1">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
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

export default GovNotificationsPage;

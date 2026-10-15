import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useNotifications } from '../../hooks/shared/useNotifications';

export const TechNotificationsPage = () => {
  const { notifications: rawNotifications, loadNotifications, markRead } = useNotifications();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [loadNotifications]);

  const items = useMemo(() => {
    const list = Array.isArray(rawNotifications)
      ? rawNotifications
      : (rawNotifications?.rows || rawNotifications?.items || []);
    return list.map((n) => ({
      id: n.id,
      title: n.title ?? '—',
      desc: n.body ?? n.message ?? '—',
      type: n.type ?? 'info',
      severity: n.severity ?? n.type ?? 'info',
      time: n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : (n.time ?? '—'),
      read: n.is_read ?? n.read ?? false,
    }));
  }, [rawNotifications]);

  const counts = useMemo(() => {
    const norm = (v) => String(v || '').toLowerCase();
    return {
      all: items.length,
      unread: items.filter((n) => !n.read).length,
      critical: items.filter((n) => ['critical', 'error', 'danger'].includes(norm(n.severity))).length,
      warning: items.filter((n) => ['warning', 'warn'].includes(norm(n.severity))).length,
      info: items.filter((n) => ['info', 'success'].includes(norm(n.severity))).length,
      archived: items.filter((n) => n.read).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((n) => {
      const matchesSearch =
        !q ||
        (n.title || '').toLowerCase().includes(q) ||
        (n.desc || '').toLowerCase().includes(q);
      const sev = String(n.severity || '').toLowerCase();
      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Critical') return matchesSearch && ['critical', 'error', 'danger'].includes(sev);
      if (activeTab === 'Warning') return matchesSearch && ['warning', 'warn'].includes(sev);
      if (activeTab === 'Info') return matchesSearch && ['info', 'success'].includes(sev);
      if (activeTab === 'Archived') return matchesSearch && n.read;
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

  const markNotificationAsRead = async (id) => {
    try {
      await markRead(id);
      await loadNotifications();
    } catch (e) {
      toast.error(e?.message || 'Failed to mark as read');
    }
  };

  const markAllAlertsAsRead = async () => {
    try {
      await Promise.all(
        items.filter((n) => !n.read).map((n) => markRead(n.id).catch(() => {}))
      );
      await loadNotifications();
    } catch (e) {
      toast.error(e?.message || 'Failed');
    }
  };

  const filterTabs = [
    { label: 'All', count: alerts.items.length },
    { label: 'Critical', count: counts.critical },
    { label: 'Warning', count: counts.warning },
    { label: 'Info', count: counts.info },
    { label: 'Archived', count: counts.archived },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Notifications' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hardware Alerts & Events</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Real-time notifications for offline displays, telematics interruptions, and maintenance work orders
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAlertsAsRead}
          className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
        >
          Mark All as Read
        </button>
      </div>

      {/* 4 KPI Counter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical</span>
          <div className="text-xl font-black text-red-700 dark:text-red-400 mt-1">{alerts.counts.critical} Alerts</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings</span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{alerts.counts.warning} Warnings</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Info & Sync</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">{alerts.counts.info} Updates</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Archived</span>
          <div className="text-xl font-black text-slate-700 dark:text-zinc-300 mt-1">{counts.archived} Resolved</div>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleTabChange(tab.label)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.label
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.label ? 'bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search alerts by device, type or message..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Alerts List Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center p-5">
            <FleetIcons.Bell className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">No alerts</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-1">You have no hardware alerts at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-5">
            {paginatedItems.map((notif) => (
              <div
                key={notif.id}
                className={`py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3 transition-colors ${
                  !notif.read ? 'bg-slate-50/60 dark:bg-zinc-800/40 p-3 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                    <FleetIcons.Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        {notif.severity}
                      </span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400"></span>}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1">{notif.desc}</p>
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

        {/* Global Pagination */}
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

export default TechNotificationsPage;

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { useNotifications } from '../../hooks/shared/useNotifications';

const sanitizeEmoji = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const TechNotificationsPage = () => {
  const { t } = useTranslation();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';
  const { notifications: rawNotifications, loadNotifications, markRead, markAllRead } = useNotifications();

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
      title: sanitizeEmoji(n.title ?? 'Notification'),
      desc: sanitizeEmoji(n.body ?? n.message ?? 'No details provided'),
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
      if (activeTab === 'Warnings') return matchesSearch && ['warning', 'warn'].includes(sev);
      if (activeTab === 'Updates') return matchesSearch && ['info', 'success'].includes(sev);
      if (activeTab === 'Read') return matchesSearch && n.read;
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
      toast.success('Notification marked as read');
    } catch (e) {
      toast.error(e?.message || 'Failed to mark as read');
    }
  };

  const markAllAlertsAsRead = async () => {
    try {
      await markAllRead();
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (e) {
      toast.error(e?.message || 'Failed to mark notifications');
    }
  };

  const getNotificationIconMeta = (notif) => {
    const sev = String(notif.severity || notif.type || '').toLowerCase();
    const titleLower = String(notif.title || '').toLowerCase();

    if (sev === 'critical' || titleLower.includes('overdue') || titleLower.includes('breached')) {
      return {
        icon: <FleetIcons.AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />,
        bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40',
        badgeBg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50',
        label: 'Critical',
      };
    }
    if (sev === 'warning' || titleLower.includes('delay') || titleLower.includes('reminder') || titleLower.includes('warning')) {
      return {
        icon: <FleetIcons.Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50',
        label: 'Warning',
      };
    }
    if (titleLower.includes('resolved') || titleLower.includes('completed') || titleLower.includes('approved')) {
      return {
        icon: <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50',
        label: 'Success',
      };
    }
    if (titleLower.includes('dispatch') || titleLower.includes('work order') || titleLower.includes('request')) {
      return {
        icon: <FleetIcons.Ticket className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50',
        label: 'Work Order',
      };
    }
    if (titleLower.includes('transit') || titleLower.includes('on-site') || titleLower.includes('bus') || titleLower.includes('depot')) {
      return {
        icon: <FleetIcons.Bus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/50',
        label: 'Transit',
      };
    }
    return {
      icon: <FleetIcons.Bell className="w-4 h-4 text-slate-600 dark:text-zinc-400" />,
      bg: 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700',
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      label: 'Notice',
    };
  };

  const filterTabs = [
    { label: 'All', count: counts.all },
    { label: 'Critical', count: counts.critical },
    { label: 'Warnings', count: counts.warning },
    { label: 'Updates', count: counts.info },
    { label: 'Read', count: counts.archived },
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
              ...(isSuperAdmin ? [{ label: 'Technician', path: `${basePath}/notifications` }] : []),
              { label: 'Notifications' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.notifications.page_title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Stay updated with dispatch alerts, assigned work orders, and hardware status
          </p>
        </div>

        <button
          type="button"
          onClick={markAllAlertsAsRead}
          className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto flex items-center gap-2 cursor-pointer"
        >
          <FleetIcons.Check className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />
          <span>{t('common.mark_all_read')}</span>
        </button>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">{t('common.critical')}</span>
            <div className="text-2xl font-black text-red-700 dark:text-red-400 mt-0.5">{counts.critical}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('common.needs_action')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-center justify-center shrink-0">
            <FleetIcons.AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">{t('common.warnings')}</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{counts.warning}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('technician.notifications.transit_sla')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center shrink-0">
            <FleetIcons.Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">{t('common.updates')}</span>
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{counts.info}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('technician.notifications.dispatches_info')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <FleetIcons.Ticket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">{t('common.read')}</span>
            <div className="text-2xl font-black text-slate-700 dark:text-zinc-200 mt-0.5">{counts.archived}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('technician.notifications.cleared_items')}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <FleetIcons.Check className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
          </div>
        </div>
      </div>

      {/* Toolbar & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 sm:pb-0 sm:border-0 overflow-x-auto no-scrollbar">
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
                  activeTab === tab.label
                    ? 'bg-slate-700 dark:bg-zinc-200 text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('common.search_notifications')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="py-14 text-center p-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3">
              <FleetIcons.Bell className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">{t('common.no_notifications')}</div>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-1 max-w-sm mx-auto">
              You're all caught up. New dispatch alerts and work order updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 p-4 sm:p-5">
            {paginatedItems.map((notif) => {
              const meta = getNotificationIconMeta(notif);
              return (
                <div
                  key={notif.id}
                  className={`py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 transition-colors ${
                    !notif.read ? 'bg-slate-50/70 dark:bg-zinc-800/40 p-3 rounded-xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.badgeBg}`}>
                          {meta.label}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 inline-block"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium mt-1 leading-relaxed">{notif.desc}</p>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-1.5 block">{notif.time}</span>
                    </div>
                  </div>
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title={t('common.mark_as_read')}
                    >
                      <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Global Standard Pagination */}
        {totalItems > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/50">
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

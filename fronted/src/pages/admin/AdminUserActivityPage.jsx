import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useAdminActivity } from '../../hooks/admin/useAdminActivity';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminUserActivityPage = () => {
  const { t } = useTranslation();
  const { logs, categories, filters, pagination, loading, loadLogs, loadCategories, loadFilters } = useAdminActivity();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // View & Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'list'

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (loadFilters) {
      loadFilters().catch(() => {});
    } else if (loadCategories) {
      loadCategories().catch(() => {});
    }
  }, [loadFilters, loadCategories]);

  // Compute date range params
  const dateParams = useMemo(() => {
    if (dateRangeFilter === 'ALL') return {};
    const now = new Date();
    const startDate = new Date();
    if (dateRangeFilter === 'TODAY') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRangeFilter === '7DAYS') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRangeFilter === '30DAYS') {
      startDate.setDate(now.getDate() - 30);
    }
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }, [dateRangeFilter]);

  // Fetch activity logs
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(categoryFilter !== 'All' ? { category: categoryFilter } : {}),
      ...(eventFilter !== 'All' ? { event: eventFilter } : {}),
      ...(severityFilter !== 'All' ? { severity: severityFilter } : {}),
      ...dateParams,
      sortBy,
      sortOrder,
    };
    loadLogs(params).catch(() => {});
  }, [currentPage, pageSize, debouncedSearch, categoryFilter, eventFilter, severityFilter, dateParams, sortBy, sortOrder, loadLogs]);

  const logsList = useMemo(() => {
    return Array.isArray(logs) ? logs : (logs?.items || logs?.rows || []);
  }, [logs]);

  // Dynamic Filters Options (from API metadata + loaded logs)
  const categoryOptions = useMemo(() => {
    const fromFilters = filters?.categories || [];
    const fromApi = Array.isArray(categories) ? categories : [];
    const fromLogs = logsList.map((l) => l.category || l.log_name).filter(Boolean);
    return Array.from(new Set([...fromFilters, ...fromApi, ...fromLogs])).sort();
  }, [filters, categories, logsList]);

  const eventOptions = useMemo(() => {
    const fromFilters = filters?.events || [];
    const fromLogs = logsList.map((l) => l.event).filter(Boolean);
    return Array.from(new Set([...fromFilters, ...fromLogs])).sort();
  }, [filters, logsList]);

  const severityOptions = useMemo(() => {
    const defaults = ['INFO', 'WARNING', 'CRITICAL'];
    const fromFilters = filters?.severities || [];
    const fromLogs = logsList.map((l) => l.severity).filter(Boolean);
    return Array.from(new Set([...defaults, ...fromFilters, ...fromLogs]));
  }, [filters, logsList]);

  // Robust Client-Side Filtering & Sorting for Instant Response
  const filteredLogs = useMemo(() => {
    const list = logsList.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const action = String(log.action || log.description || '').toLowerCase();
      const actor = String(log.actorName || log.actor_name || '').toLowerCase();
      const email = String(log.actor_email || '').toLowerCase();
      const cat = String(log.category || log.log_name || '').toLowerCase();
      const ev = String(log.event || '').toLowerCase();
      const matchesSearch =
        !q ||
        action.includes(q) ||
        actor.includes(q) ||
        email.includes(q) ||
        cat.includes(q) ||
        ev.includes(q) ||
        String(log.id).includes(q);

      const sev = String(log.severity || 'INFO').toUpperCase();
      const matchesSeverity =
        severityFilter === 'All' || sev === severityFilter.toUpperCase();

      const matchesCat =
        categoryFilter === 'All' ||
        cat.toLowerCase() === categoryFilter.toLowerCase() ||
        cat.includes(categoryFilter.toLowerCase());

      const matchesEvent =
        eventFilter === 'All' ||
        ev.toLowerCase() === eventFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesCat && matchesEvent;
    });

    return list.slice().sort((a, b) => {
      if (sortBy === 'created_at') {
        const timeA = new Date(a.created_at || a.timestamp || 0).getTime();
        const timeB = new Date(b.created_at || b.timestamp || 0).getTime();
        return sortOrder === 'ASC' ? timeA - timeB : timeB - timeA;
      }
      if (sortBy === 'id') {
        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;
        return sortOrder === 'ASC' ? idA - idB : idB - idA;
      }
      const valA = String(a[sortBy] || '');
      const valB = String(b[sortBy] || '');
      return sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [logsList, searchQuery, severityFilter, categoryFilter, eventFilter, sortBy, sortOrder]);

  // Sliced Logs for Table/Cards Rendering
  const totalItems = typeof pagination?.total === 'number' && pagination.total > 0 ? pagination.total : filteredLogs.length;
  const totalPages = pagination?.totalPages || Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedLogs = useMemo(() => {
    if (typeof pagination?.total === 'number' && pagination.total > 0) return filteredLogs;
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize, pagination]);

  // Stats calculation
  const criticalCount = useMemo(() => logsList.filter((l) => String(l.severity || '').toUpperCase() === 'CRITICAL').length, [logsList]);
  const warningCount = useMemo(() => logsList.filter((l) => String(l.severity || '').toUpperCase() === 'WARNING').length, [logsList]);
  const infoCount = useMemo(() => logsList.filter((l) => !l.severity || String(l.severity).toUpperCase() === 'INFO').length, [logsList]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setEventFilter('All');
    setSeverityFilter('All');
    setDateRangeFilter('ALL');
    setSortBy('created_at');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (!logsList.length) {
      toast.error('No activity logs available to export');
      return;
    }
    try {
      const headers = ['ID', 'Timestamp', 'Severity', 'Category', 'Action', 'User', 'Email', 'Role', 'IP Address'];
      const rows = [headers.join(',')];
      logsList.forEach((l) => {
        rows.push([
          l.id,
          `"${l.timestamp || l.created_at || ''}"`,
          `"${l.severity || 'INFO'}"`,
          `"${l.category || l.log_name || ''}"`,
          `"${(l.action || l.description || '').replace(/"/g, '""')}"`,
          `"${l.actorName || l.actor_name || 'System'}"`,
          `"${l.actor_email || ''}"`,
          `"${l.actorRole || l.actor_role || ''}"`,
          `"${l.ipAddress || l.ip_address || ''}"`,
        ].join(','));
      });

      const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Activity logs exported successfully!');
    } catch {
      toast.error('Failed to export activity logs');
    }
  };

  const handleCopyJSON = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    toast.success('Log details copied to clipboard');
  };

  const getSeverityBadge = (severity) => {
    const s = String(severity || 'INFO').toUpperCase();
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    }
  };

  // If a log is selected, render dedicated detail view with Breadcrumb navigation
  if (selectedLog) {
    const parsedProps = typeof selectedLog.properties === 'string'
      ? (() => { try { return JSON.parse(selectedLog.properties); } catch { return null; } })()
      : selectedLog.properties;

    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
        {/* Header with Breadcrumb and Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
          <div>
            <Breadcrumb
              items={[
                { label: 'Dashboard', to: '/admin/dashboard' },
                { label: 'Activity Logs', to: '/admin/activity', onClick: (e) => { e.preventDefault(); setSelectedLog(null); } },
                { label: `Log #${selectedLog.id}` },
              ]}
              className="mb-2"
            />
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                #{selectedLog.id}
              </span>
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg border ${getSeverityBadge(selectedLog.severity)}`}>
                {selectedLog.severity || 'INFO'}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
                {selectedLog.category || selectedLog.log_name || 'System'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedLog.action || selectedLog.description || 'Activity Event Recorded'}
            </h1>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-1">
              Time: {selectedLog.timestamp || (selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('en-IN') : '—')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FleetIcons.Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Copy Raw Data</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedLog(null)}
              className="px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
              <span>Back to Activity Logs</span>
            </button>
          </div>
        </div>

        {/* 3 Detail Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Action & Event */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <FleetIcons.Zap className="w-4 h-4 text-amber-500" />
              <span>{t('admin.activity.action_event', 'Action & Event')}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {selectedLog.action || selectedLog.description || '—'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Event Type</span>
                <span className="font-bold font-mono text-slate-700 dark:text-zinc-300">
                  {selectedLog.event || selectedLog.event_name || 'custom'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Log Domain</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {selectedLog.log_name || selectedLog.category || 'System'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: User / Actor */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <FleetIcons.Profile className="w-4 h-4 text-blue-500" />
              <span>{t('admin.activity.user_actor', 'User / Actor')}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {selectedLog.actorName || selectedLog.actor_name || 'System'}
              </p>
              {selectedLog.actor_email && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                  {selectedLog.actor_email}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Causer Type</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {selectedLog.causer_type || 'User'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Causer ID</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                  #{selectedLog.causer_id || selectedLog.actor_id || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Scope & Telemetry */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <FleetIcons.Key className="w-4 h-4 text-emerald-500" />
              <span>{t('admin.activity.category_ip', 'Category & IP')}</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                {selectedLog.category || selectedLog.log_name || 'IMPERSONATION'}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                IP: {selectedLog.ipAddress || selectedLog.ip_address || '127.0.0.1'}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Subject Target</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {selectedLog.subject_type ? `${selectedLog.subject_type} #${selectedLog.subject_id || ''}` : '—'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Severity</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(selectedLog.severity)}`}>
                  {selectedLog.severity || 'INFO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Changed Properties & Audit Diff (if available) */}
        {parsedProps && (parsedProps.old || parsedProps.attributes) && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Field Change Audit Diff
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {parsedProps.old && (
                <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/50 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 block mb-1">
                    Previous Values (Before)
                  </span>
                  <pre className="text-[11px] text-red-800 dark:text-red-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(parsedProps.old, null, 2)}
                  </pre>
                </div>
              )}
              {parsedProps.attributes && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                    Updated Values (After)
                  </span>
                  <pre className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(parsedProps.attributes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Data Section */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {t('admin.activity.raw_data', 'Raw Payload Data')}
              </h3>
              <p className="text-xs text-slate-400">
                Full structured JSON record received from audit telemetry
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyJSON}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FleetIcons.Copy className="w-3.5 h-3.5" />
              <span>Copy Data</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
            {JSON.stringify(selectedLog, null, 2)}
          </pre>
        </div>

        {/* Bottom Back Button */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => setSelectedLog(null)}
            className="px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>Back to Activity Logs</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/admin/dashboard' },
              { label: 'Team & Staff', to: '/admin/users' },
              { label: 'Activity Logs' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            View team activity logs, user actions, and system events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton
            onClick={() => loadLogs({ page: currentPage, limit: pageSize })}
            loading={loading}
          />

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Document className="w-4 h-4" />
            <span>{t('admin.activity.export_csv')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('admin.activity.total_events')}</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalItems}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.activity.info_logs')}</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{infoCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('admin.activity.warnings')}</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{warningCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{t('admin.activity.critical_events')}</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">{criticalCount}</div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.activity.search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="list"
            className="shrink-0 self-end sm:self-auto"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.activity.category_label')}</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.activity.all_categories')}</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.activity.action_type')}</label>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.activity.all_actions')}</option>
              {eventOptions.map((ev) => (
                <option key={ev} value={ev}>
                  {ev.charAt(0).toUpperCase() + ev.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.activity.severity_label')}</label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">{t('admin.activity.all_severities')}</option>
              {severityOptions.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.activity.date_label')}</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">{t('admin.activity.all_time')}</option>
              <option value="TODAY">{t('admin.activity.today')}</option>
              <option value="7DAYS">{t('admin.activity.past_7_days')}</option>
              <option value="30DAYS">{t('admin.activity.past_30_days')}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t('admin.activity.sort_label')}</label>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="created_at:DESC">{t('admin.activity.newest_first')}</option>
              <option value="created_at:ASC">{t('admin.activity.oldest_first')}</option>
              <option value="id:DESC">{t('admin.activity.id_high_low')}</option>
              <option value="id:ASC">{t('admin.activity.id_low_high')}</option>
              <option value="severity:DESC">{t('admin.activity.severity_critical_first')}</option>
            </select>
          </div>

          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table / Cards Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-zinc-400">{t('admin.activity.loading_logs')}</div>
      ) : paginatedLogs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <FleetIcons.Activity className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.activity.no_logs_found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.activity.no_logs_match')}</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('admin.activity.th_id_level')}</th>
                  <th className="py-3 px-4">{t('admin.activity.th_category')}</th>
                  <th className="py-3 px-4">{t('admin.activity.th_action')}</th>
                  <th className="py-3 px-4">{t('admin.activity.th_user')}</th>
                  <th className="py-3 px-4">{t('admin.activity.th_time')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.activity.th_details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">#{log.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(log.severity)}`}>
                          {log.severity || 'INFO'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.category || log.log_name || 'System'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800 dark:text-zinc-200">
                      {log.action || log.description || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {log.actorName || log.actor_name || 'System'}
                      </span>
                      {log.actorRole && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {log.actorRole}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {log.timestamp || (log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    #{log.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityBadge(log.severity)}`}>
                    {log.severity || 'INFO'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {log.category || log.log_name || 'System'}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400 font-medium">
                  {log.timestamp || (log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—')}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {log.action || log.description || '—'}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-2">
                <span>
                  User: <strong className="text-slate-700 dark:text-zinc-300">{log.actorName || log.actor_name || 'System'}</strong>
                </span>
                <span className="text-blue-600 font-bold flex items-center gap-1">{t('admin.activity.inspect_payload')} <FleetIcons.ArrowRight className="w-3 h-3 text-blue-600" /></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Pagination */}
      <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
};

export default AdminUserActivityPage;

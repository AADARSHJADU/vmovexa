import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { useSuperActivity } from '../../hooks/superadmin/useSuperActivity';
import { useOrganization } from '../../hooks/superadmin/useOrganization';

export const SuperUserActivityPage = () => {
  const { t } = useTranslation();
  const { activityLogs, categories, pagination, loading, loadActivityLogs, loadCategories } = useSuperActivity();
  const { organizations, loadOrganizations } = useOrganization();

  // Filters & Controls state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tenantFilter, setTenantFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // ALL, TODAY, 7DAYS, 30DAYS
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'table'

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load initial options (categories and organizations)
  useEffect(() => {
    loadCategories().catch(() => {});
    loadOrganizations().catch(() => {});
  }, [loadCategories, loadOrganizations]);

  // Calculate Date Range parameters
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

  // Fetch activity logs whenever filters or page change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(severityFilter !== 'All' ? { severity: severityFilter } : {}),
      ...(categoryFilter !== 'All' ? { category: categoryFilter } : {}),
      ...(tenantFilter !== 'All' ? { organizationId: tenantFilter } : {}),
      ...dateParams,
      sortBy,
      sortOrder,
    };
    loadActivityLogs(params).catch(() => {});
  }, [
    loadActivityLogs,
    currentPage,
    pageSize,
    debouncedSearch,
    severityFilter,
    categoryFilter,
    tenantFilter,
    dateParams,
    sortBy,
    sortOrder,
  ]);

  const logList = Array.isArray(activityLogs) ? activityLogs : (activityLogs?.rows || []);
  const tenantList = Array.isArray(organizations) ? organizations : (organizations?.rows || []);
  const categoryOptions = Array.isArray(categories) ? categories : [];

  // Stat Counters
  const totalEvents = pagination?.total ?? logList.length;
  const criticalCount = useMemo(() => logList.filter((l) => l.severity === 'CRITICAL').length, [logList]);
  const warningCount = useMemo(() => logList.filter((l) => l.severity === 'WARNING').length, [logList]);
  const infoCount = useMemo(() => logList.filter((l) => l.severity === 'INFO' || !l.severity).length, [logList]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setTenantFilter('All');
    setSeverityFilter('All');
    setCategoryFilter('All');
    setDateRangeFilter('ALL');
    setSortBy('created_at');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (!logList.length) {
      toast.error('No audit logs available to export.');
      return;
    }
    try {
      const headers = ['Log ID', 'Timestamp', 'Severity', 'Category', 'Action', 'Actor Name', 'Actor Email', 'Actor Role', 'Scope/Tenant', 'IP Address'];
      const csvRows = [headers.join(',')];
      logList.forEach((l) => {
        const row = [
          l.id,
          `"${l.timestamp || l.created_at || ''}"`,
          `"${l.severity || 'INFO'}"`,
          `"${l.category || l.log_name || ''}"`,
          `"${(l.action || l.description || '').replace(/"/g, '""')}"`,
          `"${l.actorName || l.actor_name || ''}"`,
          `"${l.actor_email || ''}"`,
          `"${l.actorRole || l.actor_role || ''}"`,
          `"${l.tenantName || l.tenant_name || 'Platform'}"`,
          `"${l.ipAddress || l.ip_address || ''}"`,
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sovereign_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Audit trail CSV exported successfully!');
    } catch (_err) {
      toast.error('Failed to export audit trail.');
    }
  };

  // Helper to parse properties object safely
  const parsedProperties = useMemo(() => {
    if (!selectedLog || !selectedLog.properties) return null;
    if (typeof selectedLog.properties === 'object') return selectedLog.properties;
    try {
      return JSON.parse(selectedLog.properties);
    } catch (_e) {
      return null;
    }
  }, [selectedLog]);

  const handleCopyJSON = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
    toast.success('Log payload copied to clipboard!');
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link to="/superadmin/users" className="text-blue-600 dark:text-blue-400 hover:underline">
          Global Users
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Platform Activity Logs</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/superadmin/users"
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
            title="Back to Users"
          >
            <span className="text-sm font-bold">←</span>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t('activity.audit_title', 'Sovereign Platform Audit Trail & Activity Logs')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('activity.audit_sub', 'Tamper-evident chronological log of administrative actions, safety overrides, and tenant events')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton
            onClick={() => loadActivityLogs({ page: currentPage, limit: pageSize })}
            loading={loading}
            title="Refresh audit activity logs"
          />

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Document className="w-4 h-4" />
            <span>{t('activity.export_logs', 'Export Audit Trail (CSV)')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {t('activity.total_events', 'Total Audit Events')}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalEvents}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Info Events
          </span>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{infoCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {t('activity.warning_events', 'Compliance Warnings')}
          </span>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{warningCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            {t('activity.critical_events', 'Critical Overrides')}
          </span>
          <div className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">{criticalCount}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('common.search', 'Search action, actor name, or details...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Toggle Icons */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="list"
            tableTitle="Table View"
            cardTitle="List View"
            className="self-end lg:self-auto"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          {/* Tenant / Organization Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              {t('tenants.organization', 'Tenant Scope')}
            </label>
            <select
              value={tenantFilter}
              onChange={(e) => {
                setTenantFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="All">{t('common.all', 'All Tenants & Platform')}</option>
              <option value="GLOBAL_PLATFORM">VMOVEXA Sovereign (Global)</option>
              {tenantList.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {tItem.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              {t('common.severity', 'Severity')}
            </label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="All">{t('common.all', 'All Severities')}</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              Date Range
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Past 7 Days</option>
              <option value="30DAYS">Past 30 Days</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(':');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="created_at:DESC">Newest First</option>
              <option value="created_at:ASC">Oldest First</option>
              <option value="severity:DESC">Severity High → Low</option>
              <option value="log_name:ASC">Category (A-Z)</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Activity Logs Stream */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
            <FleetIcons.Trips className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No activity logs found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto font-medium">
            No platform events match your selected filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl transition-all inline-block mt-2"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-[11px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Log ID & Severity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action / Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Tenant Scope</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {logList.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">#{log.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            log.severity === 'CRITICAL'
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                              : log.severity === 'WARNING'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {log.severity || 'INFO'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">
                      {log.category || log.log_name || 'SYSTEM'}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900 dark:text-white">
                      {log.action || log.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.actorName || log.actor_name || 'System'}
                      </span>
                      {log.actorRole && (
                        <span className="text-[10px] ml-1 text-slate-400 dark:text-zinc-500">
                          ({log.actorRole})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-zinc-300">
                      {log.tenantName || log.tenant_name || 'Global Platform'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                      {log.timestamp || (log.created_at ? new Date(log.created_at).toLocaleString() : '—')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
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
        /* Cards Stream View */
        <div className="space-y-3">
          {logList.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                    #{log.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      log.severity === 'CRITICAL'
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {log.severity || 'INFO'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {log.category || log.log_name || 'SYSTEM'}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 font-medium">
                  {log.timestamp || (log.created_at ? new Date(log.created_at).toLocaleString() : '—')}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {log.action || log.description}
                </h3>
                {log.details && log.details !== log.action && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                    {log.details}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    Actor:{' '}
                    <strong className="text-slate-700 dark:text-zinc-300 font-bold">
                      {log.actorName || log.actor_name || 'System'}
                    </strong>{' '}
                    ({log.actorRole || log.actor_role || 'Staff'})
                  </span>
                  <span>·</span>
                  <span className="truncate">
                    Scope:{' '}
                    <strong className="text-slate-700 dark:text-zinc-300 font-bold">
                      {log.tenantName || log.tenant_name || 'Global Platform'}
                    </strong>
                  </span>
                  {log.ipAddress && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-slate-500">IP: {log.ipAddress || log.ip_address}</span>
                    </>
                  )}
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-bold">Inspect Payload →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Container */}
      <div className="p-3 border border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
        <Pagination
          currentPage={pagination?.page || currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total ?? logList.length}
          pageSize={pagination?.limit || pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* Audit Log Payload Inspector Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-20 sm:pt-24 pb-8 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                  Log #{selectedLog.id}
                </span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                    selectedLog.severity === 'CRITICAL'
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                      : selectedLog.severity === 'WARNING'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {selectedLog.severity || 'INFO'}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Audit Log Inspector</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-300 font-bold flex items-center justify-center transition-colors"
                title="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 dark:bg-zinc-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block mb-0.5">
                  Actor:
                </span>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {selectedLog.actorName || selectedLog.actor_name || 'System'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                  Role: {selectedLog.actorRole || selectedLog.actor_role || 'Staff'}
                </p>
                {selectedLog.actor_email && (
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{selectedLog.actor_email}</p>
                )}
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block mb-0.5">
                  Category & Event:
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.log_name || selectedLog.category || 'SYSTEM'}
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                  Event: {selectedLog.event || 'custom'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block mb-0.5">
                  Subject Resource:
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedLog.subject_type || 'Platform'}
                </p>
                {selectedLog.subject_id && (
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    ID: #{selectedLog.subject_id}
                  </p>
                )}
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block mb-0.5">
                  Scope & IP:
                </span>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {selectedLog.tenantName || selectedLog.tenant_name || 'Global Platform'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  {selectedLog.ipAddress || selectedLog.ip_address || 'Internal'}
                </p>
              </div>
            </div>

            {/* Event Action & Description */}
            <div>
              <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block mb-1">
                Action Summary & Description
              </span>
              <div className="bg-slate-100 dark:bg-zinc-800 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-700/80 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedLog.action || selectedLog.description || 'Action Recorded'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                  Timestamp: {selectedLog.timestamp || (selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString() : '—')}
                </p>
              </div>
            </div>

            {/* Changed Properties & Audit Diff (if available) */}
            {parsedProperties && (parsedProperties.old || parsedProperties.attributes) && (
              <div className="space-y-2">
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px] block">
                  Field Change Audit Diff
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Old Values */}
                  {parsedProperties.old && (
                    <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/50 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400 block mb-1">
                        Previous Values (Before)
                      </span>
                      <pre className="text-[11px] text-red-800 dark:text-red-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(parsedProperties.old, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* New Attributes */}
                  {parsedProperties.attributes && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 p-3 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
                        Updated Values (After)
                      </span>
                      <pre className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(parsedProperties.attributes, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Raw JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase text-[10px]">
                  Full Raw JSON Payload
                </span>
                <button
                  onClick={handleCopyJSON}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  📋 Copy JSON
                </button>
              </div>
              <div className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 max-h-48 scrollbar-thin">
                <pre className="text-[11px] text-emerald-400 leading-relaxed">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

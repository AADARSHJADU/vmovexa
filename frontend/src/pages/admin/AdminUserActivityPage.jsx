import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useAdminActivity } from '../../hooks/admin/useAdminActivity';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const AdminUserActivityPage = () => {
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
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Events</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalItems}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Info Logs</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{infoCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{warningCount}</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical Events</span>
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
              placeholder="Search logs by user, action, category..."
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
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Action Type</label>
            <select
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Actions</option>
              {eventOptions.map((ev) => (
                <option key={ev} value={ev}>
                  {ev.charAt(0).toUpperCase() + ev.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Severities</option>
              {severityOptions.map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Past 7 Days</option>
              <option value="30DAYS">Past 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Sort</label>
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
              <option value="created_at:DESC">Newest First</option>
              <option value="created_at:ASC">Oldest First</option>
              <option value="id:DESC">ID: High to Low</option>
              <option value="id:ASC">ID: Low to High</option>
              <option value="severity:DESC">Severity (Critical First)</option>
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
        <div className="py-16 text-center text-xs text-slate-500">Loading activity logs...</div>
      ) : paginatedLogs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <span className="text-3xl block">📋</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Logs Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">No activity events match your search or filters.</p>
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
                  <th className="py-3 px-4">ID & Level</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-right">Details</th>
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
                <span className="text-blue-600 font-bold">Inspect Payload →</span>
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

      {/* Log Details Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600">#{selectedLog.id}</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Log Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Action & Event</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedLog.action || selectedLog.description || '—'}</p>
                <p className="text-[11px] text-slate-500 font-mono pt-1">
                  Time: {selectedLog.timestamp || (selectedLog.created_at ? new Date(selectedLog.created_at).toLocaleString('en-IN') : '—')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">User / Actor</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedLog.actorName || selectedLog.actor_name || 'System'}
                  </p>
                  {selectedLog.actor_email && <p className="text-[10px] text-slate-500 truncate">{selectedLog.actor_email}</p>}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Category & IP</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedLog.category || selectedLog.log_name || 'System'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedLog.ipAddress || selectedLog.ip_address || '127.0.0.1'}</p>
                </div>
              </div>

              {/* Raw Payload JSON */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Raw Data</span>
                  <button
                    type="button"
                    onClick={handleCopyJSON}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Copy Data
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] max-h-40 overflow-x-auto">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserActivityPage;

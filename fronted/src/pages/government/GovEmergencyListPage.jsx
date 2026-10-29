import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service.js';

export const GovEmergencyListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    broadcasts = [],
    broadcastsMeta,
    loading,
    loadBroadcasts,
    revokeBroadcast,
    approveBroadcast,
    rejectBroadcast,
    deleteBroadcast,
  } = useGovernmentRole();

  const isSuperAdmin = location.pathname.startsWith('/superadmin');
  const dashboardPath = isSuperAdmin ? '/superadmin/dashboard' : '/government/dashboard';
  const parentLabel = isSuperAdmin ? 'Super Admin' : 'Government';
  const listPath = isSuperAdmin ? '/superadmin/government/emergency' : '/government/emergency';
  const newBroadcastPath = isSuperAdmin ? '/superadmin/government/emergency/new' : '/government/emergency/new';

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedBroadcastForModal, setSelectedBroadcastForModal] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch broadcasts from API
  const fetchList = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: 100, // Fetch broad set so tabs and metrics are accurate
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedSeverity !== 'all') params.severity = selectedSeverity;
      await loadBroadcasts(params);
    } catch {
      // Handled by thunk
    }
  }, [loadBroadcasts, currentPage, debouncedSearch, selectedSeverity]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchList();
      toast.success('Emergency broadcasts updated!');
    } catch {
      toast.error('Failed to refresh broadcasts.');
    } finally {
      setRefreshing(false);
    }
  };

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-emergency-actions-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Normalize list data
  const rawList = useMemo(() => {
    if (Array.isArray(broadcasts)) return broadcasts;
    if (Array.isArray(broadcasts?.rows)) return broadcasts.rows;
    if (Array.isArray(broadcasts?.items)) return broadcasts.items;
    return [];
  }, [broadcasts]);

  // Calculate live counts for stat cards
  const counts = useMemo(() => {
    const all = rawList.length;
    let active = 0;
    let pending = 0;
    let approved = 0;
    let revoked = 0;
    let expired = 0;

    rawList.forEach((b) => {
      const st = String(b.status || '').toLowerCase();
      const isAct = b.active === true || b.active === 1 || String(b.active) === 'true';
      if (isAct || st === 'active') active++;
      else if (st === 'pending_approval' || st === 'pending') pending++;
      else if (st === 'approved') approved++;
      else if (st === 'revoked') revoked++;
      else if (st === 'expired') expired++;
    });

    return { all, active, pending, approved, revoked, expired, inactive: revoked + expired };
  }, [rawList]);

  // Filter & Sort list
  const filteredList = useMemo(() => {
    return rawList.filter((b) => {
      const st = String(b.status || '').toLowerCase();
      const isAct = b.active === true || b.active === 1 || String(b.active) === 'true';

      // Tab filter
      if (activeTab === 'Active' && !(isAct || st === 'active')) return false;
      if (activeTab === 'Pending Approval' && !(st === 'pending_approval' || st === 'pending')) return false;
      if (activeTab === 'Approved' && !(st === 'approved' && !isAct)) return false;
      if (activeTab === 'Revoked' && st !== 'revoked') return false;
      if (activeTab === 'Expired' && st !== 'expired') return false;

      // Severity filter
      if (selectedSeverity !== 'all') {
        const sev = String(b.severity || '').toLowerCase();
        if (sev !== selectedSeverity.toLowerCase()) return false;
      }

      // Scope filter
      if (selectedScope !== 'all') {
        const scp = String(b.target_scope || '').toLowerCase();
        if (selectedScope === 'all_screens' && scp !== 'all') return false;
        if (selectedScope === 'partial' && scp === 'all') return false;
      }

      // Search filter
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const code = String(b.code || '').toLowerCase();
        const headline = String(b.headline || b.title || '').toLowerCase();
        const msg = String(b.message || b.body_text || '').toLowerCase();
        const area = String(b.target_area || '').toLowerCase();
        const agencyName = String(b.agency?.agency_name || b.agency?.name || '').toLowerCase();
        if (!code.includes(q) && !headline.includes(q) && !msg.includes(q) && !area.includes(q) && !agencyName.includes(q)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return (new Date(a.created_at || a.createdAt || 0)).getTime() - (new Date(b.created_at || b.createdAt || 0)).getTime();
      }
      if (sortBy === 'severity') {
        const sevRank = { critical: 4, high: 3, medium: 2, low: 1 };
        const rankA = sevRank[String(a.severity || '').toLowerCase()] || 0;
        const rankB = sevRank[String(b.severity || '').toLowerCase()] || 0;
        return rankB - rankA;
      }
      // default newest
      return (new Date(b.created_at || b.createdAt || 0)).getTime() - (new Date(a.created_at || a.createdAt || 0)).getTime();
    });
  }, [rawList, activeTab, selectedSeverity, selectedScope, debouncedSearch, sortBy]);

  // Paginated slice
  const totalItems = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Handle Revoke Broadcast
  const handleRevoke = async (id, code) => {
    if (!window.confirm(`Are you sure you want to REVOKE emergency broadcast ${code || `#${id}`}? Connected screens will immediately restore normal scheduled loop.`)) {
      return;
    }
    setActionInProgress(true);
    try {
      await toast.promise(revokeBroadcast(id), {
        loading: 'Revoking emergency override…',
        success: 'Emergency override revoked! Screens restoring normal loop.',
        error: (e) => e?.message || 'Failed to revoke broadcast.',
      });
      fetchList();
      if (selectedBroadcastForModal?.id === id) {
        setSelectedBroadcastForModal((prev) => prev ? { ...prev, active: false, status: 'revoked' } : null);
      }
    } catch {
    } finally {
      setActionInProgress(false);
      setActiveMenuId(null);
    }
  };

  // Handle SuperAdmin Approval
  const handleApprove = async (id, code) => {
    setActionInProgress(true);
    try {
      await toast.promise(approveBroadcast(id), {
        loading: 'Approving & dispatching emergency broadcast override…',
        success: `Broadcast ${code || `#${id}`} approved and broadcast live to transit screens!`,
        error: (e) => e?.message || 'Approval failed.',
      });
      fetchList();
      if (selectedBroadcastForModal?.id === id) {
        setSelectedBroadcastForModal((prev) => prev ? { ...prev, active: true, status: 'approved' } : null);
      }
    } catch {
    } finally {
      setActionInProgress(false);
      setActiveMenuId(null);
    }
  };

  // Handle SuperAdmin Rejection
  const handleReject = async (id, code) => {
    const reason = window.prompt(`Enter reason for rejecting broadcast ${code || `#${id}`}:`);
    if (reason === null) return;
    setActionInProgress(true);
    try {
      await toast.promise(rejectBroadcast(id, reason), {
        loading: 'Rejecting emergency submission…',
        success: 'Emergency submission rejected.',
        error: (e) => e?.message || 'Rejection failed.',
      });
      fetchList();
      if (selectedBroadcastForModal?.id === id) {
        setSelectedBroadcastForModal((prev) => prev ? { ...prev, active: false, status: 'rejected', rejection_reason: reason } : null);
      }
    } catch {
    } finally {
      setActionInProgress(false);
      setActiveMenuId(null);
    }
  };

  // Handle Deletion of non-active / unapproved broadcast
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete emergency broadcast ${code || `#${id}`}? This cannot be undone.`)) {
      return;
    }
    setActionInProgress(true);
    try {
      await toast.promise(deleteBroadcast(id), {
        loading: 'Deleting emergency broadcast…',
        success: 'Emergency broadcast deleted successfully!',
        error: (e) => e?.message || 'Failed to delete broadcast.',
      });
      fetchList();
      if (selectedBroadcastForModal?.id === id) {
        setSelectedBroadcastForModal(null);
      }
    } catch {
    } finally {
      setActionInProgress(false);
      setActiveMenuId(null);
    }
  };

  const handleResetFilters = () => {
    setActiveTab('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedSeverity('all');
    setSelectedScope('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeTab !== 'All' ||
    searchQuery.trim() !== '' ||
    selectedSeverity !== 'all' ||
    selectedScope !== 'all' ||
    sortBy !== 'newest';

  const filterTabs = [
    { label: 'All', count: counts.all, key: 'all' },
    { label: 'Active', count: counts.active, key: 'active', isLive: true },
    { label: 'Pending Approval', count: counts.pending, key: 'pending_approval', isWarning: true },
    { label: 'Approved', count: counts.approved, key: 'approved' },
    { label: 'Revoked', count: counts.revoked, key: 'revoked' },
    { label: 'Expired', count: counts.expired, key: 'expired' },
  ];

  const getSeverityBadge = (sev) => {
    const s = String(sev || '').toLowerCase();
    if (s === 'critical') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 shadow-xs whitespace-nowrap">
          <FleetIcons.Siren className="w-3 h-3 text-red-600 animate-pulse shrink-0" />
          <span>{t('common.critical')}</span>
        </span>
      );
    }
    if (s === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 whitespace-nowrap">
          <FleetIcons.Alert className="w-3 h-3 text-amber-600 shrink-0" />
          <span>{t('common.high')}</span>
        </span>
      );
    }
    if (s === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
          <FleetIcons.Megaphone className="w-3 h-3 text-blue-600 shrink-0" />
          <span>{t('common.medium')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 whitespace-nowrap">
        <FleetIcons.Info className="w-3 h-3 text-slate-500 shrink-0" />
        <span>{sev || 'Standard'}</span>
      </span>
    );
  };

  const getStatusBadge = (item) => {
    const isAct = item.active === true || item.active === 1 || String(item.active) === 'true';
    const st = String(item.status || '').toLowerCase();

    if (isAct || st === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-xs whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{t('gov.emergency.live_override')}</span>
        </span>
      );
    }
    if (st === 'pending_approval' || st === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 whitespace-nowrap">
          <FleetIcons.Clock className="w-3 h-3 text-amber-600 shrink-0" />
          <span>{t('common.pending_review')}</span>
        </span>
      );
    }
    if (st === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 whitespace-nowrap">
          <FleetIcons.Check className="w-3 h-3 text-blue-600 shrink-0" />
          <span>{t('common.approved')}</span>
        </span>
      );
    }
    if (st === 'revoked') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
          <FleetIcons.Close className="w-3 h-3 text-rose-600 shrink-0" />
          <span>{t('common.revoked')}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 whitespace-nowrap">
        <span>{st || 'Expired'}</span>
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(d);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: parentLabel, path: dashboardPath, icon: FleetIcons.Dashboard },
          { label: 'Emergency Broadcasts' },
        ]}
        className="mb-1"
      />

      {/* 2. Header — Styled Exactly Like TenantsListPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Emergency Broadcasts
            </h1>
            {counts.active > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                {counts.active} OVERRIDE{counts.active > 1 ? 'S' : ''} ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage high-priority override advisories, monitor live transit alerts, and broadcast history
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title={t('gov.emergency.refresh_dir')}
          />

          <Link
            to={newBroadcastPath}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial shadow-red-500/20 cursor-pointer"
          >
            <FleetIcons.Siren className="w-4 h-4 text-white animate-pulse" />
            <span>{t('gov.emergency.new_broadcast')}</span>
          </Link>
        </div>
      </div>

      {/* 3. Stat Cards — 5 Status Breakdown Cards with Working Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-slate-400 ${
            activeTab === 'All' ? 'border-slate-900 dark:border-red-500 ring-2 ring-slate-900/10 dark:ring-red-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('gov.emergency.total_alerts')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{counts.all}</div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('gov.emergency.all_logs')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Active'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-emerald-400 ${
            activeTab === 'Active' ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('gov.emergency.live_overrides')}</span>
            {counts.active > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{counts.active}</div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">{t('gov.emergency.broadcasting_now')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Pending Approval'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-amber-400 ${
            activeTab === 'Pending Approval' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('common.pending_review')}</span>
            {counts.pending > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{counts.pending}</div>
          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">{t('gov.emergency.awaiting_superadmin')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Approved'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-blue-400 ${
            activeTab === 'Approved' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('common.approved')}</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{counts.approved}</div>
          <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">{t('gov.emergency.authorized_broadcasts')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Revoked'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-rose-400 ${
            activeTab === 'Revoked' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{t('gov.emergency.revoked_expired')}</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{counts.inactive}</div>
          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">{t('gov.emergency.override_terminated')}</p>
        </div>
      </div>

      {/* 4. Filter Tabs & Advanced Toolbar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isCurrent = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setActiveTab(tab.label);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? tab.isLive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : tab.isWarning
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-900 dark:bg-red-600 text-white shadow-sm'
                    : tab.isLive && tab.count > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                    : tab.isWarning && tab.count > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                    : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50'
                }`}
              >
                {tab.isLive && tab.count > 0 && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                )}
                {tab.isWarning && tab.count > 0 && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isCurrent
                      ? tab.isLive
                        ? 'bg-emerald-700 text-white'
                        : tab.isWarning
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 dark:bg-red-700 text-white'
                      : tab.isLive && tab.count > 0
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                      : tab.isWarning && tab.count > 0
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                      : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters Bar */}
        <div className="bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('gov.emergency.search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSeverity}
              onChange={(e) => {
                setSelectedSeverity(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-red-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('gov.emergency.sev_all')}</option>
              <option value="critical">{t('common.critical')}</option>
              <option value="high">{t('common.high')}</option>
              <option value="medium">{t('common.medium')}</option>
              <option value="low">{t('common.low')}</option>
            </select>
          </div>

          {/* Scope Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedScope}
              onChange={(e) => {
                setSelectedScope(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-red-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('gov.emergency.scope_all')}</option>
              <option value="all_screens">{t('gov.emergency.entire_network')}</option>
              <option value="partial">{t('gov.emergency.selected_routes')}</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-red-500 shadow-xs cursor-pointer"
            >
              <option value="newest">{t('gov.emergency.sort_newest')}</option>
              <option value="oldest">{t('gov.emergency.sort_oldest')}</option>
              <option value="severity">{t('gov.emergency.sort_highest_sev')}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            className="ml-auto"
          />
        </div>

        {/* Active Filter Chips & Reset Button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400">{t('gov.emergency.active_filters')}</span>
            {activeTab !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold text-[10px] border border-red-200 dark:border-red-800">
                Tab: {activeTab}
                <button type="button" onClick={() => { setActiveTab('All'); setCurrentPage(1); }} className="hover:text-red-500 font-bold ml-1"><FleetIcons.Cross className="w-3.5 h-3.5 inline-block" /></button>
              </span>
            )}
            {selectedSeverity !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                Severity: {selectedSeverity.toUpperCase()}
                <button type="button" onClick={() => { setSelectedSeverity('all'); setCurrentPage(1); }} className="hover:text-red-500 font-bold ml-1"><FleetIcons.Cross className="w-3.5 h-3.5 inline-block" /></button>
              </span>
            )}
            {selectedScope !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                Scope: {selectedScope === 'all_screens' ? 'Entire Network' : 'Selected Routes'}
                <button type="button" onClick={() => { setSelectedScope('all'); setCurrentPage(1); }} className="hover:text-red-500 font-bold ml-1"><FleetIcons.Cross className="w-3.5 h-3.5 inline-block" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] border border-slate-200 dark:border-zinc-700">
                Query: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500 font-bold ml-1"><FleetIcons.Cross className="w-3.5 h-3.5 inline-block" /></button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline ml-auto cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Content: Table or Card View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{t('gov.emergency.broadcast_alert')}</th>
                  <th className="px-4 py-3.5">{t('common.severity')}</th>
                  <th className="px-4 py-3.5">{t('gov.emergency.target_scope')}</th>
                  <th className="px-4 py-3.5">{t('gov.emergency.duration_expiry')}</th>
                  <th className="px-4 py-3.5">{t('common.status')}</th>
                  <th className="px-4 py-3.5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loading && rawList.length === 0 ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-emg-${i}`} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-36 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-2.5 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="px-4 py-4"><div className="h-3 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="px-4 py-4 text-right"><div className="h-7 w-8 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                          <FleetIcons.Siren className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.no_broadcasts')}</p>
                        <p className="text-xs text-slate-400 max-w-sm">
                          {hasActiveFilters ? 'Try adjusting your search queries or active status filters.' : 'There are no active emergency alerts or broadcast history logged yet.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, idx) => {
                    const isNearBottom = idx >= Math.max(0, paginatedList.length - 2) && paginatedList.length > 2;
                    const headline = item.headline || item.title || 'Emergency Advisory';
                    const messageSnippet = item.message || item.body_text || 'No description';
                    const isAct = item.active === true || item.active === 1 || String(item.active) === 'true';
                    const st = String(item.status || '').toLowerCase();
                    const agencyName = item.agency?.agency_name || item.agency?.name || item.authority || null;
                    const busesCount = item.affected_buses_count || (item.targets?.length ? item.targets.length : (item.target_scope === 'all' ? 'All' : '—'));

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                        onClick={() => navigate(`${listPath}/${item.id}`)}
                      >
                        {/* Alert & Code */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isAct
                                ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900/60 text-red-600'
                                : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500'
                            }`}>
                              <FleetIcons.Siren className={`w-5 h-5 ${isAct ? 'animate-pulse text-red-600 dark:text-red-400' : 'text-slate-500'}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px] block group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                  {headline}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">{item.code || `EMG-${item.id}`}</span>
                                {agencyName && (
                                  <>
                                    <span className="text-slate-300 dark:text-zinc-600">•</span>
                                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[140px]">{agencyName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="px-4 py-3.5">
                          {getSeverityBadge(item.severity)}
                        </td>

                        {/* Scope */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <FleetIcons.Target className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[160px]">
                                {item.target_scope === 'all' ? 'Entire Transit Network' : (item.target_area || 'Custom Scope')}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                              Buses Affected: <span className="font-bold text-slate-700 dark:text-zinc-300">{busesCount}</span>
                            </div>
                          </div>
                        </td>

                        {/* Timing */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="text-slate-700 dark:text-zinc-300 font-medium">
                              {formatDate(item.created_at || item.createdAt)}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <FleetIcons.Clock className="w-3 h-3 text-slate-400" />
                              <span>Duration: {item.auto_expire || '6 Hours'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {getStatusBadge(item)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <div className="relative inline-block text-left" data-emergency-actions-menu>
                              <button
                                type="button"
                                onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                title={t('common.actions')}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  activeMenuId === item.id
                                    ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <FleetIcons.MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === item.id && (
                                <div
                                  className={`absolute right-0 ${
                                    isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                  } w-52 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                                >
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        navigate(`${listPath}/${item.id}`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                    >
                                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500" />
                                      <span>{t('gov.emergency.view_full_details')}</span>
                                    </button>

                                    {/* Edit Option: Only if not approved */}
                                    {(st === 'pending_approval' || st === 'pending') ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveMenuId(null);
                                          navigate(`${listPath}/${item.id}/edit`);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer"
                                      >
                                        <FleetIcons.Edit className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{t('gov.emergency.edit_broadcast')}</span>
                                      </button>
                                    ) : (
                                      <div
                                        className="w-full px-3 py-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500 flex items-center gap-2 cursor-not-allowed select-none"
                                        title={t('gov.emergency.edit_locked_hint')}
                                      >
                                        <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Edit Locked ({st === 'approved' ? 'Approved' : isAct ? 'Live' : 'Terminated'})</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Super Admin Review Actions */}
                                  {isSuperAdmin && (st === 'pending_approval' || st === 'pending') && (
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        disabled={actionInProgress}
                                        onClick={() => handleApprove(item.id, item.code)}
                                        className="w-full px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
                                      >
                                        <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{t('gov.emergency.approve_override')}</span>
                                      </button>
                                      <button
                                        type="button"
                                        disabled={actionInProgress}
                                        onClick={() => handleReject(item.id, item.code)}
                                        className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                                      >
                                        <FleetIcons.Close className="w-3.5 h-3.5 text-rose-600" />
                                        <span>{t('gov.emergency.reject_submission')}</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Revoke Option if Active or Approved */}
                                  {(isAct || st === 'approved') && (
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        disabled={actionInProgress}
                                        onClick={() => handleRevoke(item.id, item.code)}
                                        className="w-full px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                                      >
                                        <FleetIcons.Close className="w-3.5 h-3.5 text-red-600" />
                                        <span>{t('gov.emergency.revoke_broadcast')}</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Delete Option if Unapproved / Revoked / Expired / Rejected */}
                                  {!(isAct || st === 'approved') && (
                                    <div className="py-1">
                                      <button
                                        type="button"
                                        disabled={actionInProgress}
                                        onClick={() => handleDelete(item.id, item.code)}
                                        className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                                      >
                                        <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                        <span>{t('gov.emergency.delete_broadcast')}</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && rawList.length === 0 ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <div key={`skel-card-${i}`} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full"></div>
                </div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-14 w-full bg-slate-100 dark:bg-zinc-800/60 rounded-xl"></div>
                <div className="h-8 w-full bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
              </div>
            ))
          ) : paginatedList.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <FleetIcons.Siren className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.no_broadcasts')}</p>
            </div>
          ) : (
            paginatedList.map((item) => {
              const headline = item.headline || item.title || 'Emergency Advisory';
              const messageSnippet = item.message || item.body_text || 'No description';
              const isAct = item.active === true || item.active === 1 || String(item.active) === 'true';
              const st = String(item.status || '').toLowerCase();
              const busesCount = item.affected_buses_count || (item.targets?.length ? item.targets.length : (item.target_scope === 'all' ? 'All' : '—'));

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`${listPath}/${item.id}`)}
                  className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer hover:shadow-md space-y-3.5 relative overflow-hidden group ${
                    isAct
                      ? 'border-red-400 dark:border-red-800/80 ring-1 ring-red-400/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                      {item.code || `EMG-${item.id}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getSeverityBadge(item.severity)}
                      {getStatusBadge(item)}
                    </div>
                  </div>

                  {/* Headline & Message Preview */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                      {headline}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {messageSnippet}
                    </p>
                  </div>

                  {/* Media Preview if attached */}
                  {item.media_url && (
                    <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-zinc-800/80 overflow-hidden border border-slate-200 dark:border-zinc-700/60 relative">
                      {item.media_type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white text-xs gap-1.5">
                          <FleetIcons.Video className="w-4 h-4 text-red-500" />
                          <span>{t('gov.emergency.motion_video')}</span>
                        </div>
                      ) : (
                        <img
                          src={resolveFileUrl(item.media_url) || item.media_url}
                          alt="Creative"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  )}

                  {/* Scope & Timing Metadata */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] space-y-1.5 text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('gov.emergency.target_scope')}:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[170px]">
                        {item.target_scope === 'all' ? 'Entire Network' : (item.target_area || 'Specific Fleet')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('gov.emergency.buses_affected')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{busesCount} Displays</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{t('common.created')}:</span>
                      <span>{formatDate(item.created_at || item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => navigate(`${listPath}/${item.id}`)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>{t('gov.emergency.inspect_details')}</span>
                    </button>
                    {(st === 'pending_approval' || st === 'pending') && (
                      <button
                        type="button"
                        onClick={() => navigate(`${listPath}/${item.id}/edit`)}
                        className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-amber-200 dark:border-amber-900/50"
                        title={t('gov.emergency.edit_broadcast')}
                      >
                        <FleetIcons.Edit className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('common.edit')}</span>
                      </button>
                    )}
                    {(isAct || st === 'approved') ? (
                      <button
                        type="button"
                        onClick={() => handleRevoke(item.id, item.code)}
                        className="py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-red-200 dark:border-red-900/50"
                        title={t('gov.emergency.revoke_broadcast')}
                      >
                        <FleetIcons.Close className="w-3.5 h-3.5" />
                        <span>{t('common.revoke')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.code)}
                        className="py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                        title={t('gov.emergency.delete_broadcast')}
                      >
                        <FleetIcons.Trash className="w-3.5 h-3.5" />
                        <span>{t('common.delete')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 6. Standard Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      {/* 7. Detailed Slide-over Modal Drawer */}
      {selectedBroadcastForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                    {selectedBroadcastForModal.code || `EMG-${selectedBroadcastForModal.id}`}
                  </span>
                  {getSeverityBadge(selectedBroadcastForModal.severity)}
                  {getStatusBadge(selectedBroadcastForModal)}
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                  {selectedBroadcastForModal.headline || selectedBroadcastForModal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBroadcastForModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-5 h-5" />
              </button>
            </div>

            {/* Creative Visual Preview if attached */}
            {selectedBroadcastForModal.media_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.visual_creative')}</span>
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-black max-h-[280px] flex items-center justify-center">
                  {selectedBroadcastForModal.media_type === 'video' ? (
                    <video
                      src={resolveFileUrl(selectedBroadcastForModal.media_url) || selectedBroadcastForModal.media_url}
                      controls
                      autoPlay
                      muted
                      className="w-full max-h-[280px] object-contain"
                    />
                  ) : (
                    <img
                      src={resolveFileUrl(selectedBroadcastForModal.media_url) || selectedBroadcastForModal.media_url}
                      alt="Broadcast Visual"
                      className="w-full max-h-[280px] object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Full Message Text */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('gov.emergency.advisory_message')}</span>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/70 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selectedBroadcastForModal.message || selectedBroadcastForModal.body_text}
              </div>
            </div>

            {/* Scope & Route targets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-1">
                <span className="text-slate-400 font-semibold">{t('gov.emergency.target_network_scope')}</span>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FleetIcons.Target className="w-3.5 h-3.5 text-red-500" />
                  <span>{selectedBroadcastForModal.target_scope === 'all' ? 'Entire Transit Network' : (selectedBroadcastForModal.target_area || 'Specific Fleet Corridors')}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Total Displays: <b>{selectedBroadcastForModal.affected_buses_count || 'All Online Displays'}</b>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-1">
                <span className="text-slate-400 font-semibold">{t('gov.emergency.duration_auto_expiry')}</span>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedBroadcastForModal.auto_expire || '6 Hours'}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Created: {formatDate(selectedBroadcastForModal.created_at || selectedBroadcastForModal.createdAt)}
                </div>
              </div>
            </div>

            {/* Rejection reason if present */}
            {selectedBroadcastForModal.rejection_reason && (
              <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs text-red-800 dark:text-red-300">
                <span className="font-bold block">{t('gov.emergency.rejection_reason')}</span>
                <span className="mt-0.5 block">{selectedBroadcastForModal.rejection_reason}</span>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBroadcastForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {/* SuperAdmin Approve / Reject if Pending */}
                {isSuperAdmin && (String(selectedBroadcastForModal.status).toLowerCase() === 'pending_approval' || String(selectedBroadcastForModal.status).toLowerCase() === 'pending') && (
                  <>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleReject(selectedBroadcastForModal.id, selectedBroadcastForModal.code)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                    >
                      Reject Submission
                    </button>
                    <button
                      type="button"
                      disabled={actionInProgress}
                      onClick={() => handleApprove(selectedBroadcastForModal.id, selectedBroadcastForModal.code)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                    >
                      Approve & Broadcast Live
                    </button>
                  </>
                )}

                {/* Revoke if Live/Approved */}
                {(selectedBroadcastForModal.active || String(selectedBroadcastForModal.status).toLowerCase() === 'approved') && (
                  <button
                    type="button"
                    disabled={actionInProgress}
                    onClick={() => handleRevoke(selectedBroadcastForModal.id, selectedBroadcastForModal.code)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <FleetIcons.Trash className="w-3.5 h-3.5 text-white" />
                    <span>{t('gov.emergency.revoke_override')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovEmergencyListPage;

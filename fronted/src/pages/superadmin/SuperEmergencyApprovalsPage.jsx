import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Pagination } from '../../components/ui/Pagination';
import { resolveFileUrl } from '../../api/services/upload.service.js';

const STATUS_UI = {
  pending_approval: {
    label: 'PENDING APPROVAL',
    short: 'Pending',
    cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 animate-pulse',
  },
  approved: {
    label: 'APPROVED · LIVE',
    short: 'Live',
    cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500 animate-ping',
  },
  rejected: {
    label: 'REJECTED',
    short: 'Rejected',
    cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
  revoked: {
    label: 'REVOKED',
    short: 'Revoked',
    cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
  expired: {
    label: 'EXPIRED',
    short: 'Expired',
    cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
    dot: 'bg-slate-400',
  },
};

const SEVERITY_CONFIG = {
  critical: {
    label: 'CRITICAL',
    accent: 'from-rose-600 via-red-600 to-amber-600',
    badge: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900',
    iconCls: 'text-red-600 dark:text-red-400 animate-pulse',
  },
  high: {
    label: 'HIGH',
    accent: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    iconCls: 'text-amber-500 dark:text-amber-400',
  },
  medium: {
    label: 'MEDIUM',
    accent: 'from-blue-600 via-cyan-600 to-indigo-600',
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    iconCls: 'text-blue-500 dark:text-blue-400',
  },
  low: {
    label: 'LOW',
    accent: 'from-slate-500 to-zinc-600',
    badge: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
    iconCls: 'text-slate-500 dark:text-zinc-400',
  },
};

export const SuperEmergencyApprovalsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { broadcasts, loadBroadcasts, approveBroadcast, rejectBroadcast, revokeBroadcast } = useGovernmentRole();

  // Filters & View State
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'live' | 'rejected' | 'revoked'
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('emergency_approvals_view_mode') || 'table';
    } catch (_) {
      return 'table';
    }
  }); // 'table' (list) | 'card'
  const [busyId, setBusyId] = useState(null);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('emergency_approvals_view_mode', mode);
    } catch (_) {}
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals State
  const [detailItem, setDetailItem] = useState(null);
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('Incomplete emergency advisory specifications');
  const [revokingItem, setRevokingItem] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // { id, item, coords: { top, bottom, right } }

  const toggleActionMenu = (e, item, isTable = false) => {
    e.stopPropagation();
    const menuId = isTable ? `table-${item.id}` : `card-${item.id}`;
    if (activeMenu?.id === menuId) {
      setActiveMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 220;
    const openUpward = window.innerHeight - rect.bottom < dropdownHeight;

    setActiveMenu({
      id: menuId,
      item,
      coords: {
        top: openUpward ? null : rect.bottom + 6,
        bottom: openUpward ? window.innerHeight - rect.top + 6 : null,
        right: window.innerWidth - rect.right,
      },
    });
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-action-menu]')) {
        setActiveMenu(null);
      }
    };
    const handleScrollOrResize = () => {
      setActiveMenu(null);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);

  useEffect(() => {
    loadBroadcasts({ active: 'all' }).catch(() => {});
  }, [loadBroadcasts]);

  const refresh = () => loadBroadcasts({ active: 'all' }).catch(() => {});

  const broadcastList = useMemo(() => {
    return Array.isArray(broadcasts) ? broadcasts : (broadcasts?.items || broadcasts?.rows || []);
  }, [broadcasts]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      pending: broadcastList.filter((b) => (b.status || 'pending_approval') === 'pending_approval').length,
      live: broadcastList.filter((b) => b.status === 'approved' && (b.active === true || b.active === 1 || b.active === undefined)).length,
      rejected: broadcastList.filter((b) => b.status === 'rejected').length,
      revoked: broadcastList.filter((b) => b.status === 'revoked').length,
      all: broadcastList.length,
    };
  }, [broadcastList]);



  // Filtered list
  const filteredBroadcasts = useMemo(() => {
    let list = broadcastList.filter((b) => {
      const status = b.status || 'pending_approval';

      // Tab match
      let matchTab = true;
      if (activeTab === 'pending') matchTab = status === 'pending_approval';
      else if (activeTab === 'live') matchTab = status === 'approved';
      else if (activeTab === 'rejected') matchTab = status === 'rejected';
      else if (activeTab === 'revoked') matchTab = status === 'revoked';

      // Severity match
      const sev = (b.severity || 'high').toLowerCase();
      const matchSeverity = severityFilter === 'All' || sev === severityFilter.toLowerCase();

      // Search match
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(b.code || '').toLowerCase().includes(q) ||
        String(b.headline || b.title || '').toLowerCase().includes(q) ||
        String(b.body_text || b.message || '').toLowerCase().includes(q) ||
        String(b.target_area || '').toLowerCase().includes(q) ||
        String(b.issued_by || '').toLowerCase().includes(q);

      return matchTab && matchSeverity && matchSearch;
    });

    // Sort by id descending
    list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    return list;
  }, [broadcastList, activeTab, severityFilter, search]);

  // Pagination Math
  const totalItems = filteredBroadcasts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBroadcasts.slice(startIndex, startIndex + pageSize);
  }, [filteredBroadcasts, currentPage, pageSize]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setCurrentPage(1);
  };

  // Actions
  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await toast.promise(approveBroadcast(id), {
        loading: 'Approving & broadcasting to all screens...',
        success: 'Approved! Emergency is now LIVE across transit screens.',
        error: (e) => e?.message || 'Approval failed',
      });
      if (detailItem?.id === id) setDetailItem(null);
      await refresh();
    } catch {
      /* handled by toast */
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    const id = rejectingItem.id;
    setBusyId(id);
    try {
      await toast.promise(rejectBroadcast(id, rejectReason || 'Incomplete details'), {
        loading: 'Rejecting advisory...',
        success: 'Emergency broadcast rejected.',
        error: (e) => e?.message || 'Rejection failed',
      });
      setRejectingItem(null);
      if (detailItem?.id === id) setDetailItem(null);
      await refresh();
    } catch {
      /* handled by toast */
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokingItem) return;
    const id = revokingItem.id;
    setBusyId(id);
    try {
      await toast.promise(revokeBroadcast(id), {
        loading: 'Revoking broadcast override...',
        success: 'Broadcast revoked. Transit displays restored to normal playback.',
        error: (e) => e?.message || 'Revoke failed',
      });
      setRevokingItem(null);
      if (detailItem?.id === id) setDetailItem(null);
      await refresh();
    } catch {
      /* handled by toast */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Government', to: '/superadmin/government' },
          { label: 'Emergency Broadcast Approvals' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-xs">
            <FleetIcons.Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Emergency Broadcast Approvals
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                Civil Defense NOC
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
              Audit, approve, or revoke transit emergency overrides before they take control of bus displays.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton onClick={refresh} title={t('superadmin.emergency.title_refresh', 'Refresh emergency broadcast approvals')} />
        </div>
      </div>



      {/* Row 1: Status Category Filter Tabs (Left) & ViewModeToggle (Right) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar border border-slate-200/60 dark:border-zinc-700/60">
          {[
            { k: 'all', l: 'All', count: counts.all },
            { k: 'pending', l: 'Pending', count: counts.pending },
            { k: 'live', l: 'Live', count: counts.live },
            { k: 'rejected', l: 'Rejected', count: counts.rejected },
            { k: 'revoked', l: 'Archived', count: counts.revoked },
          ].map((tab) => {
            const isActive = activeTab === tab.k;
            return (
              <button
                key={tab.k}
                type="button"
                onClick={() => handleTabChange(tab.k)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-zinc-700'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.l}
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white'
                      : 'bg-slate-200/70 dark:bg-zinc-700/50 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-end shrink-0">
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* Row 2: Search Input & Severity Filter & Clear Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative w-full sm:w-80">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('superadmin.emergency.ph_search', 'Search by code, headline, message, area...')}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors shadow-2xs font-medium"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-red-500 cursor-pointer shadow-2xs"
          >
            <option value="All">{t('superadmin.emergency.all_severities', 'All Severities')}</option>
            <option value="critical">{t('superadmin.emergency.sev_opt_critical', 'Critical')}</option>
            <option value="high">{t('superadmin.emergency.sev_opt_high', 'High')}</option>
            <option value="medium">{t('superadmin.emergency.sev_opt_medium', 'Medium')}</option>
            <option value="low">{t('superadmin.emergency.sev_opt_low', 'Low')}</option>
          </select>

          {(search || severityFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSeverityFilter('All');
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* EMPTY STATE */}
      {paginatedList.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 mx-auto mb-3 flex items-center justify-center">
            <FleetIcons.Siren className="w-7 h-7" />
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">{t('superadmin.emergency.no_broadcasts', 'No emergency broadcasts in this view')}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Government-submitted emergency advisories awaiting Super Admin approval or active overrides will appear here.
          </p>
        </div>
      )}

      {/* VIEW 1: CARD GRID VIEW */}
      {viewMode === 'card' && paginatedList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginatedList.map((b) => {
            const status = b.status || 'pending_approval';
            const ui = STATUS_UI[status] || STATUS_UI.pending_approval;
            const sevKey = (b.severity || 'high').toLowerCase();
            const sev = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.high;
            const busy = busyId === b.id;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl shadow-xs hover:shadow-md hover:border-red-300 dark:hover:border-zinc-700 transition-all flex flex-col group relative"
              >
                {/* Top Accent Gradient Line */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${sev.accent} rounded-t-2xl`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Top Meta Row: Code + Status + Severity */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[11px] font-mono font-bold border border-slate-200 dark:border-zinc-700">
                        {b.code || `EMG-${b.id}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${ui.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span>
                          {ui.short}
                        </span>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sev.badge}`}>
                          {sev.label}
                        </span>
                      </div>
                    </div>

                    {/* Creative Media / Visual Preview Box */}
                    {(() => {
                      const rawMedia = b.media_url || b.mediaUrl;
                      const mediaUrl = rawMedia ? resolveFileUrl(rawMedia) : null;
                      const isVideo = b.media_type === 'video' || b.mediaType === 'video' || (mediaUrl && /\.(mp4|webm|mov|mkv)/i.test(mediaUrl));

                      return (
                        <div
                          onClick={() => navigate(`/superadmin/emergency-approvals/${b.id}`)}
                          className="relative w-full h-36 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-center cursor-pointer group-hover:border-red-400 transition-colors"
                        >
                          {mediaUrl ? (
                            isVideo ? (
                              <div className="relative w-full h-full bg-black flex items-center justify-center">
                                <video
                                  src={mediaUrl}
                                  className="w-full h-full object-cover opacity-85"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                  <span className="p-2.5 rounded-full bg-red-600 text-white shadow-lg">
                                    <FleetIcons.Video className="w-5 h-5 text-white" />
                                  </span>
                                </div>
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono font-bold text-white uppercase">
                                  VIDEO
                                </div>
                              </div>
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={b.headline || 'Emergency creative'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center text-slate-400 dark:text-zinc-500">
                              <FleetIcons.Siren className="w-8 h-8 text-red-500 animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                                Text & Ticker Override
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500">{t('superadmin.emergency.no_media', 'No media attached')}</span>
                            </div>
                          )}

                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                            {b.target_scope === 'all' ? 'All Screens' : 'Targeted Fleet'}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Headline & Body Text */}
                    <div>
                      <h3
                        onClick={() => navigate(`/superadmin/emergency-approvals/${b.id}`)}
                        className="font-black text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1 text-base tracking-tight cursor-pointer"
                      >
                        {b.headline || b.title || 'Emergency Advisory'}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 mt-1 leading-relaxed">
                        {b.body_text || b.message || 'No additional advisory details provided.'}
                      </p>
                      {b.ticker_text && (
                        <p className="text-[11px] font-mono text-red-600 dark:text-red-400 truncate mt-1">
                          Ticker: {b.ticker_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Scope, Target Area & Authority */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.target_corridor', 'Target Corridor')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                        {b.target_area || (b.target_scope === 'all' ? 'Entire Transit Network' : 'Specific Routes')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.issued_by', 'Issued By')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                        {b.issued_by || 'Government Authority'}
                      </span>
                    </div>

                    {status === 'approved' && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center text-xs">
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          Active Broadcast
                        </p>
                        <p className="font-black text-emerald-800 dark:text-emerald-300 text-sm mt-0.5">
                          {b.affected_buses_count != null ? `${b.affected_buses_count} Transit Screens` : 'All Online Displays'}
                        </p>
                      </div>
                    )}

                    {status === 'rejected' && b.rejection_reason && (
                      <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                        <p className="font-bold text-[10px] uppercase">{t('superadmin.emergency.rejection_reason', 'Rejection Reason')}</p>
                        <p className="line-clamp-2 mt-0.5">{b.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons (Compact + 3-Dots Menu) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                    {status === 'pending_approval' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleApprove(b.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <FleetIcons.Check className="w-3.5 h-3.5" />
                        <span>{t('superadmin.emergency.btn_approve_broadcast', 'Approve Broadcast')}</span>
                      </button>
                    )}

                    {status === 'approved' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setRevokingItem(b)}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <FleetIcons.Close className="w-3.5 h-3.5" />
                        <span>{t('superadmin.emergency.btn_revoke_broadcast', 'Revoke Broadcast')}</span>
                      </button>
                    )}

                    {(status === 'rejected' || status === 'revoked') && (
                      <div className="flex-1 text-xs text-slate-400 dark:text-zinc-500 font-medium italic">
                        {status === 'rejected' ? 'Advisory Rejected' : 'Broadcast Revoked'}
                      </div>
                    )}

                    {/* 3-Dots Button */}
                    <button
                      type="button"
                      data-action-menu
                      onClick={(e) => toggleActionMenu(e, b, false)}
                      className={`p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                        activeMenu?.id === `card-${b.id}`
                          ? 'border-red-500 bg-red-50 dark:bg-zinc-800 text-red-600 dark:text-red-400'
                          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                      title={t('superadmin.emergency.title_more_options', 'More options')}
                    >
                      <FleetIcons.MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && paginatedList.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/60 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3 px-4">{t('superadmin.emergency.th_advisory_alert', 'Advisory Alert')}</th>
                  <th className="py-3 px-3 hidden sm:table-cell">{t('superadmin.emergency.th_target_authority', 'Target & Authority')}</th>
                  <th className="py-3 px-3">{t('superadmin.emergency.th_severity', 'Severity')}</th>
                  <th className="py-3 px-3">{t('superadmin.emergency.th_status', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('superadmin.emergency.th_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {paginatedList.map((b) => {
                  const status = b.status || 'pending_approval';
                  const ui = STATUS_UI[status] || STATUS_UI.pending_approval;
                  const sevKey = (b.severity || 'high').toLowerCase();
                  const sev = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.high;
                  const busy = busyId === b.id;

                  const rawMedia = b.media_url || b.mediaUrl;
                  const mediaUrl = rawMedia ? resolveFileUrl(rawMedia) : null;
                  const isVideo = b.media_type === 'video' || b.mediaType === 'video' || (mediaUrl && /\.(mp4|webm|mov|mkv)/i.test(mediaUrl));

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors group">
                      {/* Advisory Alert (Compact Thumbnail + Headline + Code) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => navigate(`/superadmin/emergency-approvals/${b.id}`)}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-rose-100 dark:from-zinc-800 dark:to-zinc-800/80 border border-red-200/80 dark:border-zinc-700 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                          >
                            {mediaUrl ? (
                              isVideo ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                  <FleetIcons.Video className="w-4 h-4 text-red-500" />
                                </div>
                              ) : (
                                <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                              )
                            ) : (
                              <FleetIcons.Siren className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs md:max-w-sm">
                            <Link
                              to={`/superadmin/emergency-approvals/${b.id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 truncate block text-xs sm:text-sm cursor-pointer"
                              title={b.headline || b.title}
                            >
                              {b.headline || b.title || 'Emergency Advisory'}
                            </Link>
                            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 font-bold truncate mt-0.5">
                              {b.code || `EMG-${b.id}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Target & Authority (Combined & Compact) */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {b.target_area || (b.target_scope === 'all' ? 'All Displays (Network)' : 'Targeted Fleet')}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[150px]">
                          {b.issued_by || 'Govt Authority'}
                          {b.affected_buses_count != null ? ` · ${b.affected_buses_count} scr.` : ''}
                        </p>
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${sev.badge}`}>
                          {sev.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${ui.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span>
                          {ui.short}
                        </span>
                      </td>

                      {/* Actions (Compact: Approve/Revoke + 3-dots button, no standalone view) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {status === 'pending_approval' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleApprove(b.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                              <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                              <span>{t('superadmin.emergency.btn_approve', 'Approve')}</span>
                            </button>
                          )}

                          {status === 'approved' && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setRevokingItem(b)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                              <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
                              <span>{t('superadmin.emergency.btn_revoke', 'Revoke')}</span>
                            </button>
                          )}

                          {/* 3-Dots Button */}
                          <button
                            type="button"
                            data-action-menu
                            onClick={(e) => toggleActionMenu(e, b, true)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                              activeMenu?.id === `table-${b.id}`
                                ? 'border-red-500 bg-red-50 dark:bg-zinc-800 text-red-600 dark:text-red-400'
                                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                            }`}
                            title={t('superadmin.emergency.title_more_options', 'More options')}
                          >
                            <FleetIcons.MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {totalItems > 0 && (
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      )}

      {/* GLOBAL FLOATING 3-DOTS ACTION MENU (PREVENTS OVERFLOW CLIPPING) */}
      {activeMenu && (
        <div
          data-action-menu
          style={{
            position: 'fixed',
            top: activeMenu.coords.top != null ? `${activeMenu.coords.top}px` : 'auto',
            bottom: activeMenu.coords.bottom != null ? `${activeMenu.coords.bottom}px` : 'auto',
            right: `${Math.max(12, activeMenu.coords.right)}px`,
            zIndex: 9999,
          }}
          className="w-52 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95"
        >
          <Link
            to={`/superadmin/emergency-approvals/${activeMenu.item.id}`}
            onClick={() => setActiveMenu(null)}
            className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-left text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('superadmin.emergency.btn_view_details', 'View Details')}</span>
          </Link>

          {(activeMenu.item.status || 'pending_approval') === 'pending_approval' && (
            <>
              <button
                type="button"
                disabled={busyId === activeMenu.item.id}
                onClick={() => {
                  const id = activeMenu.item.id;
                  setActiveMenu(null);
                  handleApprove(id);
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('superadmin.emergency.btn_approve_live', 'Approve Live')}</span>
              </button>

              <button
                type="button"
                disabled={busyId === activeMenu.item.id}
                onClick={() => {
                  const item = activeMenu.item;
                  setActiveMenu(null);
                  setRejectingItem(item);
                  setRejectReason('Incomplete advisory specifications');
                }}
                className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <FleetIcons.Close className="w-3.5 h-3.5 text-rose-600" />
                <span>{t('superadmin.emergency.btn_reject_advisory', 'Reject Advisory')}</span>
              </button>
            </>
          )}

          {activeMenu.item.status === 'approved' && (
            <button
              type="button"
              disabled={busyId === activeMenu.item.id}
              onClick={() => {
                const item = activeMenu.item;
                setActiveMenu(null);
                setRevokingItem(item);
              }}
              className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FleetIcons.Close className="w-3.5 h-3.5 text-rose-600" />
              <span>{t('superadmin.emergency.btn_revoke_broadcast', 'Revoke Broadcast')}</span>
            </button>
          )}
        </div>
      )}

      {/* DETAIL MODAL (VIEW DETAILS) */}
      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-4 sm:p-7 space-y-6 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-md">
                    {detailItem.code || `EMG-${detailItem.id}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_UI[detailItem.status || 'pending_approval']?.cls}`}>
                    {STATUS_UI[detailItem.status || 'pending_approval']?.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${SEVERITY_CONFIG[(detailItem.severity || 'high').toLowerCase()]?.badge}`}>
                    {detailItem.severity || 'HIGH'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {detailItem.headline || detailItem.title || 'Emergency Advisory'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-zinc-800 transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Media Attachment Preview */}
            {(() => {
              const modalMediaUrl = resolveFileUrl(detailItem.media_url || detailItem.mediaUrl);
              const isVideo = detailItem.media_type === 'video' || detailItem.mediaType === 'video' || (modalMediaUrl && /\.(mp4|webm|mov|mkv)/i.test(modalMediaUrl));

              return modalMediaUrl ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Broadcast Visual Creative ({isVideo ? 'Video' : 'Image'})
                  </p>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center max-h-72">
                    {isVideo ? (
                      <video src={modalMediaUrl} controls className="w-full max-h-72 object-contain" />
                    ) : (
                      <img src={modalMediaUrl} alt="" className="w-full max-h-72 object-contain" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-center">
                  <p className="text-xs font-bold text-slate-600 dark:text-zinc-300">{t('superadmin.emergency.no_media_asset', 'No media asset attached')}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('superadmin.emergency.no_media_desc', 'Advisory displays high-contrast passenger text banners and urgent bottom ticker on transit displays.')}</p>
                </div>
              );
            })()}

            {/* Alert Message Box */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Advisory Message On Screens
              </p>
              <div className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-slate-800 dark:text-zinc-200 text-sm leading-relaxed font-medium">
                {detailItem.body_text || detailItem.message || '—'}
              </div>
            </div>

            {/* Ticker Text */}
            {detailItem.ticker_text && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Bottom Marquee Ticker
                </p>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-mono text-red-600 dark:text-red-400 font-bold">
                  {detailItem.ticker_text}
                </div>
              </div>
            )}

            {/* Key Parameters Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.target_scope', 'Target Scope')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.target_scope === 'all' ? 'All Displays (Network)' : 'Specific Fleet Routes'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.target_corridor', 'Target Corridor')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.target_area || 'Entire City'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.issued_authority', 'Issued Authority')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.issued_by || 'Government'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.siren_sound', 'Siren Sound')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.siren_sound ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.push_notification', 'Push Notification')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.push_notification ? 'Dispatched' : 'None'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.emergency.affected_screens', 'Affected Screens')}</p>
                <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                  {detailItem.affected_buses_count != null ? `${detailItem.affected_buses_count} Active` : 'All Online'}
                </p>
              </div>
            </div>

            {/* Rejection Reason if Rejected */}
            {detailItem.status === 'rejected' && detailItem.rejection_reason && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 text-xs text-rose-700 dark:text-rose-300">
                <p className="font-bold uppercase tracking-wider text-[10px]">{t('superadmin.emergency.rejection_reason', 'Rejection Reason')}</p>
                <p className="mt-1 font-medium">{detailItem.rejection_reason}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>

              {(detailItem.status || 'pending_approval') === 'pending_approval' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingItem(detailItem);
                      setRejectReason('Incomplete advisory specifications');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold cursor-pointer"
                  >
                    Reject Advisory
                  </button>

                  <button
                    type="button"
                    disabled={busyId === detailItem.id}
                    onClick={() => handleApprove(detailItem.id)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FleetIcons.Check className="w-4 h-4 text-white" />
                    <span>{t('superadmin.emergency.btn_approve_and_broadcast', 'Approve & Broadcast')}</span>
                  </button>
                </>
              )}

              {detailItem.status === 'approved' && (
                <button
                  type="button"
                  disabled={busyId === detailItem.id}
                  onClick={() => setRevokingItem(detailItem)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FleetIcons.Close className="w-4 h-4 text-white" />
                  <span>{t('superadmin.emergency.btn_revoke_broadcast', 'Revoke Broadcast')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT CONFIRMATION MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FleetIcons.Alert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{t('superadmin.emergency.modal_reject_title', 'Reject Emergency Broadcast')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Advisory: {rejectingItem.code}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              Select or provide reason for rejecting this government broadcast advisory:
            </p>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Incomplete advisory specifications',
                  'Incorrect target corridor / route scope',
                  'Duplicate broadcast submission',
                  'Expired civil advisory event',
                ].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                      rejectReason === r
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('superadmin.emergency.ph_remarks', 'Remarks...')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === rejectingItem.id}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE CONFIRMATION MODAL */}
      {revokingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FleetIcons.Close className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">{t('superadmin.emergency.modal_revoke_title', 'Revoke Emergency Broadcast')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Advisory: {revokingItem.code}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
              Are you sure you want to revoke this emergency override? Normal commercial campaigns and ad loops will immediately resume on all transit screens.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokingItem(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer"
              >
                Keep Active
              </button>
              <button
                type="button"
                disabled={busyId === revokingItem.id}
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
              >
                Yes, Revoke Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperEmergencyApprovalsPage;

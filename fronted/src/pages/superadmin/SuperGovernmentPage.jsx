import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperGovernment } from '../../hooks/superadmin/useSuperGovernment';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const SuperGovernmentPage = () => {
  const { t } = useTranslation();
  const { impersonateUser } = useAuth();
  const navigate = useNavigate();
  const { agencies, loading, pagination, loadAgencies, updateStatus, deleteAgency } = useSuperGovernment();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [fetchError, setFetchError] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAgencies = useCallback(async () => {
    setFetchError(null);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'All') {
        params.status = statusFilter.toLowerCase();
      }
      await loadAgencies(params);
    } catch (err) {
      setFetchError(err?.message || 'Failed to load government agencies.');
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, loadAgencies]);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAgencies();
      toast.success('Agencies list refreshed!');
    } catch {
      toast.error('Failed to refresh agencies.');
    } finally {
      setRefreshing(false);
    }
  };

  const agencyList = agencies || [];

  // KPIs: prefer server-computed global stats; fallback to current page slice
  const stats = pagination?.stats;
  const totalAgencies = stats?.total ?? (pagination?.total ?? agencyList.length);
  const activeCount = stats?.active ?? agencyList.filter((a) => (a.status || a.user?.status) === 'active').length;
  const pendingCount = stats?.pending ?? agencyList.filter((a) => (a.status || a.user?.status) === 'pending_approval').length;
  const suspendedCount = stats?.suspended ?? agencyList.filter((a) => (a.status || a.user?.status) === 'suspended').length;
  const emergencyClearanceCount = stats?.emergency ?? agencyList.filter((a) => a.emergency_override || (a.clearance_level && a.clearance_level.toLowerCase().includes('emergency'))).length;

  // Close 3-dot actions menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-actions-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleImpersonate = async (agency) => {
    const userId = agency.user_id || agency.user?.id;
    if (!userId) {
      toast.error('Linked user credentials not provisioned for this agency.');
      return;
    }
    const agencyName = agency.agency_name || agency.name || 'Government Agency';
    if (impersonatingId) return;
    setImpersonatingId(agency.id);
    try {
      await toast.promise(
        impersonateUser(userId).then(() => {
          navigate('/government/dashboard');
        }),
        {
          loading: `Connecting to ${agencyName} agency console…`,
          success: `Logged in as Government Authority ${agencyName}!`,
          error: (e) => e.message || `Failed to impersonate ${agencyName}.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleApprove = async (agency) => {
    try {
      await toast.promise(
        updateStatus(agency.id, 'active').then(() => fetchAgencies()),
        {
          loading: 'Authorizing government agency…',
          success: 'Government Agency authorized & active!',
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch (_) {}
  };

  const handleReject = async (agency) => {
    const reason = prompt('Please enter reason for rejecting agency authorization:');
    if (reason === null) return;
    try {
      await toast.promise(
        updateStatus(agency.id, 'rejected').then(() => fetchAgencies()),
        {
          loading: 'Rejecting government agency authorization…',
          success: 'Agency authorization rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch (_) {}
  };

  const handleToggleStatus = async (agency) => {
    const currentStatus = agency.status || agency.user?.status || 'active';
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(agency.id, nextStatus).then(() => fetchAgencies()),
        {
          loading: 'Updating government agency status...',
          success: `Agency ${nextStatus === 'active' ? 'activated' : 'suspended'}!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteAgency = async (agency) => {
    const name = agency.agency_name || agency.name || 'Government Agency';
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? All emergency broadcast override authorizations and documents will be revoked.`)) {
      return;
    }
    try {
      await toast.promise(
        deleteAgency(agency.id).then(() => fetchAgencies()),
        {
          loading: 'Deleting government agency...',
          success: 'Government agency deleted!',
          error: (err) => err?.message || 'Failed to delete agency.',
        }
      );
    } catch (_) {}
  };


  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t('nav.superadmin'), href: '/superadmin/dashboard', icon: FleetIcons.Dashboard },
          { label: t('superadmin.government.title') }
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.government.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.government.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title={t('superadmin.government.refresh_title')}
          />

          <Link
            to="/superadmin/government/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('superadmin.government.add_agency')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (4 Cards with true global server counts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.government.total_agencies')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalAgencies}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('superadmin.government.active')}</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">{t('superadmin.government.suspended')}</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{suspendedCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('superadmin.government.emergency_override')}</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{emergencyClearanceCount}</div>
        </div>
      </div>

      {/* Search and Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('superadmin.government.search_ph')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
            >
              <FleetIcons.Close className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1">
            {[
              { id: 'All', label: t('superadmin.government.status_all') },
              { id: 'Active', label: t('superadmin.government.status_active') },
              { id: 'Suspended', label: t('superadmin.government.status_suspended') }
            ].map(({ id: status, label }) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs text-red-700 dark:text-red-300 font-bold">{fetchError}</p>
          <button
            onClick={fetchAgencies}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Government Agencies Roster: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">{t('superadmin.government.col_agency')}</th>
                  <th className="py-3 px-4">{t('superadmin.government.col_department')}</th>
                  <th className="py-3 px-4">{t('superadmin.government.col_officer')}</th>
                  <th className="py-3 px-4">{t('superadmin.government.col_email_phone')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('common.status') || 'Status'}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-gov-${i}`} className="animate-pulse">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800"></div>
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : agencyList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FleetIcons.Building className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                        <span>{t('superadmin.government.no_agencies')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  agencyList.map((agency, idx) => {
                    const isNearBottom = idx >= Math.max(0, agencyList.length - 2) && agencyList.length > 2;
                    const agencyName = agency.agency_name || agency.name || '—';
                    const dept = agency.department || '—';
                    const officer = agency.contact_name || agency.user?.name || agency.name || '—';
                    const email = agency.user?.email || agency.email || '—';
                    const phone = agency.user?.phone || agency.phone || '—';
                    const enrollment = agency.user?.enrollment_no || agency.code || `GOV-${agency.id}`;
                    const status = agency.status || agency.user?.status || 'active';
                    const isAct = status.toLowerCase() === 'active';

                    return (
                      <tr key={agency.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-xs overflow-hidden shrink-0">
                              {agency.user?.avatar_url || agency.avatar_url || agency.logo_url || agency.emblem_url || agency.user?.avatarUrl || agency.avatarUrl || agency.logoUrl || agency.emblemUrl ? (
                                <img
                                  src={getMediaUrl(agency.user?.avatar_url || agency.avatar_url || agency.logo_url || agency.emblem_url || agency.user?.avatarUrl || agency.avatarUrl || agency.logoUrl || agency.emblemUrl)}
                                  alt={agencyName}
                                  className="w-full h-full object-contain p-0.5"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <FleetIcons.Building className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => navigate(`/superadmin/government/${agency.id}`)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors text-left block"
                              >
                                {agencyName}
                              </button>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{enrollment}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-zinc-300">
                          {dept}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {officer}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 dark:text-zinc-200 font-medium">{email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{phone}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                            isAct
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                          }`}>
                            {status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end">
                            {/* Vertical 3 dots menu */}
                            <div className="relative inline-block text-left" data-actions-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === agency.id ? null : agency.id);
                                }}
                                title={t('superadmin.government.more_actions')}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  activeMenuId === agency.id
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <FleetIcons.MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === agency.id && (
                                <div
                                  className={`absolute right-0 ${
                                    isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                  } w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                                >
                                  <div className="py-1">
                                    {/* View Details */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        navigate(`/superadmin/government/${agency.id}`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('superadmin.government.view_details')}</span>
                                    </button>
                                    {/* Impersonate */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleImpersonate(agency);
                                      }}
                                      disabled={impersonatingId === agency.id}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {impersonatingId === agency.id ? (
                                        <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      )}
                                      <span>{t('superadmin.government.impersonate')}</span>
                                    </button>

                                    {/* Approve Agency */}
                                    {((agency.status || agency.user?.status) === 'pending_approval' || (agency.status || agency.user?.status) === 'rejected') && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuId(null);
                                          handleApprove(agency);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t('superadmin.government.approve_agency')}</span>
                                      </button>
                                    )}

                                    {/* Reject Agency */}
                                    {(agency.status || agency.user?.status) === 'pending_approval' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuId(null);
                                          handleReject(agency);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>{t('superadmin.government.reject_agency')}</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="py-1">
                                    {/* Suspend / Activate */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleToggleStatus(agency);
                                      }}
                                      className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                        isAct
                                          ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                      }`}
                                    >
                                      {isAct ? (
                                        <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      )}
                                      <span>{isAct ? 'Suspend' : 'Activate'}</span>
                                    </button>

                                    {/* Edit Agency */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        navigate(`/superadmin/government/${agency.id}/edit`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('superadmin.government.edit_agency')}</span>
                                    </button>

                                    {/* Delete Agency */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        handleDeleteAgency(agency);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>{t('superadmin.government.delete_agency')}</span>
                                    </button>
                                  </div>
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
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={`skel-gov-card-${i}`} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : agencyList.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <div className="flex flex-col items-center justify-center gap-2">
            <FleetIcons.Building className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
            <span>{t('superadmin.government.no_agencies')}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencyList.map((agency) => {
            const agencyName = agency.agency_name || agency.name || '—';
            const dept = agency.department || '—';
            const officer = agency.contact_name || agency.user?.name || agency.name || '—';
            const email = agency.user?.email || agency.email || '—';
            const phone = agency.user?.phone || agency.phone || '—';
            const enrollment = agency.user?.enrollment_no || agency.code || `GOV-${agency.id}`;
            const jurisdiction = agency.jurisdiction || agency.authorized_city || '—';
            const status = agency.status || agency.user?.status || 'active';
            const isAct = status.toLowerCase() === 'active';

            return (
              <div key={agency.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-xl overflow-hidden shrink-0">
                      {agency.user?.avatar_url || agency.avatar_url || agency.logo_url || agency.emblem_url || agency.user?.avatarUrl || agency.avatarUrl || agency.logoUrl || agency.emblemUrl ? (
                        <img
                          src={getMediaUrl(agency.user?.avatar_url || agency.avatar_url || agency.logo_url || agency.emblem_url || agency.user?.avatarUrl || agency.avatarUrl || agency.logoUrl || agency.emblemUrl)}
                          alt={agencyName}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <FleetIcons.Building className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate(`/superadmin/government/${agency.id}`)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1 text-left block"
                      >
                        {agencyName}
                      </button>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{enrollment}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 uppercase tracking-wider ${
                      isAct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.government.col_department')}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">{dept}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.government.col_officer')}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{officer}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.government.jurisdiction_label')}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <FleetIcons.Pin className="w-3 h-3 shrink-0" />
                      <span>{jurisdiction}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.government.official_email_label')}</span>
                    <span className="truncate max-w-[180px] text-slate-700 dark:text-zinc-300">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">{t('superadmin.government.clearance_label')}</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 whitespace-nowrap">
                      <FleetIcons.Shield className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>{agency.clearance_level || '—'}</span>
                    </span>
                  </div>
                </div>


                {/* Eye button & 3-dot dropdown on Card */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/superadmin/government/${agency.id}`)}
                    title={t('superadmin.government.view_details')}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <FleetIcons.Eye className="w-3.5 h-3.5" />
                    <span>{t('superadmin.government.view_details')}</span>
                  </button>

                  <div className="relative" data-actions-menu>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === agency.id ? null : agency.id);
                      }}
                      title={t('superadmin.government.more_actions')}
                      className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                        activeMenuId === agency.id
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <FleetIcons.MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === agency.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              navigate(`/superadmin/government/${agency.id}`);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{t('superadmin.government.view_details')}</span>
                          </button>
                          {/* Impersonate */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleImpersonate(agency);
                            }}
                            disabled={impersonatingId === agency.id}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {impersonatingId === agency.id ? (
                              <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            <span>{t('superadmin.government.impersonate')}</span>
                          </button>

                          {/* Approve Agency */}
                          {((agency.status || agency.user?.status) === 'pending_approval' || (agency.status || agency.user?.status) === 'rejected') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleApprove(agency);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{t('superadmin.government.approve_agency')}</span>
                            </button>
                          )}

                          {/* Reject Agency */}
                          {(agency.status || agency.user?.status) === 'pending_approval' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleReject(agency);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>{t('superadmin.government.reject_agency')}</span>
                            </button>
                          )}
                        </div>

                        <div className="py-1">
                          {/* Suspend / Activate */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleToggleStatus(agency);
                            }}
                            className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isAct
                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                            }`}
                          >
                            {isAct ? (
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span>{isAct ? 'Suspend' : 'Activate'}</span>
                          </button>

                          {/* Edit Agency */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              navigate(`/superadmin/government/${agency.id}/edit`);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{t('superadmin.government.edit_agency')}</span>
                          </button>

                          {/* Delete Agency */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleDeleteAgency(agency);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{t('superadmin.government.delete_agency')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Pagination */}
      <div className="p-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
        <Pagination
          currentPage={pagination?.page || currentPage}
          totalPages={pagination?.totalPages || 1}
          totalItems={pagination?.total ?? agencyList.length}
          pageSize={pagination?.limit || pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 10, 20, 50]}
        />
      </div>
    </div>
  );
};

export default SuperGovernmentPage;


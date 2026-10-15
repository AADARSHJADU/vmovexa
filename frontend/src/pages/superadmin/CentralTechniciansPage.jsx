import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { useDashboard } from '../../hooks/superadmin/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { TechnicianDetailsPage } from './TechnicianDetailsPage';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

const techCity = (t) => t.technicianProfile?.base_city || t.baseCity || t.city || t.organization?.city || '';
const techCert = (t) => t.technicianProfile?.cert_level || t.certLevel || t.role?.name || '';
const techStatus = (t) => String(t.status || 'active');
const isAvailable = (t) => {
  const s = techStatus(t).toLowerCase();
  return s.includes('avail') || s === 'active';
};
const isOnSite = (t) => {
  const s = techStatus(t).toLowerCase();
  return s.includes('assign') || s.includes('on site') || s.includes('deployed');
};

export const CentralTechniciansPage = () => {
  const { t } = useTranslation();
  const { impersonateUser } = useAuth();
  const navigate = useNavigate();
  const { centralTechnicians, loading, pagination, loadCentralTechnicians, updateStatus, deleteTechnician } = useSuperTechnician();
  const { superAdminKpis, loadSuperAdminKpis } = useDashboard();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card' - Default to table/list view
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [fetchError, setFetchError] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map active tab to server query parameters
  const tabFilterParams = useMemo(() => {
    if (activeTab === 'Available') return { status: 'active' };
    if (activeTab === 'On Site') return { profileStatus: 'on_site' };
    if (activeTab === 'Suspended') return { status: 'suspended' };
    return {};
  }, [activeTab]);

  const fetchTechs = useCallback(async () => {
    setFetchError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...tabFilterParams,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      await loadCentralTechnicians(params);
    } catch (err) {
      setFetchError(err?.message || 'Failed to load central technicians.');
    }
  }, [currentPage, itemsPerPage, debouncedSearch, tabFilterParams, loadCentralTechnicians]);

  useEffect(() => {
    fetchTechs();
  }, [fetchTechs]);

  useEffect(() => {
    loadSuperAdminKpis().catch(() => {});
  }, [loadSuperAdminKpis]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchTechs(),
        loadSuperAdminKpis(),
      ]);
      toast.success('Technicians list refreshed!');
    } catch {
      toast.error('Failed to refresh technicians.');
    } finally {
      setRefreshing(false);
    }
  };

  const techsList = centralTechnicians || [];
  const globalKpis = superAdminKpis || {};

  // Stat metrics
  const totalCount = pagination?.total ?? techsList.length;
  const availableCount = techsList.filter(isAvailable).length;
  const onSiteCount = techsList.filter(isOnSite).length;
  const suspendedCount = techsList.filter((t) => techStatus(t) === 'suspended').length;

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

  const handleImpersonate = async (tech) => {
    if (impersonatingId) return;
    setImpersonatingId(tech.id);
    try {
      await toast.promise(
        impersonateUser(tech.id).then(() => {
          navigate('/technician/dashboard');
        }),
        {
          loading: `Connecting to ${tech.name} technician console…`,
          success: `Logged in as Technician ${tech.name}!`,
          error: (e) => e.message || `Failed to impersonate technician ${tech.name}.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleApprove = async (tech) => {
    try {
      await toast.promise(
        updateStatus(tech.id, 'active').then(() => fetchTechs()),
        {
          loading: 'Approving technician…',
          success: 'Technician approved & active!',
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch (_) {}
  };

  const handleReject = async (tech) => {
    const reason = prompt('Please enter reason for rejecting technician authorization:');
    if (reason === null) return;
    try {
      await toast.promise(
        updateStatus(tech.id, 'rejected').then(() => fetchTechs()),
        {
          loading: 'Rejecting technician…',
          success: 'Technician rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch (_) {}
  };

  const handleToggleStatus = async (tech) => {
    const nextStatus = isAvailable(tech) ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(tech.id, nextStatus).then(() => fetchTechs()),
        {
          loading: 'Updating technician status…',
          success: `Technician ${nextStatus === 'active' ? 'activated' : 'suspended'}!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteTechnician = async (tech) => {
    if (!window.confirm(`Are you sure you want to permanently delete technician "${tech.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await toast.promise(
        deleteTechnician(tech.id).then(() => fetchTechs()),
        {
          loading: 'Deleting technician...',
          success: 'Technician deleted successfully!',
          error: (err) => err?.message || 'Failed to delete technician.',
        }
      );
    } catch (_) {}
  };

  const filterTabs = [
    { key: 'All', label: 'All', count: totalCount },
    { key: 'Available', label: 'Available', count: availableCount },
    { key: 'On Site', label: 'On Site', count: onSiteCount },
    { key: 'Suspended', label: 'Suspended', count: suspendedCount },
  ];

  // Inline detail overlay mode (no URL navigation, no ID in URL)
  if (selectedTechnician) {
    return (
      <div className="w-full">
        <TechnicianDetailsPage
          tech={selectedTechnician}
          onClose={() => setSelectedTechnician(null)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Technicians</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Technicians
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage field engineers and technicians assigned to fleet maintenance and hardware support.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title="Refresh technicians list"
          />

          <Link
            to="/superadmin/technicians/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Technicians</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Available</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {availableCount}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">On Site</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {onSiteCount}
          </div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Suspended</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {suspendedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search & View Toggle */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.key ? 'bg-slate-700 dark:bg-blue-700 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('technician.search_placeholder', 'Search technician, city, skill...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center space-y-2">
          <p className="text-xs text-red-700 dark:text-red-300 font-bold">{fetchError}</p>
          <button
            onClick={fetchTechs}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Technicians List / Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Skill / Role</th>
                  <th className="py-3 px-4">Current Assignment</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={`skel-t-row-${i}`} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-3.5 px-4"><div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-3.5 px-4 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : techsList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl">🔧</span>
                        <span>{t('common.no_data', 'No central technicians found.')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  techsList.map((tech, idx) => {
                    const isNearBottom = idx >= Math.max(0, techsList.length - 2) && techsList.length > 2;
                    return (
                    <tr key={tech.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-zinc-300 text-xs overflow-hidden">
                            {tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || tech.technicianProfile?.avatar_url ? (
                              <img
                                src={getMediaUrl(tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || tech.technicianProfile?.avatar_url)}
                                alt={tech.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerText = String(tech.name || '?').charAt(0).toUpperCase();
                                  }
                                }}
                              />
                            ) : (
                              String(tech.name || '?').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{tech.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{tech.code || tech.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-zinc-300">
                        {techCity(tech) || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          {techCert(tech) || 'Technician'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-blue-600 dark:text-blue-400">
                        {typeof tech.currentAssignment === 'object' && tech.currentAssignment !== null
                          ? `${tech.currentAssignment.tenantName || 'Assigned'} (${tech.currentAssignment.jobType || 'Job'})`
                          : (tech.currentAssignment || 'Available')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-zinc-300">
                        {tech.phone || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isAvailable(tech)
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isAvailable(tech) ? 'Available' : isOnSite(tech) ? 'On Site' : techStatus(tech)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye / View icon in Table View */}
                          <button
                            type="button"
                            onClick={() => setSelectedTechnician(tech)}
                            title="View Technician Details"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-4 h-4" />
                          </button>

                          {/* Vertical 3 dots menu */}
                          <div className="relative inline-block text-left" data-actions-menu>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === tech.id ? null : tech.id);
                              }}
                              title="More Actions"
                              className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                activeMenuId === tech.id
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                              }`}
                            >
                              <FleetIcons.MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === tech.id && (
                              <div
                                className={`absolute right-0 ${
                                  isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                } w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                              >
                                <div className="py-1">
                                  {/* Edit Profile */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      navigate(`/superadmin/technicians/${tech.id}/edit`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>Edit Profile</span>
                                  </button>

                                  {/* Impersonate */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleImpersonate(tech);
                                    }}
                                    disabled={impersonatingId === tech.id}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {impersonatingId === tech.id ? (
                                      <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    )}
                                    <span>Impersonate</span>
                                  </button>

                                  {/* Approve */}
                                </div>

                                <div className="py-1">
                                  {/* Suspend / Activate */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleToggleStatus(tech);
                                    }}
                                    className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                      isAvailable(tech)
                                        ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                        : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                    }`}
                                  >
                                    {isAvailable(tech) ? (
                                      <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    <span>{isAvailable(tech) ? 'Suspend' : 'Activate'}</span>
                                  </button>

                                  {/* Assign Work Order */}
                                  <Link
                                    to={`/superadmin/technicians/assign?techId=${tech.id}`}
                                    className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    <span>Assign Work Order</span>
                                  </Link>

                                  {/* Delete Technician */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleDeleteTechnician(tech);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>Delete Technician</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );})
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <div key={`skel-t-${i}`} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
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
      ) : techsList.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🔧</span>
            <span>{t('common.no_data', 'No central technicians found.')}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {techsList.map((tech) => (
            <div key={tech.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 text-slate-500 dark:text-zinc-400 font-black overflow-hidden">
                    {tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || tech.technicianProfile?.avatar_url ? (
                      <img
                        src={getMediaUrl(tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || tech.technicianProfile?.avatar_url)}
                        alt={tech.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerText = String(tech.name || '?').charAt(0).toUpperCase();
                          }
                        }}
                      />
                    ) : (
                      String(tech.name || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tech.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      <span className="font-mono">{tech.code || tech.id}</span>
                      {techCity(tech) && (<><span>·</span><span>📍 {techCity(tech)}</span></>)}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                    isAvailable(tech)
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {isAvailable(tech) ? t('technician.tab_available', 'Available') : isOnSite(tech) ? t('technician.tab_on_site', 'On Site') : techStatus(tech)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span className="text-slate-400 dark:text-zinc-500">Skill / Role:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{techCert(tech) || 'Technician'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span className="text-slate-400 dark:text-zinc-500">Current Assignment:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {typeof tech.currentAssignment === 'object' && tech.currentAssignment !== null
                      ? `${tech.currentAssignment.tenantName || 'Assigned'} (${tech.currentAssignment.jobType || 'Job'})`
                      : (tech.currentAssignment || 'Available')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span className="text-slate-400 dark:text-zinc-500">Phone:</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{tech.phone || '—'}</span>
                </div>
              </div>

              {/* Eye button & 3-dot dropdown on Card */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTechnician(tech)}
                  title="View Details"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <FleetIcons.Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="relative" data-actions-menu>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === tech.id ? null : tech.id);
                    }}
                    title="More Actions"
                    className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                      activeMenuId === tech.id
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    <FleetIcons.MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === tech.id && (
                    <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
                      <div className="py-1">
                        {/* Edit Profile */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            navigate(`/superadmin/technicians/${tech.id}/edit`);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Edit Profile</span>
                        </button>

                        {/* Impersonate */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            handleImpersonate(tech);
                          }}
                          disabled={impersonatingId === tech.id}
                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {impersonatingId === tech.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                          <span>Impersonate</span>
                        </button>

                      </div>

                      <div className="py-1">
                        {/* Suspend / Activate */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            handleToggleStatus(tech);
                          }}
                          className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isAvailable(tech)
                              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                          }`}
                        >
                          {isAvailable(tech) ? (
                            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span>{isAvailable(tech) ? 'Suspend' : 'Activate'}</span>
                        </button>

                        {/* Assign Work Order */}
                        <Link
                          to={`/superadmin/technicians/assign?techId=${tech.id}`}
                          className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2.5 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span>Assign Work Order</span>
                        </Link>

                        {/* Delete Technician */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            handleDeleteTechnician(tech);
                          }}
                          className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Delete Technician</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Global Pagination Component */}
      <Pagination
        currentPage={pagination?.page || currentPage}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total ?? techsList.length}
        pageSize={pagination?.limit || itemsPerPage}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />
    </div>
  );
};

export default CentralTechniciansPage;

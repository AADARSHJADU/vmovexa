import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperFinanceOfficer } from '../../hooks/superadmin/useSuperFinanceOfficer';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { FinanceOfficerDetailsPage } from './FinanceOfficerDetailsPage';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const SuperFinanceOfficersPage = () => {
  const { t } = useTranslation();
  const { impersonateUser, hasPermission } = useAuth();
  const canImpersonate = hasPermission('platform.impersonate');
  const navigate = useNavigate();
  const { financeOfficers, loading, pagination, loadFinanceOfficers, updateStatus, deleteFinanceOfficer } = useSuperFinanceOfficer();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
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

  const fetchOfficers = useCallback(async () => {
    setFetchError(null);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'All') params.status = statusFilter.toLowerCase();
      await loadFinanceOfficers(params);
    } catch (err) {
      setFetchError(err?.message || 'Failed to load finance officers.');
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, loadFinanceOfficers]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOfficers();
      toast.success('Finance officers list refreshed!');
    } catch {
      toast.error('Failed to refresh finance officers.');
    } finally {
      setRefreshing(false);
    }
  };

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

  const officerList = financeOfficers || [];

  // KPIs
  const totalOfficers = pagination?.total ?? officerList.length;
  const activeCount = officerList.filter((o) => (o.status || 'active') === 'active').length;
  const suspendedCount = officerList.filter((o) => (o.status || 'active') === 'suspended').length;
  const activeRate = totalOfficers > 0 ? Math.round((activeCount / totalOfficers) * 100) : 100;

  const handleImpersonate = async (officer) => {
    const userId = officer.id;
    const officerName = officer.name || 'Finance Officer';
    if (impersonatingId) return;
    setImpersonatingId(officer.id);
    try {
      await toast.promise(
        impersonateUser(userId).then(() => {
          navigate('/finance/dashboard');
        }),
        {
          loading: `Connecting to ${officerName} finance console…`,
          success: `Logged in as Finance Officer ${officerName}!`,
          error: (e) => e.message || `Failed to impersonate ${officerName}.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleApprove = async (officer) => {
    try {
      await toast.promise(
        updateStatus(officer.id, 'active').then(() => fetchOfficers()),
        {
          loading: 'Authorizing finance officer clearance…',
          success: 'Finance Officer authorized & active!',
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch (_) {}
  };

  const handleReject = async (officer) => {
    const reason = prompt('Please enter reason for rejecting finance officer authorization:');
    if (reason === null) return;
    try {
      await toast.promise(
        updateStatus(officer.id, 'rejected').then(() => fetchOfficers()),
        {
          loading: 'Rejecting finance officer authorization…',
          success: 'Finance officer authorization rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch (_) {}
  };

  const handleToggleStatus = async (officer) => {
    const currentStatus = officer.status || 'active';
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(officer.id, nextStatus).then(() => fetchOfficers()),
        {
          loading: 'Updating officer authority status...',
          success: `Finance Officer ${nextStatus === 'active' ? 'reactivated' : 'suspended'} successfully!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteOfficer = async (officer) => {
    if (!window.confirm(`Are you sure you want to delete Finance Officer "${officer.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await toast.promise(
        deleteFinanceOfficer(officer.id).then(() => fetchOfficers()),
        {
          loading: 'Deleting finance officer...',
          success: 'Finance Officer deleted successfully!',
          error: (err) => err?.message || 'Failed to delete finance officer.',
        }
      );
    } catch (_) {}
  };

  // Detail view overlay mode
  if (selectedOfficer) {
    return (
      <div className="w-full">
        <FinanceOfficerDetailsPage
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
          onStatusChange={fetchOfficers}
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
        <span className="text-slate-900 dark:text-white font-bold">Finance Officers</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Finance Officers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage platform finance personnel, treasury controllers, and audit officers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title="Refresh finance officers list"
          />

          <Link
            to="/superadmin/finance/new"
            className="px-4 py-2.5 bg-gradient-to-r from-[#1C68FD] via-indigo-600 to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-lg hover:shadow-[#DA29F4]/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Add Finance Officer</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Total Officers
            </span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Profile className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{totalOfficers}</div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Total accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active
            </span>
            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Authorized active</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Suspended
            </span>
            <span className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
              <FleetIcons.Security className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">{suspendedCount}</div>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400">Access revoked</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Active Rate
            </span>
            <span className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FleetIcons.Reports className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{activeRate}%</div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Operational ratio</p>
        </div>
      </div>

      {/* Toolbar (Search, Filter, View Toggles) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <FleetIcons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search officer, email, enrollment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-[#11141d] rounded-2xl border border-slate-200 dark:border-zinc-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading corporate finance officers...</p>
        </div>
      ) : fetchError ? (
        <div className="p-8 text-center bg-white dark:bg-[#11141d] rounded-2xl border border-red-200 dark:border-red-900/40 text-red-600">
          <p className="text-xs font-bold">{fetchError}</p>
          <button
            onClick={fetchOfficers}
            className="mt-3 px-3.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500"
          >
            Retry Loading
          </button>
        </div>
      ) : officerList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#11141d] rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
            <FleetIcons.Profile className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">No Finance Officers Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No finance personnel match your search filters.'
              : 'No corporate finance officers are registered yet. Onboard your first officer now.'}
          </p>
          <Link
            to="/superadmin/finance/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1C68FD] via-indigo-600 to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-lg hover:shadow-[#DA29F4]/30 active:scale-[0.99] transition-all"
          >
            <FleetIcons.Plus className="w-3.5 h-3.5" />
            <span>Add Finance Officer</span>
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto min-h-[320px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#11141d] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-800/30">
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role / Clearance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {officerList.map((officer, index) => {
                const isAct = (officer.status || 'active') === 'active';
                const enrollment = officer.enrollment_no || officer.code || `VMX-FN-26-${String(officer.id).padStart(6, '0')}`;
                const title = officer.clearance || officer.role?.name || 'Finance Officer';
                const isNearBottom = officerList.length > 3 && index >= officerList.length - 2;
                const avatar = officer.avatar_url || officer.avatarUrl || officer.user?.avatar_url || officer.user?.avatarUrl;
                return (
                  <tr
                    key={officer.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-slate-200 dark:border-zinc-700">
                          {avatar ? (
                            <img
                              src={getMediaUrl(avatar)}
                              alt={officer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerText = officer.name?.charAt(0).toUpperCase() || 'F';
                                }
                              }}
                            />
                          ) : (
                            officer.name?.charAt(0).toUpperCase() || 'F'
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {officer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate block">
                            {officer.email || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-slate-700 dark:text-zinc-300">
                      {enrollment}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300 font-medium">
                      {officer.phone || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        {title}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isAct
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                        }`}
                      >
                        {isAct ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Eye / View icon in Table View */}
                        <button
                          type="button"
                          onClick={() => setSelectedOfficer(officer)}
                          title="View Officer Details"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-slate-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                        >
                          <FleetIcons.Eye className="w-4 h-4" />
                        </button>

                        {/* Vertical 3 dots menu */}
                        <div className="relative inline-block text-left" data-actions-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === officer.id ? null : officer.id);
                            }}
                            title="More Actions"
                            className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                              activeMenuId === officer.id
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            <FleetIcons.MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === officer.id && (
                            <div
                              className={`absolute right-0 ${
                                isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                              } w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                            >
                              <div className="py-1">
                                {/* Edit Officer */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    navigate(`/superadmin/finance/${officer.id}/edit`);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>Edit Officer</span>
                                </button>

                                {/* Impersonate */}
                                {canImpersonate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleImpersonate(officer);
                                    }}
                                    disabled={impersonatingId === officer.id}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {impersonatingId === officer.id ? (
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
                                )}

                                {/* Approve */}
                              </div>

                              <div className="py-1">
                                {/* Suspend / Activate */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    handleToggleStatus(officer);
                                  }}
                                  className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                    isAct
                                      ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                  }`}
                                >
                                  {isAct ? (
                                    <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  <span>{isAct ? 'Suspend' : 'Activate'}</span>
                                </button>
                              </div>

                              <div className="py-1">
                                {/* Delete Officer */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    handleDeleteOfficer(officer);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                >
                                  <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                  <span>Delete Officer</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {officerList.map((officer) => {
            const isAct = (officer.status || 'active') === 'active';
            const enrollment = officer.enrollment_no || officer.code || `VMX-FN-26-${String(officer.id).padStart(6, '0')}`;
            const title = officer.clearance || officer.role?.name || 'Finance Officer';
            const avatar = officer.avatar_url || officer.avatarUrl || officer.user?.avatar_url || officer.user?.avatarUrl;
            return (
              <div
                key={officer.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-xs border border-slate-200 dark:border-zinc-700">
                      {avatar ? (
                        <img
                          src={getMediaUrl(avatar)}
                          alt={officer.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = officer.name?.charAt(0).toUpperCase() || 'F';
                            }
                          }}
                        />
                      ) : (
                        officer.name?.charAt(0).toUpperCase() || 'F'
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAct
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                      }`}
                    >
                      {isAct ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{officer.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{title}</p>
                    <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">{enrollment}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-1 text-slate-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <FleetIcons.Security className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{officer.email || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FleetIcons.Tracking className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{officer.phone || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedOfficer(officer)}
                    className="flex-1 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-center inline-flex items-center justify-center gap-1.5"
                  >
                    <FleetIcons.Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div className="relative" data-actions-menu>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === officer.id ? null : officer.id);
                      }}
                      title="More Actions"
                      className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                        activeMenuId === officer.id
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <FleetIcons.MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === officer.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                          {/* Edit Officer */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              navigate(`/superadmin/finance/${officer.id}/edit`);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Edit Officer</span>
                          </button>

                          {/* Impersonate */}
                          {canImpersonate && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                handleImpersonate(officer);
                              }}
                              disabled={impersonatingId === officer.id}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {impersonatingId === officer.id ? (
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
                          )}

                        </div>

                        <div className="py-1">
                          {/* Suspend / Activate */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleToggleStatus(officer);
                            }}
                            className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isAct
                                ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {isAct ? (
                              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span>{isAct ? 'Suspend' : 'Activate'}</span>
                          </button>
                        </div>

                        <div className="py-1">
                          {/* Delete Officer */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleDeleteOfficer(officer);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Delete Officer</span>
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

      {/* Pagination Integration */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
            totalItems={pagination.total}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[8, 16, 32, 50]}
          />
        </div>
      )}
    </div>
  );
};

export default SuperFinanceOfficersPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperAdvertiser } from '../../hooks/superadmin/useSuperAdvertiser';
import { useAuth } from '../../hooks/useAuth';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

export const SuperAdvertisersPage = () => {
  const { t } = useTranslation();
  const { impersonateAdvertiser } = useAuth();
  const navigate = useNavigate();
  const { advertisers, loading, pagination, loadAdvertisers, updateStatus, deleteAdvertiser } = useSuperAdvertiser();

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAdvertisers = useCallback(async () => {
    setFetchError(null);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'All') {
        params.status = statusFilter === 'Deactivated' ? 'suspended' : statusFilter.toLowerCase();
      }
      await loadAdvertisers(params);
    } catch (err) {
      setFetchError(err?.message || 'Failed to load commercial advertisers.');
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, loadAdvertisers]);

  useEffect(() => {
    fetchAdvertisers();
  }, [fetchAdvertisers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAdvertisers();
      toast.success('Advertisers list refreshed!');
    } catch {
      toast.error('Failed to refresh advertisers.');
    } finally {
      setRefreshing(false);
    }
  };

  const advList = advertisers || [];

  // KPIs
  const totalAdvertisers = pagination?.total ?? advList.length;
  const activeCount = advList.filter((a) => (a.status || a.user?.status) === 'active').length;
  const deactivatedCount = advList.filter((a) => {
    const s = (a.status || a.user?.status || '').toLowerCase();
    return s === 'suspended' || s === 'deactivated' || s === 'inactive';
  }).length;
  const verifiedCount = advList.filter((a) => a.verified).length;

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

  const handleImpersonate = async (adv) => {
    const companyName = adv.company_name || adv.name || 'Advertiser';
    if (impersonatingId) return;
    setImpersonatingId(adv.id);
    try {
      await toast.promise(
        impersonateAdvertiser(adv.id).then(() => {
          navigate('/advertiser/dashboard');
        }),
        {
          loading: `Connecting to ${companyName} advertiser portal…`,
          success: `Logged in as Advertiser ${companyName}!`,
          error: (e) => e.message || `Failed to impersonate advertiser ${companyName}.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleApprove = async (adv) => {
    const advId = adv.id || adv.user_id;
    try {
      await toast.promise(
        updateStatus(advId, 'active').then(() => fetchAdvertisers()),
        {
          loading: 'Approving advertiser…',
          success: 'Advertiser approved & active!',
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch (_) {}
  };

  const handleReject = async (adv) => {
    const advId = adv.id || adv.user_id;
    const reason = prompt('Please enter reason for rejecting advertiser onboarding:');
    if (reason === null) return;
    try {
      await toast.promise(
        updateStatus(advId, 'rejected').then(() => fetchAdvertisers()),
        {
          loading: 'Rejecting advertiser application…',
          success: 'Advertiser application rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch (_) {}
  };

  const handleToggleStatus = async (adv) => {
    const advId = adv.id || adv.user_id;
    const currentStatus = (adv.status || adv.user?.status || 'active').toLowerCase();
    const isAct = currentStatus === 'active';
    const nextStatus = isAct ? 'suspended' : 'active';
    try {
      await toast.promise(
        updateStatus(advId, nextStatus).then(() => fetchAdvertisers()),
        {
          loading: isAct ? 'Deactivating advertiser...' : 'Activating advertiser...',
          success: `Advertiser ${isAct ? 'deactivated' : 'activated'} successfully!`,
          error: (err) => err?.message || 'Failed to update status.',
        }
      );
    } catch (_) {}
  };

  const handleDeleteAdvertiser = async (adv) => {
    const company = adv.company_name || adv.name || 'Advertiser';
    if (!window.confirm(`Are you sure you want to permanently delete advertiser "${company}"? All campaigns and records will be deleted.`)) {
      return;
    }
    try {
      await toast.promise(
        deleteAdvertiser(adv.id).then(() => fetchAdvertisers()),
        {
          loading: 'Deleting advertiser...',
          success: 'Advertiser deleted successfully!',
          error: (err) => err?.message || 'Failed to delete advertiser.',
        }
      );
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Advertisers</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Advertisers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage registered brand advertisers, profile details, and ad campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title="Refresh advertisers list"
          />

          <Link
            to="/superadmin/advertisers/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>Add Advertiser</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Advertisers</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{totalAdvertisers}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Deactivated</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{deactivatedCount}</div>
        </div>
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Verified Accounts</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{verifiedCount}</div>
        </div>
      </div>

      {/* Search and Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search advertisers, contact person, email..."
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
            {['All', 'Active', 'Deactivated'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {status}
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
            onClick={fetchAdvertisers}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Advertisers Roster: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Advertiser</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={`skel-adv-${i}`} className="animate-pulse">
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
                      <td className="py-4 px-4"><div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-4 px-4"><div className="h-5 w-16 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="py-4 px-4 text-right"><div className="h-6 w-16 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : advList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FleetIcons.Broadcast className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
                        <span>No commercial advertisers found matching criteria.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  advList.map((adv, idx) => {
                    const isNearBottom = idx >= Math.max(0, advList.length - 2) && advList.length > 2;
                    const company = adv.company_name || adv.name || '—';
                    const contact = adv.user?.name || adv.name || '—';
                    const email = adv.user?.email || adv.email || '—';
                    const phone = adv.user?.phone || adv.phone || '—';
                    const enrollment = adv.user?.enrollment_no || adv.code || `ADV-${adv.id}`;
                    const rawStatus = adv.status || adv.user?.status || 'active';
                    const isAct = rawStatus.toLowerCase() === 'active';
                    const displayStatus = isAct ? 'Active' : (rawStatus.toLowerCase() === 'pending_approval' ? 'Pending' : 'Deactivated');

                    return (
                      <tr key={adv.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-xs overflow-hidden shrink-0">
                              {adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl ? (
                                <img
                                  src={getMediaUrl(adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl)}
                                  alt={company}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.parentElement) {
                                      e.currentTarget.parentElement.innerText = company.charAt(0).toUpperCase();
                                    }
                                  }}
                                />
                              ) : (
                                company.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{company}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{enrollment}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-zinc-300">
                          <div className="font-bold text-slate-900 dark:text-white">{contact}</div>
                          {adv.designation && (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">{adv.designation}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 dark:text-zinc-200 font-medium">{email}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                            <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{adv.city ? `${adv.city}${adv.state ? `, ${adv.state}` : ''}` : (adv.state || adv.country || 'India')}</span>
                          </div>
                          {adv.address ? (
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-[180px] mt-0.5" title={adv.address}>
                              {adv.address}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{adv.business_type || 'Commercial Brand'}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {adv.verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                              <FleetIcons.Check className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isAct
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye / View icon in Table View */}
                          <button
                            type="button"
                            onClick={() => navigate(`/superadmin/advertisers/${adv.id}`)}
                            title="View Advertiser Details"
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
                                setActiveMenuId(activeMenuId === adv.id ? null : adv.id);
                              }}
                              title="More Actions"
                              className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                activeMenuId === adv.id
                                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                              }`}
                            >
                              <FleetIcons.MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === adv.id && (
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
                                      navigate(`/superadmin/advertisers/${adv.id}`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>View Details</span>
                                  </button>

                                  {/* Edit Brand */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      navigate(`/superadmin/advertisers/${adv.id}/edit`);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span>Edit Advertiser</span>
                                  </button>

                                  {/* Impersonate */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleImpersonate(adv);
                                    }}
                                    disabled={impersonatingId === adv.id}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {impersonatingId === adv.id ? (
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
                                  {/* Deactivate / Activate */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleToggleStatus(adv);
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
                                    <span>{isAct ? 'Deactivate' : 'Activate'}</span>
                                  </button>

                                  {/* Delete Brand */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      handleDeleteAdvertiser(adv);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>Delete Advertiser</span>
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
            <div key={`skel-adv-card-${i}`} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
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
      ) : advList.length === 0 ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <div className="flex flex-col items-center justify-center gap-2">
            <FleetIcons.Broadcast className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
            <span>No commercial advertisers found matching criteria.</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advList.map((adv) => {
            const company = adv.company_name || adv.name || '—';
            const contact = adv.user?.name || adv.name || '—';
            const email = adv.user?.email || adv.email || '—';
            const phone = adv.user?.phone || adv.phone || '—';
            const enrollment = adv.user?.enrollment_no || adv.code || `ADV-${adv.id}`;
            const rawStatus = adv.status || adv.user?.status || 'active';
            const isAct = rawStatus.toLowerCase() === 'active';
            const displayStatus = isAct ? 'Active' : (rawStatus.toLowerCase() === 'pending_approval' ? 'Pending' : 'Deactivated');

            return (
              <div key={adv.id} className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center shrink-0 overflow-hidden text-blue-600 dark:text-blue-400 font-black text-sm">
                      {adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl ? (
                        <img
                          src={getMediaUrl(adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl)}
                          alt={company}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = company.charAt(0).toUpperCase();
                            }
                          }}
                        />
                      ) : (
                        company.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{company}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{enrollment}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 uppercase tracking-wider ${
                      isAct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                    }`}
                  >
                    {displayStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">Contact Person:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {contact} {adv.designation ? `(${adv.designation})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">Location:</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 text-xs">
                      <FleetIcons.Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{adv.city ? `${adv.city}${adv.state ? `, ${adv.state}` : ''}` : (adv.state || adv.country || 'India')}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">Email:</span>
                    <span className="truncate max-w-[180px] text-slate-700 dark:text-zinc-300">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span className="text-slate-400 dark:text-zinc-500">Phone:</span>
                    <span className="font-mono text-slate-700 dark:text-zinc-300">{phone}</span>
                  </div>
                </div>

                {/* Eye button & 3-dot dropdown on Card */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/superadmin/advertisers/${adv.id}`)}
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
                        setActiveMenuId(activeMenuId === adv.id ? null : adv.id);
                      }}
                      title="More Actions"
                      className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                        activeMenuId === adv.id
                          ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <FleetIcons.MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === adv.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
                        <div className="py-1">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              navigate(`/superadmin/advertisers/${adv.id}`);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>View Details</span>
                          </button>

                          {/* Edit Brand */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              navigate(`/superadmin/advertisers/${adv.id}/edit`);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Edit Advertiser</span>
                          </button>

                          {/* Impersonate */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleImpersonate(adv);
                            }}
                            disabled={impersonatingId === adv.id}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {impersonatingId === adv.id ? (
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
                          {/* Deactivate / Activate */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleToggleStatus(adv);
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
                            <span>{isAct ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {/* Delete Brand */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                              handleDeleteAdvertiser(adv);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Delete Advertiser</span>
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
          totalItems={pagination?.total ?? advList.length}
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


export default SuperAdvertisersPage;

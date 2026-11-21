import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import { useDashboard } from '../../hooks/superadmin/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { superOrganizationService } from '../../api/services/superadmin/organization.service';
import { getMediaUrl } from '../../utils/media';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

const getPlanTranslation = (plan, t) => {
  if (!plan) return t ? t('superadmin.onboard.no_plan', 'No Plan') : 'No Plan';
  const rawName = typeof plan === 'object' ? (plan.name || plan.code || '') : String(plan);
  const rawCode = typeof plan === 'object' ? (plan.code || '') : '';
  const keyFromCode = rawCode ? `plans.name_${rawCode.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : '';
  const keyFromName = rawName ? `plans.name_${rawName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : '';

  if (t) {
    if (keyFromCode) {
      const translated = t(keyFromCode, '__VMOVEXA_MISSING__');
      if (translated && translated !== '__VMOVEXA_MISSING__' && translated !== keyFromCode) {
        return translated;
      }
    }
    if (keyFromName) {
      const translated = t(keyFromName, '__VMOVEXA_MISSING__');
      if (translated && translated !== '__VMOVEXA_MISSING__' && translated !== keyFromName) {
        return translated;
      }
    }
    return rawName || t('superadmin.onboard.no_plan', 'No Plan');
  }
  return rawName || 'No Plan';
};

export const TenantsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { impersonateTenant, isSuperAdmin, can } = useAuth();

  const isFinance = location.pathname.startsWith('/finance') || location.pathname.startsWith('/superadmin/finance');
  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';
  const dashboardPath = isFinance
    ? (location.pathname.startsWith('/superadmin') ? '/superadmin/finance/dashboard' : '/finance/dashboard')
    : '/superadmin/dashboard';

  const canApprove = isSuperAdmin;
  const canSuspend = isSuperAdmin;
  const canCreateTenant = can('tenants.create');
  const canEditTenant = can('tenants.update');
  // Impersonation is intentionally unavailable throughout Finance subscriptions.
  const canImpersonate = isSuperAdmin && !isFinance;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [plansList, setPlansList] = useState([]);

  const { organizations, loading, pagination, counts, loadOrganizations, updateStatus } = useOrganization();
  const { superAdminKpis, loadSuperAdminKpis } = useDashboard();

  // Fetch dynamic subscription plans on mount
  useEffect(() => {
    let isMounted = true;
    apiClient.get(ENDPOINTS.BILLING.PLANS)
      .then((res) => {
        const raw = res.data?.data || res.data || [];
        if (isMounted && Array.isArray(raw)) {
          setPlansList(raw);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map active tab to status filter
  const statusParam = useMemo(() => {
    if (activeTab === 'pending' || activeTab === 'pending_approval') return 'pending_approval';
    if (activeTab === 'active') return 'active';
    if (activeTab === 'suspended') return 'suspended';
    return undefined;
  }, [activeTab]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusParam) params.status = statusParam;
    const paymentStatus = selectedPaymentStatus !== 'all'
      ? selectedPaymentStatus
      : activeTab === 'payment_pending'
      ? 'payment_pending'
      : undefined;
    if (paymentStatus) params.payment_status = paymentStatus;
    if (selectedPlan !== 'all') params.plan_id = selectedPlan;
    if (sortBy !== 'newest') params.sortBy = sortBy;
    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    activeTab,
    statusParam,
    selectedPaymentStatus,
    selectedPlan,
    sortBy,
  ]);

  // Fetch organizations with server-side pagination, search & status filter
  useEffect(() => {
    loadOrganizations(getFilterParams()).catch(() => {});
  }, [getFilterParams, loadOrganizations]);

  // Load dashboard KPIs once
  useEffect(() => {
    loadSuperAdminKpis().catch(() => {});
  }, [loadSuperAdminKpis]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOrganizations(getFilterParams()),
        loadSuperAdminKpis(),
      ]);
      toast.success(t('ag.superadmin.tenantslistpage.tenants_directory_refreshed', 'Tenants directory refreshed!'));
    } catch {
      toast.error(t('ag.superadmin.tenantslistpage.failed_to_refresh_tenants_directory', 'Failed to refresh tenants directory.'));
    } finally {
      setRefreshing(false);
    }
  };

  // 3-dot Action Menu State & Handlers (viewport-anchored fixed position so table headers & overflow never clip it)
  useEffect(() => {
    if (!openMenu) return;
    const handleOutside = (e) => {
      if (!e.target.closest('[data-tenant-actions-menu]')) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    const handleScrollOrResize = () => setOpenMenu(null);
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openMenu]);

  const handleToggleMenu = (e, tItem) => {
    e.stopPropagation();
    if (openMenu?.id === tItem.id) {
      setOpenMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const hasApproval = canApprove && tItem.status === 'pending_approval';
    const hasSuspend = canSuspend && ['active', 'suspended'].includes(String(tItem.status || '').toLowerCase());
    let estimatedHeight = 44; // base padding
    estimatedHeight += 36; // View details
    if (canEditTenant) estimatedHeight += 36;
    if (canImpersonate) estimatedHeight += 36;
    if (hasApproval) estimatedHeight += 72; // approve + reject
    if (hasSuspend) estimatedHeight += 36; // suspend/activate

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    setOpenMenu({
      id: tItem.id,
      tItem,
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      right: Math.max(12, window.innerWidth - rect.right),
      openUp,
    });
  };

  const tenantsList = organizations || [];
  const kpis = superAdminKpis || {};

  const tenantCounts = {
    all: counts?.all ?? pagination?.counts?.all ?? kpis.totalTenants ?? pagination.total ?? tenantsList.length,
    paymentPending: counts?.payment_pending ?? counts?.paymentPending ?? pagination?.counts?.payment_pending ?? 0,
    active: counts?.active ?? pagination?.counts?.active ?? kpis.activeTenants ?? 0,
    pending: counts?.pending ?? pagination?.counts?.pending ?? kpis.pendingTenants ?? kpis.pendingApprovals ?? 0,
    suspended: counts?.suspended ?? pagination?.counts?.suspended ?? kpis.suspendedTenants ?? 0,
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedPaymentStatus('all');
    setSelectedPlan('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeTab !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedPaymentStatus !== 'all' ||
    selectedPlan !== 'all' ||
    sortBy !== 'newest';

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canSuspend) {
      toast.error(t('ag.superadmin.tenantslistpage.only_super_admin_can_change_tenant_s', 'Only Super Admin can change tenant status.'));
      return;
    }
    const normalizedStatus = String(currentStatus || '').toLowerCase();
    const isSuspended = normalizedStatus === 'suspended';
    if (normalizedStatus !== 'active' && !isSuspended) {
      toast.error(t('tenants.invalid_suspend_transition', 'Only an active tenant can be suspended.'));
      return;
    }
    const newStatus = isSuspended ? 'active' : 'suspended';
    try {
      await toast.promise(
        updateStatus(id, newStatus).then(() => {
          return loadOrganizations(getFilterParams());
        }),
        {
          loading: t('ag.superadmin.tenantslistpage.updating', 'Updating...'),
          success: isSuspended ? t('ag.superadmin.tenantslistpage.tenant_reactivated', 'Tenant re-activated!') : t('ag.superadmin.tenantslistpage.tenant_suspended', 'Tenant suspended!'),
          error: (e) => e.message || 'Failed to update.'
        }
      );
    } catch {
      // error handled by toast
    }
  };

  const handleApprove = async (id) => {
    if (!canApprove) {
      toast.error(t('ag.superadmin.tenantslistpage.only_super_admin_can_approve_tenants', 'Only Super Admin can approve tenants.'));
      return;
    }
    try {
      await toast.promise(
        superOrganizationService.approveOrganization(id, { activateTrial: false }).then(() => {
          return Promise.all([
            loadOrganizations(getFilterParams()),
            loadSuperAdminKpis(),
          ]);
        }),
        {
          loading: t('ag.superadmin.tenantslistpage.approving_tenant', 'Approving tenant onboarding…'),
          success: t('ag.superadmin.tenantslistpage.tenant_approved', 'Tenant approved & awaiting plan subscription!'),
          error: (e) => e.message || 'Approval failed.',
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };

  const handleImpersonate = async (tenant) => {
    if (impersonatingId) return;
    setImpersonatingId(tenant.id);
    try {
      await toast.promise(
        impersonateTenant(tenant.id).then(() => {
          navigate('/admin/dashboard');
        }),
        {
          loading: t('ag.superadmin.tenantslistpage.connecting_admin_console', 'Connecting to admin console…'),
          success: t('ag.superadmin.tenantslistpage.impersonate_success', 'Logged in as Admin!'),
          error: (e) => e.message || `Failed to log in as admin for ${tenant.name}.`,
        }
      );
    } catch (err) {
      console.error('Impersonation error:', err);
    } finally {
      setImpersonatingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!canApprove) {
      toast.error(t('ag.superadmin.tenantslistpage.only_super_admin_can_reject_tenants', 'Only Super Admin can reject tenants.'));
      return;
    }
    const reason = prompt(t('ag.superadmin.tenantslistpage.enter_rejection_reason', 'Please enter reason for rejecting this onboarding application:'));
    if (reason === null) return;
    try {
      await toast.promise(
        superOrganizationService.rejectOrganization(id, { reason }).then(() => {
          return Promise.all([
            loadOrganizations(getFilterParams()),
            loadSuperAdminKpis(),
          ]);
        }),
        {
          loading: t('ag.superadmin.tenantslistpage.rejecting_application', 'Rejecting application…'),
          success: t('ag.superadmin.tenantslistpage.tenant_rejected', 'Tenant application rejected.'),
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };

  const filterTabs = [
    { label: t('ag.superadmin.tenantslistpage.all', 'All'), count: tenantCounts.all, key: 'all' },
    { label: t('ag.superadmin.tenantslistpage.payment_pending', 'Payment Pending'), count: tenantCounts.paymentPending, key: 'payment_pending', isWarning: true },
    { label: t('ag.superadmin.tenantslistpage.active', 'Active'), count: tenantCounts.active, key: 'active' },
    { label: t('ag.superadmin.tenantslistpage.pending_approval', 'Pending Approval'), count: tenantCounts.pending, key: 'pending_approval' },
    { label: t('ag.superadmin.tenantslistpage.suspended', 'Suspended'), count: tenantCounts.suspended, key: 'suspended' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: isFinance ? t('ag.superadmin.tenantslistpage.finance', 'Finance') : t('ag.superadmin.tenantslistpage.super_admin', 'Super Admin'), to: dashboardPath },
          { label: t('superadmin.tenants_directory', 'Tenants Directory') },
        ]}
        className="mb-2"
      />

      {/* Header — Simple Naming */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('superadmin.tenants_title', 'Tenants')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('superadmin.tenants_subtitle', 'Manage fleet companies, approvals, and subscriptions')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing || loading}
            title={t('superadmin.refresh_tenants', 'Refresh tenants directory')}
          />

          {canCreateTenant && (
            <Link
              to={`${basePath}/onboard`}
              className="px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>{t('superadmin.onboard_tenant', 'Onboard Tenant')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 5 Stat Cards — Status Breakdown with Working Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-slate-400 ${
            activeTab === 'all' ? 'border-slate-900 dark:border-blue-500 ring-2 ring-slate-900/10 dark:ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.total_tenants', 'Total Tenants')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{tenantCounts.all}</div>
        </div>

        <div
          onClick={() => { setActiveTab('payment_pending'); setSelectedPaymentStatus('all'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-amber-400 ${
            activeTab === 'payment_pending' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('common.payment_pending', 'Payment Pending')}</span>
            {tenantCounts.paymentPending > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{tenantCounts.paymentPending}</div>
        </div>

        <div
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-emerald-400 ${
            activeTab === 'active' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('superadmin.active_tenants', 'Active Tenants')}</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{tenantCounts.active}</div>
        </div>

        <div
          onClick={() => { setActiveTab('pending_approval'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-blue-400 ${
            activeTab === 'pending_approval' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('common.pending_review', 'Pending Review')}</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{tenantCounts.pending}</div>
        </div>

        <div
          onClick={() => { setActiveTab('suspended'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-red-400 ${
            activeTab === 'suspended' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{t('common.suspended', 'Suspended')}</span>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{tenantCounts.suspended}</div>
        </div>
      </div>

      {/* Filter Tabs & Advanced Filter Toolbar */}
      <div className="space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isCurrent = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'payment_pending') setSelectedPaymentStatus('all');
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? tab.isWarning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm'
                    : tab.isWarning && tab.count > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                    : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50'
                }`}
              >
                {tab.isWarning && tab.count > 0 && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                )}
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isCurrent
                      ? tab.isWarning
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 dark:bg-blue-700 text-white'
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
          <div className="relative flex-1 min-w-[200px]">
            <FleetIcons.Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('superadmin.search_tenants_ph', 'Search tenants, city, admin, state, code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
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

          {/* Payment Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                if (activeTab === 'payment_pending') setActiveTab('all');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('superadmin.payment_all', 'Payment: All')}</option>
              <option value="payment_pending">{t('common.payment_pending', 'Payment Pending')}</option>
              <option value="paid">{t('superadmin.paid_active', 'Paid & Active')}</option>
            </select>
          </div>

          {/* Plan Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('superadmin.plan_all', 'Plan: All Plans')}</option>
              {plansList.map((p) => (
                <option key={p.id} value={p.id}>
                  {getPlanTranslation(p, t)}
                </option>
              ))}
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
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="newest">{t('superadmin.sort_newest', 'Sort: Newest First')}</option>
              <option value="oldest">{t('superadmin.sort_oldest', 'Sort: Oldest First')}</option>
              <option value="name_asc">{t('superadmin.sort_name_asc', 'Sort: Name (A-Z)')}</option>
              <option value="name_desc">{t('superadmin.sort_name_desc', 'Sort: Name (Z-A)')}</option>
              <option value="buses_desc">{t('superadmin.sort_buses_desc', 'Sort: Most Buses')}</option>
              <option value="buses_asc">{t('superadmin.sort_buses_asc', 'Sort: Least Buses')}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableTitle={t('common.table_view', 'Table View')}
            cardTitle={t('common.grid_view', 'Grid View')}
            className="ml-auto"
          />
        </div>

        {/* Active Filter Chips & Reset Button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400">{t('common.active_filters', 'Active Filters:')}</span>
            {activeTab !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                {t('ag.superadmin.tenantslistpage.tab', 'Tab:')} {filterTabs.find((t) => t.key === activeTab)?.label || activeTab}
                <button type="button" onClick={() => { setActiveTab('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedPaymentStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                {t('ag.superadmin.tenantslistpage.payment', 'Payment:')} {selectedPaymentStatus === 'payment_pending' ? t('ag.superadmin.tenantslistpage.pending', 'Pending') : t('ag.superadmin.tenantslistpage.paid', 'Paid')}
                <button type="button" onClick={() => { setSelectedPaymentStatus('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedPlan !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">
                {t('ag.superadmin.tenantslistpage.plan', 'Plan:')} {getPlanTranslation(plansList.find((p) => String(p.id) === String(selectedPlan)) || `Plan #${selectedPlan}`, t)}
                <button type="button" onClick={() => { setSelectedPlan('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] border border-slate-200 dark:border-zinc-700">
                {t('ag.superadmin.tenantslistpage.sort', 'Sort:')} {t(`superadmin.sort_${sortBy}`, sortBy)}
                <button type="button" onClick={() => setSortBy('newest')} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] border border-slate-200 dark:border-zinc-700">
                {t('ag.superadmin.tenantslistpage.query', 'Query: "')}{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline ml-auto"
            >
              {t('common.reset_filters', 'Reset All Filters')}
            </button>
          </div>
        )}
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[320px]">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">{t('tenants.organization', 'Organization')}</th>
                  <th className="px-4 py-3.5">{t('tenants.city_state', 'City & State')}</th>
                  <th className="px-4 py-3.5">{t('tenants.plan_quotas', 'Plan / Quotas')}</th>
                  <th className="px-4 py-3.5">{t('tenants.active_fleet', 'Active Fleets')}</th>
                  <th className="px-4 py-3.5">{t('common.payment', 'Payment')}</th>
                  <th className="px-4 py-3.5">{t('common.status', 'Status')}</th>
                  <th className="px-4 py-3.5 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-700 dark:text-zinc-200">
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
                          <div className="space-y-1.5">
                            <div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                            <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4"><div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded"></div></td>
                      <td className="px-4 py-4"><div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="px-4 py-4"><div className="h-5 w-20 bg-slate-200 dark:bg-zinc-800 rounded-full"></div></td>
                      <td className="px-4 py-4 text-right"><div className="h-6 w-20 bg-slate-200 dark:bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : tenantsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FleetIcons.Bus className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                        <span>{t('tenants.not_found', 'No tenants found.')}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tenantsList.map((tItem) => {
                    return (
                      <tr key={tItem.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm relative">
                              {(tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url) ? (
                                <img
                                  src={getMediaUrl(tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url)}
                                  alt={tItem.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center font-bold text-white text-xs shadow-inner"
                                style={{ display: (tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url) ? 'none' : 'flex' }}
                              >
                                {tItem.name?.charAt(0)?.toUpperCase() || 'T'}
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => navigate(`${basePath}/${tItem.id}`)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate block text-left"
                              >
                                {tItem.name}
                              </button>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{tItem.code || tItem.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-300">
                          <div>{tItem.city || '—'}</div>
                          <span className="text-[10px] text-slate-400">{tItem.state}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {tItem.plan ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold text-[10px]">
                              {getPlanTranslation(tItem.plan, t)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-medium text-[10px]">
                              {t('ag.superadmin.tenantslistpage.no_plan', 'No Plan')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-xs border border-blue-200/60 dark:border-blue-800/60">
                            <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{tItem.fleets_count ?? tItem.fleetsCount ?? 0} {Number(tItem.fleets_count ?? tItem.fleetsCount ?? 0) === 1 ? t('ag.superadmin.tenantslistpage.fleet', 'Fleet') : t('ag.superadmin.tenantslistpage.fleets', 'Fleets')}</span>
                          </span>
                        </td>
                        {/* Payment Status */}
                        <td className="px-4 py-3.5">
                          {tItem.payment_status === 'paid' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{t('common.paid', 'Paid')}</span>
                            </span>
                          ) : tItem.payment_status === 'payment_pending' || tItem.status === 'approved' || tItem.status === 'awaiting_subscription' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 shadow-sm animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>{t('common.payment_pending', 'Payment Pending')}</span>
                            </span>
                          ) : tItem.status === 'pending_approval' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                              <span>{t('superadmin.awaiting_kyc', 'Awaiting KYC')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400">
                              <span>—</span>
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              tItem.status === 'active'
                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : tItem.status === 'approved'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : tItem.status === 'pending_approval'
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                : tItem.status === 'awaiting_subscription'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                tItem.status === 'active'
                                  ? 'bg-emerald-500'
                                  : tItem.status === 'approved'
                                  ? 'bg-blue-500'
                                  : tItem.status === 'pending_approval'
                                  ? 'bg-amber-500 animate-pulse'
                                  : 'bg-red-500'
                              }`}
                            ></span>
                            {tItem.status === 'approved'
                              ? t('ag.superadmin.tenantslistpage.approved', 'Approved')
                              : tItem.status === 'pending_approval'
                              ? t('ag.superadmin.tenantslistpage.pending_approval', 'Pending Approval')
                              : tItem.status === 'active'
                              ? t('ag.superadmin.tenantslistpage.active', 'Active')
                              : tItem.status === 'suspended'
                              ? t('ag.superadmin.tenantslistpage.suspended', 'Suspended')
                              : (tItem.status || 'unknown')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end">
                            {/* Vertical 3 dots menu */}
                            <div className="relative inline-block text-left" data-tenant-actions-menu>
                              <button
                                type="button"
                                onClick={(e) => handleToggleMenu(e, tItem)}
                                title={t('common.actions', 'Actions')}
                                aria-label={t('common.actions', 'Actions')}
                                aria-expanded={openMenu?.id === tItem.id}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  openMenu?.id === tItem.id
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <FleetIcons.MoreVertical className="w-4 h-4" />
                              </button>
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
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: itemsPerPage }).map((_, i) => (
              <div key={`c-skel-${i}`} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-2.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                </div>
              </div>
            ))
          ) : tenantsList.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
              <div className="flex flex-col items-center justify-center gap-2">
                <FleetIcons.Bus className="w-8 h-8 text-slate-300 dark:text-zinc-700" />
                <span>{t('tenants.not_found', 'No tenants found.')}</span>
              </div>
            </div>
          ) : (
            tenantsList.map((tItem) => {
              return (
                <div key={tItem.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm relative">
                        {(tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url) ? (
                          <img
                            src={getMediaUrl(tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url)}
                            alt={tItem.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 items-center justify-center font-bold text-white text-sm shadow-inner"
                          style={{ display: (tItem.logo_url || tItem.logoUrl || tItem.logo || tItem.primaryAdmin?.avatar_url || tItem.users?.[0]?.avatar_url) ? 'none' : 'flex' }}
                        >
                          {tItem.name?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                      </div>
                      <div>
                        <button onClick={() => navigate(`${basePath}/${tItem.id}`)} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block text-left">
                          {tItem.name}
                        </button>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">{tItem.code || tItem.id}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Payment Status Badge */}
                      {tItem.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{t('common.paid', 'Paid')}</span>
                        </span>
                      ) : tItem.payment_status === 'payment_pending' || tItem.status === 'approved' || tItem.status === 'awaiting_subscription' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 animate-pulse shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>{t('common.payment_pending', 'Payment Pending')}</span>
                        </span>
                      ) : null}

                      {/* Account Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          tItem.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tItem.status === 'approved'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : tItem.status === 'pending_approval'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            tItem.status === 'active'
                              ? 'bg-emerald-500'
                              : tItem.status === 'approved'
                              ? 'bg-blue-500'
                              : tItem.status === 'pending_approval'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-red-500'
                          }`}
                        ></span>
                        {tItem.status === 'approved'
                          ? t('ag.superadmin.tenantslistpage.approved', 'Approved')
                          : tItem.status === 'pending_approval'
                          ? t('ag.superadmin.tenantslistpage.pending_approval', 'Pending Approval')
                          : tItem.status === 'active'
                          ? t('ag.superadmin.tenantslistpage.active', 'Active')
                          : tItem.status === 'suspended'
                          ? t('ag.superadmin.tenantslistpage.suspended', 'Suspended')
                          : (tItem.status || 'unknown')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500">{t('tenants.location', 'Location')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{tItem.city || '—'}{tItem.state ? `, ${tItem.state}` : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500">{t('tenants.plan', 'Plan')}:</span>
                      {tItem.plan ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold text-[10px]">
                          {getPlanTranslation(tItem.plan, t)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-medium text-[10px]">
                          {t('ag.superadmin.tenantslistpage.no_plan', 'No Plan')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500">{t('tenants.active_fleets', 'Active Fleets')}:</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{tItem.fleets_count ?? tItem.fleetsCount ?? 0} {Number(tItem.fleets_count ?? tItem.fleetsCount ?? 0) === 1 ? t('ag.superadmin.tenantslistpage.fleet', 'Fleet') : t('ag.superadmin.tenantslistpage.fleets', 'Fleets')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {/* Eye / View Details button */}
                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/${tItem.id}`)}
                      title={t('common.view_details', 'View Details')}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-4 h-4" />
                      <span>{t('common.view_details', 'View Details')}</span>
                    </button>

                    {/* Quick Impersonate button on card — excluded from Finance subscriptions */}
                    {canImpersonate && (
                      <button
                      type="button"
                      onClick={() => handleImpersonate(tItem)}
                      disabled={impersonatingId === tItem.id}
                      title={t('superadmin.impersonate_tenant_title', 'Impersonate Admin Console')}
                      className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 transition-colors inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      {impersonatingId === tItem.id ? (
                        <svg className="w-4 h-4 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <FleetIcons.Key className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      )}
                      </button>
                    )}

                    {/* Vertical 3 dots */}
                    <div className="relative inline-block text-left" data-tenant-actions-menu>
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(e, tItem)}
                        title={t('common.actions', 'More Actions')}
                        aria-label={t('common.actions', 'More Actions')}
                        aria-expanded={openMenu?.id === tItem.id}
                        className={`p-2 rounded-xl border transition-colors inline-flex items-center justify-center cursor-pointer ${
                          openMenu?.id === tItem.id
                            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        <FleetIcons.MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Fixed 3-dot Action Dropdown (viewport-anchored: never clipped by table overflow or headers) */}
      {openMenu && (
        <div
          data-tenant-actions-menu
          style={{
            position: 'fixed',
            top: openMenu.top,
            right: openMenu.right,
            transform: openMenu.openUp ? 'translateY(-100%)' : 'none',
          }}
          className="w-48 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="py-1">
            {/* View Details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const tenantId = openMenu.tItem.id;
                setOpenMenu(null);
                navigate(`${basePath}/${tenantId}`);
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{t('common.view_details', 'View Details')}</span>
            </button>

            {/* Impersonate — excluded from Finance subscriptions */}
            {canImpersonate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const targetTenant = openMenu.tItem;
                  setOpenMenu(null);
                  handleImpersonate(targetTenant);
                }}
                disabled={impersonatingId === openMenu.tItem.id}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {impersonatingId === openMenu.tItem.id ? (
                  <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <FleetIcons.Key className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                )}
                <span>{t('superadmin.impersonate', 'Impersonate')}</span>
              </button>
            )}

            {/* Edit Tenant */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!canEditTenant) return;
                const tenantId = openMenu.tItem.id;
                setOpenMenu(null);
                navigate(`${basePath}/${tenantId}/edit`);
              }}
              disabled={!canEditTenant}
              title={!canEditTenant ? t('ag.superadmin.tenantslistpage.edit_permission_required', 'Edit permission required') : undefined}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              <span>{t('superadmin.edit_tenant', 'Edit Tenant')}</span>
            </button>
          </div>

          {canApprove && openMenu.tItem.status === 'pending_approval' && (
            <div className="py-1">
              {/* Approve */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const tenantId = openMenu.tItem.id;
                  setOpenMenu(null);
                  handleApprove(tenantId);
                }}
                className="w-full px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('common.approve', 'Approve')}</span>
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const tenantId = openMenu.tItem.id;
                  setOpenMenu(null);
                  handleReject(tenantId);
                }}
                className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('common.reject', 'Reject')}</span>
              </button>
            </div>
          )}

          {canSuspend && ['active', 'suspended'].includes(String(openMenu.tItem.status || '').toLowerCase()) && (
            <div className="py-1">
              {/* Suspend / Activate */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const { id: tenantId, status: currentStatus } = openMenu.tItem;
                  setOpenMenu(null);
                  handleToggleStatus(tenantId, currentStatus);
                }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  String(openMenu.tItem.status || '').toLowerCase() === 'suspended'
                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                {String(openMenu.tItem.status || '').toLowerCase() === 'suspended' ? (
                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{String(openMenu.tItem.status || '').toLowerCase() === 'suspended' ? t('tenants.activate', 'Activate / Re-activate') : t('tenants.suspend', 'Suspend Tenant')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={pagination?.page || currentPage}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total ?? tenantsList.length}
        pageSize={pagination?.limit || itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />
    </div>
  );
};

export default TenantsListPage;

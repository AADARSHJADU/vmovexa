import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
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

const formatPlanName = (plan) => {
  if (!plan) return 'No Plan';
  if (typeof plan === 'object') return plan.name || plan.code || 'No Plan';
  return String(plan);
};

export const TenantsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { impersonateTenant, user, hasPermission } = useAuth();

  const isFinance = location.pathname.startsWith('/finance') || location.pathname.startsWith('/superadmin/finance');
  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';
  const dashboardPath = isFinance
    ? (location.pathname.startsWith('/superadmin') ? '/superadmin/finance/dashboard' : '/finance/dashboard')
    : '/superadmin/dashboard';

  const userRoleCode = typeof user?.role === 'object' ? user?.role?.code : user?.role;
  const canApprove = userRoleCode === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT' || (Array.isArray(user?.permissions) && user.permissions.includes('orgs.approve'));
  const canSuspend = userRoleCode === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT' || (Array.isArray(user?.permissions) && user.permissions.includes('orgs.suspend'));
  const canCreateTenant = hasPermission('orgs.create') || hasPermission('finance.subscriptions.create') || hasPermission('finance.subscriptions.manage');
  const canEditTenant = hasPermission('orgs.update') || hasPermission('finance.subscriptions.update') || hasPermission('finance.subscriptions.manage');
  const canImpersonate = hasPermission('platform.impersonate');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [impersonatingId, setImpersonatingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedFleetRange, setSelectedFleetRange] = useState('all');
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

  const availableStates = useMemo(() => {
    const defaultStates = [
      'Delhi',
      'Gujarat',
      'Haryana',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Punjab',
      'Rajasthan',
      'Tamil Nadu',
      'Telangana',
      'Uttar Pradesh',
      'West Bengal',
    ];
    const fromOrgs = (organizations || []).map((o) => o.state).filter(Boolean);
    const set = new Set([...fromOrgs, ...defaultStates]);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [organizations]);

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
    if (activeTab === 'Payment Pending') return 'payment_pending';
    if (activeTab === 'Pending' || activeTab === 'Pending Approval') return 'pending_approval';
    if (activeTab === 'Active') return 'active';
    if (activeTab === 'Suspended') return 'suspended';
    return undefined;
  }, [activeTab]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusParam) params.status = statusParam;
    if (selectedPaymentStatus !== 'all') params.payment_status = selectedPaymentStatus;
    if (selectedPlan !== 'all') params.plan_id = selectedPlan;
    if (selectedState !== 'all') params.state = selectedState;
    if (selectedFleetRange !== 'all') params.fleet_range = selectedFleetRange;
    if (sortBy !== 'newest') params.sortBy = sortBy;
    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    statusParam,
    selectedPaymentStatus,
    selectedPlan,
    selectedState,
    selectedFleetRange,
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
      toast.success('Tenants directory refreshed!');
    } catch {
      toast.error('Failed to refresh tenants directory.');
    } finally {
      setRefreshing(false);
    }
  };

  // Close 3-dot actions menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-tenant-actions-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

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
    setActiveTab('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedPaymentStatus('all');
    setSelectedPlan('all');
    setSelectedState('all');
    setSelectedFleetRange('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    activeTab !== 'All' ||
    searchQuery.trim() !== '' ||
    selectedPaymentStatus !== 'all' ||
    selectedPlan !== 'all' ||
    selectedState !== 'all' ||
    selectedFleetRange !== 'all' ||
    sortBy !== 'newest';

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canSuspend) {
      toast.error('Only Super Admin can change tenant status.');
      return;
    }
    const isSuspended = String(currentStatus || '').toLowerCase() === 'suspended';
    const orgItem = organizations.find((o) => o.id === id);
    const isOrgPaid = orgItem?.payment_status === 'paid';
    const newStatus = isSuspended ? (isOrgPaid ? 'active' : 'approved') : 'suspended';
    try {
      await toast.promise(
        updateStatus(id, newStatus).then(() => {
          return loadOrganizations(getFilterParams());
        }),
        {
          loading: 'Updating...',
          success: isSuspended ? 'Tenant re-activated!' : 'Tenant suspended!',
          error: (e) => e.message || 'Failed to update.'
        }
      );
    } catch {
      // error handled by toast
    }
  };

  const handleApprove = async (id) => {
    if (!canApprove) {
      toast.error('Only Super Admin can approve tenants.');
      return;
    }
    try {
      await toast.promise(
        superOrganizationService.approveOrganization(id, { activateTrial: false, planId: 1 }).then(() => {
          return Promise.all([
            loadOrganizations(getFilterParams()),
            loadSuperAdminKpis(),
          ]);
        }),
        {
          loading: 'Approving tenant onboarding…',
          success: 'Tenant approved & awaiting plan subscription!',
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
          loading: `Connecting to ${tenant.name} admin console…`,
          success: `Logged in as Admin of ${tenant.name}!`,
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
      toast.error('Only Super Admin can reject tenants.');
      return;
    }
    const reason = prompt('Please enter reason for rejecting this onboarding application:');
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
          loading: 'Rejecting application…',
          success: 'Tenant application rejected.',
          error: (e) => e.message || 'Rejection failed.',
        }
      );
    } catch {
      // toast.promise reports the failure.
    }
  };


  const filterTabs = [
    { label: 'All', count: tenantCounts.all, key: 'all' },
    { label: 'Payment Pending', count: tenantCounts.paymentPending, key: 'payment_pending', isWarning: true },
    { label: 'Active', count: tenantCounts.active, key: 'active' },
    { label: 'Pending Approval', count: tenantCounts.pending, key: 'pending' },
    { label: 'Suspended', count: tenantCounts.suspended, key: 'suspended' },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
        <Link to={dashboardPath} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <FleetIcons.Dashboard className="w-3.5 h-3.5" />
          <span>{isFinance ? 'Finance' : 'Super Admin'}</span>
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-bold">{t('superadmin.tenants_directory', 'Tenants Directory')}</span>
      </nav>

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
          onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-slate-400 ${
            activeTab === 'All' ? 'border-slate-900 dark:border-blue-500 ring-2 ring-slate-900/10 dark:ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('superadmin.total_tenants', 'Total Tenants')}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{tenantCounts.all}</div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('superadmin.all_registered', 'All registered')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Payment Pending'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-amber-400 ${
            activeTab === 'Payment Pending' ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20' : 'border-slate-200 dark:border-zinc-800'
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
          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5">{t('superadmin.awaiting_checkout', 'Awaiting checkout')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Active'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-emerald-400 ${
            activeTab === 'Active' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('superadmin.active_tenants', 'Active Tenants')}</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{tenantCounts.active}</div>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">{t('superadmin.active_and_running', 'Active & running')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Pending Approval'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-blue-400 ${
            activeTab === 'Pending Approval' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('common.pending_review', 'Pending Review')}</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{tenantCounts.pending}</div>
          <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">{t('superadmin.awaiting_kyc', 'Awaiting KYC')}</p>
        </div>

        <div
          onClick={() => { setActiveTab('Suspended'); setCurrentPage(1); }}
          className={`bg-white dark:bg-zinc-900 border rounded-xl p-3.5 shadow-sm cursor-pointer transition-all hover:border-red-400 ${
            activeTab === 'Suspended' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-zinc-800'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">{t('common.suspended', 'Suspended')}</span>
          <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">{tenantCounts.suspended}</div>
          <p className="text-[10px] text-red-600/80 dark:text-red-400/80 mt-0.5">{t('superadmin.access_disabled', 'Access disabled')}</p>
        </div>
      </div>

      {/* Filter Tabs & Advanced Filter Toolbar */}
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
                  {p.name || p.code || `Plan #${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* State / Region Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('superadmin.state_all', 'State: All')}</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Fleet Size Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedFleetRange}
              onChange={(e) => {
                setSelectedFleetRange(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 shadow-xs cursor-pointer"
            >
              <option value="all">{t('superadmin.fleet_all_sizes', 'Fleet: All Sizes')}</option>
              <option value="small">{t('superadmin.fleet_1_25', '1 - 25 Buses')}</option>
              <option value="medium">{t('superadmin.fleet_26_50', '26 - 50 Buses')}</option>
              <option value="large">{t('superadmin.fleet_51_plus', '51+ Buses')}</option>
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
            className="ml-auto"
          />
        </div>

        {/* Active Filter Chips & Reset Button */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400">{t('common.active_filters', 'Active Filters:')}</span>
            {activeTab !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                Tab: {activeTab}
                <button type="button" onClick={() => { setActiveTab('All'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedPaymentStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                Payment: {selectedPaymentStatus === 'payment_pending' ? 'Pending' : 'Paid'}
                <button type="button" onClick={() => { setSelectedPaymentStatus('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedPlan !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-[10px] border border-purple-200 dark:border-purple-800">
                Plan: {plansList.find((p) => String(p.id) === String(selectedPlan))?.name || `Plan #${selectedPlan}`}
                <button type="button" onClick={() => { setSelectedPlan('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                State: {selectedState}
                <button type="button" onClick={() => { setSelectedState('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {selectedFleetRange !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] border border-cyan-200 dark:border-cyan-800">
                Fleet: {selectedFleetRange === 'small' ? '1-25 Buses' : selectedFleetRange === 'medium' ? '26-50 Buses' : '51+ Buses'}
                <button type="button" onClick={() => { setSelectedFleetRange('all'); setCurrentPage(1); }} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] border border-slate-200 dark:border-zinc-700">
                Sort: {sortBy}
                <button type="button" onClick={() => setSortBy('newest')} className="hover:text-red-500 ml-1 inline-flex items-center"><FleetIcons.Close className="w-2.5 h-2.5" /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px] border border-slate-200 dark:border-zinc-700">
                Query: "{searchQuery}"
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
            <table className="w-full text-left text-xs">
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
                  tenantsList.map((tItem, idx) => {
                    const isNearBottom = idx >= Math.max(0, tenantsList.length - 2) && tenantsList.length > 2;
                    return (
                      <tr key={tItem.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm relative">
                              {(tItem.logo_url || tItem.logoUrl || tItem.logo) ? (
                                <img
                                  src={getMediaUrl(tItem.logo_url || tItem.logoUrl || tItem.logo)}
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
                                style={{ display: (tItem.logo_url || tItem.logoUrl || tItem.logo) ? 'none' : 'flex' }}
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
                              {formatPlanName(tItem.plan)}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-medium text-[10px]">
                              No Plan
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono text-xs border border-blue-200/60 dark:border-blue-800/60">
                            <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{tItem.fleets_count ?? tItem.fleetsCount ?? 0} {Number(tItem.fleets_count ?? tItem.fleetsCount ?? 0) === 1 ? 'Fleet' : 'Fleets'}</span>
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
                              ? 'Approved'
                              : tItem.status === 'pending_approval'
                              ? 'Pending Approval'
                              : tItem.status === 'active'
                              ? 'Active'
                              : (tItem.status || 'unknown')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Eye / View icon in Table View */}
                            <button
                              type="button"
                              onClick={() => navigate(`${basePath}/${tItem.id}`)}
                              title={t('common.view_details', 'View Details')}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center justify-center cursor-pointer"
                            >
                              <FleetIcons.Eye className="w-4 h-4" />
                            </button>

                            {/* Vertical 3 dots menu */}
                            <div className="relative inline-block text-left" data-tenant-actions-menu>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === tItem.id ? null : tItem.id);
                                }}
                                title={t('common.actions', 'Actions')}
                                className={`p-1.5 rounded-lg border transition-colors inline-flex items-center justify-center cursor-pointer ${
                                  activeMenuId === tItem.id
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                                }`}
                              >
                                <FleetIcons.MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === tItem.id && (
                                <div
                                  className={`absolute right-0 ${
                                    isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
                                  } w-44 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100`}
                                >
                                  <div className="py-1">
                                    {/* View Details */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(null);
                                        navigate(`${basePath}/${tItem.id}`);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{t('common.view_details', 'View Details')}</span>
                                    </button>

                                    {/* Impersonate */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canImpersonate) return;
                                        setActiveMenuId(null);
                                        handleImpersonate(tItem);
                                      }}
                                      disabled={!canImpersonate || impersonatingId === tItem.id}
                                      title={!canImpersonate ? 'Impersonation permission required' : undefined}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {impersonatingId === tItem.id ? (
                                        <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                      ) : (
                                        <FleetIcons.Key className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                                      )}
                                      <span>{t('superadmin.impersonate', 'Impersonate')}</span>
                                    </button>

                                    {/* Edit Tenant */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canEditTenant) return;
                                        setActiveMenuId(null);
                                        navigate(`${basePath}/${tItem.id}/edit`);
                                      }}
                                      disabled={!canEditTenant}
                                      title={!canEditTenant ? 'Edit permission required' : undefined}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                                      <span>{t('superadmin.edit_tenant', 'Edit Tenant')}</span>
                                    </button>
                                  </div>

                                  {canApprove && tItem.status === 'pending_approval' && (
                                    <div className="py-1">
                                      {/* Approve */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuId(null);
                                          handleApprove(tItem.id);
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
                                          setActiveMenuId(null);
                                          handleReject(tItem.id);
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

                                  {canSuspend && (
                                    <div className="py-1">
                                      {/* Suspend / Activate */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveMenuId(null);
                                          handleToggleStatus(tItem.id, tItem.status);
                                        }}
                                        className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                          String(tItem.status || '').toLowerCase() === 'suspended'
                                            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                            : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                        }`}
                                      >
                                        {String(tItem.status || '').toLowerCase() === 'suspended' ? (
                                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        ) : (
                                          <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        )}
                                        <span>{String(tItem.status || '').toLowerCase() === 'suspended' ? t('tenants.activate', 'Activate / Re-activate') : t('tenants.suspend', 'Suspend Tenant')}</span>
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
                        {(tItem.logo_url || tItem.logoUrl || tItem.logo) ? (
                          <img
                            src={getMediaUrl(tItem.logo_url || tItem.logoUrl || tItem.logo)}
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
                          style={{ display: (tItem.logo_url || tItem.logoUrl || tItem.logo) ? 'none' : 'flex' }}
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
                          ? 'Approved'
                          : tItem.status === 'pending_approval'
                          ? 'Pending Approval'
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
                          {formatPlanName(tItem.plan)}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-medium text-[10px]">
                          No Plan
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                      <span className="text-slate-400 dark:text-zinc-500">{t('tenants.active_fleets', 'Active Fleets')}:</span>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{tItem.fleets_count ?? tItem.fleetsCount ?? 0} {Number(tItem.fleets_count ?? tItem.fleetsCount ?? 0) === 1 ? 'Fleet' : 'Fleets'}</span>
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

                    {/* Quick Impersonate button on card */}
                    <button
                      type="button"
                      onClick={() => handleImpersonate(tItem)}
                      disabled={impersonatingId === tItem.id}
                      title={`Impersonate ${tItem.name} Admin Console`}
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

                    {/* Vertical 3 dots */}
                    <div className="relative" data-tenant-actions-menu>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === tItem.id ? null : tItem.id);
                        }}
                        title={t('common.actions', 'More Actions')}
                        className={`p-2 rounded-xl border transition-colors inline-flex items-center justify-center cursor-pointer ${
                          activeMenuId === tItem.id
                            ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        <FleetIcons.MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === tItem.id && (
                        <div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-zinc-700 shadow-xl py-1 z-50 text-left divide-y divide-slate-100 dark:divide-zinc-800 animate-in fade-in zoom-in-95 duration-100">
                          <div className="py-1">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(null);
                                navigate(`${basePath}/${tItem.id}`);
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{t('common.view_details', 'View Details')}</span>
                            </button>
                            {/* Edit Tenant */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canEditTenant) return;
                                setActiveMenuId(null);
                                navigate(`${basePath}/${tItem.id}/edit`);
                              }}
                              disabled={!canEditTenant}
                              title={!canEditTenant ? 'Edit permission required' : undefined}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{t('superadmin.edit_tenant', 'Edit Tenant')}</span>
                            </button>

                            {/* Impersonate */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!canImpersonate) return;
                                setActiveMenuId(null);
                                handleImpersonate(tItem);
                              }}
                              disabled={!canImpersonate || impersonatingId === tItem.id}
                              title={!canImpersonate ? 'Impersonation permission required' : undefined}
                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {impersonatingId === tItem.id ? (
                                <svg className="w-3.5 h-3.5 animate-spin text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              ) : (
                                <FleetIcons.Key className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
                              )}
                              <span>{t('superadmin.impersonate', 'Impersonate')}</span>
                            </button>

                            {/* Approve */}
                            {canApprove && tItem.status === 'pending_approval' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleApprove(tItem.id);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t('common.approve', 'Approve')}</span>
                              </button>
                            )}

                            {/* Reject */}
                            {canApprove && tItem.status === 'pending_approval' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleReject(tItem.id);
                                }}
                                className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t('common.reject', 'Reject')}</span>
                              </button>
                            )}
                          </div>

                          {canSuspend && (
                            <div className="py-1">
                              {/* Suspend / Activate */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(null);
                                  handleToggleStatus(tItem.id, tItem.status);
                                }}
                                className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                                  String(tItem.status || '').toLowerCase() === 'suspended'
                                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                }`}
                              >
                                {String(tItem.status || '').toLowerCase() === 'suspended' ? (
                                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                <span>{String(tItem.status || '').toLowerCase() === 'suspended' ? t('tenants.activate', 'Activate / Re-activate') : t('tenants.suspend', 'Suspend Tenant')}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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

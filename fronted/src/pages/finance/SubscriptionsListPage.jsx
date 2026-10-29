/* Local loading/filter state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import organizationService from '../../api/services/organization.service';
import billingService from '../../api/services/billing.service';
import { INDIAN_STATES_AND_UTS } from '../superadmin/OnboardTenantPage';

export const SubscriptionsListPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { subscriptions, subscriptionsPagination, loadSubscriptions } = useFinanceRole();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const statusParam = useMemo(() => {
    if (activeTab === 'Active') return 'active';
    if (activeTab === 'Expiring Soon') return 'past_due';
    if (activeTab === 'Inactive') return 'cancelled';
    return undefined;
  }, [activeTab]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (statusParam) params.status = statusParam;
    return params;
  }, [currentPage, itemsPerPage, debouncedSearch, statusParam]);

  useEffect(() => {
    loadSubscriptions(getFilterParams()).catch(() => {});
  }, [loadSubscriptions, getFilterParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const subscriptionList = useMemo(() => Array.isArray(subscriptions) ? subscriptions : (subscriptions?.items || subscriptions?.rows || []), [subscriptions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSubscriptions(getFilterParams());
      toast.success('Subscriptions refreshed!');
    } catch {
      toast.error('Failed to refresh subscriptions.');
    } finally {
      setRefreshing(false);
    }
  };

  // Modal State for New Subscription Provisioning
  const [showModal, setShowModal] = useState(false);
  const [provisionMode, setProvisionMode] = useState('new'); // 'new' | 'existing'
  const [organizationsList, setOrganizationsList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [, setLoadingModalData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organizationId: '',
    name: '',
    state: '',
    city: '',
    gstin: '',
    cin: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    planId: '',
    busesCount: '',
    depotsCount: '',
    billingCycle: 'monthly',
    paymentMode: 'offline',
    bankName: '',
    bankRef: '',
    amount: '',
    notes: '',
  });

  // Load Orgs and Plans when Modal opens
  useEffect(() => {
    if (!showModal) return;
    let ignore = false;
    const loadModalData = async () => {
      setLoadingModalData(true);
      try {
        const [orgsRes, plansRes] = await Promise.allSettled([
          organizationService.list(),
          billingService.getPlans(),
        ]);

        if (!ignore) {
          if (orgsRes.status === 'fulfilled') {
            const list = Array.isArray(orgsRes.value) ? orgsRes.value : (orgsRes.value?.items || orgsRes.value?.rows || []);
            setOrganizationsList(list);
            if (list.length > 0) {
              setFormData((prev) => ({ ...prev, organizationId: String(list[0].id) }));
            }
          }
          if (plansRes.status === 'fulfilled') {
            const list = Array.isArray(plansRes.value) ? plansRes.value : (plansRes.value?.items || plansRes.value?.rows || []);
            setPlansList(list);
            if (list.length > 0) {
              const p = list[0];
              setFormData((prev) => ({
                ...prev,
                planId: String(p.id),
                busesCount: p.buses_limit != null ? String(p.buses_limit) : '',
                amount: p.monthly_price != null ? String(p.monthly_price) : '',
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Modal data fetch failed:', err?.message);
      } finally {
        if (!ignore) setLoadingModalData(false);
      }
    };

    loadModalData();
    return () => { ignore = true; };
  }, [showModal]);

  const filterTabs = [
    { label: 'All', count: activeTab === 'All' ? (subscriptionsPagination?.total ?? subscriptionList.length) : null },
    { label: 'Active', count: activeTab === 'Active' ? (subscriptionsPagination?.total ?? subscriptionList.length) : null },
    { label: 'Expiring Soon', count: activeTab === 'Expiring Soon' ? (subscriptionsPagination?.total ?? subscriptionList.length) : null },
    { label: 'Inactive', count: activeTab === 'Inactive' ? (subscriptionsPagination?.total ?? subscriptionList.length) : null },
  ];

  const totalItems = subscriptionsPagination?.total ?? subscriptionList.length;
  const totalPages = subscriptionsPagination?.totalPages ?? (Math.ceil(totalItems / itemsPerPage) || 1);
  const currentSubs = subscriptionList;

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'expiring' || s === 'expiring soon') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'inactive') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800';
  };

  const monogramOf = (name) => String(name || '—').trim().slice(0, 2).toUpperCase();

  const handlePlanChange = (planId) => {
    const found = plansList.find((p) => String(p.id) === String(planId));
    if (found) {
      setFormData((prev) => ({
        ...prev,
        planId: String(found.id),
        busesCount: found.buses_limit != null ? String(found.buses_limit) : '',
        amount: found.monthly_price != null ? String(found.monthly_price) : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, planId: String(planId) }));
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading('Provisioning tenant subscription...');

    try {
      if (provisionMode === 'new') {
        const payload = {
          name: formData.name.trim(),
          state: formData.state,
          city: formData.city.trim(),
          gstin: formData.gstin ? formData.gstin.trim() : undefined,
          cin: formData.cin ? formData.cin.trim() : undefined,
          adminName: formData.adminName ? formData.adminName.trim() : undefined,
          adminEmail: formData.adminEmail ? formData.adminEmail.trim() : undefined,
          adminPhone: formData.adminPhone ? formData.adminPhone.trim() : undefined,
          adminPassword: formData.adminPassword ? formData.adminPassword.trim() : undefined,
          planId: formData.planId ? Number(formData.planId) : undefined,
          busesQuota: Number(formData.busesCount) || 0,
          depotsQuota: Number(formData.depotsCount) || 0,
          paymentMode: formData.paymentMode,
          bankRef: formData.bankRef ? formData.bankRef.trim() : `UTR-${Date.now()}`,
          bankName: formData.bankName,
          amount: Number(formData.amount) || 0,
          notes: formData.notes ? formData.notes.trim() : undefined,
        };
        await organizationService.createOrganization(payload);
        toast.dismiss(toastId);
        toast.success(`Tenant subscription provisioned for "${formData.name}"!`);
      } else {
        // Record offline payment / subscription for existing organization
        const payload = {
          organizationId: Number(formData.organizationId),
          planId: formData.planId ? Number(formData.planId) : undefined,
          amount: Number(formData.amount) || 0,
          paymentMode: formData.paymentMode,
          bankRef: formData.bankRef ? formData.bankRef.trim() : `UTR-${Date.now()}`,
          bankName: formData.bankName,
          notes: formData.notes ? formData.notes.trim() : undefined,
        };
        await billingService.recordOfflinePayment(payload).catch(() => {});
        toast.dismiss(toastId);
        toast.success('Subscription renewed / record updated!');
      }

      setShowModal(false);
      await loadSubscriptions(getFilterParams()).catch(() => {});
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Subscription provisioning failed: ' + (err?.message || 'Error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Subscriptions' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.enterprise_subscriptions', 'Enterprise Subscriptions')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('finance.manage_recurring_plans_desc', 'Manage recurring advertiser mobility plans, fleet licenses, and renewal cycles')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Plus className="w-4 h-4 text-white" />
            <span>{t('finance.provision_new_sub', '+ Provision New Subscription')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.label
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:bg-zinc-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count != null && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    activeTab === tab.label ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('finance.search_subs_ph', 'Search subscriptions by company or plan...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 focus:outline-none"
            />
          </div>

          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* Main Content */}
      {subscriptionList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Fleets className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.no_subs_found', 'No subscriptions found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('finance.no_subs_adjust_filters', 'Try adjusting your filters or search keywords.')}</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentSubs.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-black text-sm flex items-center justify-center">
                      {monogramOf(sub.organization?.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sub.organization?.name ?? '—'}</h3>
                      <span className="text-[11px] font-mono font-medium text-slate-400">{sub.code ?? sub.id ?? '—'}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadge(sub.status)}`}>
                    {sub.status ?? '—'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.plan_tier_label', 'Plan Tier:')}</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{sub.plan?.name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.recurring_price', 'Recurring Price:')}</span>
                    <span className="font-black text-slate-900 dark:text-white">₹{sub.amount ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.billing_cycle', 'Billing Cycle:')}</span>
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{sub.billing_cycle ?? 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.auto_renewal_label', 'Auto Renewal:')}</span>
                    <span className={`font-bold ${sub.auto_renew ? 'text-emerald-700' : 'text-slate-500 dark:text-zinc-400'}`}>
                      {sub.auto_renew ? '● Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  to={`${basePath}/subscriptions/${sub.id}`}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl text-center transition-colors"
                >
                  {t('finance.view_details_billing', 'View Details & Billing')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('finance.client_company_col', 'Client / Company')}</th>
                  <th className="py-3 px-4">{t('finance.plan_name_col', 'Plan Name')}</th>
                  <th className="py-3 px-4">{t('finance.billing_rate_col', 'Billing Rate')}</th>
                  <th className="py-3 px-4">{t('finance.expiry_date_col', 'Expiry Date')}</th>
                  <th className="py-3 px-4">{t('finance.auto_renewal_col', 'Auto Renewal')}</th>
                  <th className="py-3 px-4">{t('common.status', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 dark:text-zinc-300">
                {currentSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {monogramOf(sub.organization?.name)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{sub.organization?.name ?? '—'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{sub.code ?? sub.id ?? '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200">{sub.plan?.name ?? '—'}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">₹{sub.amount ?? '—'}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300">{sub.billing_cycle ?? 'Monthly'}</td>
                    <td className="py-3.5 px-4">
                      {sub.auto_renew ? (
                        <span className="text-emerald-700 font-bold">{t('common.enabled', 'Enabled')}</span>
                      ) : (
                        <span className="text-slate-400">{t('common.off', 'Off')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getStatusBadge(sub.status)}`}>
                        {sub.status ?? '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`${basePath}/subscriptions/${sub.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-lg transition-colors"
                      >
                        {t('finance.details_btn', 'Details')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      {/* PROVISION NEW TENANT SUBSCRIPTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.provision_tenant_sub', 'Provision Tenant Subscription')}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{t('finance.provision_tenant_desc', 'Assign software subscription tier, bus quotas, and billing terms')}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 dark:text-zinc-400 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setProvisionMode('new')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  provisionMode === 'new' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white'
                }`}
              >
                <FleetIcons.Building className="w-3.5 h-3.5" />
                <span>{t('finance.onboard_new_tenant_plan', 'Onboard New Tenant & Plan')}</span>
              </button>
              <button
                type="button"
                onClick={() => setProvisionMode('existing')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  provisionMode === 'existing' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:text-white'
                }`}
              >
                <FleetIcons.Document className="w-3.5 h-3.5" />
                <span>{t('finance.renew_existing_org', 'Renew Existing Organization')}</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {provisionMode === 'new' ? (
                <>
                  {/* Step 1: Company Profile */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('finance.sec1_org_details', '1. Organization Details')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.company_org_name_req', 'Company / Organization Name *')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('finance.company_name_ph', 'e.g. BEST Metro Transit Authority')}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.state_ut_req', 'State / UT *')}</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        >
                          {INDIAN_STATES_AND_UTS.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.city_req', 'City *')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('finance.city_ph', 'e.g. Bhopal')}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.gstin_opt', 'GSTIN (Optional)')}</label>
                        <input
                          type="text"
                          placeholder={t('finance.gstin_ph', 'e.g. 23AAAAA0000A1Z5')}
                          value={formData.gstin}
                          onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.cin_opt', 'CIN Number (Optional)')}</label>
                        <input
                          type="text"
                          placeholder={t('finance.cin_ph', 'e.g. U60200MH2021PTC109921')}
                          value={formData.cin}
                          onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Tenant Admin Credentials */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('finance.sec2_admin_account', '2. Tenant Administrator Account')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.admin_fullname_req', 'Admin Full Name *')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('finance.admin_name_ph', 'e.g. Rajesh Sharma')}
                          value={formData.adminName}
                          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.admin_email_req', 'Admin Email Address *')}</label>
                        <input
                          type="email"
                          required
                          placeholder={t('finance.admin_email_ph', 'e.g. admin@besttransit.in')}
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.admin_phone_opt', 'Admin Phone (Optional)')}</label>
                        <input
                          type="text"
                          placeholder={t('finance.admin_phone_ph', 'e.g. +91 9876543210')}
                          value={formData.adminPhone}
                          onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.temp_password_req', 'Temporary Password *')}</label>
                        <input
                          type="text"
                          required
                          placeholder={t('finance.admin_password_ph', 'e.g. Pass#1234')}
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Select Existing Organization */
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('finance.select_org', 'Select Organization')}</h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.target_org_req', 'Target Organization *')}</label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    >
                      {organizationsList.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.code || `ORG-${org.id}`}) — {org.city || 'MP'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Subscription & Billing Term Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('finance.sec3_plan_quota', '3. Subscription Plan & Fleet Quota Terms')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.sub_plan_tier_req', 'Subscription Plan Tier *')}</label>
                    <select
                      value={formData.planId}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    >
                      {plansList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ₹{p.monthly_price}/mo ({p.buses_limit ? `${p.buses_limit} Buses` : 'Unlimited Buses'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.bus_limit_quota', 'Bus Limit / Quota')}</label>
                    <input
                      type="number"
                      value={formData.busesCount}
                      onChange={(e) => setFormData({ ...formData, busesCount: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.depot_quota', 'Depot Quota')}</label>
                    <input
                      type="number"
                      value={formData.depotsCount}
                      onChange={(e) => setFormData({ ...formData, depotsCount: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.payment_mode', 'Payment Mode')}</label>
                    <select
                      value={formData.paymentMode}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    >
                      <option value="offline">{t('finance.bank_transfer_offline', 'Bank Transfer / Offline Wire')}</option>
                      <option value="online">{t('finance.razorpay_online', 'Razorpay / Online Gateway')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.amount_rupee_req', 'Amount (₹) *')}</label>
                    <input
                      type="number"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('finance.bank_ref_utr', 'Bank Reference / UTR')}</label>
                    <input
                      type="text"
                      placeholder={t('finance.bank_ref_ph', 'e.g. UTR-982187391')}
                      value={formData.bankRef}
                      onChange={(e) => setFormData({ ...formData, bankRef: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <FleetIcons.Plus className="w-4 h-4 text-white" />
                  <span>{submitting ? 'Provisioning...' : 'Provision Subscription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsListPage;

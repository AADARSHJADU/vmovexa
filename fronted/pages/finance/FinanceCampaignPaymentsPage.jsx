/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { RecordOfflinePaymentModal } from '../../components/ui/RecordOfflinePaymentModal.jsx';

export const FinanceCampaignPaymentsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const {
    campaignPayments,
    campaignPaymentsPagination,
    campaignPaymentsCounts,
    campaignPaymentsSummary,
    loadCampaignPayments,
    shareCampaignPaymentLink,
  } = useFinanceRole();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'paid' | 'live'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'live' | 'completed' | 'paused'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'title'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Action Menu States
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareCamp, setSelectedShareCamp] = useState(null);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [sendingShare, setSendingShare] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [selectedManualCamp, setSelectedManualCamp] = useState(null);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown-menu]')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    if (!searchQuery && !debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      sort: sortBy,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab === 'pending') params.paymentStatus = 'pending';
    else if (activeTab === 'paid') params.paymentStatus = 'paid';
    else if (activeTab === 'live') params.status = 'live';

    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [currentPage, pageSize, debouncedSearch, activeTab, statusFilter, sortBy]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      await loadCampaignPayments(getFilterParams());
    } catch (err) {
      toast.error(t('finance.campaign_payments.load_failed', 'Failed to load campaign payments: ') + (err?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  }, [loadCampaignPayments, getFilterParams, t]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCampaignPayments(getFilterParams());
      toast.success(t('finance.campaign_payments.refreshed_success', 'Campaign payments refreshed!'));
    } catch {
      toast.error(t('finance.campaign_payments.refresh_failed', 'Failed to refresh campaign payments.'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleShareLink = async (e) => {
    e.preventDefault();
    if (!clientEmail && !clientPhone) {
      toast.error('Please enter an email or phone number.');
      return;
    }
    setSendingShare(true);
    try {
      await shareCampaignPaymentLink(selectedShareCamp.id, {
        email: clientEmail || undefined,
        phone: clientPhone || undefined,
      });
      toast.success('Payment checkout link sent successfully!');
      setShowShareModal(false);
      setSelectedShareCamp(null);
      setClientEmail('');
      setClientPhone('');
    } catch (err) {
      toast.error(err?.message || 'Failed to send payment link.');
    } finally {
      setSendingShare(false);
    }
  };

  const campaignList = useMemo(() => Array.isArray(campaignPayments)
    ? campaignPayments
    : (campaignPayments?.rows || campaignPayments?.items || []), [campaignPayments]);

  // Filter Helper Predicates
  const isPendingPayment = (c) => c.payment_status !== 'paid';
  const isSettledPaid = (c) => c.payment_status === 'paid';
  const isLiveBroadcast = (c) => c.status === 'live';

  // Base counts & financial summary from server aggregate (independent of active filter tab)
  const tabCounts = useMemo(() => ({
    all: campaignPaymentsCounts?.all ?? (campaignPaymentsPagination?.total ?? campaignList.length),
    pending: campaignPaymentsCounts?.pending ?? campaignList.filter(isPendingPayment).length,
    paid: campaignPaymentsCounts?.paid ?? campaignList.filter(isSettledPaid).length,
    live: campaignPaymentsCounts?.live ?? campaignList.filter(isLiveBroadcast).length,
  }), [campaignPaymentsCounts, campaignPaymentsPagination?.total, campaignList]);

  // Overall KPIs (prefer server aggregate across all records, fallback to current slice)
  const kpis = useMemo(() => {
    const fallbackPendingList = campaignList.filter(isPendingPayment);
    const fallbackPaidList = campaignList.filter(isSettledPaid);
    const payable = (c) => Number(c.total_payable ?? ((Number(c.budget || 0)) + Number(c.tax_amount || 0))) || Number(c.budget || 0);

    return {
      pendingCount: tabCounts.pending,
      totalPendingAmt: campaignPaymentsSummary?.totalPendingAmount ?? fallbackPendingList.reduce((sum, c) => sum + payable(c), 0),
      paidCount: tabCounts.paid,
      totalCollectedAmt: campaignPaymentsSummary?.totalCollectedAmount ?? fallbackPaidList.reduce((sum, c) => sum + payable(c), 0),
      liveCount: tabCounts.live,
      totalAmt: campaignPaymentsSummary?.totalAmount ?? (fallbackPendingList.concat(fallbackPaidList)).reduce((sum, c) => sum + payable(c), 0),
    };
  }, [tabCounts, campaignPaymentsSummary, campaignList]);

  // Pagination Slice
  const totalItems = campaignPaymentsPagination?.total ?? campaignList.length;
  const totalPages = campaignPaymentsPagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;
  const pagedCampaigns = campaignList;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              {
                label: basePath.startsWith('/superadmin')
                  ? t('nav.superadmin', 'Super Admin')
                  : t('nav.headers.finance_portal', 'Finance Portal'),
                path: `${basePath}/dashboard`,
              },
              { label: t('finance.campaign_payments_title', 'Campaign Payments') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('finance.campaign_payments_title', 'Campaign Payments')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.finance.financecampaignpaymentspage.track_campaign_payments_billing_and_status', 'Track campaign payments, billing, and status.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing || loading} />
        </div>
      </div>

      {/* KPI Cards with Gradient Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Payments */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.pending_payments')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              {kpis.pendingCount}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
              {t('ag.finance.financecampaignpaymentspage.unpaid', 'Unpaid')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.pending_payments_sub')}</p>
        </div>

        {/* Card 2: Pending Amount */}
        <div className="bg-gradient-to-br from-white via-white to-rose-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-rose-950/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.pending_amount')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{kpis.totalPendingAmt.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {t('ag.finance.financecampaignpaymentspage.incl_gst', 'Incl. GST')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.pending_amount_sub')}</p>
        </div>

        {/* Card 3: Paid Campaigns */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.paid_campaigns')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {kpis.paidCount}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs">
              {kpis.liveCount} {t('ag.finance.financecampaignpaymentspage.live', 'Live')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.paid_campaigns_sub')}</p>
        </div>

        {/* Card 4: Total Received */}
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.total_received')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ₹{kpis.totalCollectedAmt.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xs">
              {t('ag.finance.financecampaignpaymentspage.received', 'Received')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.total_received_sub')}</p>
        </div>
      </div>

      {/* Responsive Filter Bar with Gradient Active Tabs & In-line Controls */}
      <div className="bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Filter Tabs with Gradient */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1 xl:pb-0">
          {[
            { id: 'all', label: t('common.all', 'All'), count: tabCounts.all },
            { id: 'pending', label: t('common.pending', 'Pending'), count: tabCounts.pending },
            { id: 'paid', label: t('common.paid', 'Paid'), count: tabCounts.paid },
            { id: 'live', label: t('common.live', 'Live'), count: tabCounts.live },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white/80 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-zinc-700/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === tab.id
                  ? 'bg-white/25 text-white backdrop-blur-xs'
                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Search + Filters + Compact View Switcher */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-52 md:w-56 sm:flex-none">
            <FleetIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('finance.campaign_payments.search_ph', 'Search by campaign, code, or client...')}
              className="w-full pl-9 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-2xs placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer shadow-2xs shrink-0"
          >
            <option value="all">{t('finance.campaign_payments.all_statuses')}</option>
            <option value="approved">{t('common.approved')}</option>
            <option value="live">{t('common.live')}</option>
            <option value="completed">{t('common.completed')}</option>
            <option value="paused">{t('common.paused')}</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer shadow-2xs shrink-0"
          >
            <option value="newest">{t('finance.campaign_payments.newest_first')}</option>
            <option value="oldest">{t('finance.campaign_payments.oldest_first')}</option>
            <option value="amount_high">{t('finance.campaign_payments.highest_amount')}</option>
            <option value="amount_low">{t('finance.campaign_payments.lowest_amount')}</option>
            <option value="title">{t('finance.campaign_payments.name_az')}</option>
          </select>

          {/* View Mode Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableValue="table"
            cardValue="card"
          />
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-8 h-8 border-3 border-slate-300 dark:border-zinc-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('finance.campaign_payments.loading')}</p>
        </div>
      ) : pagedCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-2 shadow-xs">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">{t('finance.no_campaigns_found', 'No campaigns found')}</p>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {searchQuery
              ? t('finance.campaign_payments.no_results_query', 'No results match search query.')
              : t('finance.campaign_payments.no_results_filter', 'No campaigns found for the selected filter.')}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3 px-4">{t('finance.campaign_payments.campaign')}</th>
                  <th className="py-3 px-4">{t('finance.campaign_payments.client')}</th>
                  <th className="py-3 px-4 text-right">{t('finance.campaign_payments.amount')}</th>
                  <th className="py-3 px-4 text-center">{t('common.status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {pagedCampaigns.map(camp => {
                  const budgetNum = Number(camp.taxable_amount ?? camp.budget ?? 0);
                  const gst = Number(camp.tax_amount ?? Math.round(Number(camp.budget || 0) * 0.18));
                  const totalPayable = Number(camp.total_payable ?? (budgetNum + gst));
                  const isPaid = camp.payment_status === 'paid';

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Campaign Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <FleetIcons.Campaigns className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </span>
                          <div className="min-w-0">
                            <Link
                              to={`${basePath}/campaign-payments/${camp.id}`}
                              className="font-bold text-slate-900 dark:text-white truncate text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer block"
                            >
                              {camp.title}
                            </Link>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                              {camp.code} · <span className="text-slate-600 dark:text-zinc-400 font-sans font-medium">{camp.brand_name || t('finance.campaign_payments.brand_commercial', 'Commercial')}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">
                          {camp.client_name || camp.client_company || camp.advertiser?.company_name || camp.advertiser?.name || camp.brand_name || t('finance.campaign_payments.client_fallback', 'Customer / Client')}
                        </p>
                        {camp.client_company && camp.client_name && (
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 font-medium">{camp.client_company}</p>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2 flex-wrap">
                          {camp.client_phone && (
                            <span className="flex items-center gap-1">
                              <FleetIcons.Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{camp.client_phone}</span>
                            </span>
                          )}
                          {camp.client_email && (
                            <span className="flex items-center gap-1">
                              <FleetIcons.Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{camp.client_email}</span>
                            </span>
                          )}
                          {!camp.client_phone && !camp.client_email && (
                            <span>{camp.advertiser?.user?.email || camp.advertiser?.email || t('finance.campaign_payments.registered_advertiser', 'Registered Advertiser')}</span>
                          )}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-black text-slate-900 dark:text-white text-sm">₹{totalPayable.toLocaleString('en-IN')}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('common.paid')}</span>
                            {camp.status === 'live' && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">({t('common.live')})</span>}
                            {camp.status === 'completed' && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">({t('common.completed')})</span>}
                          </span>
                        ) : camp.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{t('finance.campaign_payments.pending_payment')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 capitalize">
                            {camp.status}
                          </span>
                        )}
                      </td>

                      {/* Actions: 3-Dots Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="relative inline-block text-left" data-dropdown-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === camp.id ? null : camp.id);
                            }}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <FleetIcons.MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === camp.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`${basePath}/campaign-payments/${camp.id}`);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{t('common.view_details', 'View Details')}</span>
                              </button>

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setSelectedShareCamp(camp);
                                    setClientEmail(camp.client_email || camp.advertiser?.user?.email || '');
                                    setClientPhone(camp.client_phone || '');
                                    setShowShareModal(true);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Share className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span>{t('finance.campaign_payments.share_link', 'Share Link')}</span>
                                </button>
                              )}

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setSelectedManualCamp(camp);
                                    setShowOfflineModal(true);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>{t('finance.campaign_payments.record_payment', 'Record Payment')}</span>
                                </button>
                              )}

                              {camp.payment_token && !isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${camp.id}/pay?token=${camp.payment_token}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Payment URL copied!');
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{t('common.copy_link', 'Copy Link')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Global Pagination Component in Table View */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pagedCampaigns.map((camp) => {
              const budgetNum = Number(camp.taxable_amount ?? camp.budget ?? 0);
              const gst = Number(camp.tax_amount ?? Math.round(Number(camp.budget || 0) * 0.18));
              const totalPayable = Number(camp.total_payable ?? (budgetNum + gst));
              const isPaid = camp.payment_status === 'paid';
              const clientName = camp.client_name || camp.client_company || camp.advertiser?.company_name || camp.advertiser?.name || camp.brand_name || t('finance.campaign_payments.client_fallback', 'Customer / Client');

              return (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Card Top: Code & Status + 3-Dots Action */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                          {camp.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate" title={camp.title}>
                          <Link
                            to={`${basePath}/campaign-payments/${camp.id}`}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {camp.title}
                          </Link>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                          {camp.brand_name || t('finance.campaign_payments.brand_commercial', 'Commercial Brand')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('common.paid')}</span>
                          </span>
                        ) : camp.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{t('common.pending')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 capitalize">
                            {camp.status}
                          </span>
                        )}

                        {/* Card 3-Dots Action Dropdown */}
                        <div className="relative inline-block text-left" data-dropdown-menu>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === camp.id ? null : camp.id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <FleetIcons.MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === camp.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  navigate(`${basePath}/campaign-payments/${camp.id}`);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>{t('common.view_details', 'View Details')}</span>
                              </button>

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setSelectedShareCamp(camp);
                                    setClientEmail(camp.client_email || camp.advertiser?.user?.email || '');
                                    setClientPhone(camp.client_phone || '');
                                    setShowShareModal(true);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Share className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                  <span>{t('finance.campaign_payments.share_link', 'Share Link')}</span>
                                </button>
                              )}

                              {!isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setSelectedManualCamp(camp);
                                    setShowOfflineModal(true);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>{t('finance.campaign_payments.record_payment', 'Record Payment')}</span>
                                </button>
                              )}

                              {camp.payment_token && !isPaid && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${camp.id}/pay?token=${camp.payment_token}`;
                                    navigator.clipboard.writeText(url);
                                    toast.success('Payment URL copied!');
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <FleetIcons.Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{t('common.copy_link', 'Copy Link')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Client details */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('finance.campaign_payments.client')}</span>
                        <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 truncate">{clientName}</p>
                        {camp.client_company && camp.client_company !== clientName && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{camp.client_company}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                          {camp.client_phone && (
                            <span className="flex items-center gap-1">
                              <FleetIcons.Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{camp.client_phone}</span>
                            </span>
                          )}
                          {camp.client_email && (
                            <span className="flex items-center gap-1">
                              <FleetIcons.Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{camp.client_email}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount Box */}
                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{t('finance.campaign_payments.total_amount')}</span>
                          <span className="font-black text-slate-900 dark:text-white font-mono text-base">₹{totalPayable.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('finance.campaign_payments.payment_status')}</span>
                    <div className="flex items-center gap-2">
                      {isPaid ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t('ag.finance.financecampaignpaymentspage.paid', 'Paid ·')} {camp.status === 'live' ? t('common.live', 'Live') : camp.status === 'completed' ? t('common.completed', 'Completed') : t('finance.campaign_payments.settled', 'Settled')}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>{t('finance.campaign_payments.pending_payment')}</span>
                        </span>
                      )}
                      <Link
                        to={`${basePath}/campaign-payments/${camp.id}`}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-1"
                      >
                        {t('common.details', 'Details →')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Pagination Component in Card View */}
          <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageSizeChange={(sz) => {
                setPageSize(sz);
                setCurrentPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </div>
        </div>
      )}


      {/* Share Payment Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FleetIcons.Share className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Send Payment Link</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedShareCamp(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleShareLink} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Customer Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Customer Mobile (SMS / WhatsApp)</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedShareCamp(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingShare}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingShare ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Offline Payment Modal */}
      {showOfflineModal && (
        <RecordOfflinePaymentModal
          isOpen={showOfflineModal}
          onClose={() => {
            setShowOfflineModal(false);
            setSelectedManualCamp(null);
          }}
          campaign={selectedManualCamp}
          onSuccess={() => {
            setShowOfflineModal(false);
            setSelectedManualCamp(null);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default FinanceCampaignPaymentsPage;

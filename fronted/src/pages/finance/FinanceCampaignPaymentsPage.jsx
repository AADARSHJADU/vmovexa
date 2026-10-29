/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { FleetIcons } from '../../components/FleetIcons.jsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const FinanceCampaignPaymentsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const {
    campaignPayments,
    campaignPaymentsPagination,
    loadCampaignPayments,
  } = useFinanceRole();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'paid' | 'live'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'live' | 'completed' | 'paused'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'title'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab === 'pending') params.paymentStatus = 'pending';
    else if (activeTab === 'paid') params.paymentStatus = 'paid';
    else if (activeTab === 'live') params.status = 'live';

    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [currentPage, pageSize, debouncedSearch, activeTab, statusFilter]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      await loadCampaignPayments(getFilterParams());
    } catch (err) {
      toast.error('Failed to load campaign payments: ' + (err?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  }, [loadCampaignPayments, getFilterParams]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const campaignList = useMemo(() => Array.isArray(campaignPayments)
    ? campaignPayments
    : (campaignPayments?.rows || campaignPayments?.items || []), [campaignPayments]);

  // Filter Helper Predicates
  const isPendingPayment = (c) => c.payment_status !== 'paid';
  const isSettledPaid = (c) => c.payment_status === 'paid';
  const isLiveBroadcast = (c) => c.status === 'live';

  // KPIs
  const kpis = useMemo(() => {
    const pendingList = campaignList.filter(isPendingPayment);
    const paidList = campaignList.filter(isSettledPaid);
    const liveList = campaignList.filter(isLiveBroadcast);
    const totalPendingAmt = pendingList.reduce((sum, c) => sum + Math.round(Number(c.budget || 0) * 1.18), 0);
    const totalCollectedAmt = paidList.reduce((sum, c) => sum + Math.round(Number(c.budget || 0) * 1.18), 0);

    return {
      pendingCount: pendingList.length,
      totalPendingAmt,
      paidCount: paidList.length,
      liveCount: liveList.length,
      totalCollectedAmt,
    };
  }, [campaignList]);

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
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Campaign Payments' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('finance.campaign_payments_title', 'Campaign Payments')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Track campaign payments, billing, and status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={fetchCampaigns} loading={loading} />
        </div>
      </div>

      {/* KPI Cards with Gradient Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: {t('finance.campaign_payments.pending_payments')} */}
        <div className="bg-gradient-to-br from-white via-white to-amber-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.pending_payments')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              {kpis.pendingCount}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs">
              Unpaid
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.pending_payments_sub')}</p>
        </div>

        {/* Card 2: {t('finance.campaign_payments.pending_amount')} */}
        <div className="bg-gradient-to-br from-white via-white to-rose-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-rose-950/20 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.pending_amount')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{kpis.totalPendingAmt.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              Incl. GST
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.pending_amount_sub')}</p>
        </div>

        {/* Card 3: {t('finance.campaign_payments.paid_campaigns')} */}
        <div className="bg-gradient-to-br from-white via-white to-emerald-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.paid_campaigns')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {kpis.paidCount}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs">
              {kpis.liveCount} Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 font-medium">{t('finance.campaign_payments.paid_campaigns_sub')}</p>
        </div>

        {/* Card 4: {t('finance.campaign_payments.total_received')} */}
        <div className="bg-gradient-to-br from-white via-white to-indigo-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('finance.campaign_payments.total_received')}</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              ₹{kpis.totalCollectedAmt.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xs">
              Received
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
            { id: 'all', label: 'All', count: campaignList.length },
            { id: 'pending', label: 'Pending', count: kpis.pendingCount },
            { id: 'paid', label: 'Paid', count: kpis.paidCount },
            { id: 'live', label: 'Live', count: kpis.liveCount },
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

        {/* Right: Search + Filters + Compact View Switcher (One Single Row) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-52 md:w-56 sm:flex-none">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder={t('common.search', 'Search campaigns...')}
              className="w-full pl-9 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-2xs"
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
            {searchQuery ? `No results match "${searchQuery}".` : 'No campaigns found for the selected filter.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                  <th className="py-3 px-4">{t('finance.campaign_payments.campaign')}</th>
                  <th className="py-3 px-4">{t('finance.campaign_payments.client')}</th>
                  <th className="py-3 px-4">{t('finance.campaign_payments.screens_routes')}</th>
                  <th className="py-3 px-4 text-right">{t('finance.campaign_payments.amount')}</th>
                  <th className="py-3 px-4 text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {pagedCampaigns.map(camp => {
                  const budgetNum = Number(camp.budget || 0);
                  const gst = Math.round(budgetNum * 0.18);
                  const totalPayable = budgetNum + gst;
                  const isPaid = camp.payment_status === 'paid';
                  const targets = camp.targets || [];
                  const routesCount = targets.filter(t => t.route_id || t.route).length;
                  const totalScreens = targets.reduce((sum, t) => sum + (t.screens_count || 0), 0);

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Campaign Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
                            <FleetIcons.Campaigns className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{camp.title}</p>
                            <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                              {camp.code} · <span className="text-slate-600 dark:text-zinc-400 font-sans font-medium">{camp.brand_name || 'Commercial'}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Client Info */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">
                          {camp.client_name || camp.client_company || camp.advertiser?.company_name || camp.advertiser?.name || camp.brand_name || 'Customer / Client'}
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
                            <span>{camp.advertiser?.user?.email || camp.advertiser?.email || 'Registered Advertiser'}</span>
                          )}
                        </p>
                      </td>

                      {/* Screens & Routes */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                            {routesCount > 0 ? `${routesCount} Route(s)` : `${targets.length || 1} Fleet Operator(s)`}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {totalScreens > 0 ? `${totalScreens} Screen(s)` : 'Transit Network'}
                          </p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-black text-slate-900 dark:text-white text-sm">₹{totalPayable.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          Base: ₹{budgetNum.toLocaleString()} · GST: ₹{gst.toLocaleString()}
                        </p>
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
              const budgetNum = Number(camp.budget || 0);
              const gst = Math.round(budgetNum * 0.18);
              const totalPayable = budgetNum + gst;
              const isPaid = camp.payment_status === 'paid';
              const targets = camp.targets || [];
              const routesCount = targets.filter(t => t.route_id || t.route).length;
              const totalScreens = targets.reduce((sum, t) => sum + (t.screens_count || 0), 0);
              const clientName = camp.client_name || camp.client_company || camp.advertiser?.company_name || camp.advertiser?.name || camp.brand_name || 'Customer / Client';

              return (
                <div
                  key={camp.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Card Top: Code & Status */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                          {camp.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate" title={camp.title}>
                          {camp.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                          {camp.brand_name || 'Commercial Brand'}
                        </p>
                      </div>
                      <div>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('common.paid')}</span>
                          </span>
                        ) : camp.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{t('common.pending')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shrink-0 capitalize">
                            {camp.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Client details & targets */}
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

                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('finance.campaign_payments.routes')}</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200">
                            {routesCount > 0 ? `${routesCount} Route(s)` : `${targets.length || 1} Operator(s)`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('finance.campaign_payments.screens')}</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200">
                            {totalScreens > 0 ? `${totalScreens} Screen(s)` : 'Transit Network'}
                          </p>
                        </div>
                      </div>

                      {/* Amount Box */}
                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{t('finance.campaign_payments.total_amount')}</span>
                          <span className="font-black text-slate-900 dark:text-white font-mono text-base">₹{totalPayable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          <span>Base: ₹{budgetNum.toLocaleString()}</span>
                          <span>+ GST (18%): ₹{gst.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clean Card Footer - Status Only, No Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 dark:text-zinc-500 font-medium">{t('finance.campaign_payments.payment_status')}</span>
                    {isPaid ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Paid · {camp.status === 'live' ? 'Live' : camp.status === 'completed' ? 'Completed' : 'Settled'}</span>
                      </span>
                    ) : (
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>{t('finance.campaign_payments.pending_payment')}</span>
                      </span>
                    )}
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
    </div>
  );
};

export default FinanceCampaignPaymentsPage;

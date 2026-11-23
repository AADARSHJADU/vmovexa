import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const PaymentsListPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { payments, paymentsPagination, loadPayments } = useFinanceRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    payerType: '', purpose: '', method: '', paymentMode: '',
    startDate: '', endDate: '', minAmount: '', maxAmount: '',
  });

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
    if (activeTab === 'paid') params.status = 'success';
    else if (activeTab === 'pending') params.status = 'pending,created';
    else if (activeTab === 'failed') params.status = 'failed';
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params[key] = value;
    });
    return params;
  }, [currentPage, pageSize, debouncedSearch, activeTab, filters]);

  useEffect(() => {
    loadPayments(getFilterParams()).catch(() => {});
  }, [getFilterParams, loadPayments]);

  const paymentList = useMemo(() => Array.isArray(payments) ? payments : (payments?.items || payments?.rows || []), [payments]);
  const currentPayments = paymentList;
  const totalItems = paymentsPagination?.total ?? paymentList.length;
  const totalPages = paymentsPagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPayments(getFilterParams());
      toast.success(t('finance.payments.refreshed_success', 'Payment settlements refreshed!'));
    } catch {
      toast.error(t('finance.payments.refresh_failed', 'Failed to refresh payments.'));
    } finally {
      setRefreshing(false);
    }
  };

  const stats = paymentsPagination?.stats || {};
  const filterOptions = paymentsPagination?.filterOptions || {};

  const dynamicPayerOptions = useMemo(() => {
    const values = Array.isArray(filterOptions.payerTypes) ? [...filterOptions.payerTypes] : [];
    if (filters.payerType && !values.includes(filters.payerType)) values.push(filters.payerType);
    return values.map((val) => [val, formatPayerLabel(val, t)]);
  }, [filterOptions.payerTypes, filters.payerType, t]);

  const dynamicPurposeOptions = useMemo(() => {
    const values = Array.isArray(filterOptions.purposes) ? [...filterOptions.purposes] : [];
    if (filters.purpose && !values.includes(filters.purpose)) values.push(filters.purpose);
    return values.map((val) => [val, formatPurposeLabel(val, t)]);
  }, [filterOptions.purposes, filters.purpose, t]);

  const dynamicMethodOptions = useMemo(() => {
    const values = Array.isArray(filterOptions.methods) ? [...filterOptions.methods] : [];
    if (filters.method && !values.includes(filters.method)) values.push(filters.method);
    return values.map((val) => [val, formatMethodLabel(val)]);
  }, [filterOptions.methods, filters.method]);

  const dynamicChannelOptions = useMemo(() => {
    const values = Array.isArray(filterOptions.paymentModes) ? [...filterOptions.paymentModes] : [];
    if (filters.paymentMode && !values.includes(filters.paymentMode)) values.push(filters.paymentMode);
    return values.map((val) => [val, formatChannelLabel(val, t)]);
  }, [filterOptions.paymentModes, filters.paymentMode, t]);

  const filterTabs = [
    { id: 'all', label: t('common.all', 'All'), count: stats.all ?? (activeTab === 'all' ? totalItems : 0) },
    { id: 'paid', label: t('common.paid', 'Paid'), count: stats.successful ?? (activeTab === 'paid' ? totalItems : 0) },
    { id: 'pending', label: t('common.pending', 'Pending'), count: stats.pending ?? (activeTab === 'pending' ? totalItems : 0) },
    { id: 'failed', label: t('common.failed', 'Failed'), count: stats.failed ?? (activeTab === 'failed' ? totalItems : 0) },
  ];

  const activeFilterCount = Object.values(filters).filter((value) => value !== '').length;
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };
  const resetFilters = () => {
    setFilters({ payerType: '', purpose: '', method: '', paymentMode: '', startDate: '', endDate: '', minAmount: '', maxAmount: '' });
    setSearchQuery('');
    setDebouncedSearch('');
    setActiveTab('all');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'success' || s === 'paid') return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (s === 'pending' || s === 'created') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (s === 'failed' || s === 'overdue') return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    if (s === 'refunded') return 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800';
    return 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
  };

  const getStatusText = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'success' || s === 'paid') return t('common.paid', 'Paid');
    if (s === 'pending' || s === 'created') return t('common.pending', 'Pending');
    if (s === 'failed' || s === 'overdue') return t('common.failed', 'Failed');
    if (s === 'refunded') return t('common.refunded', 'Refunded');
    return status ?? '—';
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
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
              { label: t('finance.payment_settlements', 'Payment Settlements') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.payment_settlements', 'Payment Settlements')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.finance.paymentslistpage.audit_inward_collections_bank_gateway_settle', 'Audit inward collections, bank gateway settlements, and unpaid client receivables')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:max-w-xl">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('finance.payments.search_ph', 'Search payment, invoice, client, UTR or transaction ref')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${showFilters || activeFilterCount ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'}`}
            >
              <FleetIcons.Filter className="w-4 h-4" />
              {t('ag.finance.paymentslistpage.filters', 'Filters')}
              {activeFilterCount > 0 && <span className="rounded-full bg-indigo-600 text-white px-1.5 py-0.5 text-[10px]">{activeFilterCount}</span>}
            </button>
            {(activeFilterCount > 0 || debouncedSearch || activeTab !== 'all') && (
              <button type="button" onClick={resetFilters} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer">
                {t('ag.finance.paymentslistpage.clear_all', 'Clear all')}
              </button>
            )}
            <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} tableValue="table" cardValue="card" />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <FilterSelect
              label={t('finance.payments.filter_payer_type', 'Payer type')}
              value={filters.payerType}
              onChange={(value) => updateFilter('payerType', value)}
              options={dynamicPayerOptions}
              allLabel={t('common.all', 'All')}
            />
            <FilterSelect
              label={t('finance.payments.filter_purpose', 'Purpose')}
              value={filters.purpose}
              onChange={(value) => updateFilter('purpose', value)}
              options={dynamicPurposeOptions}
              allLabel={t('common.all', 'All')}
            />
            <FilterSelect
              label={t('finance.payments.filter_method', 'Payment method')}
              value={filters.method}
              onChange={(value) => updateFilter('method', value)}
              options={dynamicMethodOptions}
              allLabel={t('common.all', 'All')}
            />
            <FilterSelect
              label={t('finance.payments.filter_channel', 'Channel')}
              value={filters.paymentMode}
              onChange={(value) => updateFilter('paymentMode', value)}
              options={dynamicChannelOptions}
              allLabel={t('common.all', 'All')}
            />
            <FilterInput
              label={t('finance.payments.filter_from_date', 'From date')}
              type="date"
              value={filters.startDate}
              onChange={(value) => updateFilter('startDate', value)}
              max={filters.endDate || undefined}
            />
            <FilterInput
              label={t('finance.payments.filter_to_date', 'To date')}
              type="date"
              value={filters.endDate}
              onChange={(value) => updateFilter('endDate', value)}
              min={filters.startDate || undefined}
            />
            <FilterInput
              label={t('finance.payments.filter_min_amount', 'Minimum amount')}
              type="number"
              value={filters.minAmount}
              onChange={(value) => updateFilter('minAmount', value)}
              min="0"
              placeholder="₹0"
            />
            <FilterInput
              label={t('finance.payments.filter_max_amount', 'Maximum amount')}
              type="number"
              value={filters.maxAmount}
              onChange={(value) => updateFilter('maxAmount', value)}
              min={filters.minAmount || '0'}
              placeholder={t('ag.finance.paymentslistpage.any_amount', 'Any amount')}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      {paymentList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Analytics className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.payments.no_settlements')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('finance.payments.no_settlements_desc')}</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('finance.payments.payment_ref')}</th>
                  <th className="py-3 px-4">{t('finance.payments.linked_invoice')}</th>
                  <th className="py-3 px-4">{t('finance.payments.client_name')}</th>
                  <th className="py-3 px-4">{t('finance.campaign_payments.amount')}</th>
                  <th className="py-3 px-4">{t('finance.payments.settlement_date')}</th>
                  <th className="py-3 px-4">{t('finance.payments.method_channel')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                {currentPayments.map((pay) => {
                  const formattedDate = pay.paid_at
                    ? new Date(pay.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const clientName =
                    pay.invoice?.customer_name ||
                    pay.campaign?.client_name ||
                    pay.campaign?.client_company ||
                    pay.organization?.name ||
                    pay.customer_name ||
                    '—';
                  const metaLine = [pay.payer_type, pay.purpose]
                    .filter(Boolean)
                    .map((val) => String(val).replace(/_/g, ' '))
                    .join(' · ');
                  const displayMethod =
                    pay.payment_mode === 'offline'
                      ? (pay.offline_method || pay.method || null)
                      : (pay.method || pay.offline_method || null);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {pay.code || pay.utr_number || pay.reference_number || pay.gateway_ref || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {pay.invoice ? (
                          <Link
                            to={`${basePath}/invoices/${pay.invoice.id}`}
                            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {pay.invoice.code}
                          </Link>
                        ) : pay.campaign?.code ? (
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            {pay.campaign.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <div>{clientName}</div>
                        {metaLine && (
                          <div className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                            {metaLine}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                        <div>{pay.amount != null ? `₹${Number(pay.amount).toLocaleString('en-IN')}` : '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">{formattedDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 capitalize">
                        <div>{displayMethod ? String(displayMethod).replace(/_/g, ' ') : '—'}</div>
                        {pay.payment_mode && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase">{pay.payment_mode}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getStatusBadge(pay.status)}`}>
                          {getStatusText(pay.status)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`${basePath}/payments/${pay.id}`}
                          className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all inline-flex items-center justify-center shadow-xs cursor-pointer"
                          title={t('finance.payments.view_details')}
                          aria-label={t('finance.payments.view_details')}
                        >
                          <FleetIcons.Eye className="w-4 h-4 text-white" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Global Pagination */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
            <Pagination
              currentPage={paymentsPagination?.page || currentPage}
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
            {currentPayments.map((pay) => {
              const formattedDate = pay.paid_at
                ? new Date(pay.paid_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';
              const clientName =
                pay.invoice?.customer_name ||
                pay.campaign?.client_name ||
                pay.campaign?.client_company ||
                pay.organization?.name ||
                pay.customer_name ||
                '—';
              const metaLine = [pay.payer_type, pay.purpose]
                .filter(Boolean)
                .map((val) => String(val).replace(/_/g, ' '))
                .join(' · ');
              const displayMethod =
                pay.payment_mode === 'offline'
                  ? (pay.offline_method || pay.method || null)
                  : (pay.method || pay.offline_method || null);

              return (
                <div
                  key={pay.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                          {pay.code || pay.utr_number || pay.reference_number || pay.gateway_ref || '—'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{clientName}</h3>
                        {metaLine && (
                          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500 mt-1">{metaLine}</p>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${getStatusBadge(pay.status)}`}>
                        {getStatusText(pay.status)}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-100 dark:border-zinc-700 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-zinc-500">{t('finance.campaign_payments.total_amount')}</span>
                        <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                          {pay.amount != null ? `₹${Number(pay.amount).toLocaleString('en-IN')}` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-zinc-500">{t('finance.payments.settlement_date')}:</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{formattedDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 dark:text-zinc-500">{t('finance.payments.method_channel')}:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                          {displayMethod ? String(displayMethod).replace(/_/g, ' ') : '—'}
                          {pay.payment_mode ? ` (${pay.payment_mode})` : ''}
                        </span>
                      </div>
                      {pay.invoice ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-zinc-500">{t('finance.payments.linked_invoice')}:</span>
                          <Link to={`${basePath}/invoices/${pay.invoice.id}`} className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            {pay.invoice.code}
                          </Link>
                        </div>
                      ) : pay.campaign?.code ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 dark:text-zinc-500">{t('finance.payments.campaign_code')}</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300">{pay.campaign.code}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      to={`${basePath}/payments/${pay.id}`}
                      className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all inline-flex items-center justify-center shadow-xs cursor-pointer"
                      title={t('finance.payments.view_details')}
                      aria-label={t('finance.payments.view_details')}
                    >
                      <FleetIcons.Eye className="w-4 h-4 text-white" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global Pagination */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3 shadow-sm">
            <Pagination
              currentPage={paymentsPagination?.page || currentPage}
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

const titleCase = (str) =>
  String(str || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());

const formatPayerLabel = (val, t) => {
  const key = String(val || '').toLowerCase();
  if (key === 'tenant') return t('finance.payers.tenant', 'Tenant Admin');
  if (key === 'advertiser') return t('finance.payers.advertiser', 'Advertiser');
  if (key === 'government') return t('finance.payers.government', 'Government');
  if (key === 'platform') return t('finance.payers.platform', 'Platform');
  return titleCase(val);
};

const formatPurposeLabel = (val, t) => {
  const key = String(val || '').toLowerCase();
  if (key === 'saas_subscription') return t('finance.purposes.saas', 'SaaS subscription');
  if (key === 'ad_spend') return t('finance.purposes.ad_spend', 'Advertising campaign');
  if (key === 'psa_spend') return t('finance.purposes.psa_spend', 'Government / PSA campaign');
  if (key === 'payout') return t('finance.purposes.payout', 'Payout');
  if (key === 'wallet_topup') return t('finance.purposes.wallet_topup', 'Wallet top-up');
  if (key === 'refund') return t('finance.purposes.refund', 'Refund');
  return titleCase(val);
};

const METHOD_DISPLAY_MAP = {
  razorpay: 'Razorpay',
  upi: 'UPI',
  upi_manual: 'UPI (Manual)',
  card: 'Card',
  netbanking: 'Net banking',
  bank_wire: 'Bank wire',
  bank_transfer: 'Bank transfer',
  neft: 'NEFT',
  rtgs: 'RTGS',
  imps: 'IMPS',
  cheque: 'Cheque',
  demand_draft: 'Demand draft',
  cash: 'Cash',
};

const formatMethodLabel = (val) => {
  const key = String(val || '').toLowerCase();
  return METHOD_DISPLAY_MAP[key] || titleCase(val);
};

const formatChannelLabel = (val, t) => {
  const key = String(val || '').toLowerCase();
  if (key === 'online') return t('finance.channels.online', 'Online');
  if (key === 'offline') return t('finance.channels.offline', 'Offline');
  return titleCase(val);
};

const fieldClassName = 'w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-300';

const FilterSelect = ({ label, value, onChange, options, allLabel = 'All' }) => (
  <label className="space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClassName}>
      <option value="">{allLabel}</option>
      {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
    </select>
  </label>
);

const FilterInput = ({ label, value, onChange, ...props }) => (
  <label className="space-y-1.5">
    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className={fieldClassName} {...props} />
  </label>
);

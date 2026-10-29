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
  const { payments, paymentsPagination, kpis, loadKpis, loadPayments } = useFinanceRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [refreshing, setRefreshing] = useState(false);
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
    if (activeTab === 'Paid') params.status = 'success';
    else if (activeTab === 'Pending') params.status = 'pending';
    else if (activeTab === 'Failed') params.status = 'failed';
    return params;
  }, [currentPage, pageSize, debouncedSearch, activeTab]);

  useEffect(() => {
    loadPayments(getFilterParams()).catch(() => {});
  }, [getFilterParams, loadPayments]);

  useEffect(() => {
    loadKpis().catch(() => {});
  }, [loadKpis]);

  const paymentList = useMemo(() => Array.isArray(payments) ? payments : (payments?.items || payments?.rows || []), [payments]);
  const currentPayments = paymentList;
  const totalItems = paymentsPagination?.total ?? paymentList.length;
  const totalPages = paymentsPagination?.totalPages || Math.ceil(totalItems / pageSize) || 1;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadPayments(getFilterParams()), loadKpis()]);
      toast.success('Payment settlements refreshed!');
    } catch {
      toast.error('Failed to refresh payments.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterTabs = [
    { label: 'All', count: activeTab === 'All' ? totalItems : (kpis?.totalPayments ? '₹' + Number(kpis.totalPayments).toLocaleString('en-IN') : '—') },
    { label: 'Paid', count: activeTab === 'Paid' ? totalItems : '—' },
    { label: 'Pending', count: activeTab === 'Pending' ? totalItems : '—' },
    { label: 'Failed', count: activeTab === 'Failed' ? totalItems : '—' },
  ];

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'success' || s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'failed' || s === 'overdue') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Payment Settlements' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.payment_settlements', 'Payment Settlements')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Audit inward collections, bank gateway settlements, and unpaid client receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link
            to={`${basePath}/reconciliation`}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Analytics className="w-4 h-4" />
            <span>{t('finance.bank_reconciliation', 'Bank Reconciliation')}</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
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
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTab === tab.label ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('finance.payments.search_ph')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300 focus:outline-none"
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
      {paymentList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Analytics className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">{t('finance.payments.no_settlements')}</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">{t('finance.payments.no_settlements_desc')}</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
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
                    : (pay.created_at ? new Date(pay.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {pay.code || pay.gateway_ref || pay.gateway_payment_id || pay.txn_ref || `PAY-${pay.id}`}
                      </td>
                      <td className="py-3.5 px-4">
                        {pay.invoice ? (
                          <Link
                            to={`${basePath}/invoices/${pay.invoice.id}`}
                            className="font-mono font-bold text-blue-600 hover:underline"
                          >
                            {pay.invoice.code}
                          </Link>
                        ) : pay.campaign ? (
                          <span className="font-mono text-xs font-semibold text-slate-700">
                            {pay.campaign.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {pay.invoice?.customer_name || pay.campaign?.client_name || pay.campaign?.client_company || pay.customer_name || 'Client'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono text-sm">
                        ₹{Number(pay.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">{formattedDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 capitalize">
                        {String(pay.method || pay.gateway || 'Bank Transfer').replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getStatusBadge(pay.status)}`}>
                          {pay.status ?? '—'}
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
          <div className="p-3 border-t border-slate-200">
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
                : (pay.created_at ? new Date(pay.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
              const clientName = pay.invoice?.customer_name || pay.campaign?.client_name || pay.campaign?.client_company || pay.customer_name || 'Client';

              return (
                <div
                  key={pay.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {pay.code || pay.gateway_ref || pay.gateway_payment_id || pay.txn_ref || `PAY-${pay.id}`}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5 truncate">{clientName}</h3>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${getStatusBadge(pay.status)}`}>
                        {pay.status ?? '—'}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('finance.campaign_payments.total_amount')}</span>
                        <span className="font-black text-slate-900 font-mono text-sm">₹{Number(pay.amount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('finance.payments.settlement_date')}:</span>
                        <span className="font-medium text-slate-700">{formattedDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('finance.payments.method_channel')}:</span>
                        <span className="font-semibold text-slate-800 capitalize">
                          {String(pay.method || pay.gateway || 'Bank Transfer').replace(/_/g, ' ')}
                        </span>
                      </div>
                      {pay.invoice ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{t('finance.payments.linked_invoice')}:</span>
                          <Link to={`${basePath}/invoices/${pay.invoice.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                            {pay.invoice.code}
                          </Link>
                        </div>
                      ) : pay.campaign ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">{t('finance.payments.campaign_code')}</span>
                          <span className="font-mono font-semibold text-slate-700">{pay.campaign.code}</span>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
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

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const statusEq = (status, label) => String(status || '').toLowerCase() === label.toLowerCase();

export const InvoicesListPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { invoices, loadInvoices, markInvoicePaid } = useFinanceRole();

  useEffect(() => {
    loadInvoices().catch(() => {});
  }, [loadInvoices]);

  const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.items || invoices?.rows || []);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [utrRef, setUtrRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInvoices();
      toast.success('Invoices list refreshed!');
    } catch {
      toast.error('Failed to refresh invoices.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterTabs = [
    { label: 'All', count: invoiceList.length },
    { label: 'Paid', count: invoiceList.filter((i) => statusEq(i.status, 'paid')).length },
    { label: 'Pending', count: invoiceList.filter((i) => statusEq(i.status, 'issued')).length },
    { label: 'Overdue', count: invoiceList.filter((i) => statusEq(i.status, 'overdue')).length },
  ];

  const filteredInvoices = useMemo(() => {
    return invoiceList.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(inv.code || '').toLowerCase().includes(q) ||
        String(inv.customer_name || '').toLowerCase().includes(q) ||
        String(inv.gstin || '').toLowerCase().includes(q);

      if (activeTab === 'All') return matchesSearch;
      if (activeTab === 'Paid') return matchesSearch && statusEq(inv.status, 'paid');
      if (activeTab === 'Pending') return matchesSearch && statusEq(inv.status, 'issued');
      if (activeTab === 'Overdue') return matchesSearch && statusEq(inv.status, 'overdue');
      return matchesSearch;
    });
  }, [invoiceList, searchQuery, activeTab]);

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleMarkPaid = async (invId) => {
    try {
      await toast.promise(
        markInvoicePaid(invId, { method: paymentMethod, utrRef }),
        {
          loading: 'Recording payment settlement…',
          success: 'Invoice marked as paid!',
          error: (err) => err?.message || 'Failed to update invoice',
        }
      );
      setPayingInvoiceId(null);
      setUtrRef('');
      await loadInvoices().catch(() => {});
    } catch {
      /* handled by toast */
    }
  };


  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'issued' || s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'overdue') return 'bg-red-50 text-red-700 border-red-200';
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
              { label: 'Tax Invoices' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.tax_invoices_billing', 'Tax Invoices & Billing')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Issue GST-compliant invoices, track client receivables, and audit settlement status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link
            to={`${basePath}/invoices/design`}
            title="Customize Invoice Template & Design"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Settings className="w-3.5 h-3.5" />
            <span>Invoice Design</span>
          </Link>
          <Link
            to={`${basePath}/invoices/generate`}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('finance.generate_new_invoice', 'Generate New Invoice')}</span>
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
              placeholder="Search by invoice # or client name..."
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
      {filteredInvoices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Document className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">No invoices found</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">{t('finance.no_invoices_sub', 'Try adjusting your search criteria or create a new invoice.')}</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Client / Entity</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Total Amount (Inc. GST)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.code ?? '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                        inv.type === 'ad_spend'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : inv.type === 'saas_subscription'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {inv.type === 'ad_spend' ? 'Ad Campaign' : inv.type === 'saas_subscription' ? 'SaaS Subscription' : (inv.type || 'Standard')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inv.customer_name || inv.organization?.name || 'Client Entity'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {inv.type === 'ad_spend' ? 'Transit Ad Broadcast' : inv.type === 'saas_subscription' ? 'Fleet Management SaaS' : 'Platform Billing'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">
                      {inv.due_at ? new Date(inv.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (inv.due_date ?? '—')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${getStatusBadge(inv.status)}`}>
                        {inv.status ?? '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`${basePath}/invoices/${inv.id}`}
                        className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all inline-flex items-center justify-center shadow-xs cursor-pointer"
                        title="View Details"
                        aria-label="View Details"
                      >
                        <FleetIcons.Eye className="w-4 h-4 text-white" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {currentInvoices.map((inv) => (
            <div
              key={inv.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{inv.code ?? '—'}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                        inv.type === 'ad_spend'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : inv.type === 'saas_subscription'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {inv.type === 'ad_spend' ? 'Ad Campaign' : inv.type === 'saas_subscription' ? 'SaaS' : (inv.type || 'Invoice')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{inv.customer_name || inv.organization?.name || 'Client Entity'}</h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getStatusBadge(inv.status)}`}>
                    {inv.status ?? '—'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.total_billed', 'Total Billed:')}</span>
                    <span className="font-black text-slate-900">₹{Number(inv.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.issue_date_label', 'Issue Date:')}</span>
                    <span className="text-slate-700">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('finance.payment_due_label', 'Payment Due:')}</span>
                    <span className="font-bold text-slate-800">
                      {inv.due_at ? new Date(inv.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (inv.due_date ?? '—')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`${basePath}/invoices/${inv.id}`}
                  className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all inline-flex items-center justify-center shadow-xs cursor-pointer"
                  title="View Details"
                  aria-label="View Details"
                >
                  <FleetIcons.Eye className="w-4 h-4 text-white" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Pagination */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onPageSizeChange={setItemsPerPage}
          pageSizeOptions={[6, 12, 24, 48]}
        />
      </div>

      {/* Mark Invoice as Paid Modal */}
      {payingInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Confirm Payment Settlement</h3>
              <button
                onClick={() => setPayingInvoiceId(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.settlement_mode', 'Settlement Mode')}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none"
                >
                  <option value="bank_transfer">{t('finance.method_neft_rtgs', 'Direct Bank Transfer / NEFT / RTGS')}</option>
                  <option value="upi">{t('finance.method_upi', 'UPI / QR Payment')}</option>
                  <option value="cheque">{t('finance.method_cheque', 'Cheque Deposit')}</option>
                  <option value="razorpay">Razorpay Gateway Clearance</option>
                  <option value="cash">Cash In-Hand</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('finance.bank_utr_ref', 'Bank UTR / Transaction Reference #')}</label>
                <input
                  type="text"
                  placeholder="e.g. HDFCR52026092500..."
                  value={utrRef}
                  onChange={(e) => setUtrRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPayingInvoiceId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleMarkPaid(payingInvoiceId)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                <span>Confirm Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


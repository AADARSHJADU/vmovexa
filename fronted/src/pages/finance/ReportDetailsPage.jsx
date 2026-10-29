/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useReports } from '../../hooks/shared/useReports';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

function fmtDate(str) {
  if (!str) return '—';
  const parts = str.split('T')[0].split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
}

export const ReportDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { loadReportById, currentReport } = useReports();

  const [loading, setLoading] = useState(true);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [downloading, setDownloading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      await loadReportById(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to load report details.');
    } finally {
      setLoading(false);
    }
  }, [id, loadReportById]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const report = currentReport;
  const params = useMemo(() => {
    if (typeof report?.params !== 'string') return report?.params || {};
    try {
      return JSON.parse(report.params || '{}');
    } catch {
      return {};
    }
  }, [report]);
  const summary = useMemo(() => {
    if (typeof report?.summary !== 'string') return report?.summary || {};
    try {
      return JSON.parse(report.summary || '{}');
    } catch {
      return {};
    }
  }, [report]);

  const reportTitle = params.title || report?.title || `Financial Statement REP-${id}`;
  const periodStr = params.period || (params.startDate && params.endDate ? `${fmtDate(params.startDate)} to ${fmtDate(params.endDate)}` : 'All Time');
  const generatedDate = report?.created_at || report?.createdAt ? new Date(report?.created_at || report?.createdAt).toLocaleDateString('en-IN') : '—';

  // Itemized transaction list (Exactly the rows exported to Excel/CSV)
  const allInvoices = useMemo(() => {
    if (Array.isArray(summary?.invoices) && summary.invoices.length > 0) {
      return summary.invoices;
    }
    return [];
  }, [summary]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv) => {
      const q = ledgerSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(inv.code || '').toLowerCase().includes(q) ||
        String(inv.customerName || '').toLowerCase().includes(q) ||
        String(inv.payerType || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allInvoices, ledgerSearch, statusFilter]);

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pagedInvoices = filteredInvoices.slice(startIndex, startIndex + pageSize);

  // Financial KPI totals
  const totalBilled = Number(summary.totalBilled || allInvoices.reduce((s, i) => s + Number(i.total || 0), 0));
  const totalRevenue = Number(summary.totalRevenue || allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.total || 0), 0));
  const totalTax = Number(summary.totalTax || allInvoices.reduce((s, i) => s + Number(i.taxAmount || 0), 0));
  const pendingDues = Number(summary.pendingDues || allInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + Number(i.total || 0), 0));

  /** Download CSV file matching the table data */
  const handleDownloadCsv = () => {
    setDownloading(true);
    try {
      const serverOrigin = (typeof window !== 'undefined' && window.location.hostname === 'one.vmovexa.com')
        ? window.location.origin
        : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
      if (report?.file_url && report.file_url.endsWith('.csv')) {
        const link = document.createElement('a');
        link.href = `${serverOrigin}${report.file_url}`;
        link.download = `${reportTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV ledger downloaded!');
        return;
      }

      // Generate RFC-compliant CSV with exact rows
      const lines = [
        `"VMOVEXA Corporate Revenue & Collections Ledger"`,
        `"Report Title","${reportTitle.replace(/"/g, '""')}"`,
        `"Statement ID","REP-${id}"`,
        `"Period","${periodStr}"`,
        `"Generated On","${new Date().toISOString()}"`,
        `"Total Billed (INR)","${totalBilled}"`,
        `"Total Revenue Realized (INR)","${totalRevenue}"`,
        `"Total Tax / GST (INR)","${totalTax}"`,
        `"Outstanding Receivables (INR)","${pendingDues}"`,
        '',
        `"Invoice Code","Client / Payer Entity","Issue Date","Due Date","Payer Type","Billing Type","Taxable Subtotal (INR)","GST Amount (INR)","Gross Total (INR)","Status"`,
        ...allInvoices.map((inv) => [
          `"${inv.code}"`,
          `"${(inv.customerName || '').replace(/"/g, '""')}"`,
          `"${fmtDate(inv.issuedAt)}"`,
          `"${fmtDate(inv.dueAt)}"`,
          `"${inv.payerType || ''}"`,
          `"${(inv.type || '').replace(/_/g, ' ')}"`,
          inv.subtotal || 0,
          inv.taxAmount || 0,
          inv.total || 0,
          `"${(inv.status || '').toUpperCase()}"`,
        ].join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV ledger downloaded successfully!');
    } catch {
      toast.error('Failed to export CSV.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Financial Reports', path: `${basePath}/reports` },
              { label: `Statement REP-${id}` },
            ]}
            className="mb-2"
          />
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {reportTitle}
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              REP-{id}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ● Verified
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Itemized financial transaction ledger, client billing records, and tax calculations for period <strong className="text-slate-700 dark:text-zinc-300">{periodStr}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/reports`)}
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('finance.report_details.back_to_reports')}</span>
          </button>
          <RefreshButton onClick={fetchDetails} loading={loading} />
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadCsv}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FleetIcons.Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Downloading...' : 'Export Excel / CSV'}</span>
          </button>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('finance.report_details.gross_billed')}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            ₹ {totalBilled.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.report_details.billed_across_ledger')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Realized Collections
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            ₹ {totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.settled_realized')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Total GST Accrued
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
            ₹ {totalTax.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.gst_heads')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Outstanding Receivables
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
            ₹ {pendingDues.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.unpaid_balance')}</p>
        </div>
      </div>

      {/* METADATA STRIP */}
      <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('finance.reports.period_label')}</span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{periodStr}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('finance.reports.generated_on')}</span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{generatedDate}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('finance.report_details.invoice_count')}</span>
            <div className="font-bold text-blue-700 dark:text-blue-400 mt-0.5">{allInvoices.length} Transactions</div>
          </div>
        </div>

        <div className="text-slate-500 dark:text-zinc-400 font-medium text-[11px]">
          Rule 46 CGST Statutory Tax Ledger · Verified Digitally
        </div>
      </div>

      {/* ITEMIZED TRANSACTION LEDGER TABLE (EXACT EXCEL/CSV DATA) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Itemized Ledger &amp; Invoices
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Line items and transaction breakdown matching the exported CSV ledger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
            >
              <option value="all">{t('finance.campaign_payments.all_statuses')}</option>
              <option value="paid">{t('common.paid')}</option>
              <option value="issued">{t('finance.report_details.issued_unpaid')}</option>
              <option value="overdue">{t('common.overdue', 'Overdue')}</option>
            </select>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                placeholder={t('finance.report_details.search_ph')}
                value={ledgerSearch}
                onChange={(e) => {
                  setLedgerSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-400 transition-colors"
              />
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        {pagedInvoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            No matching transactions found in this report statement.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">{t('finance.report_details.invoice_code')}</th>
                  <th className="py-3 px-4">{t('finance.report_details.client_payer')}</th>
                  <th className="py-3 px-4">{t('finance.report_details.billing_type')}</th>
                  <th className="py-3 px-4">{t('finance.invoices.issue_date')}</th>
                  <th className="py-3 px-4">{t('finance.invoices.due_date')}</th>
                  <th className="py-3 px-4 text-right">{t('finance.taxable_subtotal', 'Taxable Subtotal')}</th>
                  <th className="py-3 px-4 text-right">{t('finance.payment_details.total_tax')}</th>
                  <th className="py-3 px-4 text-right">{t('finance.report_details.gross_total')}</th>
                  <th className="py-3 px-4 text-center">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-300">
                {pagedInvoices.map((inv) => (
                  <tr key={inv.id || inv.code} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-[11px]">
                        {inv.code}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {inv.customerName}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                        {inv.payerType || 'Direct Entity'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {(inv.type || 'Standard').replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                      {fmtDate(inv.issuedAt)}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">
                      {fmtDate(inv.dueAt)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-zinc-300">
                      ₹ {Number(inv.subtotal || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-amber-700 dark:text-amber-400">
                      ₹ {Number(inv.taxAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ₹ {Number(inv.total || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                        }`}
                      >
                        {inv.status || 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Pagination */}
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;

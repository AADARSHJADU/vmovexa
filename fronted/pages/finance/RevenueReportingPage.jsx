/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { useReports } from '../../hooks/shared/useReports';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { IndiaDateInput } from '../../components/ui/IndiaDateInput';
import { resolveFileUrl } from '../../utils/media';

function toLocalIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayStr() { return toLocalIsoDate(new Date()); }
function firstOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalIsoDate(d);
}
function quarterStartStr() {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3);
  return `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`;
}
function yearStartStr() { return `${new Date().getFullYear()}-01-01`; }
function fmtDate(str) {
  if (!str) return '—';
  const parts = String(str).split('T')[0].split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
}

const REPORT_TYPES = [
  {
    id: 'revenue_summary',
    labelKey: 'finance.reports.type_all_revenue',
    labelFallback: 'All Revenue (Combined)',
    desc: 'Combined SaaS subscriptions, campaign ad spend & government PSA billing',
    icon: 'Analytics',
    badgeKey: 'finance.reports.badge_all_revenue',
    badgeFallback: 'All Revenue',
  },
  {
    id: 'subscription_revenue',
    labelKey: 'finance.reports.type_saas_mrr',
    labelFallback: 'SaaS Subscription MRR',
    desc: 'Fleet operator recurring plans, license fees & renewal billings',
    icon: 'Refresh',
    badgeKey: 'finance.reports.badge_recurring',
    badgeFallback: 'Subscription',
  },
  {
    id: 'campaign_revenue',
    labelKey: 'finance.reports.type_ad_revenue',
    labelFallback: 'Campaign Ad Revenue',
    desc: 'Ad spend collections, impression ledger & advertiser invoicing',
    icon: 'Analytics',
    badgeKey: 'finance.reports.badge_ad_spend',
    badgeFallback: 'Ad Spend',
  },
  {
    id: 'government_campaign_revenue',
    labelKey: 'ag.finance.revenuereportingpage.government_campaign_revenue',
    labelFallback: 'Government Campaign Revenue',
    desc: 'PSA campaigns, department billing and treasury collections',
    icon: 'Shield',
    badgeKey: 'finance.reports.badge_government',
    badgeFallback: 'Government',
  },
];

function formatUnknownType(typeStr) {
  if (!typeStr) return '—';
  return String(typeStr)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatPayerType(payerType) {
  if (!payerType) return '—';
  const map = {
    tenant: 'Tenant Admin',
    advertiser: 'Advertiser',
    government: 'Government',
  };
  return map[String(payerType).toLowerCase()] || formatUnknownType(payerType);
}

function formatBillingStream(type) {
  if (!type) return '—';
  const map = {
    saas_subscription: 'SaaS Subscription',
    ad_spend: 'Campaign Ad Spend',
    psa_spend: 'Government PSA',
  };
  return map[String(type).toLowerCase()] || formatUnknownType(type);
}

function formatInvoiceStatusLabel(status) {
  if (!status) return '—';
  const map = {
    paid: 'Paid',
    issued: 'Unpaid',
    overdue: 'Overdue',
    draft: 'Draft',
  };
  return map[String(status).toLowerCase()] || formatUnknownType(status);
}

function buildReportCsv(title, period, reportType, summary) {
  const s = summary || {};
  const invoices = Array.isArray(s.invoices) ? s.invoices : [];
  const totalBilled = Number(s.totalBilled ?? invoices.reduce((sum, i) => sum + Number(i.total || 0), 0));
  const totalRevenue = Number(s.totalRevenue ?? invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + Number(i.total || 0), 0));
  const totalTax = Number(s.totalTax ?? invoices.reduce((sum, i) => sum + Number(i.taxAmount || 0), 0));
  const cgstTotal = Number(s.cgstTotal ?? invoices.reduce((sum, i) => sum + Number(i.cgstAmount || 0), 0));
  const sgstTotal = Number(s.sgstTotal ?? invoices.reduce((sum, i) => sum + Number(i.sgstAmount || 0), 0));
  const igstTotal = Number(s.igstTotal ?? invoices.reduce((sum, i) => sum + Number(i.igstAmount || 0), 0));
  const pendingDues = Number(s.pendingDues ?? invoices.filter((i) => ['issued', 'overdue'].includes(i.status)).reduce((sum, i) => sum + Number(i.total || 0), 0));

  const lines = [
    `"VMOVEXA Corporate Revenue & Collections Ledger"`,
    `"Title","${String(title || '').replace(/"/g, '""')}"`,
    `"Report Type","${String(reportType || '')}"`,
    `"Period","${String(period || '—').replace(/"/g, '""')}"`,
    `"Total Billed (INR)","${totalBilled}"`,
    `"Total Revenue Paid (INR)","${totalRevenue}"`,
    `"Total Tax / GST (INR)","${totalTax}"`,
    `"CGST (INR)","${cgstTotal}"`,
    `"SGST (INR)","${sgstTotal}"`,
    `"IGST (INR)","${igstTotal}"`,
    `"Outstanding Dues (INR)","${pendingDues}"`,
  ];

  if (invoices.length > 0) {
    lines.push('');
    lines.push(`"Invoice Code","Client / Payer","Issue Date","Due Date","Payer Type","Type","Taxable Subtotal (INR)","CGST (INR)","SGST (INR)","IGST (INR)","GST Amount (INR)","Breakdown Items","Total Amount (INR)","Status"`);
    invoices.forEach((inv) => {
      lines.push([
        `"${inv.code || ''}"`,
        `"${String(inv.customerName || '').replace(/"/g, '""')}"`,
        `"${fmtDate(inv.issuedAt)}"`,
        `"${fmtDate(inv.dueAt)}"`,
        `"${inv.payerType || ''}"`,
        `"${inv.type || ''}"`,
        Number(inv.subtotal || 0),
        Number(inv.cgstAmount || 0),
        Number(inv.sgstAmount || 0),
        Number(inv.igstAmount || 0),
        Number(inv.taxAmount || 0),
        `"${(inv.items || []).map((item) => `${item.description}: ${item.amount}`).join(' | ').replace(/"/g, '""')}"`,
        Number(inv.total || 0),
        `"${inv.status || ''}"`,
      ].join(','));
    });
  }

  return `\uFEFF${lines.join('\n')}`;
}

export const RevenueReportingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { reportSummary, loadReportSummary } = useFinanceRole();
  const { reports: rawReports, reportsPagination, loadReports, generateReport } = useReports();

  // Filter & Generation State
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('this_month');
  const [reportType, setReportType] = useState('revenue_summary');

  // Active Workspace Tab: 'ledger' (live DB invoices/subscriptions) | 'archive' (compiled snapshots)
  const [activeTab, setActiveTab] = useState('ledger');

  // Live Ledger Filter State
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('all');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(6);

  // Archive Filter State
  const [typeFilter, setTypeFilter] = useState('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Loading States
  const [refreshing, setRefreshing] = useState(false);
  const [generatingCsv, setGeneratingCsv] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const getReportTypeLabel = useCallback((rt) => t(rt.labelKey, rt.labelFallback), [t]);
  const getReportTypeBadge = useCallback((rt) => t(rt.badgeKey, rt.badgeFallback), [t]);
  const getBadgeForTypeId = useCallback((typeId) => {
    const found = REPORT_TYPES.find((rt) => rt.id === typeId);
    return found ? getReportTypeBadge(found) : formatUnknownType(typeId);
  }, [getReportTypeBadge]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(archiveSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [archiveSearch]);

  const getFilterParams = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      scope: 'finance',
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (typeFilter && typeFilter !== 'all') params.reportType = typeFilter;
    return params;
  }, [currentPage, pageSize, debouncedSearch, typeFilter]);

  useEffect(() => {
    loadReports(getFilterParams()).catch(() => {});
  }, [loadReports, getFilterParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    setSummaryLoading(true);
    loadReportSummary({ startDate, endDate, reportType }).catch(() => {}).finally(() => setSummaryLoading(false));
  }, [startDate, endDate, reportType, loadReportSummary]);

  const applyPreset = useCallback((id) => {
    setActivePreset(id);
    const today = todayStr();
    if (id === 'this_month') {
      setStartDate(firstOfMonthStr());
      setEndDate(today);
    } else if (id === 'last_30') {
      setStartDate(daysAgoStr(30));
      setEndDate(today);
    } else if (id === 'this_quarter') {
      setStartDate(quarterStartStr());
      setEndDate(today);
    } else if (id === 'this_year') {
      setStartDate(yearStartStr());
      setEndDate(today);
    } else if (id === 'all') {
      setStartDate('2024-01-01');
      setEndDate(today);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadReports(getFilterParams()), loadReportSummary({ startDate, endDate, reportType })]);
      toast.success(t('finance.reports.refreshed_success', 'Reports & live metrics refreshed!'));
    } catch {
      toast.error(t('finance.reports.refresh_failed', 'Failed to refresh data.'));
    } finally {
      setRefreshing(false);
    }
  };

  /** Generate & Download CSV Report */
  const handleGenerateReport = async () => {
    setGeneratingCsv(true);
    const selectedType = REPORT_TYPES.find((r) => r.id === reportType);
    const autoTitle = `${selectedType ? getReportTypeLabel(selectedType) : formatUnknownType(reportType)} Ledger`;
    const periodStr = `${fmtDate(startDate)} to ${fmtDate(endDate)}`;

    try {
      const generated = await generateReport(reportType, {
        title: `${autoTitle} (${periodStr})`,
        period: periodStr,
        reportType,
        startDate,
        endDate,
        format: 'csv',
      });

      await loadReports(getFilterParams()).catch(() => {});
      setActiveTab('archive');
      toast.success(t('finance.reports.generated_success', 'Financial report compiled successfully!'));

      const fileDownloadUrl = generated?.file_url ? resolveFileUrl(generated.file_url) : '';
      if (fileDownloadUrl && generated.file_url.endsWith('.csv')) {
        const link = document.createElement('a');
        link.href = fileDownloadUrl;
        link.download = `${autoTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const genSummary = typeof generated?.summary === 'string'
          ? JSON.parse(generated.summary || '{}')
          : (generated?.summary || {});
        const csvContent = buildReportCsv(autoTitle, periodStr, reportType, genSummary);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${autoTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      toast.error(err?.message || t('finance.reports.compile_failed', 'Failed to compile report.'));
    } finally {
      setGeneratingCsv(false);
    }
  };

  /** Live Period Invoices (Subscription / Campaign / Government) from reportSummary */
  const liveInvoices = useMemo(
    () => (Array.isArray(reportSummary?.invoices) ? reportSummary.invoices : []),
    [reportSummary]
  );

  const availableLedgerStatuses = useMemo(() => {
    const set = new Set();
    liveInvoices.forEach((inv) => {
      if (inv.status) set.add(inv.status);
    });
    return Array.from(set);
  }, [liveInvoices]);

  useEffect(() => {
    setLedgerPage(1);
    if (ledgerStatusFilter !== 'all' && !availableLedgerStatuses.includes(ledgerStatusFilter)) {
      setLedgerStatusFilter('all');
    }
  }, [startDate, endDate, reportType, availableLedgerStatuses, ledgerStatusFilter]);

  const filteredLiveInvoices = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    return liveInvoices.filter((inv) => {
      const matchesStatus = ledgerStatusFilter === 'all' || inv.status === ledgerStatusFilter;
      const matchesSearch =
        !q ||
        String(inv.code || '').toLowerCase().includes(q) ||
        String(inv.customerName || '').toLowerCase().includes(q) ||
        formatPayerType(inv.payerType).toLowerCase().includes(q) ||
        formatBillingStream(inv.type).toLowerCase().includes(q) ||
        formatInvoiceStatusLabel(inv.status).toLowerCase().includes(q) ||
        fmtDate(inv.issuedAt).toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [liveInvoices, ledgerStatusFilter, ledgerSearch]);

  const ledgerTotalItems = filteredLiveInvoices.length;
  const ledgerTotalPages = Math.ceil(ledgerTotalItems / ledgerPageSize) || 1;
  const pagedLiveInvoices = filteredLiveInvoices.slice(
    (ledgerPage - 1) * ledgerPageSize,
    ledgerPage * ledgerPageSize
  );

  /** Normalized Reports List */
  const reports = useMemo(() => {
    const list = Array.isArray(rawReports) ? rawReports : (rawReports?.rows || rawReports?.items || []);
    return list.map((r) => {
      let params = {};
      if (typeof r.params === 'string') {
        try { params = JSON.parse(r.params || '{}'); } catch { params = {}; }
      } else if (r.params && typeof r.params === 'object') {
        params = r.params;
      }

      let summary = {};
      if (typeof r.summary === 'string') {
        try { summary = JSON.parse(r.summary || '{}'); } catch { summary = {}; }
      } else if (r.summary && typeof r.summary === 'object') {
        summary = r.summary;
      }

      const repType = params.reportType || r.report_type || '';
      const matchedType = REPORT_TYPES.find((rt) => rt.id === repType);
      const title = params.title || r.title || (matchedType ? `${matchedType.labelFallback} Ledger` : `${formatUnknownType(repType)} Ledger`);
      const period = params.period || (params.startDate && params.endDate ? `${fmtDate(params.startDate)} → ${fmtDate(params.endDate)}` : '—');
      const invoiceCount = typeof summary.invoiceCount === 'number'
        ? summary.invoiceCount
        : (Array.isArray(summary.invoices) ? summary.invoices.length : null);
      const totalBilled = typeof summary.totalBilled === 'number' ? summary.totalBilled : null;

      return {
        id: r.id ?? '—',
        title,
        reportType: repType,
        period,
        startDate: params.startDate,
        endDate: params.endDate,
        fileUrl: r.file_url,
        summary,
        invoiceCount,
        totalBilled,
        params,
        status: r.status || 'ready',
        generatedOn: r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt).toLocaleDateString('en-IN') : '—',
      };
    });
  }, [rawReports]);

  const totalItems = reportsPagination?.total ?? reports.length;
  const totalPages = reportsPagination?.totalPages ?? (Math.ceil(totalItems / pageSize) || 1);
  const currentReports = reports;

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
              { label: t('finance.reports.breadcrumb_title', 'Revenue Reports') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('ag.finance.revenuereportingpage.financial_reports_and_ledgers', 'Financial Reports & Ledgers')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.finance.revenuereportingpage.audited_financial_statements_revenue_collect', 'Audited financial statements, revenue collection ledgers, and period breakdown analytics.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
        </div>
      </div>

      {/* LIVE PERIOD FINANCIAL KPI STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('finance.reports.gross_invoiced')}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.totalBilled ?? 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {Number(reportSummary?.invoiceCount ?? 0)} {t('finance.reports.invoices_in_period', 'invoice(s) in period')}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('ag.finance.revenuereportingpage.realized_collections', 'Realized Collections')}
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.totalRevenue ?? 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {reportType === 'subscription_revenue'
              ? `${Number(reportSummary?.activeSubs ?? 0)} active subscription(s)`
              : reportType === 'revenue_summary'
              ? `Subs ₹${Number(reportSummary?.subRevenue ?? 0).toLocaleString('en-IN')} · Ads ₹${Number(reportSummary?.campaignRevenue ?? 0).toLocaleString('en-IN')} · Gov ₹${Number(reportSummary?.governmentRevenue ?? 0).toLocaleString('en-IN')}`
              : t('finance.reports.settled_realized')}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {t('ag.finance.revenuereportingpage.total_gst_accrued', 'Total GST Accrued')}
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.taxTotal ?? 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {t('ag.finance.revenuereportingpage.cgst', 'CGST ₹')}{Number(reportSummary?.cgstTotal ?? 0).toLocaleString('en-IN')} {t('ag.finance.revenuereportingpage.sgst', '· SGST ₹')}{Number(reportSummary?.sgstTotal ?? 0).toLocaleString('en-IN')} {t('ag.finance.revenuereportingpage.igst', '· IGST ₹')}{Number(reportSummary?.igstTotal ?? 0).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            {t('ag.finance.revenuereportingpage.outstanding_receivables', 'Outstanding Receivables')}
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-400 font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.pendingDues ?? 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.unpaid_balance')}</p>
        </div>
      </div>

      {/* SIMPLE GENERATION & FILTER STUDIO */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Date Filter Presets Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <FleetIcons.Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              {t('ag.finance.revenuereportingpage.filter_by', 'Filter By')} {t('finance.reports.period_label')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: t('finance.reports.preset_this_month', 'This Month'), id: 'this_month' },
              { label: t('finance.reports.preset_last_30', 'Last 30 Days'), id: 'last_30' },
              { label: t('finance.reports.preset_this_quarter', 'This Quarter'), id: 'this_quarter' },
              { label: t('finance.reports.preset_this_year', 'This Year'), id: 'this_year' },
              { label: t('finance.reports.preset_all_time', 'All Time'), id: 'all' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activePreset === p.id
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs & Compile Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">{t('finance.reports.from_date')}</label>
            <IndiaDateInput
              value={startDate}
              max={endDate}
              onChange={(val) => {
                setStartDate(val);
                setActivePreset('custom');
              }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">{t('finance.reports.to_date')}</label>
            <IndiaDateInput
              value={endDate}
              min={startDate}
              max={todayStr()}
              onChange={(val) => {
                setEndDate(val);
                setActivePreset('custom');
              }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">{t('finance.reports.report_category')}</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {getReportTypeLabel(rt)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              disabled={generatingCsv}
              onClick={handleGenerateReport}
              className="w-full py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FleetIcons.Download className="w-3.5 h-3.5" />
              <span>{generatingCsv ? t('finance.reports.compiling_report', 'Compiling Report...') : t('finance.reports.compile_export_csv', 'Compile & Export CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE REVENUE LEDGER & COMPILED REPORTS REGISTRY */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Tabs + Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="space-y-2.5">
            {/* Workspace Switcher Tabs */}
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'ledger'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t('finance.reports.live_ledger_tab', 'Live Revenue Ledger')}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  activeTab === 'ledger'
                    ? 'bg-white/20 text-white'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                }`}>
                  {liveInvoices.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('archive')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'archive'
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t('finance.reports.compiled_archive_tab', 'Compiled Reports')}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  activeTab === 'archive'
                    ? 'bg-white/20 text-white'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300'
                }`}>
                  {totalItems}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {activeTab === 'ledger'
                ? t('finance.reports.live_ledger_desc', 'Real-time billing & subscription ledger records matching the selected period and report category')
                : t('ag.finance.revenuereportingpage.filter_statements_view_itemized_details_and_', 'Filter compiled statements, view itemized details, and export ledger records')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'ledger' ? (
              <>
                {/* Dynamic Status Filter from live DB invoices */}
                <select
                  value={ledgerStatusFilter}
                  onChange={(e) => {
                    setLedgerStatusFilter(e.target.value);
                    setLedgerPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="all">{t('finance.campaign_payments.all_statuses', 'All Statuses')}</option>
                  {availableLedgerStatuses.map((st) => (
                    <option key={st} value={st}>
                      {formatInvoiceStatusLabel(st)}
                    </option>
                  ))}
                </select>

                {/* Live Ledger Search */}
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder={t('finance.report_details.search_ph', 'Search invoice or client...')}
                    value={ledgerSearch}
                    onChange={(e) => {
                      setLedgerSearch(e.target.value);
                      setLedgerPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-400 transition-colors"
                  />
                  <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </>
            ) : (
              <>
                {/* Filter Compiled Archive by Category */}
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="all">{t('finance.reports.all_categories')}</option>
                  <option value="revenue_summary">{t('finance.reports.type_all_revenue', 'All Revenue (Combined)')}</option>
                  <option value="subscription_revenue">{t('finance.reports.saas_mrr')}</option>
                  <option value="campaign_revenue">{t('finance.reports.ad_revenue')}</option>
                  <option value="government_campaign_revenue">{t('ag.finance.revenuereportingpage.government_campaign_revenue', 'Government Campaign Revenue')}</option>
                </select>

                {/* Archive Search Input */}
                <div className="relative min-w-[200px]">
                  <input
                    type="text"
                    placeholder={t('finance.reports.search_ph')}
                    value={archiveSearch}
                    onChange={(e) => {
                      setArchiveSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-400 transition-colors"
                  />
                  <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </>
            )}

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>

        {/* TAB 1: LIVE REVENUE LEDGER */}
        {activeTab === 'ledger' ? (
          <>
            {summaryLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="h-14 rounded-xl bg-slate-100 dark:bg-zinc-800/70 animate-pulse" />
                ))}
              </div>
            ) : pagedLiveInvoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                {t('finance.reports.no_live_records', 'No billing or subscription records found for the selected period and category.')}
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full min-w-[720px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">{t('finance.report_details.invoice_code', 'Invoice / Client')}</th>
                      <th className="py-3 px-4">{t('common.category', 'Category')}</th>
                      <th className="py-3 px-4">{t('finance.invoices.issue_date', 'Issue Date')}</th>
                      <th className="py-3 px-4 text-right">{t('finance.taxable_subtotal', 'Taxable + GST')}</th>
                      <th className="py-3 px-4 text-right">{t('finance.report_details.gross_total', 'Gross Total')}</th>
                      <th className="py-3 px-4 text-center">{t('common.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-300">
                    {pagedLiveInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                                <FleetIcons.Document className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {inv.customerName || '—'}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                                  {inv.code} · {formatPayerType(inv.payerType)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-900/50">
                              {formatBillingStream(inv.type)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400">
                            {fmtDate(inv.issuedAt)}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono">
                            <div className="text-slate-800 dark:text-zinc-200">
                              ₹ {Number(inv.subtotal || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-amber-600 dark:text-amber-400">
                              GST ₹ {Number(inv.taxAmount || 0).toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ₹ {Number(inv.total || 0).toLocaleString('en-IN')}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                                  : inv.status === 'overdue'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                              }`}
                            >
                              {formatInvoiceStatusLabel(inv.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pagedLiveInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                            <FleetIcons.Document className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {inv.customerName || '—'}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                              {inv.code}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                              : inv.status === 'overdue'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                          }`}
                        >
                          {formatInvoiceStatusLabel(inv.status)}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('common.category', 'Category')}</span>
                          <span className="text-slate-800 dark:text-zinc-200 font-bold">{formatBillingStream(inv.type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.invoices.issue_date', 'Issue Date')}</span>
                          <span className="text-slate-700 dark:text-zinc-300">{fmtDate(inv.issuedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.report_details.gross_total', 'Gross Total')}</span>
                          <span className="text-slate-900 dark:text-white font-mono font-bold">
                            ₹ {Number(inv.total || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Global Pagination (Live Ledger) */}
            <div className="pt-2">
              <Pagination
                currentPage={ledgerPage}
                totalPages={ledgerTotalPages}
                onPageChange={setLedgerPage}
                totalItems={ledgerTotalItems}
                pageSize={ledgerPageSize}
                onPageSizeChange={(newSize) => {
                  setLedgerPageSize(newSize);
                  setLedgerPage(1);
                }}
                pageSizeOptions={[6, 12, 24, 50]}
              />
            </div>
          </>
        ) : (
          /* TAB 2: COMPILED REPORTS ARCHIVE */
          <>
            {currentReports.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                {t('ag.finance.revenuereportingpage.no_matching_reports_found_in_archive_use_the', 'No compiled reports in archive yet. Use the studio above and click Compile & Export CSV to save a snapshot.')}
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full min-w-[640px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">{t('finance.reports.report_name')}</th>
                      <th className="py-3 px-4">{t('finance.reports.report_id')}</th>
                      <th className="py-3 px-4">{t('common.category', 'Category')}</th>
                      <th className="py-3 px-4">{t('finance.reports.period')}</th>
                      <th className="py-3 px-4">{t('finance.reports.generated_date')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-300">
                    {currentReports.map((rep) => {
                      const badgeLabel = getBadgeForTypeId(rep.reportType);
                      const subtitle = rep.invoiceCount !== null && rep.totalBilled !== null
                        ? `${rep.invoiceCount} invoice(s) · ₹ ${Number(rep.totalBilled).toLocaleString('en-IN')}`
                        : badgeLabel;
                      return (
                        <tr key={rep.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                                <FleetIcons.Document className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{rep.title}</div>
                                <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                                  {subtitle}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-[11px] font-bold">
                              {t('ag.finance.revenuereportingpage.rep', 'REP-')}{rep.id}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                              {badgeLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                            {rep.period}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                            {rep.generatedOn}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentReports.map((rep) => {
                  const badgeLabel = getBadgeForTypeId(rep.reportType);
                  return (
                    <div
                      key={rep.id}
                      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                            <FleetIcons.Document className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{rep.title}</h4>
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                              {t('ag.finance.revenuereportingpage.rep', 'REP-')}{rep.id}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                          {badgeLabel}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[11px] bg-slate-50/80 dark:bg-zinc-800/50 rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.reports.period_label')}</span>
                          <span className="text-slate-800 dark:text-zinc-200 font-bold">{rep.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.reports.generated_on')}</span>
                          <span className="text-slate-700 dark:text-zinc-300">{rep.generatedOn}</span>
                        </div>
                        {rep.invoiceCount !== null && rep.totalBilled !== null && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.reports.gross_invoiced')}</span>
                            <span className="text-slate-800 dark:text-zinc-200 font-mono font-bold">
                              ₹ {Number(rep.totalBilled).toLocaleString('en-IN')} ({rep.invoiceCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Global Pagination (Compiled Archive) */}
            <div className="pt-2">
              <Pagination
                currentPage={reportsPagination?.page ?? currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 12, 24, 50]}
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default RevenueReportingPage;

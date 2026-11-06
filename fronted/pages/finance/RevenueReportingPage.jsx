/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { useReports } from '../../hooks/shared/useReports';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { IndiaDateInput } from '../../components/ui/IndiaDateInput';

function todayStr() { return new Date().toISOString().split('T')[0]; }
function firstOfMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function daysAgoStr(n) { return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]; }
function quarterStartStr() {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3);
  return `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`;
}
function yearStartStr() { return `${new Date().getFullYear()}-01-01`; }
function fmtDate(str) {
  if (!str) return '—';
  const parts = str.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return str;
}

const REPORT_TYPES = [
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
    id: 'subscription_revenue',
    labelKey: 'finance.reports.type_saas_mrr',
    labelFallback: 'SaaS Subscription MRR',
    desc: 'Fleet operator recurring plans, license fees & renewal billings',
    icon: 'Refresh',
    badgeKey: 'finance.reports.badge_recurring',
    badgeFallback: 'Recurring',
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

export const RevenueReportingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { reportSummary, loadReportSummary } = useFinanceRole();
  const { reports: rawReports, reportsPagination, loadReports, generateReport, deleteReport } = useReports();

  // Filter & Generation State
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activePreset, setActivePreset] = useState('this_month');
  const [reportType, setReportType] = useState('campaign_revenue');

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
    loadReportSummary({ startDate, endDate }).catch(() => {}).finally(() => setSummaryLoading(false));
  }, [startDate, endDate, loadReportSummary]);

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
      await Promise.all([loadReports(getFilterParams()), loadReportSummary({ startDate, endDate })]);
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
    const selectedType = REPORT_TYPES.find((r) => r.id === reportType) || REPORT_TYPES[0];
    const autoTitle = `${getReportTypeLabel(selectedType)} Ledger`;
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
      toast.success(t('finance.reports.generated_success', 'Financial report compiled successfully!'));

      const serverOrigin = (typeof window !== 'undefined' && window.location.hostname === 'one.vmovexa.com')
        ? window.location.origin
        : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
      if (generated?.file_url) {
        const link = document.createElement('a');
        link.href = `${serverOrigin}${generated.file_url}`;
        link.download = `${autoTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const csvContent =
          `Title,Period,Report Type,Total Billed,Total Revenue,Total Tax,Pending Dues\n"${autoTitle}","${periodStr}","${reportType}","${reportSummary?.totalBilled || 0}","${reportSummary?.totalRevenue || 0}","${reportSummary?.taxTotal || 0}","${reportSummary?.pendingDues || 0}"\n`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${autoTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      toast.error(err?.message || t('finance.reports.compile_failed', 'Failed to compile report.'));
    } finally {
      setGeneratingCsv(false);
    }
  };

  /** Instant Download CSV from row or modal */
  const handleDownloadCsv = (rep) => {
    const serverOrigin = (typeof window !== 'undefined' && window.location.hostname === 'one.vmovexa.com')
      ? window.location.origin
      : (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');
    if (rep.fileUrl && rep.fileUrl.endsWith('.csv')) {
      const link = document.createElement('a');
      link.href = `${serverOrigin}${rep.fileUrl}`;
      link.download = `${(rep.title || 'Financial_Report').replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('finance.reports.csv_downloaded', 'CSV report downloaded!'));
      return;
    }

    const csvContent =
      `Title,Period,Total Billed,Total Revenue,Total Tax,Pending Dues\n"${rep.title}","${rep.period}","₹${rep.summary?.totalBilled || reportSummary?.totalBilled || 0}","₹${rep.summary?.totalRevenue || reportSummary?.totalRevenue || 0}","₹${rep.summary?.totalTax || reportSummary?.taxTotal || 0}","₹${rep.summary?.pendingDues || reportSummary?.pendingDues || 0}"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(rep.title || 'Financial_Report').replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('finance.reports.csv_downloaded', 'CSV report downloaded!'));
  };

  /** Navigate to Details Page */
  const handleOpenDetails = (rep) => {
    navigate(`${basePath}/reports/${rep.id}`);
  };

  /** Delete Report */
  const handleDeleteReport = async (rep) => {
    if (!window.confirm(t('finance.reports.confirm_delete', 'Are you sure you want to delete this report?'))) return;
    try {
      await toast.promise(deleteReport(rep.id), {
        loading: t('finance.reports.deleting_report', 'Deleting report...'),
        success: t('finance.reports.deleted_success', 'Report deleted from registry.'),
        error: (err) => err?.message || t('finance.reports.delete_failed', 'Failed to delete report.'),
      });
      await loadReports(getFilterParams()).catch(() => {});
    } catch {
      /* handled by toast */
    }
  };

  /** Normalized Reports List */
  const reports = useMemo(() => {
    const list = Array.isArray(rawReports) ? rawReports : (rawReports?.rows || rawReports?.items || []);
    return list.map((r) => {
      const params = typeof r.params === 'string' ? JSON.parse(r.params || '{}') : (r.params || {});
      const summary = typeof r.summary === 'string' ? JSON.parse(r.summary || '{}') : (r.summary || {});
      const repType = params.reportType || r.report_type || 'revenue';
      const title = params.title || r.title || `${repType.replace(/_/g, ' ').toUpperCase()} Ledger`;
      const period = params.period || (params.startDate && params.endDate ? `${fmtDate(params.startDate)} → ${fmtDate(params.endDate)}` : 'All Time');

      return {
        id: r.id ?? '—',
        title,
        reportType: repType,
        period,
        startDate: params.startDate,
        endDate: params.endDate,
        fileUrl: r.file_url,
        summary,
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
              `₹ ${Number(reportSummary?.totalBilled || reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.billed_across_period')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('ag.finance.revenuereportingpage.realized_collections', 'Realized Collections')}
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{t('finance.reports.settled_realized')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {t('ag.finance.revenuereportingpage.total_gst_accrued', 'Total GST Accrued')}
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {summaryLoading ? (
              <span className="inline-block w-20 h-7 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              `₹ ${Number(reportSummary?.taxTotal || 0).toLocaleString('en-IN')}`
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {t('ag.finance.revenuereportingpage.cgst', 'CGST ₹')}{Number(reportSummary?.cgstTotal || 0).toLocaleString('en-IN')} {t('ag.finance.revenuereportingpage.sgst', '· SGST ₹')}{Number(reportSummary?.sgstTotal || 0).toLocaleString('en-IN')} {t('ag.finance.revenuereportingpage.igst', '· IGST ₹')}{Number(reportSummary?.igstTotal || 0).toLocaleString('en-IN')}
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
              `₹ ${Number(reportSummary?.pendingDues || 0).toLocaleString('en-IN')}`
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
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
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
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FleetIcons.Download className="w-3.5 h-3.5" />
              <span>{generatingCsv ? t('finance.reports.compiling_report', 'Compiling Report...') : t('finance.reports.compile_export_csv', 'Compile & Export CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPORTS ARCHIVE & FILTERABLE REGISTRY */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('ag.finance.revenuereportingpage.financial_reports_registry', 'Financial Reports Registry')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.finance.revenuereportingpage.filter_statements_view_itemized_details_and_', 'Filter statements, view itemized details, and export ledger records')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Category */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
            >
              <option value="all">{t('finance.reports.all_categories')}</option>
              <option value="campaign_revenue">{t('finance.reports.ad_revenue')}</option>
              <option value="government_campaign_revenue">{t('ag.finance.revenuereportingpage.government_campaign_revenue', 'Government Campaign Revenue')}</option>
              <option value="subscription_revenue">{t('finance.reports.saas_mrr')}</option>
            </select>

            {/* Search Input */}
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

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>

        {/* Reports Content */}
        {currentReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium bg-slate-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            {t('ag.finance.revenuereportingpage.no_matching_reports_found_in_archive_use_the', 'No matching reports found in archive. Use the generator above to compile a statement.')}
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
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-medium text-slate-700 dark:text-zinc-300">
                {currentReports.map((rep) => {
                  const typeObj = REPORT_TYPES.find((rt) => rt.id === rep.reportType) || REPORT_TYPES[0];
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
                              {t('ag.finance.revenuereportingpage.audited_financial_ledger', 'Audited Financial Ledger')}
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
                          {getReportTypeBadge(typeObj)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">
                        {rep.period}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400">
                        {rep.generatedOn}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* DETAILS BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(rep)}
                            title={t('finance.reports.view_details_title')}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>{t('finance.reports.details')}</span>
                          </button>

                          {/* CSV DOWNLOAD */}
                          <button
                            type="button"
                            onClick={() => handleDownloadCsv(rep)}
                            title={t('finance.reports.download_csv')}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FleetIcons.Download className="w-3 h-3" />
                            <span>{t('finance.reports.csv')}</span>
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReport(rep)}
                            title={t('finance.reports.delete_report')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              const typeObj = REPORT_TYPES.find((rt) => rt.id === rep.reportType) || REPORT_TYPES[0];
              return (
                <div
                  key={rep.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
                        <FleetIcons.Document className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{rep.title}</h4>
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                          {t('ag.finance.revenuereportingpage.rep', 'REP-')}{rep.id}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {getReportTypeBadge(typeObj)}
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
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    {/* DETAILS BUTTON */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(rep)}
                      className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{t('finance.reports.details')}</span>
                    </button>

                    {/* CSV */}
                    <button
                      type="button"
                      onClick={() => handleDownloadCsv(rep)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {t('ag.finance.revenuereportingpage.csv', 'CSV')}
                    </button>

                    {/* DELETE */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(rep)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <FleetIcons.Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Pagination */}
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
      </div>

    </div>
  );
};

export default RevenueReportingPage;

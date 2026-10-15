import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { apiClient } from '../../api/client';

export const ReportsHubPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin/advertiser')
    ? '/superadmin/advertiser'
    : '/advertiser';

  const {
    campaigns: rawCampaigns,
    loadCampaigns,
    reports: rawReports,
    loadReports,
    generateReport,
  } = useAdvertiserRole();

  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Archive Search, Filter & Pagination
  const [reportSearch, setReportSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'pdf' | 'xlsx' | 'csv'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadCampaigns().catch(() => {});
    loadReports().catch(() => {});
  }, [loadCampaigns, loadReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([loadCampaigns(), loadReports()]);
    } finally {
      setRefreshing(false);
    }
  };

  const campaigns = useMemo(() => {
    return Array.isArray(rawCampaigns)
      ? rawCampaigns
      : (rawCampaigns?.items || rawCampaigns?.rows || []);
  }, [rawCampaigns]);

  const reports = useMemo(() => {
    const list = Array.isArray(rawReports)
      ? rawReports
      : (rawReports?.rows || rawReports?.items || []);
    return list.map((r) => ({
      id: r.id ?? '—',
      title: r.title ?? (r.report_type === 'campaign_performance' ? 'Proof-of-Play Performance Audit' : (r.report_type || 'Campaign Audit Report')),
      format: (r.file_format || 'csv').toUpperCase(),
      generatedOn: r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt).toLocaleString('en-IN') : (r.generatedOn ?? '—'),
      status: r.status || 'ready',
      fileUrl: r.file_url || null,
      summary: r.summary || {},
    }));
  }, [rawReports]);

  // Filtered and paginated reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (formatFilter !== 'all' && r.format.toLowerCase() !== formatFilter.toLowerCase()) {
        return false;
      }
      if (reportSearch.trim()) {
        const query = reportSearch.toLowerCase().trim();
        const matchTitle = r.title.toLowerCase().includes(query);
        const matchId = String(r.id).toLowerCase().includes(query);
        if (!matchTitle && !matchId) return false;
      }
      return true;
    });
  }, [reports, formatFilter, reportSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const paginatedReports = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return filteredReports.slice(from, from + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  const getBaseBackendUrl = () => {
    const apiBase = apiClient.defaults?.baseURL || (window.location.origin ? `${window.location.origin.replace(':5173', ':4000')}/api/v1` : 'http://localhost:4000/api/v1');
    return apiBase.replace('/api/v1', '');
  };

  const handleExport = async (format) => {
    setIsGenerating(true);
    const toastId = toast.loading(`Compiling ${format.toUpperCase()} campaign audit report...`);
    try {
      const result = await generateReport({
        type: 'campaign_performance',
        reportType: 'campaign_performance',
        format,
        params: {
          campaignId: selectedCampaignId || null,
          dateRange: dateRange || null,
          format,
        },
      });

      toast.dismiss(toastId);
      toast.success(`${format.toUpperCase()} report generated successfully!`);
      loadReports().catch(() => {});

      // Auto-trigger download if file URL is available
      if (result?.file_url) {
        const baseUrl = getBaseBackendUrl();
        const downloadUrl = result.file_url.startsWith('http') ? result.file_url : `${baseUrl}${result.file_url}`;
        const win = window.open(downloadUrl, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `Report_${result.id}.${format === 'pdf' ? 'html' : format}`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.message || 'Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFile = (fileUrl, format, reportId) => {
    if (!fileUrl) {
      toast.error('File link not available for this report.');
      return;
    }
    const baseUrl = getBaseBackendUrl();
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${baseUrl}${fileUrl}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Opening report #${reportId}`);
  };

  const getCampTotal = (c) => {
    if (!c) return 0;
    const pb = typeof c.payment_breakdown === 'string'
      ? (() => { try { return JSON.parse(c.payment_breakdown); } catch (_) { return null; } })()
      : c.payment_breakdown;
    return Number(pb?.totalAmount ?? c.budget ?? 0);
  };

  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === 'live' || c.status === 'running' || c.status === 'approved').length;
    const totalBudget = campaigns.reduce((sum, c) => sum + getCampTotal(c), 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + (Number(c.spent) || 0), 0);
    const impressions = campaigns.reduce((sum, c) => sum + (Number(c.impressions_delivered) || 0), 0);
    return { total, active, totalBudget, totalSpent, impressions };
  }, [campaigns]);

  const activeCampaign = campaigns.find((c) => String(c.id) === String(selectedCampaignId));

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: `${basePath}/dashboard` },
              { label: 'Campaigns', to: `${basePath}/campaigns` },
              { label: 'Proof-of-Play Reports' }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('reports_hub.title', 'Proof-of-Play Reports Hub')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('reports_hub.subtitle', 'Export verified DOOH proof-of-play records, GPS-validated screen broadcast logs, budget spend statements, and tax-compliant reconciliation files.')}
          </p>
        </div>

        {/* Action Buttons in Top Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FleetIcons.FileText className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{t('reports_hub.pdf_report', 'PDF / HTML Report')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('xlsx')}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FleetIcons.BarChart className="w-4 h-4 shrink-0 text-white" />
            <span>{t('reports_hub.excel_report', 'Excel (.xlsx)')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={isGenerating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-xs border border-transparent dark:border-zinc-700 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <FleetIcons.Save className="w-4 h-4 shrink-0 text-white" />
            <span>{t('reports_hub.export_csv', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Period Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <FleetIcons.Document className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t('reports_hub.customization', 'Report Customization')}
              </h2>
              <p className="text-sm font-black text-slate-900 dark:text-zinc-100">Select Campaign & Reporting Parameters</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full">
            {campaigns.length} {t('common.total', 'Campaigns in Portfolio')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {t('reports_hub.target_campaign', 'Target Campaign:')}
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer"
            >
              <option value="">{t('common.all', 'All Campaigns Aggregate Audit')}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name} — [{c.code || c.id}] ({c.status?.toUpperCase() || 'LIVE'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {t('reports_hub.audit_period', 'Audit Date Range / Period:')}
            </label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="e.g. Current Month or 2026-09-01 to 2026-09-25"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('nav.campaigns', 'Total Campaigns'), value: stats.total.toLocaleString(), icon: <FleetIcons.Target className="w-4 h-4 text-blue-500" />, sub: 'In System Portfolio' },
          { label: t('common.active', 'Active Campaigns'), value: stats.active.toLocaleString(), icon: <FleetIcons.Zap className="w-4 h-4 text-amber-500" />, sub: 'Approved or Broadcasting' },
          { label: t('reports_hub.total_budget', 'Total Amount Managed'), value: `₹ ${stats.totalBudget.toLocaleString('en-IN')}`, icon: <FleetIcons.Money className="w-4 h-4 text-emerald-500" />, sub: 'All Campaigns Value' },
          { label: t('reports_hub.impressions_delivered', 'Impressions Delivered'), value: stats.impressions.toLocaleString(), icon: <FleetIcons.Tv className="w-4 h-4 text-indigo-500" />, sub: 'GPS-Verified Slots' },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              <span>{card.label}</span>
              <span className="shrink-0">{card.icon}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight mt-1">{card.value}</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Financial & Performance Snapshot */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {t('reports_hub.financial_snapshot', 'Active Scope Financial Snapshot')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('reports_hub.snapshot_sub', 'Summary metrics compiled into exported reports.')}
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {activeCampaign ? activeCampaign.code : 'ALL-CAMPAIGNS'}
          </span>
        </div>

        {activeCampaign ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.total_budget', 'Total Amount')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">₹ {getCampTotal(activeCampaign).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.amount_spent', 'Amount Spent')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">₹ {(Number(activeCampaign.spent) || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.impressions_delivered', 'Impressions Delivered')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">{(Number(activeCampaign.impressions_delivered) || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.broadcast_status', 'Broadcast Status')}</span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase">{activeCampaign.status || 'LIVE'}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.total_budget', 'Total Portfolio Amount')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">₹ {stats.totalBudget.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.amount_spent', 'Aggregated Spend')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">₹ {stats.totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/60 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{t('reports_hub.impressions_delivered', 'Total Proof-of-Plays')}</span>
              <p className="text-lg font-black text-slate-900 dark:text-zinc-100 mt-0.5">{stats.impressions.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Generated Reports Archive */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Archive Header with Controls */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {t('reports_hub.archive_title', 'Generated Reports Archive')}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {filteredReports.length} {t('common.details', 'Records')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('reports_hub.archive_sub', 'Previously compiled proof-of-play audits ready for instant download.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Format Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
              {['all', 'pdf', 'xlsx', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => { setFormatFilter(fmt); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer uppercase ${
                    formatFilter === fmt
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={reportSearch}
                onChange={(e) => { setReportSearch(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 pl-8 pr-3 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {paginatedReports.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4">
              <FleetIcons.Document className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-base font-black text-slate-900 dark:text-zinc-100">
              {t('reports_hub.no_reports', 'No reports found')}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {reportSearch
                ? 'Try adjusting your search criteria or format filter.'
                : t('reports_hub.no_reports_sub', "Click 'PDF Report', 'Excel (.xlsx)', or 'Export CSV' above to compile a fresh proof-of-play audit report.")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {paginatedReports.map((rep) => (
              <div
                key={rep.id}
                className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-850/50 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 truncate">{rep.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                      {rep.format}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {t('reports_hub.ready', 'Ready')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t('reports_hub.compiled', 'Compiled:')} <span className="font-semibold text-slate-700 dark:text-zinc-300">{rep.generatedOn}</span> · Report ID: <span className="font-mono text-slate-600 dark:text-zinc-400">#{rep.id}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(rep.fileUrl, rep.format, rep.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-xs inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <FleetIcons.Download className="w-3.5 h-3.5" />
                    <span>{t('common.download', 'Download')} {rep.format}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Pagination */}
        <div className="px-5 sm:px-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReports.length}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

    </div>
  );
};

export default ReportsHubPage;

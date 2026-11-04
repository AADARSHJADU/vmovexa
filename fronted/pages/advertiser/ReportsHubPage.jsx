import { useState, useEffect, useMemo } from 'react';
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
  const isSuperAdmin = location.pathname.startsWith('/superadmin');
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Archive Search, Filter & Pagination
  const [reportSearch, setReportSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all'); // 'all' | 'pdf' | 'csv'
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
      id: r.id ?? null,
      title: r.title || r.params?.title || r.report_type || null,
      format: r.file_format ? String(r.file_format).toUpperCase() : null,
      generatedOn: r.created_at || r.createdAt ? new Date(r.created_at || r.createdAt).toLocaleString('en-IN') : (r.generatedOn ?? '—'),
      status: r.status || null,
      fileUrl: r.file_url || null,
    }));
  }, [rawReports]);

  // Filtered and paginated reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (formatFilter !== 'all' && r.format?.toLowerCase() !== formatFilter.toLowerCase()) {
        return false;
      }
      if (reportSearch.trim()) {
        const query = reportSearch.toLowerCase().trim();
        const matchTitle = String(r.title || '').toLowerCase().includes(query);
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
          startDate: startDate || null,
          endDate: endDate || null,
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
          a.download = `Report_${result.id}.${format === 'pdf' ? 'html' : 'csv'}`;
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

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-200">

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isSuperAdmin ? t('nav.superadmin', 'SuperAdmin') : t('roles.advertiser', 'Advertiser'), path: `${basePath}/dashboard`, icon: FleetIcons.Dashboard },
              { label: t('nav.campaigns', 'Campaigns'), path: `${basePath}/campaigns` },
              { label: t('advertiser.reports.breadcrumb', 'Campaign Reports') }
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('ag.advertiser.reportshubpage.campaign_reports', 'Campaign Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {t('ag.advertiser.reportshubpage.generate_campaign_performance_summaries_from', 'Generate campaign performance summaries from recorded campaign, playback, impression, and QR scan data.')}
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
            <span>{t('ag.advertiser.reportshubpage.printable_html_report', 'Printable HTML Report')}</span>
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
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <FleetIcons.Document className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {t('reports_hub.customization', 'Report Customization')}
              </h2>
              <p className="text-sm font-black text-slate-900 dark:text-zinc-100">{t('advertiser.reports.select_params')}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1 rounded-full">
            {campaigns.length} {t('common.total', 'Campaigns in Portfolio')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              {t('reports_hub.target_campaign', 'Target Campaign:')}
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer"
            >
              <option value="">{t('ag.advertiser.reportshubpage.all_campaigns', 'All campaigns')}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title || c.name || '—'} — [{c.code || c.id}] ({c.status?.toUpperCase() || 'STATUS UNAVAILABLE'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.advertiser.reportshubpage.start_date', 'Start date')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('ag.advertiser.reportshubpage.end_date', 'End date')}</label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Generated Reports Archive */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Archive Header with Controls */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              {t('ag.advertiser.reportshubpage.generated_campaign_reports_with_files_suppli', 'Generated campaign reports with files supplied by the reports service.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Format Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
              {['all', 'pdf', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => { setFormatFilter(fmt); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer uppercase ${
                    formatFilter === fmt
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-xs'
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
                placeholder={t('advertiser.reports.search_ph')}
                value={reportSearch}
                onChange={(e) => { setReportSearch(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-48 pl-8 pr-3 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                : 'Generate a printable HTML or CSV campaign report using the controls above.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {paginatedReports.map((rep) => (
              <div
                key={rep.id || rep.fileUrl || rep.generatedOn}
                className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-zinc-100 truncate">{rep.title || '—'}</h4>
                    {rep.format && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                        {rep.format === 'PDF' ? 'HTML' : rep.format}
                      </span>
                    )}
                    {rep.status && (
                      <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700 uppercase">
                        {rep.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {t('reports_hub.compiled', 'Compiled:')} <span className="font-semibold text-slate-700 dark:text-zinc-300">{rep.generatedOn}</span>
                    {rep.id != null && <> · {t('advertiser.reports.report_id')} <span className="font-mono text-slate-600 dark:text-zinc-400">#{rep.id}</span></>}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(rep.fileUrl, rep.format, rep.id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold text-slate-700 dark:text-zinc-200 transition-all shadow-xs inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <FleetIcons.Download className="w-3.5 h-3.5" />
                    <span>{t('common.download', 'Download')} {rep.format === 'PDF' ? 'HTML' : (rep.format || 'report')}</span>
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

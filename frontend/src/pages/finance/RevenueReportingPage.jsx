import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { useReports } from '../../hooks/shared/useReports';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

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
  const [y, m, dy] = str.split('-');
  return `${dy}/${m}/${y}`;
}

const REPORT_TYPES = [
  { id: 'campaign_revenue',    label: 'Campaign Revenue',      desc: 'Total ad spend, payments collected & impressions delivered', icon: 'Analytics', color: 'blue'    },
  { id: 'subscription_revenue',label: 'Subscription Revenue',  desc: 'Active SaaS plans, MRR & billing cycle summary',            icon: 'Refresh',   color: 'indigo'  },
  { id: 'gst_tax',             label: 'GST & Tax Statement',   desc: 'CGST / SGST / IGST breakup for GST return filing',          icon: 'Receipt',   color: 'emerald' },
  { id: 'overdue_dues',        label: 'Overdue Receivables',   desc: 'Clients & tenants with unpaid / overdue invoices',          icon: 'Warning',   color: 'amber'   },
];

const COLOR_MAP = {
  blue:    { card: 'border-blue-300 bg-blue-50',      icon: 'bg-blue-100 text-blue-600',      text: 'text-blue-700',    ring: 'ring-blue-400'    },
  indigo:  { card: 'border-indigo-300 bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600',  text: 'text-indigo-700',  ring: 'ring-indigo-400'  },
  emerald: { card: 'border-emerald-300 bg-emerald-50',icon: 'bg-emerald-100 text-emerald-600',text: 'text-emerald-700', ring: 'ring-emerald-400' },
  amber:   { card: 'border-amber-300 bg-amber-50',    icon: 'bg-amber-100 text-amber-600',    text: 'text-amber-700',   ring: 'ring-amber-400'   },
};

export const RevenueReportingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { reportSummary, loadReportSummary } = useFinanceRole();
  const { reports: rawReports, loadReports, generateReport } = useReports();

  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reportType, setReportType] = useState('campaign_revenue');
  const [viewMode, setViewMode] = useState('table');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [refreshing, setRefreshing] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => { loadReports().catch(() => {}); }, [loadReports]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    setSummaryLoading(true);
    loadReportSummary({ startDate, endDate }).catch(() => {}).finally(() => setSummaryLoading(false));
  }, [startDate, endDate, loadReportSummary]);

  const applyPreset = useCallback((id) => {
    const today = todayStr();
    if (id === 'this_month')   { setStartDate(firstOfMonthStr()); setEndDate(today); }
    if (id === 'last_30')      { setStartDate(daysAgoStr(30));    setEndDate(today); }
    if (id === 'this_quarter') { setStartDate(quarterStartStr()); setEndDate(today); }
    if (id === 'this_year')    { setStartDate(yearStartStr());    setEndDate(today); }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadReports(), loadReportSummary({ startDate, endDate })]);
      toast.success('Reports refreshed!');
    } catch { toast.error('Failed to refresh.'); }
    finally { setRefreshing(false); }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const typeLabel = REPORT_TYPES.find((r) => r.id === reportType)?.label || reportType;
    const autoTitle = `${typeLabel} — ${fmtDate(startDate)} to ${fmtDate(endDate)}`;
    try {
      const generated = await toast.promise(
        generateReport('revenue', { title: autoTitle, period: `${startDate} → ${endDate}`, reportType, startDate, endDate }),
        { loading: 'Generating report...', success: 'Report compiled!', error: (err) => err?.message || 'Failed' }
      );
      await loadReports().catch(() => {});
      if (generated) {
        navigate(`${basePath}/reports/success`, {
          state: {
            report: {
              id: generated.id || `REP-${Date.now().toString().slice(-6)}`,
              title: generated.title || autoTitle,
              period: generated.period || `${startDate} → ${endDate}`,
              generatedOn: new Date().toLocaleDateString('en-IN'),
              summary: {
                totalRevenue: `₹${Number(reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}`,
                activeCampaigns: reportSummary?.activeCampaigns || 0,
                activeSubs: reportSummary?.activeSubs || 0,
                taxTotal: `₹${Number(reportSummary?.taxTotal || 0).toLocaleString('en-IN')}`,
                campaignRevenue: `₹${Number(reportSummary?.campaignRevenue || 0).toLocaleString('en-IN')}`,
                subRevenue: `₹${Number(reportSummary?.subRevenue || 0).toLocaleString('en-IN')}`,
                invoicesIssued: reportSummary?.activeCampaigns || 0,
                paymentsReceived: reportSummary?.activeSubs || 0,
              },
              content: generated.content,
            },
          },
        });
      }
    } catch { /* handled by toast */ }
  };

  const handleExport = (exportFormat, rep = null) => {
    if (exportFormat === 'pdf') { window.print(); return; }
    const reportTitle = rep?.title || 'Report';
    const csvContent = rep?.content ||
      `Title,Period,Total Revenue,Subscription Revenue,Campaign Revenue,Total Tax\n"${reportTitle}","${rep?.period || ''}","₹${reportSummary?.totalRevenue || 0}","₹${reportSummary?.subRevenue || 0}","₹${reportSummary?.campaignRevenue || 0}","₹${reportSummary?.taxTotal || 0}"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportTitle.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV downloaded!');
  };

  const reports = useMemo(() => {
    const list = Array.isArray(rawReports) ? rawReports : (rawReports?.rows || rawReports?.items || []);
    return list.map((r) => ({
      id: r.id ?? '—',
      title: r.title ?? r.name ?? '—',
      period: r.period ?? '—',
      fileSize: r.file_size ?? r.fileSize ?? '24.8 KB',
      generatedOn: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : (r.generatedOn ?? '—'),
      content: r.content,
    }));
  }, [rawReports]);

  const filteredReports = useMemo(() => reports.filter((r) => {
    const q = archiveSearch.toLowerCase();
    return (
      String(r.title || '').toLowerCase().includes(q) ||
      String(r.id || '').toLowerCase().includes(q) ||
      String(r.period || '').toLowerCase().includes(q)
    );
  }), [reports, archiveSearch]);

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentReports = filteredReports.slice(startIndex, startIndex + pageSize);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Financial Reports' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Generate audited statements for campaigns, subscriptions and GST compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link to={`${basePath}/gst`} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors">
            GST Portal →
          </Link>
        </div>
      </div>

      {/* SECTION 1 — Date Range */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <FleetIcons.Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Reporting Period</h2>
            <p className="text-[11px] text-slate-400 font-medium">Select start and end date for the report</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">From Date</label>
            <input type="date" value={startDate} max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">To Date</label>
            <input type="date" value={endDate} min={startDate} max={todayStr()}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick:</span>
          {[
            { label: 'This Month', id: 'this_month' },
            { label: 'Last 30 Days', id: 'last_30' },
            { label: 'This Quarter', id: 'this_quarter' },
            { label: 'This Year', id: 'this_year' },
          ].map((p) => (
            <button key={p.id} type="button" onClick={() => applyPreset(p.id)}
              className="px-3 py-1 text-[11px] font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg border border-slate-200 hover:border-blue-300 transition-all cursor-pointer">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2 — Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Active Subscriptions', value: reportSummary?.activeSubs ?? 0, sub: `₹${Number(reportSummary?.subRevenue || 0).toLocaleString('en-IN')} SaaS revenue`,   icon: 'Users',     color: 'text-indigo-700', bg: 'bg-indigo-50 text-indigo-600' },
          { label: 'Campaigns',            value: reportSummary?.activeCampaigns ?? 0, sub: `₹${Number(reportSummary?.campaignRevenue || 0).toLocaleString('en-IN')} ad spend`, icon: 'Analytics', color: 'text-blue-700',   bg: 'bg-blue-50 text-blue-600'     },
          { label: 'Total Revenue',        value: `₹${Number(reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}`, sub: 'Paid invoices collected', icon: 'Money',     color: 'text-emerald-700 font-mono text-xl', bg: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total Tax (GST)',      value: `₹${Number(reportSummary?.taxTotal || 0).toLocaleString('en-IN')}`,  sub: 'CGST + SGST + IGST total', icon: 'Receipt',   color: 'text-amber-700 font-mono text-xl',   bg: 'bg-amber-50 text-amber-600'     },
        ].map((kpi) => {
          const Icon = FleetIcons[kpi.icon];
          return (
            <div key={kpi.label} className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 transition-opacity ${summaryLoading ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>{Icon && <Icon className="w-3.5 h-3.5" />}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{kpi.label}</span>
              </div>
              <div className={`text-2xl font-black ${kpi.color}`}>
                {summaryLoading ? <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded" /> : kpi.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* SECTION 3 — Report Type + Generate */}
      <form onSubmit={handleGenerate} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 print:hidden">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Select Report Type</h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Choose the statement to generate for{' '}
            <span className="font-bold text-slate-600">{fmtDate(startDate)}</span>{' → '}
            <span className="font-bold text-slate-600">{fmtDate(endDate)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REPORT_TYPES.map((rt) => {
            const selected = reportType === rt.id;
            const clr = COLOR_MAP[rt.color];
            const Icon = FleetIcons[rt.icon];
            return (
              <button key={rt.id} type="button" onClick={() => setReportType(rt.id)}
                className={`relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer focus:outline-none ${
                  selected ? `${clr.card} ${clr.ring} ring-2 shadow-sm` : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}>
                {selected && (
                  <span className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center ${clr.icon}`}>
                    <FleetIcons.Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                )}
                <div className={`inline-flex p-2 rounded-lg mb-2.5 ${selected ? clr.icon : 'bg-slate-100 text-slate-500'}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                </div>
                <div className={`text-xs font-bold mb-1 ${selected ? clr.text : 'text-slate-800'}`}>{rt.label}</div>
                <div className="text-[11px] text-slate-400 font-medium leading-snug">{rt.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Report: <span className="font-bold text-slate-600">
              {REPORT_TYPES.find((r) => r.id === reportType)?.label} — {fmtDate(startDate)} to {fmtDate(endDate)}
            </span>
          </p>
          <button type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 ml-auto cursor-pointer">
            <FleetIcons.Document className="w-4 h-4" />
            <span>Generate &amp; Download Report</span>
          </button>
        </div>
      </form>

      {/* SECTION 4 — Archive */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Generated Reports Archive</h3>
            <p className="text-xs text-slate-500 font-medium">Historical financial exports ready for audit download</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <input type="text" placeholder="Search archive..." value={archiveSearch}
                onChange={(e) => { setArchiveSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors" />
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

        {currentReports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No matching reports found in archive
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Report</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Generated On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0"><FleetIcons.Document className="w-3.5 h-3.5" /></div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{rep.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal">Statement export</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold">{rep.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{rep.period}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rep.fileSize}</td>
                    <td className="py-3.5 px-4 text-slate-500">{rep.generatedOn}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => handleExport('pdf', rep)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer">
                          <FleetIcons.Document className="w-3 h-3" /><span>PDF</span>
                        </button>
                        <button type="button" onClick={() => handleExport('csv', rep)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer">
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReports.map((rep) => (
              <div key={rep.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0"><FleetIcons.Analytics className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{rep.title}</h4>
                    <span className="text-[10px] font-mono font-bold text-blue-700">{rep.id}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px] bg-slate-50/80 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Period:</span><span className="text-slate-800 font-bold">{rep.period}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Size:</span><span className="text-slate-700">{rep.fileSize}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Generated:</span><span className="text-slate-700">{rep.generatedOn}</span></div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button type="button" onClick={() => handleExport('pdf', rep)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <FleetIcons.Document className="w-3.5 h-3.5" /><span>Download PDF</span>
                  </button>
                  <button type="button" onClick={() => handleExport('csv', rep)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer">
                    CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Pagination
            currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}
            totalItems={totalItems} pageSize={pageSize}
            onPageSizeChange={(newSize) => { setPageSize(newSize); setCurrentPage(1); }}
            pageSizeOptions={[6, 12, 24, 50]}
          />
        </div>
      </div>
    </div>
  );
};

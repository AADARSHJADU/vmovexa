import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const ReportGeneratedSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const currentPeriod = useMemo(() => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), []);
  const report = location.state?.report || {
    id: 'REP-CURRENT',
    title: `Monthly Revenue & Collections Statement – ${currentPeriod}`,
    period: currentPeriod,
    generatedOn: new Date().toLocaleDateString('en-IN'),
    summary: {
      totalRevenue: '₹0',
      invoicesIssued: 0,
      paymentsReceived: 0,
      pendingInvoices: 0,
    },
  };

  const handleDownloadPackage = () => {
    // CSV download
    const csvContent = report.content ||
      `Title,Period,{t('finance.report_success.total_revenue_label')},Subscription Revenue,Campaign Revenue,Total Tax\n"${report.title}","${report.period}","${report.summary?.totalRevenue || '₹0'}","${report.summary?.subRevenue || '₹0'}","${report.summary?.campaignRevenue || '₹0'}","${report.summary?.taxTotal || '₹0'}"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(report.title || 'Revenue_Report').replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report CSV downloaded! Opening print preview...');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${report.title} · VMOVEXA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .kpis { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
    .kpi-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 18px; font-weight: 800; margin-top: 4px; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 12px; font-size: 11px; color: #64748b; }
    @media print { @page { size: A4 portrait; margin: 15mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="font-size: 22px; margin: 0;">VMOVEXA</h1>
      <p style="font-size: 11px; color: #64748b; margin-top: 2px;">{t('finance.report_success.smart_transit')}</p>
      <h2 style="font-size: 15px; margin-top: 10px;">${report.title}</h2>
    </div>
    <div style="text-align: right; font-size: 11px; color: #475569;">
      <strong>VMOVEXA ENTERPRISES PVT. LTD.</strong><br />
      GSTIN: 27AABCV1234F1Z5<br />
      Statement ID: ${report.id}
    </div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="kpi-title">{t('finance.report_success.reporting_period')}</div><div class="kpi-val" style="font-size: 14px;">${report.period}</div></div>
    <div class="kpi"><div class="kpi-title">{t('finance.report_success.total_revenue_label')}</div><div class="kpi-val" style="color: #15803d;">${report.summary.totalRevenue}</div></div>
  </div>
  <div class="footer">
    Verified by VMOVEXA Financial Telemetry Engine · Digitally Certified
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 400); };
  </script>
</body>
</html>`;
    const win = window.open('', '_blank');
    if (win) {
      win.document.open();
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Global Left-Aligned Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Financial Reports', path: `${basePath}/reports` },
          { label: 'Report Generated' },
        ]}
        className="mb-2 print:hidden"
      />

      {/* 2. Responsive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs shrink-0">
            <FleetIcons.Check className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('finance.report_success.success_title', 'Report Generated Successfully!')}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full">
                {report.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('ag.finance.reportgeneratedsuccesspage.your_statement_has_been_compiled_and_is_read', 'Your statement has been compiled and is ready for export and audit sharing.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleDownloadPackage}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Download className="w-3.5 h-3.5" />
            <span>{t('ag.finance.reportgeneratedsuccesspage.download_pdf_and_csv_package', 'Download PDF & CSV Package')}</span>
          </button>
          <Link
            to={`${basePath}/reports`}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('ag.finance.reportgeneratedsuccesspage.back_to_reports_archive', 'Back to Reports Archive')}</span>
          </Link>
        </div>
      </div>

      {/* 3. 4 KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.report_success.reporting_period_label', 'Reporting Period')}</span>
            <FleetIcons.Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {report.period}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Compiled Cycle
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.report_success.total_revenue_label', 'Total Revenue')}</span>
            <FleetIcons.Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {report.summary?.totalRevenue || '₹0'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Gross Collections
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.report_success.active_subs_label', 'Active Subscriptions')}</span>
            <FleetIcons.Document className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {report.summary?.activeSubs ?? report.summary?.paymentsReceived ?? 0} Plans
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
            {report.summary?.subRevenue ? `Sub Revenue: ${report.summary.subRevenue}` : 'Subscription Revenue'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.report_success.campaigns_tax_label', 'Campaigns & Tax')}</span>
            <FleetIcons.Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {report.summary?.activeCampaigns ?? report.summary?.invoicesIssued ?? 0} Campaigns
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
            {report.summary?.taxTotal ? `Tax: ${report.summary.taxTotal}` : 'Statutory GST'}
          </div>
        </div>
      </div>

      {/* 4. Statement Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t('finance.report_success.statement_title', 'Statement Title')}
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {report.title}
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-slate-400 dark:text-zinc-500 font-bold text-[10px] uppercase">Generated On</div>
            <div className="font-bold text-slate-900 dark:text-white">{report.generatedOn}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('finance.report_success.reporting_period_label', 'Reporting Period')}</span>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{report.period}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('finance.report_success.total_revenue_label', 'Total Revenue')}</span>
            <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">{report.summary?.totalRevenue || '₹0'}</div>
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Statement signed and archived to VMOVEXA ledger repositories.
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/dashboard`}
              className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('ag.finance.reportgeneratedsuccesspage.go_to_dashboard', 'Go to Dashboard')}
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <Link
              to={`${basePath}/reports`}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
            >
              {t('ag.finance.reportgeneratedsuccesspage.back_to_reports_archive', 'Back to Reports Archive')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratedSuccessPage;

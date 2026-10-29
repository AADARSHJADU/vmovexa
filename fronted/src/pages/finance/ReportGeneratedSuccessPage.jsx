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
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Financial Reports', path: `${basePath}/reports` },
          { label: 'Report Generated' },
        ]}
        className="mb-4 justify-center"
      />

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.report_success.success_title')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your statement has been compiled and is ready for export and audit sharing.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.report_success.statement_title')}</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{report.title}</div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
            {report.id}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('finance.report_success.reporting_period_label')}</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{report.period}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('finance.report_success.total_revenue_label')}</span>
            <div className="font-black text-blue-700 mt-0.5">{report.summary.totalRevenue}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('finance.report_success.active_subs_label')}</span>
            <div className="font-bold text-indigo-700 mt-0.5">
              {report.summary.activeSubs ?? report.summary.paymentsReceived ?? 0} Plans
              {report.summary.subRevenue ? ` (${report.summary.subRevenue})` : ''}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('finance.report_success.campaigns_tax_label')}</span>
            <div className="font-bold text-emerald-700 mt-0.5">
              {report.summary.activeCampaigns ?? report.summary.invoicesIssued ?? 0} Campaigns
              {report.summary.taxTotal ? ` • Tax: ${report.summary.taxTotal}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleDownloadPackage}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all block text-center"
        >
          Download PDF & CSV Package
        </button>
        <Link
          to={`${basePath}/reports`}
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Back to Reports Archive
        </Link>
        <Link
          to={`${basePath}/dashboard`}
          className="text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:text-white block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

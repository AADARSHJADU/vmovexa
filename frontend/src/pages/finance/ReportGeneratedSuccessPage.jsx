import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const ReportGeneratedSuccessPage = () => {
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
      `Title,Period,Total Revenue,Subscription Revenue,Campaign Revenue,Total Tax\n"${report.title}","${report.period}","${report.summary?.totalRevenue || '₹0'}","${report.summary?.subRevenue || '₹0'}","${report.summary?.campaignRevenue || '₹0'}","${report.summary?.taxTotal || '₹0'}"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(report.title || 'Revenue_Report').replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report CSV downloaded! Opening print view for PDF...');
    setTimeout(() => {
      window.print();
    }, 500);
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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Report Generated Successfully!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your statement has been compiled and is ready for export and audit sharing.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Statement Title</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{report.title}</div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
            {report.id}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Reporting Period:</span>
            <div className="font-bold text-slate-900 mt-0.5">{report.period}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Total Revenue:</span>
            <div className="font-black text-blue-700 mt-0.5">{report.summary.totalRevenue}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Active Subscriptions:</span>
            <div className="font-bold text-indigo-700 mt-0.5">
              {report.summary.activeSubs ?? report.summary.paymentsReceived ?? 0} Plans
              {report.summary.subRevenue ? ` (${report.summary.subRevenue})` : ''}
            </div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Campaigns &amp; Tax:</span>
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
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Back to Reports Archive
        </Link>
        <Link
          to={`${basePath}/dashboard`}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 block"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

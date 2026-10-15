import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const ReconciliationCompletePage = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const currentPeriod = useMemo(() => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), []);
  const auditData = location.state?.reconciliation || {
    accountName: 'HDFC Corporate Transit Current A/C',
    period: currentPeriod,
    balance: '₹5,00,000',
    matchedRate: '100%',
    discrepancy: 'Zero Variance (Balanced)',
  };

  const handleDownloadCertificate = () => {
    toast.success('Opening official Bank Reconciliation Statement for print/PDF…');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Reconciliation', path: `${basePath}/reconciliation` },
          { label: 'Completed' },
        ]}
        className="mb-4 justify-center"
      />

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Reconciliation Completed!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your bank statement records and internal VMOVEXA ledger have been matched and balanced with zero variance.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Account Audited</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{auditData.accountName}</div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            100% Balanced
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Reconciled Period:</span>
            <div className="font-bold text-slate-900 mt-0.5">{auditData.period}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Audited Ledger Balance:</span>
            <div className="font-black text-slate-900 mt-0.5 font-mono">{auditData.balance}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Reconciliation Result:</span>
            <div className="font-bold text-emerald-700 mt-0.5">{auditData.matchedRate} Matched</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">Net Discrepancy:</span>
            <div className="font-bold text-emerald-700 mt-0.5">{auditData.discrepancy}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2 print:hidden">
        <button
          onClick={handleDownloadCertificate}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all block text-center"
        >
          Download BRS Audit Certificate (PDF)
        </button>
        <Link
          to={`${basePath}/reconciliation`}
          className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Back to Reconciliation Roster
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

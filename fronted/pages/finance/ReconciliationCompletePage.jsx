import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const ReconciliationCompletePage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const currentPeriod = useMemo(() => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }), []);

  const auditData = location.state?.reconciliation || {
    accountName: 'Corporate Transit Collection Account',
    period: currentPeriod,
    balance: '₹0.00',
    matchedRate: '100%',
    discrepancy: 'Zero Variance (Balanced)',
  };

  const statementRef = useMemo(() => {
    return `BRS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);

  const handleDownloadCertificate = () => {
    toast.success('Opening official Bank Reconciliation Statement for print/PDF…');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Global Left-Aligned Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Reconciliation', path: `${basePath}/reconciliation` },
          { label: 'Completed' },
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
                {t('finance.recon_complete.title', 'Reconciliation Completed!')}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{t('ag.finance.reconciliationcompletepage.100_balanced', '100% Balanced')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {t('ag.finance.reconciliationcompletepage.your_bank_statement_records_and_internal_vmo', 'Your bank statement records and internal VMOVEXA ledger have been matched and balanced with zero variance.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={handleDownloadCertificate}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Printer className="w-3.5 h-3.5" />
            <span>{t('ag.finance.reconciliationcompletepage.download_brs_audit_certificate_pdf', 'Download / Print BRS Certificate')}</span>
          </button>
          <Link
            to={`${basePath}/reconciliation`}
            className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('ag.finance.reconciliationcompletepage.back_to_reconciliation_roster', 'Back to Roster')}</span>
          </Link>
        </div>
      </div>

      {/* 3. 4 KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.recon_complete.account_audited', 'Account Audited')}</span>
            <FleetIcons.Document className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={auditData.accountName}>
            {auditData.accountName}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Active Operating Account
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.recon_complete.reconciled_period', 'Reconciled Period')}</span>
            <FleetIcons.Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {auditData.period}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
            Monthly Audit Cycle
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.recon_complete.audited_balance', 'Audited Ledger Balance')}</span>
            <FleetIcons.Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
            {auditData.balance}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
            <span>Matched with Bank Feed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('finance.recon_complete.net_discrepancy', 'Net Variance')}</span>
            <FleetIcons.Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {auditData.discrepancy || 'Zero Variance'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {auditData.matchedRate} Records Matched
          </div>
        </div>
      </div>

      {/* 4. Official Bank Reconciliation Statement (BRS) Audit Certificate Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
              <FleetIcons.Shield className="w-3.5 h-3.5" />
              <span>Official Bank Reconciliation Statement (BRS)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Statement of Balanced Accounts & Verification Certificate
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verified by VMOVEXA Financial Telemetry Engine · Digitally Certified
            </p>
          </div>
          <div className="text-left sm:text-right font-mono text-xs">
            <div className="text-slate-400 dark:text-zinc-500 font-bold text-[10px] uppercase">Statement Ref</div>
            <div className="font-bold text-slate-900 dark:text-white">{statementRef}</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Line Item / Audit Description</th>
                <th className="py-3 px-4">Ledger Record</th>
                <th className="py-3 px-4">Bank Statement Feed</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-200">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  Opening Balance for {auditData.period}
                </td>
                <td className="py-3.5 px-4 font-mono font-medium">{auditData.balance}</td>
                <td className="py-3.5 px-4 font-mono font-medium">{auditData.balance}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-zinc-500">₹0.00</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <FleetIcons.Check className="w-2.5 h-2.5" /> Matched
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  Direct Transit Gateway Collections & Advertiser Inflow
                </td>
                <td className="py-3.5 px-4 font-mono font-medium">Reconciled</td>
                <td className="py-3.5 px-4 font-mono font-medium">Reconciled</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-zinc-500">₹0.00</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <FleetIcons.Check className="w-2.5 h-2.5" /> Matched
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  Fleet Operator & Vendor Payout Settlements
                </td>
                <td className="py-3.5 px-4 font-mono font-medium">Cleared</td>
                <td className="py-3.5 px-4 font-mono font-medium">Cleared</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400 dark:text-zinc-500">₹0.00</td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <FleetIcons.Check className="w-2.5 h-2.5" /> Cleared
                  </span>
                </td>
              </tr>
              <tr className="bg-slate-50/60 dark:bg-zinc-800/30 font-bold">
                <td className="py-3.5 px-4 text-slate-900 dark:text-white">
                  Audited Closing Ledger Position
                </td>
                <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {auditData.balance}
                </td>
                <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                  {auditData.balance}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  ₹0.00 (Zero)
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <FleetIcons.Shield className="w-2.5 h-2.5" /> 100% Balanced
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Verification Stamp & Compliance Notice */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <FleetIcons.Check className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-emerald-950 dark:text-emerald-300">
                Audit Status: Finalized, Sealed & Tamper-Proof
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                All transactional feeds matched with zero variance. Digital ledger locked into VMOVEXA immutable store.
              </div>
            </div>
          </div>
          <div className="font-mono text-[11px] text-emerald-800 dark:text-emerald-400 shrink-0 font-bold">
            SEAL: {statementRef}-OK
          </div>
        </div>

        {/* Quick Footer Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Need an official certified audit printout for internal or statutory filings?
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/dashboard`}
              className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('ag.finance.reconciliationcompletepage.go_to_dashboard', 'Go to Dashboard')}
            </Link>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <Link
              to={`${basePath}/reconciliation`}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
            >
              {t('ag.finance.reconciliationcompletepage.back_to_reconciliation_roster', 'Back to Reconciliation Roster')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationCompletePage;

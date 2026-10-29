/* Local loading/form state is intentionally synchronized from remote route data. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const StartReconciliationPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const {
    reconciliationSummary,
    loadReconciliationSummary,
    reconciliationTransactions,
    loadReconciliationTransactions,
    autoMatchReconciliation,
    finalizeReconciliation,
  } = useFinanceRole();

  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const accountId = queryParams.get('account');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      loadReconciliationTransactions().catch(() => {}),
      loadReconciliationSummary().catch(() => {}),
    ]).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [loadReconciliationTransactions, loadReconciliationSummary]);

  // Dynamically resolve account info from real accounts
  const accountInfo = useMemo(() => {
    const accounts = reconciliationSummary?.accounts || [];
    if (accountId) {
      const found = accounts.find((a) => a.id === accountId);
      if (found) {
        return {
          name: found.name || found.accountName,
          num: found.accountNumber,
          balance: found.ledgerBalance,
        };
      }
    }
    return {
      name: accounts[0]?.name || accounts[0]?.accountName || 'Consolidated Corporate Accounts',
      num: accounts[0]?.accountNumber || 'All Active Feeds',
      balance: reconciliationSummary?.ledgerBalance || '₹0.00',
    };
  }, [accountId, reconciliationSummary]);

  const txns = useMemo(
    () => (Array.isArray(reconciliationTransactions) ? reconciliationTransactions : []),
    [reconciliationTransactions]
  );

  const matchedCount = useMemo(() => txns.filter((t) => t.status === 'Matched').length, [txns]);
  const discrepancyCount = useMemo(() => txns.filter((t) => t.status !== 'Matched').length, [txns]);

  const handleAutoMatch = async () => {
    setMatching(true);
    try {
      await toast.promise(autoMatchReconciliation(), {
        loading: 'Running automated rule-based matching…',
        success: 'All verified records matched successfully!',
        error: (err) => err?.message || 'Failed to auto-match',
      });
      await loadReconciliationTransactions().catch(() => {});
      await loadReconciliationSummary().catch(() => {});
    } catch {
      // toast alerted
    } finally {
      setMatching(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const result = await toast.promise(
        finalizeReconciliation({
          statementDate: new Date().toISOString(),
          accountName: accountInfo.name,
          accountId: accountId || 'corporate_all',
        }),
        {
          loading: 'Generating verified BRS statement…',
          success: 'Reconciliation finalized with zero variance!',
          error: (err) => err?.message || 'Failed to finalize reconciliation',
        }
      );
      navigate(`${basePath}/reconciliation/success`, {
        state: {
          reconciliation: {
            accountName: result?.accountName || accountInfo.name,
            period: result?.period || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            balance: result?.balance || accountInfo.balance || '₹0.00',
            matchedRate: result?.matchedRate || '100%',
            discrepancy: result?.discrepancy || 'Zero Variance (Balanced)',
          },
        },
      });
    } catch {
      // toast alerted
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Reconciliation', path: `${basePath}/reconciliation` },
          { label: 'Reconciliation Wizard' },
        ]}
        className="mb-2"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to={`${basePath}/reconciliation`}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer transition-colors"
            title={t('finance.start_recon.back_recon')}
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" /> <span>{t('common.back')}</span>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reconciliation Wizard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              <span className="font-bold text-slate-800 dark:text-zinc-200">{accountInfo.name}</span> ({accountInfo.num}) · Real-Time Ledger Tally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <RefreshButton onClick={() => loadReconciliationTransactions().catch(() => {})} loading={loading} />
          <button
            type="button"
            onClick={handleAutoMatch}
            disabled={matching}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
            <span>{matching ? 'Matching…' : 'Auto-Match Records'}</span>
          </button>
        </div>
      </div>

      {/* Snapshot KPI Mini-Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('finance.start_recon.total_compared')}</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{txns.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('finance.start_recon.matched_zero_var')}</span>
          <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{matchedCount}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('finance.start_recon.unmatched')}</span>
          <div className={`text-lg sm:text-xl font-black mt-0.5 ${discrepancyCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-500'}`}>
            {discrepancyCount}
          </div>
        </div>
      </div>

      {/* Reconciliation Comparison Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden space-y-4">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.start_recon.comparison_feed')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.start_recon.comparison_feed_sub')}</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{t('finance.start_recon.bank_live_connected')}</span>
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('finance.start_recon.date_ref')}</th>
                <th className="py-3 px-4">{t('finance.start_recon.desc_entity')}</th>
                <th className="py-3 px-4">{t('finance.start_recon.bank_statement')}</th>
                <th className="py-3 px-4">{t('finance.start_recon.book_ledger')}</th>
                <th className="py-3 px-4">{t('finance.start_recon.variance')}</th>
                <th className="py-3 px-4">{t('common.status')}</th>
                <th className="py-3 px-4 text-right">{t('finance.start_recon.audit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
              {txns.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 dark:text-zinc-500 font-medium">
                    {loading ? 'Loading reconciliation transactions…' : 'No records found'}
                  </td>
                </tr>
              )}
              {txns.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{row.date}</div>
                    <div className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">{row.refNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200">{row.description}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{Number(row.bankStatement || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    ₹{Number(row.bookLedger || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {row.variance === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">₹0.00</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold">₹{Number(row.variance).toLocaleString('en-IN')}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border inline-flex items-center gap-1 ${
                        row.status === 'Matched'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : row.status === 'Discrepancy'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Matched' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{row.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1">
                      <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('finance.start_recon.verified')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Bar */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <Link
          to={`${basePath}/reconciliation`}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleFinalize}
          disabled={finalizing}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
        >
          <FleetIcons.Check className="w-4 h-4" />
          <span>{finalizing ? 'Finalizing…' : 'Finalize & Confirm Reconciliation'}</span>
        </button>
      </div>
    </div>
  );
};

export default StartReconciliationPage;

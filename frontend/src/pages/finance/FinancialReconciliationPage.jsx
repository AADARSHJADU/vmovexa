import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const FinancialReconciliationPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { reconciliationSummary, loadReconciliationSummary } = useFinanceRole();

  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [accountSearch, setAccountSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadReconciliationSummary();
      toast.success('Reconciliation summary & accounts refreshed!');
    } catch {
      toast.error('Failed to refresh reconciliation summary.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReconciliationSummary().catch(() => {});
  }, [loadReconciliationSummary]);

  const summary = reconciliationSummary || {};
  const accounts = useMemo(() => {
    return Array.isArray(summary.accounts) ? summary.accounts : [];
  }, [summary.accounts]);

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return accounts;
    return accounts.filter((acc) => {
      const name = String(acc.name || acc.accountName || '').toLowerCase();
      const num = String(acc.accountNumber || '').toLowerCase();
      const cat = String(acc.category || '').toLowerCase();
      const status = String(acc.status || '').toLowerCase();
      return name.includes(q) || num.includes(q) || cat.includes(q) || status.includes(q);
    });
  }, [accounts, accountSearch]);

  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentAccounts = filteredAccounts.slice(startIndex, startIndex + pageSize);

  const kpis = [
    {
      label: t('finance.total_transactions', 'Total Transactions'),
      value: summary.totalTransactions ?? 0,
      sub: t('finance.recorded_across_accounts', 'Across all accounts'),
      icon: 'Document',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Matched Feeds',
      value: summary.matched ?? 0,
      sub: t('finance.auto_matched_bank', 'Verified with bank feeds'),
      icon: 'Check',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Requires Review',
      value: summary.unmatched ?? 0,
      sub: t('finance.requires_audit', 'Mismatches or discrepancies'),
      icon: 'Warning',
      color: 'text-rose-700',
      bg: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'In Progress',
      value: summary.inProgress ?? 0,
      sub: t('finance.pending_bank_clearance', 'Pending gateway clearance'),
      icon: 'Refresh',
      color: 'text-amber-700',
      bg: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Financial Reconciliation' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('finance.reconciliation_title', 'Financial Reconciliation')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Reconcile corporate bank accounts, payment gateway escrow, and payout ledgers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
          <Link
            to={`${basePath}/reconciliation/start`}
            className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Analytics className="w-4 h-4" />
            <span>{t('finance.start_recon_wizard', 'Start Wizard')}</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = FleetIcons[kpi.icon];
          return (
            <div key={kpi.label} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.label}
                </span>
              </div>
              <div className={`text-2xl font-black ${kpi.color}`}>
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Accounts Reconciliation Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Ledger Accounts Roster</h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('finance.ledger_accounts_sub', 'Corporate banks, gateway escrow, and payout ledgers')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search accounts..."
                value={accountSearch}
                onChange={(e) => {
                  setAccountSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 transition-colors"
              />
              <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* View Mode Switcher */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="card"
            />
          </div>
        </div>

        {currentAccounts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            {accounts.length === 0 ? 'Loading accounts roster…' : 'No matching accounts found'}
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Account Name &amp; Category</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4 text-center">Txns</th>
                  <th className="py-3 px-4 text-center">Matched</th>
                  <th className="py-3 px-4 text-center">Unmatched</th>
                  <th className="py-3 px-4">Ledger Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {currentAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{acc.name || acc.accountName}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{acc.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{acc.accountNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-center">{acc.totalTxns}</td>
                    <td className="py-3.5 px-4 text-emerald-700 font-bold text-center">{acc.matched}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-center">{acc.unmatched}</td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                      {String(acc.ledgerBalance || acc.balance || '0').startsWith('₹')
                        ? (acc.ledgerBalance || acc.balance)
                        : `₹${Number(acc.ledgerBalance || acc.balance || 0).toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border inline-flex items-center gap-1 ${
                          acc.status === 'Reconciled'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Reconciled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>{acc.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`${basePath}/reconciliation/start?account=${acc.id}`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <span>Reconcile</span>
                        <FleetIcons.ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAccounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{acc.name || acc.accountName}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md capitalize">
                        {acc.category}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {acc.accountNumber}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] border shrink-0 inline-flex items-center gap-1 ${
                      acc.status === 'Reconciled'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Reconciled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{acc.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Txns</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5">{acc.totalTxns}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-600 font-bold uppercase">Matched</div>
                    <div className="text-xs font-black text-emerald-700 mt-0.5">{acc.matched}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-red-500 font-bold uppercase">Unmatched</div>
                    <div className="text-xs font-black text-red-600 mt-0.5">{acc.unmatched}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Ledger Balance</div>
                    <div className="text-sm font-black text-slate-900 font-mono">
                      {String(acc.ledgerBalance || acc.balance || '0').startsWith('₹')
                        ? (acc.ledgerBalance || acc.balance)
                        : `₹${Number(acc.ledgerBalance || acc.balance || 0).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                  <Link
                    to={`${basePath}/reconciliation/start?account=${acc.id}`}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>Reconcile</span>
                    <FleetIcons.ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Global Pagination */}
        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialReconciliationPage;

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { useAuth } from '../../hooks/useAuth';

export const FinanceDashboardPage = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  const canView = hasPermission('finance.dashboard.view');
  const canCreateInvoice = hasPermission('finance.invoices.create') || hasPermission('finance.invoices.manage');
  const { kpis, invoices, subscriptions, loadKpis, loadInvoices, loadSubscriptions } = useFinanceRole();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadKpis(),
        loadInvoices({ limit: 5, page: 1 }),
        loadSubscriptions({ limit: 5, page: 1 }),
      ]);
      toast.success('Dashboard metrics refreshed!');
    } catch {
      toast.error('Failed to refresh metrics.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadKpis().catch(() => {});
      loadInvoices({ limit: 5, page: 1 }).catch(() => {});
      loadSubscriptions({ limit: 5, page: 1 }).catch(() => {});
    }
  }, [canView, loadKpis, loadInvoices, loadSubscriptions]);

  const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.items || invoices?.rows || []);
  const subscriptionList = Array.isArray(subscriptions) ? subscriptions : (subscriptions?.items || subscriptions?.rows || []);

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-500 dark:text-zinc-400">
          <FleetIcons.Lock className="w-6 h-6 text-slate-500 dark:text-zinc-400" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('finance.access_revoked', 'Access Revoked')}</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          You do not have permission to view the Finance Dashboard. Please contact your system administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('common.welcome', 'Welcome')}, {user?.name ?? 'Finance Officer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Overview of your revenue, invoices, and payments
          </p>
        </div>

        {/* Header Action Buttons (Fully Responsive) */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <RefreshButton onClick={handleRefresh} loading={refreshing} />


          {/* Create Invoice Link */}
          {canCreateInvoice && (
            <Link
              to={`${basePath}/invoices/generate`}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 shadow-blue-600/20"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
              <span>{t('finance.dashboard.create_invoice')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Cards (Simple Words + Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Link
          to={`${basePath}/payments`}
          className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all block group min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 transition-colors">
              Total Revenue
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            ₹{Number(kpis?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.total_earnings')}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center"><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Total Invoices */}
        <Link
          to={`${basePath}/invoices`}
          className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all block group min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-blue-600 transition-colors">
              Total Invoices
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <FleetIcons.Document className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {Number(kpis?.totalInvoices || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.all_issued_bills')}</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center"><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Total Payments */}
        <Link
          to={`${basePath}/payments`}
          className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all block group min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 transition-colors">
              Total Payments
            </span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <FleetIcons.BarChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            ₹{Number(kpis?.totalPayments || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.completed_payments')}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center"><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>

        {/* Pending Invoices */}
        <Link
          to={`${basePath}/invoices`}
          className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all block group min-w-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 group-hover:text-amber-600 transition-colors">
              Pending Invoices
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {Number(kpis?.pendingInvoices || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.unpaid_invoices')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center"><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>
      </div>


      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to={`${basePath}/invoices`}
          className="p-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition-all flex items-center gap-2.5 shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FleetIcons.Document className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-blue-600">{t('finance.profile.invoices')}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{t('finance.dashboard.manage_bills')}</div>
          </div>
        </Link>

        {canCreateInvoice && <Link
          to={`${basePath}/invoices/design`}
          className="p-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl transition-all flex items-center gap-2.5 shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <FleetIcons.Settings className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-600">{t('finance.dashboard.invoice_design')}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{t('finance.dashboard.templates_colors')}</div>
          </div>
        </Link>}

        <Link
          to={`${basePath}/payments`}
          className="p-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-xl transition-all flex items-center gap-2.5 shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <FleetIcons.Check className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-emerald-600">{t('nav.payments', 'Payments')}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{t('finance.dashboard.settled_ledger')}</div>
          </div>
        </Link>

        <Link
          to={`${basePath}/reports`}
          className="p-3 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-xl transition-all flex items-center gap-2.5 shadow-2xs group"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <FleetIcons.BarChart className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-purple-600">{t('nav.reports', 'Reports')}</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{t('finance.dashboard.revenue_insights')}</div>
          </div>
        </Link>
      </div>

      {/* Middle Grid: Recent Invoices & Active Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Invoices */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.dashboard.recent_invoices')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.latest_bills_sub')}</p>
              </div>
              <Link to={`${basePath}/invoices`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {invoiceList.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('finance.dashboard.no_invoices')}</p>
              )}
              {invoiceList.slice(0, 3).map((inv) => (
                <div key={inv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0">{inv.code ?? '—'}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">{inv.customer_name ?? '—'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      Issued: {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 inline-block ${
                      String(inv.status).toLowerCase() === 'paid'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : String(inv.status).toLowerCase() === 'overdue'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>
                      {inv.status ?? '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to={`${basePath}/invoices`}
            className="w-full py-2.5 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors text-center block mt-3"
          >
            View All Invoices →
          </Link>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.dashboard.active_subscriptions')}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.dashboard.active_subscriptions_sub')}</p>
              </div>
              <Link to={`${basePath}/subscriptions`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {subscriptionList.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('finance.dashboard.no_subscriptions')}</p>
              )}
              {subscriptionList.slice(0, 3).map((sub) => (
                <div key={sub.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{sub.organization?.name ?? '—'}</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded shrink-0">
                        {sub.plan?.name ?? '—'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      Cycle: {sub.billing_cycle ?? 'Monthly'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      ₹{Number(sub.mrr || sub.amount || sub.plan?.price || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mt-0.5 inline-block">
                      {sub.status ?? 'active'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to={`${basePath}/subscriptions`}
            className="w-full py-2.5 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors text-center block mt-3"
          >
            View All Subscriptions →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;

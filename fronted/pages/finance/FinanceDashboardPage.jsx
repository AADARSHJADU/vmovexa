import { useState, useEffect, useMemo } from 'react';
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
  const { kpis, invoices, subscriptions, status, loadKpis, loadInvoices, loadSubscriptions } = useFinanceRole();

  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('all');
  const periodParams = useMemo(() => getPeriodParams(period), [period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadKpis(periodParams),
        loadInvoices({ limit: 5, page: 1 }),
        loadSubscriptions({ limit: 5, page: 1, status: 'active' }),
      ]);
      toast.success(t('common.dashboard_refreshed', 'Dashboard metrics refreshed!'));
    } catch {
      toast.error(t('common.dashboard_refresh_failed', 'Failed to refresh metrics.'));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadKpis(periodParams).catch(() => {});
      loadInvoices({ limit: 5, page: 1 }).catch(() => {});
      loadSubscriptions({ limit: 5, page: 1, status: 'active' }).catch(() => {});
    }
  }, [canView, loadKpis, loadInvoices, loadSubscriptions, periodParams]);

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
          {t('ag.finance.financedashboardpage.you_do_not_have_permission_to_view_the_finan', 'You do not have permission to view the Finance Dashboard. Please contact your system administrator.')}
        </p>
      </div>
    );
  }

  if (status === 'loading' && !kpis) {
    return (
      <div className="w-full space-y-6 animate-pulse" aria-label={t('ag.finance.financedashboardpage.loading_finance_dashboard', 'Loading finance dashboard')}>
        <div className="h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 rounded-2xl bg-slate-100 dark:bg-zinc-900" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-56 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
          <div className="h-56 rounded-2xl bg-slate-100 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('common.welcome', 'Welcome')}, {user?.name ?? t('roles.finance', 'Finance Officer')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.finance.financedashboardpage.overview_of_your_revenue_invoices_and_paymen', 'Overview of your revenue, invoices, and payments')}
          </p>
        </div>

        {/* Header Action Buttons (Fully Responsive) */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <label className="sr-only" htmlFor="finance-dashboard-period">{t('ag.finance.financedashboardpage.dashboard_period', 'Dashboard period')}</label>
          <select
            id="finance-dashboard-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">{t('ag.finance.financedashboardpage.all_time', 'All time')}</option>
            <option value="month">{t('ag.finance.financedashboardpage.this_month', 'This month')}</option>
            <option value="quarter">{t('ag.finance.financedashboardpage.this_quarter', 'This quarter')}</option>
            <option value="year">{t('ag.finance.financedashboardpage.this_year', 'This year')}</option>
          </select>
          <RefreshButton onClick={handleRefresh} loading={refreshing} />
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
              {t('ag.finance.financedashboardpage.collected_revenue', 'Collected Revenue')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            ₹{Number(kpis?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{t('ag.finance.financedashboardpage.base', 'Base ₹')}{Number(kpis?.baseRevenue || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.tax', '+ Tax ₹')}{Number(kpis?.taxCollected || 0).toLocaleString('en-IN')}</span>
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
              {t('ag.finance.financedashboardpage.total_invoices', 'Total Invoices')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <FleetIcons.Document className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {Number(kpis?.totalInvoices || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{Number(kpis?.paidInvoices || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.paid_invoices', 'paid invoices')}</span>
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
              {t('ag.finance.financedashboardpage.successful_payments', 'Successful Payments')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <FleetIcons.BarChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            ₹{Number(kpis?.totalPayments || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{Number(kpis?.successfulPayments || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.ledger_entries', 'ledger entries')}</span>
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
              {t('ag.finance.financedashboardpage.outstanding_receivables', 'Outstanding Receivables')}
            </span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <FleetIcons.Alert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            ₹{Number(kpis?.pendingAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">{Number(kpis?.pendingInvoices || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.pending', 'pending ·')} {Number(kpis?.overdueInvoices || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.overdue', 'overdue')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center"><FleetIcons.ArrowRight className="w-3.5 h-3.5" /></span>
          </div>
        </Link>
      </div>

      {/* Saved breakdown summary — no tax is inferred outside invoice line items. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">{t('ag.finance.financedashboardpage.revenue_by_source', 'Revenue by source')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('ag.finance.financedashboardpage.paid_invoice_totals_from_the_selected_period', 'Paid invoice totals from the selected period')}</p>
            </div>
            <FleetIcons.BarChart className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <BreakdownTile label={t('finance.dashboard.advertising_campaigns', 'Advertising campaigns')} amount={kpis?.advertisingRevenue} tone="blue" />
            <BreakdownTile label={t('finance.dashboard.government_psa', 'Government / PSA')} amount={kpis?.governmentRevenue} tone="violet" />
            <BreakdownTile label={t('finance.dashboard.subscriptions', 'Subscriptions')} amount={kpis?.subscriptionRevenue} tone="emerald" />
            <BreakdownTile label={t('finance.dashboard.other_revenue', 'Other revenue')} amount={kpis?.otherRevenue} tone="slate" />
          </div>
        </section>

        <section className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">{t('ag.finance.financedashboardpage.saved_tax_breakdown', 'Saved tax breakdown')}</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('ag.finance.financedashboardpage.only_persisted_cgst_sgst_and_igst_lines_are_', 'Only persisted CGST, SGST and IGST lines are counted')}</p>
            </div>
            <Link to={`${basePath}/gst`} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">{t('ag.finance.financedashboardpage.gst_ledger', 'GST ledger →')}</Link>
          </div>
          <div className="space-y-2.5">
            <TaxRow label={t('finance.dashboard.base_revenue', 'Base revenue')} value={kpis?.baseRevenue} />
            <TaxRow label="CGST" value={kpis?.cgst} />
            <TaxRow label="SGST" value={kpis?.sgst} />
            <TaxRow label="IGST" value={kpis?.igst} />
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-zinc-800 text-sm font-black text-slate-900 dark:text-white">
              <span>{t('ag.finance.financedashboardpage.total_collected', 'Total collected')}</span>
              <span className="font-mono">₹{Number(kpis?.totalRevenue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </section>
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
                {t('ag.finance.financedashboardpage.view_all', 'View All →')}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {invoiceList.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('finance.dashboard.no_invoices')}</p>
              )}
              {invoiceList.slice(0, 5).map((inv) => (
                <Link to={`${basePath}/invoices/${inv.id}`} key={inv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 min-w-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg px-1 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white shrink-0">{inv.code ?? '—'}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">{inv.customer_name ?? '—'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      {t('ag.finance.financedashboardpage.issued', 'Issued:')} {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      ₹{Number(inv.total || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{t('ag.finance.financedashboardpage.base', 'Base ₹')}{Number(inv.subtotal || 0).toLocaleString('en-IN')} {t('ag.finance.financedashboardpage.tax_2', '· Tax ₹')}{Number(inv.tax_amount || 0).toLocaleString('en-IN')}</div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mt-0.5 inline-block capitalize ${
                      String(inv.status).toLowerCase() === 'paid'
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : String(inv.status).toLowerCase() === 'overdue'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                        : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>
                      {String(inv.status).toLowerCase() === 'issued' ? t('common.unpaid', 'Unpaid') : (inv.status ?? '—')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            to={`${basePath}/invoices`}
            className="w-full py-2.5 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 transition-colors text-center block mt-3"
          >
            {t('ag.finance.financedashboardpage.view_all_invoices', 'View All Invoices →')}
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
                {t('ag.finance.financedashboardpage.view_all', 'View All →')}
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {subscriptionList.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('finance.dashboard.no_subscriptions')}</p>
              )}
              {subscriptionList.slice(0, 5).map((sub) => (
                <div key={sub.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{sub.organization?.name ?? '—'}</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded shrink-0">
                        {sub.plan?.name ?? '—'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                      {t('ag.finance.financedashboardpage.cycle', 'Cycle:')} {sub.billing_cycle ? t(`common.${String(sub.billing_cycle).toLowerCase()}`, sub.billing_cycle) : t('common.monthly', 'Monthly')}
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
            {t('ag.finance.financedashboardpage.view_all_subscriptions', 'View All Subscriptions →')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;

const tileTones = {
  blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50',
  violet: 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/50',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
  slate: 'bg-slate-50 dark:bg-zinc-800/60 border-slate-100 dark:border-zinc-800',
};

const BreakdownTile = ({ label, amount, tone }) => (
  <div className={`rounded-xl border p-3 ${tileTones[tone] || tileTones.slate}`}>
    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-500 dark:text-zinc-400">{label}</p>
    <p className="mt-1 text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">₹{Number(amount || 0).toLocaleString('en-IN')}</p>
  </div>
);

const TaxRow = ({ label, value }) => (
  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
    <span>{label}</span>
    <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(value || 0).toLocaleString('en-IN')}</span>
  </div>
);

function getPeriodParams(period) {
  if (period === 'all') return {};
  const now = new Date();
  const endDate = toDateInput(now);
  let start;
  if (period === 'month') start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (period === 'quarter') start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  else start = new Date(now.getFullYear(), 0, 1);
  return { startDate: toDateInput(start), endDate };
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

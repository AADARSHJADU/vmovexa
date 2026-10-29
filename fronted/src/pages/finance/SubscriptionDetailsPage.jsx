import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const monogramOf = (name) => String(name || '—').trim().slice(0, 2).toUpperCase();

export const SubscriptionDetailsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { id } = useParams();
  const { subscriptions, invoices, loadSubscriptions, loadInvoices } = useFinanceRole();

  useEffect(() => {
    loadSubscriptions().catch(() => {});
  }, [loadSubscriptions]);
  useEffect(() => {
    loadInvoices().catch(() => {});
  }, [loadInvoices]);

  const subscriptionList = Array.isArray(subscriptions) ? subscriptions : (subscriptions?.items || subscriptions?.rows || []);
  const invoiceList = Array.isArray(invoices) ? invoices : (invoices?.items || invoices?.rows || []);

  const sub = subscriptionList.find((s) => String(s.id) === String(id) || String(s.code) === String(id));

  if (!sub) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('finance.subs.subscription')}</h1>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <FleetIcons.Fleets className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.subs.not_found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('finance.subs.not_found_desc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Subscriptions', path: `${basePath}/subscriptions` },
              { label: sub.organization?.name ? `${sub.organization.name}` : `Subscription #${id}` },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{sub.organization?.name ?? '—'}</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md">
              {sub.code ?? sub.id ?? '—'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {sub.plan?.name ?? '—'} · Complete billing contract and automated renewal configuration
          </p>
        </div>

        <button
          onClick={() => toast('Coming soon')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <FleetIcons.Settings className="w-4 h-4" />
          <span>{t('finance.subs.edit_plan_config')}</span>
        </button>
      </div>

      {/* Subscription Summary Hero Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 font-black text-xl flex items-center justify-center shadow-xs">
              {monogramOf(sub.organization?.name)}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('finance.subs.selected_tier')}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{sub.plan?.name ?? '—'}</h2>
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">Assigned to: {sub.organization?.name ?? '—'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{sub.status ?? '—'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase">{t('finance.subs.base_price')}</span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{sub.amount ?? '—'}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase">{t('finance.subs.billing_cycle')}</span>
            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{sub.billing_cycle ?? '—'}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase">{t('finance.subs.total_billed')}</span>
            <div className="text-sm font-black text-blue-700 mt-0.5">{sub.amount ?? '—'}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase">{t('finance.subs.next_renewal')}</span>
            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{sub.ends_at ?? '—'}</div>
          </div>
        </div>
      </div>

      {/* Plan Features & Payment Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Payment Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
            Billing & Auto-Debit Method
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">{t('finance.subs.payment_instrument')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{sub.payment_method ?? '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">{t('finance.subs.auto_renewal')}</span>
              <span className="font-bold text-emerald-700">● {sub.auto_renew ? 'Enabled (Automatic)' : 'Manual Pay'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">{t('finance.subs.billing_email')}</span>
              <span className="font-medium text-slate-900 dark:text-white truncate">{sub.billing_email ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
            Automated Alert Triggers
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{t('finance.subs.send_email_inv')}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('finance.subs.enabled')}</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{t('finance.subs.send_email_pmt')}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('finance.subs.enabled')}</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
              <span className="text-slate-700 dark:text-zinc-300 font-medium">{t('finance.subs.expiry_reminder')}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('finance.subs.enabled')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('finance.subs.sub_invoices')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('finance.subs.sub_invoices_desc')}</p>
          </div>
          <Link to={`${basePath}/invoices`} className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Invoices →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {invoiceList.length === 0 && (
            <p className="py-6 text-center text-xs text-slate-400 font-medium">{t('finance.subs.no_records')}</p>
          )}
          {invoiceList.slice(0, 2).map((inv) => (
            <div key={inv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.code ?? '—'}</span>
                  <span className="text-slate-600 dark:text-zinc-400">· {inv.issued_at ?? '—'}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Total: {inv.total ?? '—'}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                  {inv.status ?? '—'}
                </span>
                <Link
                  to={`${basePath}/invoices/${inv.id}`}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-lg transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

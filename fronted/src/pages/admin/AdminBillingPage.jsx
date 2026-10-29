import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/services/billing.service';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';
import { InvoiceDownloadButton } from '../../components/billing/InvoiceDownloadButton';

export const AdminBillingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Quota counts state
  const [quotas, setQuotas] = useState({
    busesUsed: 0,
    busesLimit: 0,
    driversUsed: 0,
    driversLimit: 0,
    depotsUsed: 0,
    depotsLimit: 0,
    displaysUsed: 0,
    displaysLimit: 0,
    operatorsUsed: 0,
    operatorsLimit: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSession = params.get('stripe_session');
    const statusParam = params.get('status');
    if (stripeSession && statusParam === 'success') {
      const verify = async () => {
        try {
          const res = await billingService.verifySession({ sessionId: stripeSession });
          if (res?.tokens) {
            storage.setTokens({
              accessToken: res.tokens.accessToken,
              refreshToken: res.tokens.refreshToken,
            });
          }
          toast.success('Stripe payment verified! Subscription is active.');
        } catch (err) {
          toast.error(err?.message || 'Failed to verify payment session.');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
          loadBillingData();
        }
      };
      verify();
      return;
    }
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [subData, plansData, invData] = await Promise.allSettled([
        billingService.getSubscription(),
        billingService.getPlans(),
        billingService.getInvoices(),
      ]);

      if (subData.status === 'fulfilled' && subData.value) {
        const s = subData.value;
        setSubscription(s);
        const plan = s.plan || {};
        const features = plan.features || {};
        const q = s.quotas || {};
        setQuotas({
          busesUsed: q.busesUsed != null ? Number(q.busesUsed) : (s.organization?.vehicles_count || 0),
          busesLimit: plan.buses_limit != null ? Number(plan.buses_limit) : (features.buses_limit != null ? Number(features.buses_limit) : 0),
          driversUsed: q.driversUsed != null ? Number(q.driversUsed) : (s.organization?.drivers_count || 0),
          driversLimit: plan.drivers_limit != null ? Number(plan.drivers_limit) : (features.drivers_limit != null ? Number(features.drivers_limit) : 0),
          depotsUsed: q.depotsUsed != null ? Number(q.depotsUsed) : (s.organization?.depots_count || 0),
          depotsLimit: plan.depots_limit != null ? Number(plan.depots_limit) : (features.depots_limit != null ? Number(features.depots_limit) : 0),
          operatorsUsed: q.operatorsUsed != null ? Number(q.operatorsUsed) : (s.organization?.fleet_operators_count || 0),
          operatorsLimit: plan.fleet_operators_limit != null ? Number(plan.fleet_operators_limit) : (features.fleet_operators_limit != null ? Number(features.fleet_operators_limit) : 0),
          displaysUsed: q.displaysUsed != null ? Number(q.displaysUsed) : (s.organization?.active_screens || 0),
          displaysLimit: features.displays_limit != null ? Number(features.displays_limit) : 0,
        });
      } else {
        setSubscription(null);
      }

      if (plansData.status === 'fulfilled') {
        setPlans(plansData.value || []);
      }

      if (invData.status === 'fulfilled') {
        setInvoices(invData.value || []);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan || null;
  const status = subscription?.status || 'active';
  const isGrace = status === 'grace';
  const isExpired = status === 'expired';

  const busPercent = quotas.busesLimit > 0 ? Math.min(100, Math.round((quotas.busesUsed / quotas.busesLimit) * 100)) : 0;
  const driverPercent = quotas.driversLimit > 0 ? Math.min(100, Math.round(((quotas.driversUsed || 0) / quotas.driversLimit) * 100)) : 0;
  const depotPercent = quotas.depotsLimit > 0 ? Math.min(100, Math.round((quotas.depotsUsed / quotas.depotsLimit) * 100)) : 0;
  const operatorPercent = quotas.operatorsLimit > 0 ? Math.min(100, Math.round((quotas.operatorsUsed / quotas.operatorsLimit) * 100)) : 0;

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" />
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
              { label: t('nav.admin') || 'Tenant Admin', path: '/admin/dashboard' },
              { label: t('admin.billing.title') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            SaaS Subscription & Operational Quotas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage your fleet capacity tier, billing invoices, GST tax compliance, and payment rails
          </p>
        </div>
      </div>

      {/* EXPIRED OR GRACE WARNING BANNER */}
      {isGrace && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <FleetIcons.Alert className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Subscription Expired — 7-Day Grace Period Active
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Renew your plan now to prevent operational lockout and telemetry interruption.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            {t('admin.billing.renew_now')}
          </button>
        </div>
      )}

      {isExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <FleetIcons.Emergency className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                Subscription Expired — Fleet Operations Restricted
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Adding new buses or depots is currently blocked (HTTP 403). Renew your plan to restore full access immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            {t('admin.billing.reactivate_sub')}
          </button>
        </div>
      )}

      {/* Plan Card or Empty State */}
      {!currentPlan ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <FleetIcons.Reports className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.billing.no_active_plan')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              {t('admin.billing.no_active_plan_desc')}
            </p>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('admin.billing.choose_fleet_plan')}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Current Plan Overview Card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.billing.active_plan')}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExpired
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : isGrace
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {isExpired ? 'EXPIRED' : isGrace ? 'GRACE PERIOD' : 'ACTIVE'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentPlan.name}</h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{currentPlan.code}</p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ₹{Number(currentPlan.monthly_price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('admin.billing.per_month_gst')}</span>
                </div>
                {(() => {
                  const bd = currentPlan.price_breakdown || currentPlan.features?.price_breakdown;
                  const items = Array.isArray(bd) ? bd : (typeof bd === 'object' && bd !== null ? Object.entries(bd).map(([k, v]) => ({ key: k, value: v })) : []);
                  if (!items || items.length === 0) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {items.map((it, i) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {it.label || it.key}: ₹{Number(it.value ?? it.amount ?? 0).toLocaleString('en-IN')}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/billing/upgrade')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {t('admin.billing.change_tier')}
                </button>
              </div>
            </div>

            {/* Feature Specs Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('admin.billing.driver_quota')}</span>
                <p className="text-sm font-black text-slate-800 dark:text-zinc-100">
                  {currentPlan.drivers_limit != null
                    ? `${currentPlan.drivers_limit} Drivers`
                    : (currentPlan.features?.drivers_limit != null
                      ? `${currentPlan.features.drivers_limit} Drivers`
                      : 'Unlimited')}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('admin.billing.licensed_roster')}</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">{t('admin.billing.fleet_operators')}</span>
                <p className="text-sm font-black text-slate-800 dark:text-zinc-100">
                  {currentPlan.fleet_operators_limit != null
                    ? `${currentPlan.fleet_operators_limit} Accounts`
                    : (currentPlan.features?.fleet_operators_limit != null
                      ? `${currentPlan.features.fleet_operators_limit} Accounts`
                      : 'Unlimited')}
                </p>
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">{t('admin.billing.operator_licenses')}</span>
              </div>
            </div>
          </div>

          {/* 4 Operational Quota Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Buses Quota */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.billing.vehicles_quota')}</span>
                <span className={`text-xs font-black ${busPercent >= 90 ? 'text-rose-600' : 'text-blue-600 dark:text-blue-400'}`}>
                  {quotas.busesLimit > 0 ? `${quotas.busesUsed} / ${quotas.busesLimit}` : `${quotas.busesUsed} / Unlimited`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    busPercent >= 90 ? 'bg-rose-500' : busPercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${busPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                {quotas.busesLimit > 0
                  ? (quotas.busesLimit - quotas.busesUsed > 0
                    ? `${quotas.busesLimit - quotas.busesUsed} slots available`
                    : 'Limit reached — Upgrade to add buses')
                  : 'Unlimited vehicle slots'}
              </p>
            </div>

            {/* Drivers Quota */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.billing.drivers_quota')}</span>
                <span className={`text-xs font-black ${driverPercent >= 90 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {quotas.driversLimit > 0 ? `${quotas.driversUsed || 0} / ${quotas.driversLimit}` : `${quotas.driversUsed || 0} / Unlimited`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${driverPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                {quotas.driversLimit > 0
                  ? (quotas.driversLimit - (quotas.driversUsed || 0) > 0
                    ? `${quotas.driversLimit - (quotas.driversUsed || 0)} driver slots free`
                    : 'Driver limit reached')
                  : 'Unlimited driver slots'}
              </p>
            </div>

            {/* Depots Quota */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.billing.depot_terminals')}</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {quotas.depotsLimit > 0 ? `${quotas.depotsUsed} / ${quotas.depotsLimit}` : `${quotas.depotsUsed} / Unlimited`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${depotPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                {quotas.depotsLimit > 0
                  ? (quotas.depotsLimit - quotas.depotsUsed > 0
                    ? `${quotas.depotsLimit - quotas.depotsUsed} terminal slots free`
                    : 'Terminal limit reached')
                  : 'Unlimited terminals'}
              </p>
            </div>

            {/* Fleet Operators Quota */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.billing.fleet_operators')}</span>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400">
                  {quotas.operatorsLimit > 0 ? `${quotas.operatorsUsed} / ${quotas.operatorsLimit}` : `${quotas.operatorsUsed} / Unlimited`}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600 transition-all"
                  style={{ width: `${operatorPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                {quotas.operatorsLimit > 0
                  ? (quotas.operatorsLimit - quotas.operatorsUsed > 0
                    ? `${quotas.operatorsLimit - quotas.operatorsUsed} operator slots free`
                    : 'Operator limit reached')
                  : 'Unlimited operators'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Invoices History Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              GST Tax Invoices & Payment Receipts
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              SAC Code 997331 — Certified GST tax invoices for accounting & input tax credit
            </p>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">{t('admin.billing.th_invoice_code')}</th>
                <th className="py-3 px-4">{t('admin.billing.th_desc')}</th>
                <th className="py-3 px-4">{t('admin.billing.th_total_gst')}</th>
                <th className="py-3 px-4">{t('admin.billing.th_status')}</th>
                <th className="py-3 px-4">{t('admin.billing.th_date_issued')}</th>
                <th className="py-3 px-4 text-right">{t('admin.billing.th_tax_invoice')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    {t('admin.billing.no_invoices')}
                  </td>
                </tr>
              ) : (
                invoices
                  .slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize)
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">{inv.code}</td>
                      <td className="py-3.5 px-4">
                        {inv.items && inv.items.length > 0
                          ? inv.items.map((it) => it.description).join(', ')
                          : 'VMOVEXA SaaS Subscription Plan'}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-black text-slate-900 dark:text-white">₹{Number(inv.total || 0).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {(inv.status || 'PAID').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-zinc-500">
                        {inv.issued_at
                          ? new Date(inv.issued_at).toLocaleDateString('en-IN')
                          : (inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : 'N/A')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <InvoiceDownloadButton
                          invoice={inv}
                          variant="compact"
                          color="outline"
                          label="Download PDF"
                        />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {invoices.length > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={invoicePage}
              totalPages={Math.ceil(invoices.length / invoicePageSize) || 1}
              totalItems={invoices.length}
              pageSize={invoicePageSize}
              pageSizeOptions={[6, 10, 20, 50]}
              onPageChange={setInvoicePage}
              onPageSizeChange={setInvoicePageSize}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminBillingPage;

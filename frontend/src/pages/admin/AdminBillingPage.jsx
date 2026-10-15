import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/services/billing.service';
import { Pagination } from '../../components/ui/Pagination';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';

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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('stripe'); // 'stripe' | 'razorpay'
  const [processingPlanId, setProcessingPlanId] = useState(null);

  // Quota counts state
  const [quotas, setQuotas] = useState({
    busesUsed: 0,
    busesLimit: 25,
    depotsUsed: 0,
    depotsLimit: 2,
    displaysUsed: 0,
    displaysLimit: 50,
    operatorsUsed: 0,
    operatorsLimit: 10,
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
          busesUsed: q.busesUsed ?? (s.organization?.vehicles_count || 0),
          busesLimit: plan.buses_limit || 25,
          depotsUsed: q.depotsUsed ?? (s.organization?.depots_count || 0),
          depotsLimit: features.depots_limit || 2,
          displaysUsed: q.displaysUsed ?? 0,
          displaysLimit: (plan.buses_limit || 25) * (features.displays_per_bus || 2),
          operatorsUsed: q.operatorsUsed ?? 0,
          operatorsLimit: features.users_limit || 10,
        });
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

  const handleSelectUpgrade = async (plan) => {
    try {
      setProcessingPlanId(plan.id);
      const res = await billingService.createSubscriptionOrder({
        planId: plan.id,
        gateway: selectedGateway,
        successUrl: `${window.location.origin}/admin/billing?stripe_session={CHECKOUT_SESSION_ID}&status=success`,
        cancelUrl: `${window.location.origin}/admin/billing?status=cancelled`,
      });

      if (res?.order?.clientParams?.sessionUrl) {
        // Redirect to live Stripe Checkout
        window.location.href = res.order.clientParams.sessionUrl;
        return;
      }

      if (selectedGateway === 'razorpay') {
        const clientParams = res?.order?.clientParams || {};
        const keyId = clientParams.keyId;
        const rzpOrderId = res?.order?.orderId;
        const amountPaise = clientParams.amount || Math.round(Number(plan.monthly_price) * 100);

        if (!keyId || !rzpOrderId) {
          throw new Error('Razorpay order initialization failed.');
        }

        await openRazorpayCheckout({
          keyId,
          orderId: rzpOrderId,
          amount: amountPaise,
          currency: 'INR',
          name: 'VMOVEXA Platform',
          description: `Upgrade to ${plan.name}`,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          onSuccess: async (rzpResp) => {
            const verifyToast = toast.loading('Verifying payment signature…');
            try {
              await billingService.confirmSubscription({
                orderId: rzpOrderId,
                paymentCode: res.paymentCode,
                planId: plan.id,
                razorpayPaymentId: rzpResp.razorpay_payment_id,
                razorpayOrderId: rzpResp.razorpay_order_id || rzpOrderId,
                razorpaySignature: rzpResp.razorpay_signature,
              });
              toast.dismiss(verifyToast);
              toast.success(`Upgraded to ${plan.name} successfully!`);
              setUpgradeModalOpen(false);
              loadBillingData();
            } catch (vErr) {
              toast.dismiss(verifyToast);
              toast.error(vErr?.message || 'Payment signature verification failed.');
            } finally {
              setProcessingPlanId(null);
            }
          },
          onDismiss: () => {
            setProcessingPlanId(null);
            toast('Payment cancelled or closed.', { icon: 'ℹ️' });
          },
          onError: (err) => {
            setProcessingPlanId(null);
            toast.error(err?.description || 'Razorpay payment transaction failed.');
          },
        });
        return;
      }

      throw new Error('Payment processing could not be initiated. Please select Stripe or Razorpay.');
    } catch (err) {
      toast.error(err.message || 'Upgrade checkout failed.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleDownloadInvoice = (inv) => {
    const token = storage.getAccessToken();
    const url = `${billingService.getInvoiceHtmlUrl(inv.id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  const currentPlan = subscription?.plan || {
    name: 'Growth Fleet Tier',
    code: 'PLAN-GROWTH',
    monthly_price: 24999,
    buses_limit: 25,
    features: {
      depots_limit: 2,
      displays_per_bus: 2,
      gps_ping_interval: '5s',
      data_retention_days: 90,
      support_sla: '24h',
      emergency_broadcast: true,
      badge: 'Active Tier',
    },
  };

  const status = subscription?.status || 'active';
  const isGrace = status === 'grace';
  const isExpired = status === 'expired';

  const busPercent = Math.min(100, Math.round((quotas.busesUsed / (quotas.busesLimit || 1)) * 100));
  const depotPercent = Math.min(100, Math.round((quotas.depotsUsed / (quotas.depotsLimit || 1)) * 100));
  const displayPercent = Math.min(100, Math.round((quotas.displaysUsed / (quotas.displaysLimit || 1)) * 100));
  const operatorPercent = Math.min(100, Math.round((quotas.operatorsUsed / (quotas.operatorsLimit || 1)) * 100));

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Tenant Admin', path: '/admin/dashboard' },
              { label: 'Subscription & Quotas' },
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

        <button
          onClick={() => setUpgradeModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <FleetIcons.Plus className="w-4 h-4" />
          <span>Upgrade Fleet Plan</span>
        </button>
      </div>

      {/* EXPIRED OR GRACE WARNING BANNER */}
      {isGrace && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-900">
                Subscription Expired — 7-Day Grace Period Active
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Renew your plan now to prevent operational lockout and telemetry interruption.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            Renew Now
          </button>
        </div>
      )}

      {isExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                Subscription Expired — Fleet Operations Restricted
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Adding new buses or depots is currently blocked (HTTP 403). Renew your plan to restore full access immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
          >
            Reactivate Subscription
          </button>
        </div>
      )}

      {/* Current Plan Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active SaaS Plan</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isExpired
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isGrace
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isExpired ? 'EXPIRED' : isGrace ? 'GRACE PERIOD' : 'ACTIVE'}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-1">{currentPlan.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{currentPlan.code}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹{Number(currentPlan.monthly_price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ month (GST Included)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Change Tier
            </button>
          </div>
        </div>

        {/* Feature Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">GPS Ping Speed</span>
            <p className="text-sm font-black text-slate-800">{currentPlan.features?.gps_ping_interval || '5s'}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Sub-second ready</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry History</span>
            <p className="text-sm font-black text-slate-800">{currentPlan.features?.data_retention_days || 90} Days</p>
            <span className="text-[10px] text-slate-500 font-medium">Audit logs preserved</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Support Level</span>
            <p className="text-sm font-black text-slate-800">{currentPlan.features?.support_sla || '24h'} Response</p>
            <span className="text-[10px] text-slate-500 font-medium">Dedicated desk</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Override</span>
            <p className="text-sm font-black text-emerald-700">Enabled</p>
            <span className="text-[10px] text-slate-500 font-medium">Screen takeover access</span>
          </div>
        </div>
      </div>

      {/* 4 Operational Quota Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Buses Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Vehicles Quota</span>
            <span className={`text-xs font-black ${busPercent >= 90 ? 'text-rose-600' : 'text-blue-600'}`}>
              {quotas.busesUsed} / {quotas.busesLimit}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                busPercent >= 90 ? 'bg-rose-500' : busPercent >= 75 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${busPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {quotas.busesLimit - quotas.busesUsed > 0
              ? `${quotas.busesLimit - quotas.busesUsed} slots available`
              : 'Limit reached — Upgrade to add buses'}
          </p>
        </div>

        {/* Depots Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Depot Terminals</span>
            <span className="text-xs font-black text-blue-600">
              {quotas.depotsUsed} / {quotas.depotsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${depotPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {quotas.depotsLimit - quotas.depotsUsed} terminal slots free
          </p>
        </div>

        {/* Displays Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Edge IoT Displays</span>
            <span className="text-xs font-black text-emerald-600">
              {quotas.displaysUsed} / {quotas.displaysLimit}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${displayPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Passenger screen allocation</p>
        </div>

        {/* Staff Operators Quota */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Staff Accounts</span>
            <span className="text-xs font-black text-purple-600">
              {quotas.operatorsUsed} / {quotas.operatorsLimit}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all"
              style={{ width: `${operatorPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Fleet managers & supervisors</p>
        </div>
      </div>

      {/* Invoices History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              GST Tax Invoices & Payment Receipts
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              SAC Code 997331 — Certified GST tax invoices for accounting & input tax credit
            </p>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Total (GST Included)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4 text-right">Tax Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No past invoices on record.
                  </td>
                </tr>
              ) : (
                invoices
                  .slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize)
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{inv.code}</td>
                      <td className="py-3.5 px-4">VMOVEXA SaaS Subscription Plan</td>
                      <td className="py-3.5 px-4">
                        <p className="font-black text-slate-900">₹{Number(inv.total).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {(inv.status || 'PAID').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(inv)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all inline-block cursor-pointer"
                        >
                          Download PDF
                        </button>
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

      {/* MODAL: PLAN UPGRADE & TIER SELECTION */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Upgrade or Switch Fleet Plan</h3>
                <p className="text-xs text-slate-500">Expand your bus quota, telemetry frequency, and support SLA</p>
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Gateway Selection */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Select Payment Rail:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gateway"
                    value="stripe"
                    checked={selectedGateway === 'stripe'}
                    onChange={() => setSelectedGateway('stripe')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Stripe (Credit / Debit Cards, Apple/Google Pay)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="gateway"
                    value="razorpay"
                    checked={selectedGateway === 'razorpay'}
                    onChange={() => setSelectedGateway('razorpay')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Razorpay (UPI, NetBanking)</span>
                </label>
              </div>
            </div>

            {/* Plans Comparative Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isCurrent = subscription?.plan_id === p.id;
                const f = p.features || {};
                return (
                  <div
                    key={p.id}
                    className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                      isCurrent
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-slate-900">{p.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          ₹{Number(p.monthly_price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">/mo (GST Inc.)</span>
                      </div>

                      <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 text-slate-600">
                        <p><strong>{p.buses_limit ? `${p.buses_limit} Buses` : 'Unlimited Buses'}</strong></p>
                        <p>{f.depots_limit || 2} Depot Terminals</p>
                        <p>GPS Ping: <strong>{f.gps_ping_interval || '5s'}</strong></p>
                        <p>SLA: <strong>{f.support_sla || '24h'}</strong></p>
                        <p>Retention: {f.data_retention_days || 90} Days</p>
                      </div>
                    </div>

                    <button
                      disabled={isCurrent || processingPlanId === p.id}
                      onClick={() => handleSelectUpgrade(p)}
                      className={`w-full py-2 text-xs font-bold rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                    >
                      {processingPlanId === p.id ? 'Processing...' : isCurrent ? 'Active Plan' : 'Select & Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBillingPage;

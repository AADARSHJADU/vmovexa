import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import billingService from '../../api/services/billing.service';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { storage } from '../../utils/storage';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminUpgradePlanPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, plansData] = await Promise.allSettled([
        billingService.getSubscription(),
        billingService.getPlans(),
      ]);

      if (subData.status === 'fulfilled' && subData.value) {
        setSubscription(subData.value);
      }
      if (plansData.status === 'fulfilled') {
        setPlans(plansData.value || []);
      }
    } catch (err) {
      toast.error('Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan || null;

  const handleSelectUpgrade = async (plan) => {
    try {
      setProcessingPlanId(plan.id);

      const res = await billingService.createSubscriptionOrder({
        planId: plan.id,
        gateway: 'razorpay',
      });

      const clientParams = res?.order?.clientParams || {};
      const keyId = clientParams.keyId;
      const rzpOrderId = clientParams.orderId || res?.order?.orderId;
      const amountPaise = clientParams.amount || Math.round(Number(plan.monthly_price || 0) * 100);

      if (keyId && rzpOrderId) {
        await openRazorpayCheckout({
          keyId: keyId,
          orderId: rzpOrderId,
          amount: amountPaise,
          currency: clientParams.currency || 'INR',
          name: 'VMOVEXA SaaS',
          description: `Subscription Upgrade to ${plan.name}`,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          themeColor: '#0f172a',
          onSuccess: async (rzpResp) => {
            const verifyToast = toast.loading('Verifying Razorpay payment signature…');
            try {
              const confirmRes = await billingService.confirmSubscription({
                orderId: rzpOrderId,
                paymentCode: res.paymentCode,
                planId: plan.id,
                razorpayPaymentId: rzpResp.razorpay_payment_id,
                razorpayOrderId: rzpResp.razorpay_order_id || rzpOrderId,
                razorpaySignature: rzpResp.razorpay_signature,
              });

              toast.dismiss(verifyToast);
              toast.success(`Upgraded to ${plan.name} successfully!`);

              if (confirmRes?.tokens) {
                storage.setTokens({
                  accessToken: confirmRes.tokens.accessToken,
                  refreshToken: confirmRes.tokens.refreshToken,
                });
              }

              navigate('/admin/billing');
            } catch (vErr) {
              toast.dismiss(verifyToast);
              toast.error(vErr?.message || 'Payment signature verification failed.');
            } finally {
              setProcessingPlanId(null);
            }
          },
          onDismiss: () => {
            setProcessingPlanId(null);
            toast('Payment process was cancelled.', { icon: 'ℹ️' });
          },
          onError: (err) => {
            setProcessingPlanId(null);
            toast.error(err?.description || 'Razorpay payment transaction failed.');
          },
        });
        return;
      }

      throw new Error('Razorpay order initialization failed. Missing credentials from server.');
    } catch (err) {
      toast.error(err?.message || 'Failed to initiate plan upgrade.');
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Billing & Quotas', to: '/admin/billing' },
          { label: 'Upgrade Tier' },
        ]}
        className="mb-2"
      />

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Upgrade or Switch Fleet Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Expand your bus fleet quota, licensed drivers, depot terminals, and operator accounts
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/billing')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all w-full sm:w-auto justify-center"
        >
          <FleetIcons.ArrowLeft className="w-4 h-4" />
          <span>{t('admin.billing.back_to_billing')}</span>
        </button>
      </div>

      {/* Trust & Payment Info Badge */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-zinc-300 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('admin.billing.instant_expansion')}</span>
        </div>
        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
          Direct Razorpay Gateway (UPI / QR / NetBanking / Cards)
        </span>
      </div>

      {/* Plans Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-slate-100 dark:bg-zinc-800/40 animate-pulse border border-slate-200 dark:border-zinc-800"
            />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <FleetIcons.Target className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{t('admin.billing.no_plans_available')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('admin.billing.contact_support')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const f = p.features || {};
            const isCurrent = currentPlan?.id === p.id;
            const isProcessing = processingPlanId === p.id;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                  isCurrent
                    ? 'border-2 border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-lg'
                }`}
              >
                <div className="space-y-4">
                  {/* Top code pill & badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                      {p.code}
                    </span>
                    {f.badge && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                        {f.badge}
                      </span>
                    )}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {p.name}
                  </h3>

                  {/* Price */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ₹{Number(p.monthly_price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                        /mo (GST Inc.)
                      </span>
                    </div>

                    {/* Breakdown pills */}
                    {(() => {
                      const bd = p.price_breakdown || f.price_breakdown;
                      const items = Array.isArray(bd)
                        ? bd
                        : typeof bd === 'object' && bd !== null
                        ? Object.entries(bd).map(([k, v]) => ({ key: k, value: v }))
                        : [];
                      if (!items || items.length === 0) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                          {items.map((it, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                            >
                              {it.label || it.key}: ₹{Number(it.value ?? it.amount ?? 0).toLocaleString('en-IN')}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Quotas List (4 Core items, No SLA) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                      <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-bold">
                        {p.buses_limit ? `${p.buses_limit} Buses` : f.buses_limit ? `${f.buses_limit} Buses` : 'Unlimited Buses'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                      <FleetIcons.Driver className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold">
                        {p.drivers_limit != null
                          ? `${p.drivers_limit} Drivers`
                          : f.drivers_limit != null
                          ? `${f.drivers_limit} Drivers`
                          : 'Custom Drivers'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                      <FleetIcons.Depot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="font-bold">
                        {p.depots_limit != null
                          ? `${p.depots_limit} Depot Terminals`
                          : f.depots_limit != null
                          ? `${f.depots_limit} Depot Terminals`
                          : 'Custom Terminals'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
                      <FleetIcons.Fleets className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="font-bold">
                        {p.fleet_operators_limit != null
                          ? `${p.fleet_operators_limit} Fleet Operators`
                          : f.fleet_operators_limit != null
                          ? `${f.fleet_operators_limit} Fleet Operators`
                          : 'Custom Operators'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-200 dark:border-zinc-700"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleSelectUpgrade(p)}
                      className="w-full py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow transition-all disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing Order…' : 'Select & Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminUpgradePlanPage;

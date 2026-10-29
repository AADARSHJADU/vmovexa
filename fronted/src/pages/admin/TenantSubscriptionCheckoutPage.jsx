import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import billingService from '../../api/services/billing.service';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { storage } from '../../utils/storage';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { FleetIcons } from '../../components/FleetIcons';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';

export const TenantSubscriptionCheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, fetchMe, logout } = useAuth();
  const { plans, loadPlans, confirmSubscription, checkPaymentStatus } = useSubscription();

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activating, setActivating] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  // org ka assigned plan_id — SuperAdmin ne onboard karte waqt assign kiya hoga
  const orgAssignedPlanId = user?.organization?.plan_id ?? null;

  useEffect(() => {
    // Auto-check latest payment status in case user completed payment in another tab or refreshed
    checkPaymentStatus()
      .then(async (res) => {
        if (res?.activated || (res?.status === 'active' && res?.alreadyActive)) {
          if (res?.tokens) {
            storage.setTokens({
              accessToken: res.tokens.accessToken,
              refreshToken: res.tokens.refreshToken,
            });
          }
          await fetchMe().catch(() => {});
          toast.success('Subscription active! Unlocking your dashboard…');
          navigate('/admin/dashboard', { replace: true });
        } else if (res?.status === 'pending' || res?.status === 'past_due') {
          setHasPendingPayment(true);
        }
      })
      .catch(() => {});
  }, [checkPaymentStatus, fetchMe, navigate]);

  useEffect(() => {
    loadPlans()
      .then((loaded) => {
        if (!loaded || loaded.length === 0) return;

        // Agar SuperAdmin ne org ke liye plan assign kiya hai, woh pre-select karo
        if (orgAssignedPlanId) {
          const matchedPlan = loaded.find((p) => p.id === orgAssignedPlanId);
          if (matchedPlan) {
            setSelectedPlanId(matchedPlan.id);
            return;
          }
        }

        // Fallback: pehla available plan select karo
        setSelectedPlanId(loaded[0].id);
      })
      .catch(() => {});
  }, [loadPlans, orgAssignedPlanId]);

  const handleManualCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await checkPaymentStatus();
      if (res?.activated || (res?.status === 'active' && res?.alreadyActive)) {
        if (res?.tokens) {
          storage.setTokens({
            accessToken: res.tokens.accessToken,
            refreshToken: res.tokens.refreshToken,
          });
        }
        await fetchMe().catch(() => {});
        toast.success('Payment confirmed & subscription active! Unlocking…');
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast('No confirmed payment found yet. If you just paid, please allow a moment and try again.', { icon: 'ℹ️' });
      }
    } catch (err) {
      toast.error(err?.message || 'Could not verify payment status.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const orgName = user?.organization?.name || user?.org?.name || 'Your Fleet Enterprise';

  // Fallback plans if database returned empty
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: 1,
      code: 'PLAN-STARTER',
      name: 'Starter Tier',
      monthly_price: 15000,
      price_breakdown: [
        { key: 'Base Amount', value: '14000' },
        { key: 'CGST', value: '500' },
        { key: 'SGST', value: '500' },
      ],
      buses_limit: 25,
      drivers_limit: 50,
      depots_limit: 2,
      fleet_operators_limit: 5,
      features: { depots_limit: 2, drivers_limit: 50, fleet_operators_limit: 5, support_sla: '48h', badge: 'Starter Fleet' },
    },
    {
      id: 2,
      code: 'PLAN-GROWTH',
      name: 'Growth Enterprise',
      monthly_price: 45000,
      price_breakdown: [
        { key: 'Base Amount', value: '38136' },
        { key: 'CGST (9%)', value: '3432' },
        { key: 'SGST (9%)', value: '3432' },
      ],
      buses_limit: 100,
      drivers_limit: 200,
      depots_limit: 5,
      fleet_operators_limit: 20,
      features: { depots_limit: 5, drivers_limit: 200, fleet_operators_limit: 20, support_sla: '24h', badge: 'Most Popular' },
    },
    {
      id: 3,
      code: 'PLAN-ENTERPRISE',
      name: 'State Sovereign Enterprise',
      monthly_price: 90000,
      price_breakdown: [
        { key: 'Base Amount', value: '76271' },
        { key: 'CGST (9%)', value: '6864.50' },
        { key: 'SGST (9%)', value: '6864.50' },
      ],
      buses_limit: 500,
      drivers_limit: 1000,
      depots_limit: 15,
      fleet_operators_limit: 50,
      features: { depots_limit: 15, drivers_limit: 1000, fleet_operators_limit: 50, support_sla: '4h', badge: 'State Undertaking' },
    },
  ];

  const selectedPlan = displayPlans.find((p) => p.id === selectedPlanId) || displayPlans[0];
  const billingCycle = selectedPlan?.billing_cycle || 'monthly';
  const totalPrice = Number(selectedPlan?.monthly_price || 0);

  const handleCheckout = async () => {
    const targetPlanId = selectedPlanId || displayPlans[0]?.id || 1;
    setActivating(true);

    try {
      // Commercial Razorpay Checkout
      const orderRes = await toast.promise(
        billingService.createSubscriptionOrder({
          planId: targetPlanId,
          billingCycle,
          gateway: 'razorpay',
        }),
        {
          loading: 'Initializing secure Razorpay payment gateway session…',
          success: 'Payment session created!',
          error: (err) => err?.message || 'Order creation failed.',
        }
      );

      // Razorpay Checkout Modal Flow
      const clientParams = orderRes?.order?.clientParams || {};
      const keyId = clientParams.keyId;
      const rzpOrderId = orderRes?.order?.orderId;
      const amountPaise = clientParams.amount || Math.round(totalPrice * 100);

      if (!keyId || !rzpOrderId) {
        throw new Error('Razorpay order initialization failed. Missing key or order reference.');
      }

      await openRazorpayCheckout({
        keyId,
        orderId: rzpOrderId,
        amount: amountPaise,
        currency: 'INR',
        name: 'VMOVEXA Transit Cloud',
        description: `${selectedPlan?.name || 'SaaS'} Subscription Tier`,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          organization_id: String(user?.organization?.id || user?.organizationId || ''),
          plan_id: String(targetPlanId),
          payment_code: orderRes?.paymentCode || '',
        },
        onSuccess: async (rzpResp) => {
          const verifyToast = toast.loading('Verifying Razorpay payment with platform security…');
          try {
            const confirmRes = await confirmSubscription({
              orderId: rzpOrderId,
              paymentCode: orderRes?.paymentCode,
              planId: targetPlanId,
              razorpayPaymentId: rzpResp.razorpay_payment_id,
              razorpayOrderId: rzpResp.razorpay_order_id || rzpOrderId,
              razorpaySignature: rzpResp.razorpay_signature,
            });

            toast.dismiss(verifyToast);
            toast.success('Payment verified! Subscription active. Welcome to VMOVEXA!');

            if (confirmRes?.tokens) {
              storage.setTokens({
                accessToken: confirmRes.tokens.accessToken,
                refreshToken: confirmRes.tokens.refreshToken,
              });
            }

            await fetchMe().catch(() => {});
            navigate('/admin/dashboard', { replace: true });
          } catch (confirmErr) {
            toast.dismiss(verifyToast);
            toast.error(confirmErr?.message || 'Payment signature verification failed.');
          } finally {
            setActivating(false);
          }
        },
        onDismiss: () => {
          setActivating(false);
          toast('Payment cancelled or closed. You can retry whenever you are ready.', { icon: 'ℹ️' });
        },
        onError: (err) => {
          setActivating(false);
          toast.error(err?.description || 'Razorpay payment transaction failed.');
        },
      });
    } catch (checkoutErr) {
      if (checkoutErr?.message) {
        toast.error(checkoutErr.message);
      }
    } finally {
      setActivating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
          <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('admin.checkout.org_approved')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('admin.checkout.select_tier_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
          Your enterprise organization <strong className="text-slate-800 dark:text-zinc-200">{orgName}</strong> is approved. Choose a subscription tier to activate your operational dashboard, bus fleet quotas, and IoT displays.
        </p>
      </div>

      {/* Pending payment banner */}
      {hasPendingPayment ? (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-200">{t('admin.checkout.pending_pay_title')}</p>
              <p className="text-blue-700 dark:text-blue-300 text-[11px]">{t('admin.checkout.pending_pay_desc')}</p>
            </div>
          </div>
          <RefreshButton
            onClick={handleManualCheckStatus}
            loading={checkingStatus}
            label={t('admin.checkout.verify_payment_status')}
            loadingLabel="Checking Gateway…"
            title={t('admin.checkout.verify_payment_status')}
          />
        </div>
      ) : null}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayPlans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          const f = plan.features || {};
          const isPopular = f.badge?.includes('Popular') || plan.code?.includes('GROWTH');
          // SuperAdmin ne jo plan assign kiya tha woh highlight karo
          const isAdminRecommended = orgAssignedPlanId && plan.id === orgAssignedPlanId;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`cursor-pointer bg-white dark:bg-zinc-900 rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                isSelected && isAdminRecommended
                  ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/25 shadow-xl shadow-emerald-500/10'
                  : isSelected
                  ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/20 shadow-xl shadow-blue-500/10'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm'
              }`}
            >
              {/* SuperAdmin Recommended badge — highest priority */}
              {isAdminRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                  <span>{t('admin.checkout.admin_recommended')}</span>
                </div>
              )}
              {!isAdminRecommended && isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {f.badge || 'Most Popular'}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{plan.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      {f.badge || 'Tier'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{plan.code}</p>
                </div>

                <div className="border-b border-slate-100 dark:border-zinc-800 pb-4 space-y-1.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    ₹{Number(plan.monthly_price).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">
                      {' '}/ {plan.billing_cycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  {/* Plan Card Itemized Price Breakdown */}
                  {(() => {
                    const bd = plan.price_breakdown || f.price_breakdown;
                    const items = Array.isArray(bd) ? bd : (typeof bd === 'object' && bd !== null ? Object.entries(bd).map(([k, v]) => ({ key: k, value: v })) : []);
                    if (!items || items.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-600 dark:text-zinc-300 font-medium"
                          >
                            <span>{item.label || item.key}:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{Number(item.value ?? item.amount ?? 0).toLocaleString('en-IN')}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Feature Bullets — Exact Core Plan Quotas */}
                <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 font-medium">
                  <li className="flex items-center gap-2">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">{plan.buses_limit ? `${plan.buses_limit} Buses` : 'Unlimited'}</strong> {t('admin.checkout.fleet_capacity')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">{plan.drivers_limit ?? f.drivers_limit ?? 50} Drivers</strong> {t('admin.checkout.drivers_allocation')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">{plan.depots_limit ?? f.depots_limit ?? 2} Depot Terminals</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">{plan.fleet_operators_limit ?? f.fleet_operators_limit ?? 5} Fleet Operators</strong></span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanId(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isSelected && isAdminRecommended
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                      : isSelected
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                  }`}
                >
                  {isSelected && (
                    <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                  )}
                  {isSelected && isAdminRecommended
                    ? 'Admin Recommended — Selected'
                    : isSelected
                    ? 'Selected Tier'
                    : isAdminRecommended
                    ? 'Select Admin Recommended'
                    : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Summary & Payment Gateway Selector Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">{t('admin.checkout.commercial_checkout')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.checkout.instant_activation')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Rail Options */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">{t('admin.checkout.payment_method')}</span>

            {/* Razorpay Card */}
            <div className="p-4 rounded-2xl border border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{t('admin.checkout.razorpay_secure')}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.checkout.upi_cards_desc')}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">{t('admin.checkout.upi_instant')}</span>
            </div>

            {/* Razorpay Test Mode Card & Domestic Guide */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
                <FleetIcons.Key className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t('admin.checkout.sandbox_title')}</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                <p>
                  <strong className="text-amber-950 dark:text-amber-100">{t('admin.checkout.visa_credit')}</strong>{' '}
                  <span className="font-mono bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-amber-200 dark:border-zinc-700 font-bold select-all text-blue-700 dark:text-blue-400">
                    4718 6091 0820 4366
                  </span>{' '}
                  <span className="text-amber-700 dark:text-amber-400/80">{t('admin.checkout.exp_hint')}</span>
                </p>
                <p>
                  <strong className="text-amber-950 dark:text-amber-100">{t('admin.checkout.visa_debit')}</strong>{' '}
                  <span className="font-mono bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-amber-200 dark:border-zinc-700 font-bold select-all text-blue-700 dark:text-blue-400">
                    4100 2800 0000 1007
                  </span>{' '}
                  <span className="text-amber-700 dark:text-amber-400/80">{t('admin.checkout.exp_hint')}</span>
                </p>
                <p>
                  <strong className="text-amber-950 dark:text-amber-100">{t('admin.checkout.upi_option')}</strong> {t('admin.checkout.upi_test_instructions')}
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary & Checkout Action */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>{t('admin.checkout.selected_plan')}</span>
                <strong className="text-slate-900 dark:text-white">{selectedPlan.name}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                <span>{t('admin.checkout.billing_freq')}</span>
                <span className="font-bold text-slate-900 dark:text-white capitalize">
                  {selectedPlan?.billing_cycle || 'Monthly'}
                </span>
              </div>

              {/* Itemized Price Breakdown in Checkout Box */}
              {(() => {
                const bd = selectedPlan.price_breakdown || selectedPlan.features?.price_breakdown;
                const items = Array.isArray(bd) ? bd : (typeof bd === 'object' && bd !== null ? Object.entries(bd).map(([k, v]) => ({ key: k, value: v })) : []);
                if (!items || items.length === 0) return null;
                return (
                  <div className="py-2 border-t border-slate-200 dark:border-zinc-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                      Cost & Tax Breakdown:
                    </span>
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                        <span>{item.label || item.key}:</span>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">
                          ₹{Number(item.value ?? item.amount ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex items-center justify-between text-sm font-black text-slate-900 dark:text-white">
                <span>{t('admin.checkout.total_amount')}</span>
                <span className="text-blue-700 dark:text-blue-400 font-mono">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={activating}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {activating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('admin.checkout.processing_checkout')}</span>
                  </>
                ) : (
                  <span>Proceed to Pay with Razorpay (₹{totalPrice.toLocaleString('en-IN')})</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Footer Option */}
      <div className="text-center pt-2">
        <button
          onClick={handleLogout}
          className="text-xs font-bold text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 underline"
        >
          {t('admin.checkout.sign_out_later')}
        </button>
      </div>
    </div>
  );
};

export default TenantSubscriptionCheckoutPage;

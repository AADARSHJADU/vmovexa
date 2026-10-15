import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import billingService from '../../api/services/billing.service';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { storage } from '../../utils/storage';
import { RefreshButton } from '../../components/ui/RefreshButton';
import toast from 'react-hot-toast';

export const TenantSubscriptionCheckoutPage = () => {
  const navigate = useNavigate();
  const { user, fetchMe, logout } = useAuth();
  const { plans, loadPlans, confirmSubscription, verifySession, checkPaymentStatus } = useSubscription();

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('razorpay'); // Default to 'razorpay' for Indian Transit Operations
  const [activating, setActivating] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  // org ka assigned plan_id — SuperAdmin ne onboard karte waqt assign kiya hoga
  const orgAssignedPlanId = user?.organization?.plan_id ?? null;

  // Check URL for returned Stripe checkout session or auto-check pending payments
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSession = params.get('stripe_session');
    const statusParam = params.get('status');

    if (stripeSession && statusParam === 'success') {
      setVerifyingSession(true);
      const verifyPromise = (async () => {
        const res = await verifySession({ sessionId: stripeSession });
        if (res?.tokens) {
          storage.setTokens({
            accessToken: res.tokens.accessToken,
            refreshToken: res.tokens.refreshToken,
          });
        }
        await fetchMe().catch(() => {});
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/admin/dashboard', { replace: true });
        return res;
      })();

      toast.promise(verifyPromise, {
        loading: 'Verifying your Stripe payment session…',
        success: 'Subscription verified & activated! Welcome to VMOVEXA!',
        error: (err) => err?.message || 'Payment verification failed.',
      }).finally(() => {
        setVerifyingSession(false);
      });
      return;
    }

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
  }, [checkPaymentStatus, fetchMe, navigate, verifySession]);

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
      buses_limit: 25,
      features: { depots_limit: 2, displays_per_bus: 2, gps_ping_interval: '5s', support_sla: '48h', badge: 'Starter Fleet' },
    },
    {
      id: 2,
      code: 'PLAN-GROWTH',
      name: 'Growth Enterprise',
      monthly_price: 45000,
      buses_limit: 100,
      features: { depots_limit: 5, displays_per_bus: 4, gps_ping_interval: '1s', support_sla: '24h', badge: 'Most Popular' },
    },
    {
      id: 3,
      code: 'PLAN-ENTERPRISE',
      name: 'State Sovereign Enterprise',
      monthly_price: 90000,
      buses_limit: 500,
      features: { depots_limit: 15, displays_per_bus: 4, gps_ping_interval: '1s', support_sla: '4h', badge: 'State Undertaking' },
    },
  ];

  const selectedPlan = displayPlans.find((p) => p.id === selectedPlanId) || displayPlans[0];
  const totalPrice = Number(selectedPlan?.monthly_price || 0);

  const handleCheckout = async () => {
    const targetPlanId = selectedPlanId || displayPlans[0]?.id || 1;
    setActivating(true);

    try {
      let confirmRes = null;
      // Commercial Multi-Gateway Checkout (Stripe or Razorpay)
      const orderRes = await toast.promise(
        billingService.createSubscriptionOrder({
          planId: targetPlanId,
          gateway: selectedGateway,
          successUrl: `${window.location.origin}/admin/subscription?stripe_session={CHECKOUT_SESSION_ID}&status=success`,
          cancelUrl: `${window.location.origin}/admin/subscription?status=cancelled`,
        }),
        {
          loading: `Initializing secure ${selectedGateway.toUpperCase()} payment gateway session…`,
          success: 'Payment session created!',
          error: (err) => err?.message || 'Order creation failed.',
        }
      );

      if (orderRes?.order?.clientParams?.sessionUrl) {
        // Redirect to live Stripe Checkout
        window.location.href = orderRes.order.clientParams.sessionUrl;
        return;
      }

      // Razorpay Checkout Modal Flow
      if (selectedGateway === 'razorpay') {
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
        return;
      }

      // If gateway didn't trigger Stripe redirect or Razorpay modal, do NOT auto-confirm
      throw new Error(`Unable to initialize payment session for ${selectedGateway.toUpperCase()}. Please try again.`);
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <span>✓ Organization Approved by Super Admin</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Fleet Operating Tier
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium">
          Your enterprise organization <strong className="text-slate-800">{orgName}</strong> is approved. Choose a subscription tier to activate your operational dashboard, bus fleet quotas, and IoT displays.
        </p>
      </div>

      {/* Verification in progress or pending payment banner */}
      {verifyingSession ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-xs text-emerald-800 shadow-sm animate-pulse">
          <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">Verifying payment session with Stripe and unlocking your operational dashboard…</span>
        </div>
      ) : hasPendingPayment ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Payment in progress or completed?</p>
              <p className="text-blue-700 text-[11px]">If you recently completed payment on Stripe or Razorpay, verify now to immediately unlock your dashboard.</p>
            </div>
          </div>
          <RefreshButton
            onClick={handleManualCheckStatus}
            loading={checkingStatus}
            label="Verify Payment Status"
            loadingLabel="Checking Gateway…"
            title="Verify Payment Status"
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
              className={`cursor-pointer bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                isSelected && isAdminRecommended
                  ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-xl shadow-emerald-500/10'
                  : isSelected
                  ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xl shadow-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* SuperAdmin Recommended badge — highest priority */}
              {isAdminRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <span>⭐</span><span>Recommended by Admin</span>
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
                    <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {f.badge || 'Tier'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{plan.code}</p>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{Number(plan.monthly_price).toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400"> / month</span>
                  </div>
                </div>

                {/* Feature Bullets */}
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>{plan.buses_limit ? `${plan.buses_limit} Buses` : 'Unlimited'}</strong> Fleet License</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span><strong>{f.depots_limit || 2} Depot Terminals</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>GPS Telemetry Speed: <strong>{f.gps_ping_interval || '5s'}</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Support SLA: <strong>{f.support_sla || '24h'} Dedicated</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>Ad Revenue Share to Org: <strong>{plan.ad_revenue_share_rate || 65}%</strong></span>
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
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected && isAdminRecommended
                    ? '✓ Admin Recommended — Selected'
                    : isSelected
                    ? '✓ Selected Tier'
                    : isAdminRecommended
                    ? '⭐ Select Admin Recommended'
                    : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Summary & Payment Gateway Selector Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-black text-slate-900">Commercial Checkout & Payment Gateway</h3>
          <p className="text-xs text-slate-500">Select payment rail for automated monthly subscription renewal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Rail Options */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Choose Payment Rail:</span>

            {/* Stripe Card */}
            <div
              onClick={() => setSelectedGateway('stripe')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedGateway === 'stripe'
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedGateway === 'stripe' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                }`}>
                  {selectedGateway === 'stripe' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Stripe Global Rails</p>
                  <p className="text-[11px] text-slate-500">Credit / Debit Cards, Apple Pay, Google Pay</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">Multi-Currency</span>
            </div>

            {/* Razorpay Card */}
            <div
              onClick={() => setSelectedGateway('razorpay')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedGateway === 'razorpay'
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedGateway === 'razorpay' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                }`}>
                  {selectedGateway === 'razorpay' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Razorpay India Rail</p>
                  <p className="text-[11px] text-slate-500">UPI (PhonePe, GPay, Paytm), RuPay, NetBanking</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">UPI Instant</span>
            </div>

            {/* Razorpay Test Mode Card & Domestic Guide */}
            {selectedGateway === 'razorpay' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <span className="text-sm">🧪</span>
                  <span>Razorpay Sandbox / Test Credentials</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-amber-800 leading-relaxed">
                  <p>
                    <strong>Visa Credit Card:</strong>{' '}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 font-bold select-all text-blue-800">
                      4718 6091 0820 4366
                    </span>{' '}
                    (Exp: Any future date e.g. 12/28, CVV: 123)
                  </p>
                  <p>
                    <strong>Visa Debit Card:</strong>{' '}
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 font-bold select-all text-blue-800">
                      4100 2800 0000 1007
                    </span>{' '}
                    (Exp: Any future date e.g. 12/28, CVV: 123)
                  </p>
                  <p>
                    <strong>UPI Option:</strong> Select <strong>UPI</strong> on modal menu & enter UPI ID{' '}
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 font-bold text-blue-800">
                      success@razorpay
                    </span>{' '}
                    or choose <strong>Netbanking</strong> and click <strong>"Success"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Checkout Action */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Selected Plan:</span>
                <strong className="text-slate-900">{selectedPlan.name}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Billing Frequency:</span>
                <span className="font-medium text-slate-900">Monthly</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-blue-700 font-mono">₹{totalPrice.toLocaleString('en-IN')}</span>
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
                    <span>Processing {selectedGateway.toUpperCase()} Checkout…</span>
                  </>
                ) : (
                  <span>Proceed to Pay with {selectedGateway.toUpperCase()} (₹{totalPrice.toLocaleString('en-IN')})</span>
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
          className="text-xs font-bold text-slate-400 hover:text-slate-600 underline"
        >
          Sign Out & Complete Later
        </button>
      </div>
    </div>
  );
};

export default TenantSubscriptionCheckoutPage;

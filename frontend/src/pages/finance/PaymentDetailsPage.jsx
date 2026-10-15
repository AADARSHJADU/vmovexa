import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const PaymentDetailsPage = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { id } = useParams();
  const { payments, currentPayment, loadPayment, sendPaymentReminder } = useFinanceRole();

  const [loading, setLoading] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      loadPayment(id)
        .catch(() => {})
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [id, loadPayment]);

  const paymentList = Array.isArray(payments) ? payments : (payments?.items || payments?.rows || []);
  const pay = currentPayment || paymentList.find((p) => String(p.id) === String(id) || String(p.code) === String(id));

  const [selectedState, setSelectedState] = useState('Paid');

  useEffect(() => {
    const s = String(pay?.status || '').toLowerCase();
    if (s === 'success' || s === 'paid') setSelectedState('Paid');
    else if (s === 'pending' || s === 'created') setSelectedState('Pending');
    else if (s === 'failed' || s === 'overdue') setSelectedState('Failed');
    else setSelectedState('Paid');
  }, [pay]);

  const getStatusTheme = () => {
    switch (selectedState) {
      case 'Paid':
        return {
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
          dot: 'bg-emerald-500',
          label: 'Payment Successful',
          bannerBg: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-200 dark:border-emerald-800/40',
        };
      case 'Pending':
        return {
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Awaiting Settlement',
          bannerBg: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-200 dark:border-amber-800/40',
        };
      case 'Failed':
        return {
          badgeBg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
          dot: 'bg-red-500',
          label: 'Transaction Failed',
          bannerBg: 'from-red-500/10 via-rose-500/5 to-transparent border-red-200 dark:border-red-800/40',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
          dot: 'bg-slate-500',
          label: selectedState,
          bannerBg: 'from-slate-500/10 via-zinc-500/5 to-transparent border-slate-200 dark:border-zinc-800',
        };
    }
  };

  const theme = getStatusTheme();

  const handleCopy = (text, keyName, label) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.success(`Copied ${label}`);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === keyName ? null : curr));
    }, 2000);
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const handleSendReminder = async (isUrgent = false) => {
    if (!pay?.id) return;
    setSendingReminder(true);
    try {
      await toast.promise(
        sendPaymentReminder(pay.id, {
          channels: ['email', 'sms'],
          urgent: isUrgent,
        }),
        {
          loading: isUrgent ? 'Dispatching urgent demand notice...' : 'Sending payment reminder...',
          success: isUrgent ? 'Urgent notice dispatched successfully!' : 'Payment reminder sent via Email & SMS!',
          error: (err) => err?.message || 'Failed to send reminder',
        }
      );
    } catch {
      // toast alerted
    } finally {
      setSendingReminder(false);
    }
  };

  // Loading Skeleton State
  if (loading && !pay) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-32 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not Found State
  if (!pay) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <Link
            to={`${basePath}/payments`}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            ← Back to Payments
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <FleetIcons.Analytics className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Payment record not found
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Payment record #{id} could not be located in the financial ledger. It may have been archived or removed.
          </p>
          <div className="pt-2">
            <Link
              to={`${basePath}/payments`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-block"
            >
              Return to Payments List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formatting variables & helper details
  const clientName =
    pay.campaign?.client_name ||
    pay.invoice?.customer_name ||
    pay.customer_name ||
    pay.advertiser?.name ||
    'Client / Brand Partner';

  const clientCompany =
    pay.campaign?.client_company ||
    pay.invoice?.organization?.name ||
    pay.organization?.name ||
    pay.advertiser?.company_name ||
    '—';

  const clientPhone = pay.campaign?.client_phone || pay.invoice?.phone || pay.customer_phone || '—';
  const clientEmail = pay.campaign?.client_email || pay.invoice?.email || pay.customer_email || '—';
  const clientCity = pay.campaign?.client_city || '—';
  const clientState = pay.campaign?.client_state || '';
  const clientPincode = pay.campaign?.client_pincode || '';
  const fullAddress =
    pay.invoice?.billing_address ||
    pay.campaign?.client_address ||
    '—';

  const paymentRef = pay.gateway_ref || pay.txn_ref || pay.transaction_id || pay.gateway_payment_id || '—';
  const orderRef = pay.gateway_order_id || pay.order_id || '—';
  const paymentCode = pay.code || `PAY-${pay.id}`;
  const gatewayName = pay.gateway?.name || pay.gateway || 'Razorpay Gateway';

  const rawMethod = String(pay.method || pay.gateway || 'Bank Transfer').toLowerCase();
  const readableMethod =
    rawMethod.includes('card') ? (pay.method || 'Credit / Debit Card') :
    rawMethod === 'upi' ? 'UPI / QR Transfer' :
    rawMethod === 'netbanking' ? 'Internet Banking' :
    rawMethod === 'bank_transfer' ? 'Bank Transfer (NEFT / RTGS)' :
    rawMethod === 'cheque' ? 'Cheque Clearance' :
    String(pay.method || 'Bank Transfer').replace(/_/g, ' ');

  const readablePurpose =
    pay.purpose === 'ad_spend' ? 'Transit DOOH Advertising Campaign' :
    pay.purpose === 'saas_subscription' ? 'Fleet Management SaaS Subscription' :
    pay.purpose === 'psa_spend' ? 'Public Service Announcement (PSA)' :
    pay.purpose === 'payout' ? 'Fleet Operator Revenue Share Payout' :
    String(pay.purpose || 'Commercial Settlement').replace(/_/g, ' ');

  const readablePayerType =
    pay.payer_type === 'advertiser' ? 'Advertiser (Brand Client)' :
    pay.payer_type === 'tenant' ? 'Fleet Operator (Tenant)' :
    pay.payer_type === 'government' ? 'Government Agency' :
    'Corporate Enterprise';

  const settlementDateFormatted = pay.paid_at
    ? new Date(pay.paid_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : pay.created_at
    ? new Date(pay.created_at).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Pending';

  // Itemized Tax Calculation
  const totalAmountNum = Number(pay.amount || pay.invoice?.total || 0);
  const subtotalNum = Number(pay.invoice?.subtotal || (totalAmountNum > 0 ? (totalAmountNum / 1.18).toFixed(2) : 0));
  const cgstNum = Number(pay.invoice?.cgst_amount || ((totalAmountNum - subtotalNum) / 2).toFixed(2));
  const sgstNum = Number(pay.invoice?.sgst_amount || ((totalAmountNum - subtotalNum) / 2).toFixed(2));
  const taxTotalNum = Number(pay.invoice?.tax_amount || (cgstNum + sgstNum).toFixed(2));

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const timeline = [
    {
      title: 'Payment Created',
      desc: 'Invoice & checkout session initiated',
      date: pay.created_at
        ? new Date(pay.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '—',
      done: true,
    },
    {
      title: 'Gateway Authorized',
      desc: `${gatewayName} authenticated transaction`,
      date: pay.paid_at
        ? new Date(pay.paid_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Pending',
      done: Boolean(pay.paid_at || selectedState === 'Paid'),
    },
    {
      title: 'Bank Nodal Settlement',
      desc: 'Funds credited to VMOVEXA nodal escrow account',
      date: selectedState === 'Paid'
        ? (pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('en-IN') : 'Settled')
        : 'Pending',
      done: selectedState === 'Paid',
    },
    {
      title: 'Invoice & Ledger Reconciled',
      desc: 'Tax invoice updated & audit ledger marked verified',
      date: selectedState === 'Paid' ? 'Verified ✓' : 'Awaiting Settlement',
      done: selectedState === 'Paid',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Payments', path: `${basePath}/payments` },
          { label: paymentCode },
        ]}
        className="print:hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            to={`${basePath}/payments`}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 transition-all font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
            title="Back to Payments list"
          >
            <span className="text-sm leading-none">←</span>
            <span>Back to Payments</span>
          </Link>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {paymentCode}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${theme.badgeBg}`}>
                <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                <span>{theme.label}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Payment settlement & ledger audit record for <span className="font-bold text-slate-800 dark:text-zinc-200">{clientName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RefreshButton onClick={() => loadPayment(id).catch(() => {})} loading={loading} />
          {pay.invoice?.id && (
            <Link
              to={`${basePath}/invoices/${pay.invoice.id}`}
              className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="View Tax Invoice"
            >
              <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Tax Invoice</span>
            </Link>
          )}
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Print receipt"
          >
            <FleetIcons.Print className="w-3.5 h-3.5 text-white" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Hero Settlement Banner */}
      <div className={`bg-gradient-to-br from-white via-white to-blue-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Total Settlement Amount
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                ✓ Settled & Verified
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {formatCurrency(totalAmountNum)}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                {pay.currency || 'INR'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Payment Purpose: <span className="font-semibold text-slate-800 dark:text-zinc-200">{readablePurpose}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/90 dark:bg-zinc-800/90 p-4 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 text-xs shadow-2xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">Payment Mode</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate flex items-center gap-1.5">
                <FleetIcons.CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{readableMethod}</span>
              </p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">Settled On</span>
              <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate">
                {settlementDateFormatted}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">Payment Gateway</span>
              <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>{gatewayName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Clean, Comprehensive & Easy-to-Understand Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: Transaction & Banking Audit */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Transaction & Banking Audit</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              Gateway Verified
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Bank UTR Ref */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Bank UTR / Transaction Reference</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5">{paymentRef}</p>
              </div>
              {paymentRef !== '—' && (
                <button
                  type="button"
                  onClick={() => handleCopy(paymentRef, 'utr', 'UTR Reference')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  {copiedKey === 'utr' ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>

            {/* Platform ID & Order ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Platform ID</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentCode, 'code', 'Payment Code')}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copiedKey === 'code' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 truncate" title={paymentCode}>
                  {paymentCode}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Order Reference</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 truncate" title={orderRef}>
                  {orderRef !== '—' ? orderRef : 'Direct Settlement'}
                </p>
              </div>
            </div>

            {/* Payer Type & Channel */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Payer Entity Type</span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">
                  {readablePayerType}
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Payment Channel</span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 capitalize">
                  {pay.client_type === 'app' ? 'Mobile App' : 'Web Checkout Portal'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Itemized Financial & GST Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tax & Commercial Breakdown</h2>
            </div>
            {pay.invoice?.code ? (
              <Link
                to={`${basePath}/invoices/${pay.invoice.id}`}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{pay.invoice.code}</span>
                <span>→</span>
              </Link>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                Direct Receipt
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                <span>Base Subtotal (Campaign Value)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotalNum)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span>CGST (Central Tax 9.0%)</span>
                <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(cgstNum)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span>SGST (State Tax 9.0%)</span>
                <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(sgstNum)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 flex items-center justify-between text-slate-700 dark:text-zinc-300 font-bold">
                <span>Total Tax (18% GST)</span>
                <span className="font-mono">{formatCurrency(taxTotalNum)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/80 flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm">
                <span>Net Total Paid</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{formatCurrency(totalAmountNum)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
              <span>Invoice Status: <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{pay.invoice?.status || 'PAID'}</span></span>
              {pay.invoice?.id && (
                <Link to={`${basePath}/invoices/${pay.invoice.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Open Tax Invoice →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Payer / Client Information */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payer & Entity Profile</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
              Verified Client
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Client / Contact Person</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{clientName}</p>
              {clientCompany !== '—' && clientCompany !== clientName && (
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <FleetIcons.Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Organization:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{clientCompany}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Contact Phone</span>
                <p className="font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                  <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{clientPhone}</span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Email Address</span>
                <p className="font-medium text-slate-800 dark:text-zinc-200 truncate flex items-center gap-1.5 mt-0.5" title={clientEmail}>
                  <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{clientEmail}</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Billing Location & Address</span>
              <div className="font-medium text-slate-800 dark:text-zinc-200 leading-relaxed flex items-start gap-1.5 mt-0.5">
                <FleetIcons.Pin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </div>
              {clientCity !== '—' && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium pl-5">
                  {clientCity}{clientState ? `, ${clientState}` : ''}{clientPincode ? ` - ${clientPincode}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Associated Campaign / Subscription Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              {pay.campaign ? (
                <FleetIcons.Campaigns className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <FleetIcons.Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              )}
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {pay.campaign ? 'Associated Campaign Specs' : 'Platform Subscription Service'}
              </h2>
            </div>
            {pay.campaign?.code && (
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {pay.campaign.code}
              </span>
            )}
          </div>

          {pay.campaign ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Campaign Title & Brand</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{pay.campaign.title}</p>
                    {pay.campaign.brand_name && (
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Brand: <span className="font-semibold text-slate-800 dark:text-zinc-200">{pay.campaign.brand_name}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 uppercase">
                    {pay.campaign.status || 'Approved'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Placement & Screens</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">
                    {pay.campaign.placement || 'All Screens'} ({pay.campaign.targeting_mode || 'Transit Screens'})
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Slot & Duration</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 capitalize">
                    {pay.campaign.duration_per_play_sec ? `${pay.campaign.duration_per_play_sec}s per slot` : '15s slot'} ({pay.campaign.slot_type || 'standard'})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Category & Objective</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">
                    {pay.campaign.category || 'Commercial'} {pay.campaign.objective ? `· ${pay.campaign.objective}` : ''}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Campaign Budget</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1">
                    {formatCurrency(pay.campaign.budget || totalAmountNum)}
                  </p>
                </div>
              </div>
            </div>
          ) : pay.subscription ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Subscription Plan</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{pay.subscription.plan_name || 'Enterprise SaaS Plan'}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Code: {pay.subscription.code || `SUB-${pay.subscription.id}`}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Status</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5 uppercase">{pay.subscription.status || 'Active'}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Direct Platform Billing Transaction</p>
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                Settled directly against commercial invoice reference {pay.invoice?.code || paymentCode}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Timeline Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5 print:hidden">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Settlement Progression & Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Clear 4-step reconciliation verification flow
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <FleetIcons.Check className="w-4 h-4" />
            <span>Complete</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                step.done
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 font-mono">
                  {step.date}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
        <Link
          to={`${basePath}/payments`}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold text-center transition-colors cursor-pointer"
        >
          ← Return to Payments List
        </Link>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {pay.invoice?.id && (
            <Link
              to={`${basePath}/invoices/${pay.invoice.id}`}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>View Tax Invoice</span>
            </Link>
          )}

          {selectedState === 'Paid' ? (
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Print className="w-4 h-4 text-white" />
              <span>Print Official Receipt</span>
            </button>
          ) : selectedState === 'Pending' ? (
            <button
              type="button"
              onClick={() => handleSendReminder(false)}
              disabled={sendingReminder}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <FleetIcons.Bell className="w-4 h-4" />
              <span>{sendingReminder ? 'Sending…' : 'Send Payment Reminder'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSendReminder(true)}
              disabled={sendingReminder}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <FleetIcons.Alert className="w-4 h-4" />
              <span>{sendingReminder ? 'Dispatching…' : 'Send Overdue Notice'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;

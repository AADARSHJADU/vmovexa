import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { copyToClipboard } from '../../utils/clipboard';

const formatDateTime = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateOnly = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (val) =>
  `₹${Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const METHOD_LABELS = {
  upi: 'UPI',
  upi_manual: 'UPI (Manual)',
  netbanking: 'Net Banking',
  bank_transfer: 'Bank Transfer',
  bank_wire: 'Bank Wire',
  neft: 'NEFT',
  rtgs: 'RTGS',
  imps: 'IMPS',
  cheque: 'Cheque',
  demand_draft: 'Demand Draft',
  cash: 'Cash',
  card: 'Card',
  razorpay: 'Razorpay',
  stripe: 'Stripe',
  other: 'Other',
};

const PURPOSE_LABELS = {
  ad_spend: 'Advertising Campaign',
  saas_subscription: 'SaaS Subscription',
  psa_spend: 'Government / PSA Campaign',
  payout: 'Payout',
  wallet_topup: 'Wallet Top-up',
  refund: 'Refund',
};

const PAYER_TYPE_LABELS = {
  advertiser: 'Advertiser',
  tenant: 'Tenant Admin',
  government: 'Government Agency',
  platform: 'Platform',
};

export const PaymentDetailsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { id } = useParams();
  const {
    currentPayment,
    loadPayment,
    resetCurrentPayment,
  } = useFinanceRole();

  const [loadedId, setLoadedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    let mounted = true;
    resetCurrentPayment();
    if (id) {
      loadPayment(id)
        .catch(() => {})
        .finally(() => {
          if (mounted) setLoadedId(String(id));
        });
    }
    return () => {
      mounted = false;
      resetCurrentPayment();
    };
  }, [id, loadPayment, resetCurrentPayment]);

  const loading = Boolean(id) && loadedId !== String(id);

  const handleRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      await loadPayment(id);
    } catch {
      // handled by hook/error state
    } finally {
      setRefreshing(false);
    }
  };

  // Only render currentPayment if it actually matches the requested route id/code.
  const pay =
    currentPayment &&
    (String(currentPayment.id) === String(id) ||
      String(currentPayment.code) === String(id) ||
      String(currentPayment.gateway_ref) === String(id))
      ? currentPayment
      : null;

  const rawStatus = String(pay?.status || '').toLowerCase();
  const statusKind =
    rawStatus === 'success' || rawStatus === 'paid'
      ? 'paid'
      : rawStatus === 'pending' || rawStatus === 'created'
      ? 'pending'
      : rawStatus === 'failed' || rawStatus === 'overdue'
      ? 'failed'
      : rawStatus === 'refunded'
      ? 'refunded'
      : 'other';

  const getStatusTheme = () => {
    switch (statusKind) {
      case 'paid':
        return {
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
          dot: 'bg-emerald-500',
          label: t('common.paid', 'Paid'),
        };
      case 'pending':
        return {
          badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
          dot: 'bg-amber-500 animate-pulse',
          label: t('common.pending', 'Pending'),
        };
      case 'failed':
        return {
          badgeBg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
          dot: 'bg-red-500',
          label: t('common.failed', 'Failed'),
        };
      case 'refunded':
        return {
          badgeBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
          dot: 'bg-violet-500',
          label: t('common.refunded', 'Refunded'),
        };
      default:
        return {
          badgeBg: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
          dot: 'bg-slate-500',
          label: pay?.status || '—',
        };
    }
  };

  const theme = getStatusTheme();

  const handleCopy = async (text, keyName, label) => {
    if (!text) return;
    const copied = await copyToClipboard(String(text));
    if (copied) {
      setCopiedKey(keyName);
      toast.success(`Copied ${label}`);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === keyName ? null : curr));
      }, 2000);
    } else {
      toast.error(`Failed to copy ${label}`);
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
        <Breadcrumb
          items={[
            { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
            { label: 'Payments', path: `${basePath}/payments` },
            { label: `#${id}` },
          ]}
        />
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <FleetIcons.Analytics className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('ag.finance.paymentdetailspage.payment_record_not_found', 'Payment record not found')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {t('ag.finance.paymentdetailspage.payment_record', 'Payment record #')}{id} {t('ag.finance.paymentdetailspage.could_not_be_located_in_the_financial_ledger', 'could not be located in the financial ledger. It may have been archived or removed.')}
          </p>
          <div className="pt-2">
            <Link
              to={`${basePath}/payments`}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-block"
            >
              {t('ag.finance.paymentdetailspage.return_to_payments_list', 'Return to Payments List')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Resolve ONLY real persisted DB values — zero fabricated defaults.
  const org = pay.organization || pay.invoice?.organization || pay.subscription?.organization || null;
  const orgUsers = Array.isArray(org?.users) ? org.users : [];
  const orgAdmin =
    orgUsers.find((u) => String(u.role?.code || '').toUpperCase() === 'ROLE-TENANT-ADMIN') ||
    orgUsers[0] ||
    null;
  const advertiser = pay.advertiser || null;
  const govAgency = pay.government_agency || null;

  const clientName =
    pay.campaign?.client_name ||
    pay.invoice?.customer_name ||
    org?.name ||
    advertiser?.name ||
    govAgency?.name ||
    govAgency?.agency_name ||
    null;

  const clientCompany =
    pay.campaign?.client_company ||
    org?.name ||
    advertiser?.company_name ||
    govAgency?.department ||
    null;

  const clientPhone =
    pay.campaign?.client_phone ||
    orgAdmin?.phone ||
    advertiser?.phone ||
    govAgency?.phone ||
    null;

  const clientEmail =
    pay.campaign?.client_email ||
    orgAdmin?.email ||
    advertiser?.email ||
    govAgency?.email ||
    null;

  const clientGstin =
    pay.invoice?.gstin ||
    org?.gstin ||
    advertiser?.gstin ||
    null;

  const fullAddress =
    pay.invoice?.billing_address ||
    pay.campaign?.client_address ||
    org?.office_address ||
    advertiser?.address ||
    govAgency?.office_address ||
    govAgency?.address ||
    null;

  const clientCity =
    pay.campaign?.client_city ||
    org?.city ||
    advertiser?.city ||
    govAgency?.city ||
    null;
  const clientState =
    pay.campaign?.client_state ||
    org?.state ||
    advertiser?.state ||
    govAgency?.state ||
    null;
  const clientPincode =
    pay.campaign?.client_pincode ||
    org?.pincode ||
    advertiser?.pincode ||
    govAgency?.pincode ||
    null;
  const locationLine = [
    [clientCity, clientState].filter(Boolean).join(', '),
    clientPincode,
  ]
    .filter(Boolean)
    .join(' - ') || null;

  const paymentCode = pay.code || null;
  const paymentMode = pay.payment_mode || null; // 'online' | 'offline'
  const isOffline = paymentMode === 'offline';

  const rawMethodKey = isOffline
    ? (pay.offline_method || pay.method || null)
    : (pay.method || pay.offline_method || null);
  const readableMethod = rawMethodKey
    ? (METHOD_LABELS[String(rawMethodKey).toLowerCase()] || String(rawMethodKey).replace(/_/g, ' '))
    : null;

  const gatewayName = pay.gateway?.name || null;
  const paymentRef =
    pay.utr_number ||
    pay.reference_number ||
    pay.cheque_number ||
    pay.gateway_ref ||
    pay.transaction_id ||
    null;
  const orderRef = pay.gateway_order_id || null;

  const readablePurpose = pay.purpose
    ? (PURPOSE_LABELS[pay.purpose] || String(pay.purpose).replace(/_/g, ' '))
    : null;
  const readablePayerType = pay.payer_type
    ? (PAYER_TYPE_LABELS[pay.payer_type] || String(pay.payer_type).replace(/_/g, ' '))
    : null;
  const readableClientType = pay.client_type
    ? (pay.client_type === 'app' ? 'Mobile App' : pay.client_type === 'web' ? 'Web' : pay.client_type)
    : null;

  const createdAtFormatted = formatDateTime(pay.created_at);
  const paidAtFormatted = formatDateTime(pay.paid_at);
  const collectedAtFormatted = formatDateTime(pay.collected_at);
  const chequeDateFormatted = formatDateOnly(pay.cheque_date);

  const totalAmountNum = pay.amount != null ? Number(pay.amount) : (pay.invoice?.total != null ? Number(pay.invoice.total) : null);
  const subtotalNum = pay.invoice?.subtotal != null ? Number(pay.invoice.subtotal) : null;
  const cgstNum = pay.invoice?.cgst_amount != null ? Number(pay.invoice.cgst_amount) : 0;
  const sgstNum = pay.invoice?.sgst_amount != null ? Number(pay.invoice.sgst_amount) : 0;
  const igstNum = pay.invoice?.igst_amount != null ? Number(pay.invoice.igst_amount) : 0;
  const taxAmountNum = pay.invoice?.tax_amount != null ? Number(pay.invoice.tax_amount) : 0;

  // Offline settlement detail rows (only populated DB fields)
  const offlineDetails = isOffline
    ? [
        { label: 'Bank Name', value: pay.bank_name },
        { label: 'Branch Name', value: pay.branch_name },
        { label: 'Account Holder', value: pay.account_holder },
        { label: 'UTR Number', value: pay.utr_number, mono: true },
        { label: 'Reference Number', value: pay.reference_number && pay.reference_number !== pay.utr_number ? pay.reference_number : null, mono: true },
        { label: 'Cheque Number', value: pay.cheque_number, mono: true },
        { label: 'Cheque Date', value: chequeDateFormatted },
        { label: 'Collected By', value: pay.collector?.name || pay.verified_by_name || null },
        { label: 'Collected At', value: collectedAtFormatted },
        { label: 'Remarks', value: pay.remarks },
      ].filter((item) => Boolean(item.value))
    : [];

  // Real persisted timestamps only (zero fabricated steps)
  const realTimestamps = [
    { label: 'Payment Recorded', value: createdAtFormatted },
    { label: 'Collected At', value: collectedAtFormatted && collectedAtFormatted !== paidAtFormatted ? collectedAtFormatted : null },
    { label: 'Paid / Settled At', value: paidAtFormatted },
    { label: 'Invoice Issued At', value: formatDateTime(pay.invoice?.issued_at) },
    { label: 'Invoice Paid At', value: formatDateTime(pay.invoice?.paid_at) },
  ].filter((item) => Boolean(item.value));

  const hasPayerInfo = Boolean(
    clientName || clientCompany || clientPhone || clientEmail || clientGstin || fullAddress || locationLine
  );

  const subPlanName = pay.subscription?.plan?.name || pay.subscription?.plan_type || null;
  const subPlanCode = pay.subscription?.plan?.code || null;
  const subPeriodStart = formatDateOnly(pay.subscription?.current_period_start);
  const subPeriodEnd = formatDateOnly(pay.subscription?.current_period_end);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
          { label: 'Payments', path: `${basePath}/payments` },
          { label: paymentCode || `#${pay.id}` },
        ]}
        className="print:hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {paymentCode || `#${pay.id}`}
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${theme.badgeBg}`}>
              <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
              <span>{theme.label}</span>
            </span>
            {paymentMode && (
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                isOffline
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50'
              }`}>
                {paymentMode}
              </span>
            )}
          </div>
          {clientName && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              {t('ag.finance.paymentdetailspage.payment_settlement_and_ledger_audit_record_f', 'Payment settlement & ledger audit record for')}{' '}
              <span className="font-bold text-slate-800 dark:text-zinc-200">{clientName}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <RefreshButton onClick={handleRefresh} loading={loading || refreshing} />
          {pay.invoice?.id && (
            <Link
              to={`${basePath}/invoices/${pay.invoice.id}`}
              className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title={t('finance.payment_details.tax_invoice')}
            >
              <FleetIcons.Document className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('finance.payment_details.tax_invoice')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Settlement Banner */}
      <div className="bg-gradient-to-br from-white via-white to-blue-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t('ag.finance.paymentdetailspage.total_settlement_amount', 'Total Settlement Amount')}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {totalAmountNum != null ? formatCurrency(totalAmountNum) : '—'}
              </span>
              {pay.currency && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  {pay.currency}
                </span>
              )}
            </div>
            {readablePurpose && (
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {t('ag.finance.paymentdetailspage.payment_purpose', 'Payment Purpose:')}{' '}
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{readablePurpose}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/90 dark:bg-zinc-800/90 p-4 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 text-xs shadow-2xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">
                {t('finance.payment_details.payment_mode')}
              </span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate capitalize">
                {readableMethod || '—'}
                {paymentMode ? ` (${paymentMode})` : ''}
              </p>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">
                {t('finance.payment_details.settled_on')}
              </span>
              <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate">
                {paidAtFormatted || '—'}
              </p>
            </div>
            {isOffline ? (
              pay.bank_name ? (
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">Bank</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate">{pay.bank_name}</p>
                </div>
              ) : null
            ) : gatewayName ? (
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase">
                  {t('finance.payment_details.payment_gateway')}
                </span>
                <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 truncate">{gatewayName}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Transaction Audit */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.payment_details.txn_audit')}</h2>
            </div>
            {paymentMode && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 uppercase">
                {paymentMode}
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {paymentRef && (
              <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.bank_utr')}
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-0.5 break-all">{paymentRef}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(paymentRef, 'utr', 'Reference')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === 'utr' ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentCode && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                      {t('finance.payment_details.platform_id')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentCode, 'code', 'Payment Code')}
                      className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {copiedKey === 'code' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 truncate" title={paymentCode}>
                    {paymentCode}
                  </p>
                </div>
              )}

              {orderRef && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.order_ref')}
                  </span>
                  <p className="font-mono font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 truncate" title={orderRef}>
                    {orderRef}
                  </p>
                </div>
              )}

              {readablePayerType && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.payer_type')}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">{readablePayerType}</p>
                </div>
              )}

              {readableClientType && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.payment_channel')}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">{readableClientType}</p>
                </div>
              )}

              {gatewayName && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.payment_gateway')}
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">{gatewayName}</p>
                </div>
              )}

              {createdAtFormatted && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">Created At</span>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">{createdAtFormatted}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Financial & GST Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.payment_details.tax_breakdown')}</h2>
            </div>
            {pay.invoice?.code && (
              <Link
                to={`${basePath}/invoices/${pay.invoice.id}`}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{pay.invoice.code}</span>
                <FleetIcons.ArrowRight className="w-3 h-3 inline ml-0.5" />
              </Link>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-xl p-3 border border-slate-100 dark:border-zinc-800 space-y-2">
              {pay.invoice && subtotalNum != null && (
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span>{t('finance.payment_details.base_subtotal')}</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotalNum)}</span>
                </div>
              )}
              {pay.invoice && cgstNum > 0 && (
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t('finance.payment_details.cgst')}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(cgstNum)}</span>
                </div>
              )}
              {pay.invoice && sgstNum > 0 && (
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t('finance.payment_details.sgst')}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(sgstNum)}</span>
                </div>
              )}
              {pay.invoice && igstNum > 0 && (
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span>{t('ag.finance.paymentdetailspage.igst', 'IGST')}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(igstNum)}</span>
                </div>
              )}
              {pay.invoice && taxAmountNum > 0 && cgstNum === 0 && sgstNum === 0 && igstNum === 0 && (
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span>Tax</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-zinc-300">+ {formatCurrency(taxAmountNum)}</span>
                </div>
              )}
              <div className={`${pay.invoice ? 'pt-2 border-t border-slate-200 dark:border-zinc-700/80' : ''} flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm`}>
                <span>{t('finance.payment_details.net_total')}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">
                  {totalAmountNum != null ? formatCurrency(totalAmountNum) : '—'}
                </span>
              </div>
            </div>

            {pay.invoice && (
              <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                <span>
                  {t('finance.payment_details.invoice_status')}{' '}
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{pay.invoice.status}</span>
                </span>
                <Link to={`${basePath}/invoices/${pay.invoice.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  {t('ag.finance.paymentdetailspage.open_tax_invoice', 'Open Tax Invoice')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Offline Settlement Details (only when payment_mode === 'offline' and DB fields exist) */}
        {offlineDetails.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FleetIcons.Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Offline Settlement Details</h2>
              </div>
              {pay.offline_method && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 uppercase">
                  {String(pay.offline_method).replace(/_/g, ' ')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {offlineDetails.map((item) => (
                <div
                  key={item.label}
                  className={`p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 ${
                    item.label === 'Remarks' ? 'sm:col-span-2' : ''
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">{item.label}</span>
                  <p className={`font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 break-words ${item.mono ? 'font-mono' : ''}`}>
                    {item.value}
                  </p>
                </div>
              ))}
              {pay.proof_url && (
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 block">Payment Proof</span>
                  <a
                    href={pay.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block break-all"
                  >
                    View Uploaded Proof
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card 4: Payer / Client Information (only rendered if real payer fields exist) */}
        {hasPayerInfo && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FleetIcons.Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('finance.payment_details.payer_profile')}</h2>
              </div>
              {readablePayerType && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                  {readablePayerType}
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {(clientName || clientCompany) && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.client_person')}
                  </span>
                  {clientName && <p className="text-sm font-bold text-slate-900 dark:text-white">{clientName}</p>}
                  {clientCompany && clientCompany !== clientName && (
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <FleetIcons.Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t('finance.payment_details.organization')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{clientCompany}</span>
                    </p>
                  )}
                  {clientGstin && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">GSTIN: {clientGstin}</p>
                  )}
                </div>
              )}

              {(clientPhone || clientEmail) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {clientPhone && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.contact_phone')}
                      </span>
                      <p className="font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                        <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{clientPhone}</span>
                      </p>
                    </div>
                  )}
                  {clientEmail && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.email_addr')}
                      </span>
                      <p className="font-medium text-slate-800 dark:text-zinc-200 truncate flex items-center gap-1.5 mt-0.5" title={clientEmail}>
                        <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{clientEmail}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(fullAddress || locationLine) && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                    {t('finance.payment_details.billing_loc')}
                  </span>
                  {fullAddress && (
                    <div className="font-medium text-slate-800 dark:text-zinc-200 leading-relaxed flex items-start gap-1.5 mt-0.5">
                      <FleetIcons.Pin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{fullAddress}</span>
                    </div>
                  )}
                  {locationLine && (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium pl-5">{locationLine}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card 5: Associated Campaign / Subscription Details (only when linked in DB) */}
        {(pay.campaign || pay.subscription) && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                {pay.campaign ? (
                  <FleetIcons.Campaigns className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <FleetIcons.Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {pay.campaign ? 'Associated Campaign' : 'Linked Subscription'}
                </h2>
              </div>
              {pay.campaign?.code && (
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{pay.campaign.code}</span>
              )}
              {!pay.campaign && subPlanCode && (
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{subPlanCode}</span>
              )}
            </div>

            {pay.campaign ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.campaign_brand')}
                      </span>
                      {pay.campaign.title && (
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{pay.campaign.title}</p>
                      )}
                      {pay.campaign.brand_name && (
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                          {t('ag.finance.paymentdetailspage.brand', 'Brand:')}{' '}
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{pay.campaign.brand_name}</span>
                        </p>
                      )}
                    </div>
                    {pay.campaign.status && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase">
                        {pay.campaign.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(pay.campaign.placement || pay.campaign.targeting_mode) && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.placement_screens')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">
                        {[pay.campaign.placement, pay.campaign.targeting_mode].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}
                  {(pay.campaign.duration_per_play_sec || pay.campaign.slot_type) && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.slot_duration')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1 capitalize">
                        {[
                          pay.campaign.duration_per_play_sec ? `${pay.campaign.duration_per_play_sec}s per slot` : null,
                          pay.campaign.slot_type,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  )}
                  {(pay.campaign.category || pay.campaign.objective) && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.cat_objective')}
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-1">
                        {[pay.campaign.category, pay.campaign.objective].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}
                  {pay.campaign.budget != null && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('finance.payment_details.campaign_budget')}
                      </span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-xs mt-1">
                        {formatCurrency(pay.campaign.budget)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {subPlanName && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                      {t('finance.payment_details.subscription_plan')}
                    </span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{subPlanName}</p>
                    {subPlanCode && (
                      <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-1">{subPlanCode}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pay.subscription.status && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        {t('common.status')}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white text-xs mt-0.5 uppercase">
                        {pay.subscription.status}
                      </p>
                    </div>
                  )}
                  {(subPeriodStart || subPeriodEnd) && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">
                        Billing Period
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 text-xs mt-0.5">
                        {[subPeriodStart, subPeriodEnd].filter(Boolean).join(' - ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persisted Record Timestamps (only real DB dates, never fabricated steps) */}
      {realTimestamps.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4 print:hidden">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <FleetIcons.Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Recorded Timestamps
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {realTimestamps.map((entry) => (
              <div
                key={entry.label}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800"
              >
                <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500">{entry.label}</span>
                <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailsPage;

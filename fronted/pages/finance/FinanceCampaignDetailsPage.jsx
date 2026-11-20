import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from '../../hooks/useTranslation';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl } from '../../api/services/upload.service';
import { extractYouTubeId } from '../../utils/mediaUtils';
import { RecordOfflinePaymentModal } from '../../components/ui/RecordOfflinePaymentModal';

const getStatusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'live') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (s === 'completed') {
    return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
  }
  if (s === 'paused') {
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
  }
  if (s === 'approved') {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
  }
  if (s === 'rejected') {
    return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
  }
  return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
};

const formatTime12h = (timeStr) => {
  if (!timeStr) return '—';
  const clean = String(timeStr).slice(0, 5);
  const parts = clean.split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const formatDateNice = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch (_) {
    return dateStr;
  }
};

const formatDateTimeNice = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (_) {
    return dateStr;
  }
};

const formatDays = (days, defaultText = 'Every day') => {
  if (!days) return defaultText;
  if (Array.isArray(days)) return days.length > 0 ? days.join(', ') : defaultText;
  if (typeof days === 'string') {
    const trimmed = days.trim();
    if (!trimmed) return defaultText;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.length > 0 ? parsed.join(', ') : defaultText;
    } catch (_) {}
    return trimmed;
  }
  return defaultText;
};

export const FinanceCampaignDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';

  const { loadCampaignPayment, currentCampaignPayment, shareCampaignPaymentLink } = useFinanceRole();

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [sendingShare, setSendingShare] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      loadCampaignPayment(id)
        .then((res) => {
          if (isMounted) setCampaign(res);
        })
        .catch((err) => {
          if (isMounted) toast.error(err?.message || 'Failed to load campaign payment details.');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, loadCampaignPayment]);

  const activeCamp = campaign || currentCampaignPayment;

  const scheduleMetrics = useMemo(() => {
    if (!activeCamp) return null;
    const startStr = activeCamp.start_date || '';
    const endStr = activeCamp.end_date || '';
    let durationDays = Number(activeCamp.duration_days) || 1;
    if (!activeCamp.duration_days && startStr && endStr) {
      try {
        const d1 = new Date(startStr);
        const d2 = new Date(endStr);
        const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
        if (diff > 0) durationDays = diff;
      } catch (_) {}
    }

    const startTimeRaw = String(activeCamp.broadcast_start_time || '08:00:00').slice(0, 5);
    const endTimeRaw = String(activeCamp.broadcast_end_time || '22:00:00').slice(0, 5);
    const startParts = startTimeRaw.split(':').map((v) => parseInt(v, 10) || 0);
    const endParts = endTimeRaw.split(':').map((v) => parseInt(v, 10) || 0);
    const startMinutes = (startParts[0] || 0) * 60 + (startParts[1] || 0);
    const endMinutes = (endParts[0] || 0) * 60 + (endParts[1] || 0);
    const diffMinutes = Math.max(1, endMinutes - startMinutes);
    const diffHours = (diffMinutes / 60).toFixed(1);

    const activeDaysFormatted = formatDays(activeCamp.active_days, 'Every day');

    return {
      durationDays,
      startFormatted: formatDateNice(startStr),
      endFormatted: formatDateNice(endStr),
      startTimeDisplay: formatTime12h(activeCamp.broadcast_start_time),
      endTimeDisplay: formatTime12h(activeCamp.broadcast_end_time),
      startTimeRaw,
      endTimeRaw,
      diffMinutes,
      diffHours,
      startMinutes,
      activeDaysFormatted,
    };
  }, [activeCamp]);

  const budgetNum = Number(activeCamp?.taxable_amount ?? activeCamp?.budget ?? 0);
  const gst = Number(activeCamp?.tax_amount ?? Math.round(Number(activeCamp?.budget || 0) * 0.18));
  const totalPayable = Number(activeCamp?.total_payable ?? (budgetNum + gst));
  const isPaid = activeCamp?.payment_status === 'paid';
  const paymentToken = activeCamp?.payment_token;
  const checkoutUrl = paymentToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/campaigns/${activeCamp?.id}/pay?token=${paymentToken}`
    : null;

  const copyCode = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleShareLink = async (e) => {
    e.preventDefault();
    if (!clientEmail && !clientPhone) {
      toast.error('Please enter an email or phone number.');
      return;
    }
    setSendingShare(true);
    try {
      await shareCampaignPaymentLink(activeCamp.id, {
        email: clientEmail || undefined,
        phone: clientPhone || undefined,
      });
      toast.success('Payment checkout link sent successfully!');
      setShowShareModal(false);
    } catch (err) {
      toast.error(err?.message || 'Failed to send payment link.');
    } finally {
      setSendingShare(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading campaign payment details...</p>
      </div>
    );
  }

  if (!activeCamp) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-4">
        <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Campaign not found</p>
        <Link
          to={`${basePath}/campaign-payments`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campaign Payments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <Breadcrumb
          items={[
            {
              label: basePath.startsWith('/superadmin') ? t('nav.superadmin', 'Super Admin') : t('nav.headers.finance_portal', 'Finance Portal'),
              path: `${basePath}/dashboard`,
            },
            { label: t('finance.campaign_payments_title', 'Campaign Payments'), path: `${basePath}/campaign-payments` },
            { label: activeCamp.code },
          ]}
          className="mb-2"
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{activeCamp.title}</h1>
              <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-full border shadow-2xs ${getStatusBadge(activeCamp.status)}`}>
                {activeCamp.status}
              </span>
              {isPaid ? (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  Paid
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  Pending Payment
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1.5 flex items-center gap-2 flex-wrap font-medium">
              <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{activeCamp.code}</span>
              {activeCamp.brand_name && (
                <>
                  <span>·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activeCamp.brand_name}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isPaid && (
              <>
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <FleetIcons.Share className="w-3.5 h-3.5" />
                  <span>Share Payment Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfflineModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <FleetIcons.Check className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </>
            )}

            <Link
              to={`${basePath}/campaign-payments`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-2xs transition-colors shrink-0"
            >
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Payments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Key Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Campaign Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${activeCamp.status === 'live' ? 'bg-emerald-500 animate-pulse' : activeCamp.status === 'completed' ? 'bg-slate-400' : 'bg-amber-500'}`} />
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeCamp.status}</p>
          </div>
          {activeCamp.schedule_status && (
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 capitalize font-medium">
              Schedule: {activeCamp.schedule_status}
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Total Payable</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
            ₹{totalPayable.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium capitalize">
            {activeCamp.payment_status}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Flight Duration</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
            {scheduleMetrics?.durationDays} {scheduleMetrics?.durationDays === 1 ? 'Day' : 'Days'}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            {scheduleMetrics?.startFormatted}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Slot Playtime</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
            {activeCamp.duration_per_play_sec || 15}s Per Play
          </p>
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 font-medium capitalize">
            {activeCamp.slot_type || 'Exclusive'}
          </p>
        </div>
      </div>

      {/* Customer / Client Profile Section (Real DB fields only) */}
      {(activeCamp.client_name || activeCamp.client_company || activeCamp.client_phone || activeCamp.client_email || activeCamp.client_city || activeCamp.client_address || activeCamp.advertiser) && (
        <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FleetIcons.Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Customer & Client Profile</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
            {(activeCamp.client_name || activeCamp.client_company) && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 font-medium">Client / Company</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeCamp.client_name || '—'}</p>
                {activeCamp.client_company && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">{activeCamp.client_company}</p>
                )}
              </div>
            )}

            {(activeCamp.client_phone || activeCamp.client_email) && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 font-medium">Contact Details</span>
                {activeCamp.client_phone && (
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCamp.client_phone}</span>
                  </p>
                )}
                {activeCamp.client_email && (
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 flex items-center gap-1.5 truncate">
                    <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeCamp.client_email}</span>
                  </p>
                )}
              </div>
            )}

            {(activeCamp.client_city || activeCamp.client_state || activeCamp.client_address) && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 font-medium">Location</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {[activeCamp.client_city, activeCamp.client_state].filter(Boolean).join(', ') || '—'}
                </p>
                {activeCamp.client_address && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">{activeCamp.client_address}</p>
                )}
              </div>
            )}

            {activeCamp.advertiser && (
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 font-medium">Registered Agency</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeCamp.advertiser.company_name || activeCamp.advertiser.name || 'Advertiser Agency'}
                </p>
                {activeCamp.advertiser.user?.email && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{activeCamp.advertiser.user.email}</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Payment & Billing Breakdown Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FleetIcons.Invoice className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Billing & Settlement Breakdown</span>
          </h2>
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${isPaid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}`}>
            {isPaid ? 'Settled' : 'Pending'}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Total Payable</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">₹{totalPayable.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Gross billing</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Base / Taxable</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">₹{budgetNum.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Before GST</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">GST Amount</span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-1">₹{gst.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Tax component</p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Payment Method</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1 capitalize">
              {activeCamp.payment_method || activeCamp.payment?.method || (isPaid ? 'Settled' : 'Unpaid')}
            </p>
            {activeCamp.paid_at && (
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                Paid: {formatDateTimeNice(activeCamp.paid_at)}
              </p>
            )}
          </div>
        </div>

        {/* Real DB Reference Fields */}
        {(activeCamp.payment?.gateway_ref || activeCamp.payment?.code || activeCamp.payment?.collector || checkoutUrl) && (
          <div className="p-3.5 bg-slate-50/80 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700/80 text-xs space-y-2">
            {activeCamp.payment?.code && (
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span>Payment Ledger Code:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{activeCamp.payment.code}</span>
              </div>
            )}
            {activeCamp.payment?.gateway_ref && (
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span>UTR / Transaction Reference:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{activeCamp.payment.gateway_ref}</span>
              </div>
            )}
            {activeCamp.payment?.collector?.name && (
              <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                <span>Recorded By:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeCamp.payment.collector.name}</span>
              </div>
            )}
            {checkoutUrl && !isPaid && (
              <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Direct Checkout Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={checkoutUrl}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 w-48 sm:w-80 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyCode(checkoutUrl, 'Payment URL')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Flight Schedule & Broadcast Window */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Broadcast Flight Window</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Flight Dates</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {scheduleMetrics?.startFormatted} to {scheduleMetrics?.endFormatted}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Total: {scheduleMetrics?.durationDays} {scheduleMetrics?.durationDays === 1 ? 'Day' : 'Days'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Daily Window</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {scheduleMetrics?.startTimeDisplay} – {scheduleMetrics?.endTimeDisplay}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Airtime: ~{scheduleMetrics?.diffMinutes} mins / day ({scheduleMetrics?.diffHours} hrs)
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 font-medium">Active Days</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate" title={scheduleMetrics?.activeDaysFormatted}>
              {scheduleMetrics?.activeDaysFormatted}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Loop: {activeCamp.frequency || 'Daily loop'}
            </p>
          </div>
        </div>
      </section>

      {/* Media Creatives Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FleetIcons.Campaigns className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Creative Media Assets</span>
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {(activeCamp.media || []).length} Asset(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeCamp.media || []).map((media, idx) => {
            const rawUrl = media.file_url || media.fileUrl || '';
            const resolved = resolveFileUrl(rawUrl);
            const rawType = String(media.media_type || media.mediaType || '').toLowerCase();
            const isVideo = rawType === 'video' || /\.(mp4|mov|webm)$/i.test(rawUrl);
            const isPdf = rawType === 'pdf' || /\.pdf$/i.test(rawUrl);
            const isUrl = rawType === 'url' || /youtube\.com|youtu\.be/i.test(rawUrl);
            const ytId = isUrl ? extractYouTubeId(rawUrl) : null;
            const durationSec = media.display_duration_sec || media.duration_sec || activeCamp.duration_per_play_sec || 15;
            const filename = rawUrl.split('/').pop() || `Creative #${idx + 1}`;

            return (
              <div
                key={media.id || idx}
                className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 flex flex-col justify-between shadow-2xs"
              >
                <div className="p-2.5 bg-white dark:bg-zinc-800 border-b border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-white text-[11px]">#{idx + 1} {rawType.toUpperCase()}</span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">⏱ {durationSec}s</span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-center">
                  {isVideo && (
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      src={resolved}
                      className="w-full aspect-video object-contain bg-black rounded-lg"
                    />
                  )}

                  {!isVideo && !isPdf && !isUrl && (
                    <img
                      src={resolved}
                      alt={`Creative #${idx + 1}`}
                      className="w-full aspect-video object-contain bg-slate-900 rounded-lg"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/1e293b/white?text=Creative+Preview';
                      }}
                    />
                  )}

                  {isPdf && (
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 text-center space-y-2">
                      <FleetIcons.Document className="w-8 h-8 text-rose-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800 dark:text-white break-all">{filename}</p>
                      <a
                        href={resolved}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold"
                      >
                        <span>Open PDF</span>
                        <FleetIcons.ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {isUrl && ytId && (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${ytId}`}
                      title="YouTube Creative Player"
                      className="w-full aspect-video rounded-lg border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  {isUrl && !ytId && (
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2 text-center">
                      <FleetIcons.ExternalLink className="w-6 h-6 text-blue-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-900 dark:text-white break-all">{filename}</p>
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200"
                      >
                        <span>Visit Stream</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-800 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span>{media.resolution || 'Standard'}</span>
                  {rawUrl.startsWith('http') && (
                    <a
                      href={resolved}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>View File</span>
                      <FleetIcons.ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {!(activeCamp.media || []).length && (
            <div className="col-span-full p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">No media creatives attached.</p>
            </div>
          )}
        </div>
      </section>

      {/* QR Code Tracking Section (if present in DB) */}
      {(activeCamp.qrCodes || []).length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FleetIcons.QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Transit QR Code Tracking</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {activeCamp.qrCodes.map((qr) => {
              const qrUrl = qr.target_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/qr/${qr.code}`;
              return (
                <div key={qr.id || qr.code} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                    <QRCodeSVG value={qrUrl} size={80} level="M" />
                  </div>
                  <div className="min-w-0 space-y-1 text-xs">
                    <p className="font-mono font-bold text-slate-900 dark:text-white">{qr.code}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{qrUrl}</p>
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      Scans: {qr.scan_count || 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Send Payment Link</h3>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <FleetIcons.Close className="w-3.5 h-3.5" />
              </button>
            </div>
            <form onSubmit={handleShareLink} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Customer Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Customer Mobile (SMS / WhatsApp)</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingShare}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingShare ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Offline Payment Modal */}
      {showOfflineModal && (
        <RecordOfflinePaymentModal
          isOpen={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          campaign={activeCamp}
          onSuccess={() => {
            setShowOfflineModal(false);
            loadCampaignPayment(id);
          }}
        />
      )}
    </div>
  );
};

export default FinanceCampaignDetailsPage;


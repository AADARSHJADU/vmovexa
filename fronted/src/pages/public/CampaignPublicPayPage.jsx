import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { apiClient } from '../../api/client';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { copyToClipboard } from '../../utils/clipboard';
import { FleetIcons } from '../../components/FleetIcons';

export const CampaignPublicPayPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Gateway Selection: 'razorpay'
  const [selectedGateway, setSelectedGateway] = useState('razorpay');

  const [paymentDone, setPaymentDone] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    async function fetchCheckout() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/campaigns/${id}/public-checkout`, {
          params: { token },
        });
        const data = res.data?.data || res.data;
        setCampaign(data);

        // Preselect default gateway if available
        if (data.gateways && data.gateways.length > 0) {
          const defaultGw = data.gateways.find((g) => g.isDefault) || data.gateways[0];
          if (defaultGw?.provider) setSelectedGateway(defaultGw.provider);
        }

        if (data.paymentStatus === 'paid' || data.status === 'live') {
          setPaymentDone(true);
          setReceiptData(data.lastPayment || {
            txnId: `TXN_CONFIRMED_${id}`,
            utr: `UTR-${Math.floor(100000000 + Math.random() * 900000000)}`,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            amount: data.totalAmount || 0,
            method: 'ONLINE GATEWAY',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || t('common.error_occurred', 'Unable to load invoice details.'));
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCheckout();
  }, [id, token, t]);

  const getInvoiceUrl = (autoPrint = false) => {
    const base = apiClient.defaults?.baseURL || (window.location.origin ? `${window.location.origin.replace(':5173', ':4000')}/api/v1` : 'http://localhost:4000/api/v1');
    const printParam = autoPrint ? '&print=true' : '';
    return `${base}/campaigns/${id}/public-invoice?token=${encodeURIComponent(token)}${printParam}`;
  };

  const handlePrintInvoice = () => {
    const url = getInvoiceUrl(true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadInvoice = () => {
    const url = getInvoiceUrl(false);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCode = async () => {
    if (!campaign?.code) return;
    const ok = await copyToClipboard(campaign.code);
    if (ok) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success(t('common.copied', 'Campaign code copied!'));
    }
  };

  // Real Gateway Checkout Handler
  const handleGatewayCheckout = async (isSimulated = false) => {
    setPaying(true);
    try {
      if (isSimulated) {
        // Instant Simulated Razorpay clearance
        const mockTxn = `pay_rzp_mock_${Date.now()}`;
        const mockOrder = `order_rzp_${Date.now()}`;
        await apiClient.post(`/campaigns/${id}/public-pay`, {
          token,
          gateway: 'razorpay',
          paymentMethod: 'razorpay',
          razorpayPaymentId: mockTxn,
          razorpayOrderId: mockOrder,
          amount: campaign?.totalAmount,
        });

        setReceiptData({
          txnId: mockTxn,
          utr: `UTR-${Math.floor(100000000 + Math.random() * 900000000)}`,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          amount: campaign?.totalAmount || 0,
          method: 'RAZORPAY (TEST MODE)',
        });
        setPaymentDone(true);
        toast.success(t('public_pay.payment_success', 'Razorpay payment verified! Campaign is cleared for broadcast launch'));
        return;
      }

      // Production / Live Standard Razorpay Modal
      const orderRes = await apiClient.post(`/campaigns/${id}/public-order`, {
        token,
        gateway: 'razorpay',
      });
      const orderData = orderRes.data?.data || orderRes.data;
      const rzpGateway = campaign?.gateways?.find((g) => g.provider === 'razorpay');
      const keyId = rzpGateway?.publishableKey || orderData?.order?.clientParams?.keyId || 'rzp_test_TcfPaWMXbL0Obx';
      const rzpOrderId = orderData?.orderId || orderData?.order?.orderId;
      const amountPaise = Math.round(Number(campaign?.totalAmount || 0) * 100);

      await openRazorpayCheckout({
        keyId,
        orderId: rzpOrderId,
        amount: amountPaise,
        currency: 'INR',
        name: 'VMOVEXA DOOH Cloud',
        description: `DOOH Campaign - ${campaign?.title}`,
        prefill: {
          name: campaign?.clientName || campaign?.clientCompany || 'Valued Client',
          email: campaign?.clientEmail || '',
          contact: campaign?.clientPhone || '',
        },
        notes: {
          campaign_id: String(campaign?.id),
          campaign_code: campaign?.code,
        },
        onSuccess: async (rzpResp) => {
          const verifyToast = toast.loading(t('common.processing', 'Confirming Razorpay cryptographic signature…'));
          try {
            await apiClient.post(`/campaigns/${id}/public-pay`, {
              token,
              gateway: 'razorpay',
              paymentMethod: 'razorpay',
              paymentMode: 'online',
              payment_mode: 'online',
              razorpayPaymentId: rzpResp.razorpay_payment_id,
              razorpayOrderId: rzpResp.razorpay_order_id || rzpOrderId,
              razorpaySignature: rzpResp.razorpay_signature,
              amount: campaign?.totalAmount,
            });
            toast.dismiss(verifyToast);
            setReceiptData({
              txnId: rzpResp.razorpay_payment_id,
              utr: `UTR-${Math.floor(100000000 + Math.random() * 900000000)}`,
              date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              amount: campaign?.totalAmount || 0,
              method: 'RAZORPAY (LIVE VERIFIED)',
            });
            setPaymentDone(true);
            toast.success(t('public_pay.payment_success', 'Razorpay payment verified! Campaign ready for launch'));
          } catch (verErr) {
            toast.dismiss(verifyToast);
            toast.error(verErr.response?.data?.message || t('common.error_occurred', 'Payment confirmation failed'));
          } finally {
            setPaying(false);
          }
        },
        onDismiss: () => {
          setPaying(false);
          toast(t('common.modal_closed', 'Payment modal closed. You can retry whenever ready.'));
        },
        onError: (err) => {
          setPaying(false);
          toast.error(err?.description || t('common.error_occurred', 'Razorpay transaction failed.'));
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('common.error_occurred', 'Payment failed.'));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-white tracking-tight">{t('public_pay.loading_invoice')}</h2>
          <p className="text-xs text-slate-400">{t('public_pay.verifying_token')}</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <FleetIcons.Alert className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{t('public_pay.invalid_expired_link')}</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{error || t('public_pay.invalid_expired_link')}</p>
          <div className="pt-2">
            <Link to="/login" className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-block transition-colors border border-slate-700">
              {t('public_pay.return_to_portal')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = campaign.isApproved !== false && (['approved', 'live', 'paused', 'completed'].includes(campaign.status) || campaign.paymentStatus === 'paid');

  if (!isApproved) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
            <FleetIcons.Clock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
              {t('public_pay.approval_pending_badge')}
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight mt-3">{t('public_pay.pending_approval_title')}</h2>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {t('public_pay.pending_approval_desc')}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{t('public_pay.client_label')}</span>
              <span className="text-slate-200 font-medium">{campaign.clientName || campaign.clientCompany || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{t('public_pay.flight_schedule_label')}</span>
              <span className="text-slate-200 font-medium">{campaign.startDate || '—'} {t('common.to', 'to')} {campaign.endDate || '—'}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{t('public_pay.current_status_label')}</span>
              <span className="text-amber-400 font-bold uppercase">{campaign.status}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {t('common.refresh', 'Refresh')}
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 text-center"
            >
              {t('public_pay.return_to_portal')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breakdownItems = Array.isArray(campaign.paymentBreakdown?.items) ? campaign.paymentBreakdown.items : [];
  const baseAmount = Number(campaign.paymentBreakdown?.baseAmount || campaign.budget || 0);
  const subtotalAmount = Number(campaign.paymentBreakdown?.subtotal || campaign.budget || 0);
  const totalAmount = Number(campaign.totalAmount || campaign.budget || 0);

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 transition-all">
        <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/25 shrink-0 border border-white/10">
              V
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white truncate">VMOVEXA ONE</h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold uppercase tracking-wider">
                  {t('public_pay.encrypted_checkout')}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-wide line-clamp-1">{t('public_pay.network_checkout')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>{t('public_pay.encrypted_checkout')}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start flex-1">
        {/* Left Column (Span 7): Official Invoice Details & Itemized Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl backdrop-blur-xl min-w-0">
          {/* Header & Badges */}
          <div className="space-y-2 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                {t('public_pay.invoice_agreement')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider">
                {t('public_pay.approved_for_flight')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight break-words">{campaign.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
              <span>{t('public_pay.brand_label')} <strong className="text-white font-semibold">{campaign.brandName}</strong></span>
              <span>·</span>
              <span>{t('public_pay.advertiser_label')} <strong className="text-slate-200 font-semibold">{campaign.advertiserName}</strong></span>
            </div>
          </div>

          {/* Client & Payer Profile Card */}
          <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between text-xs flex-wrap gap-1 border-b border-slate-800/60 pb-2.5">
              <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">{t('public_pay.client_details')}</span>
              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0" />
                {t('public_pay.verified_beneficiary')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{t('public_pay.client_name_company')}</span>
                <p className="font-bold text-white text-sm break-words">{campaign.clientName || 'Valued Client'}</p>
                {campaign.clientCompany && <p className="text-xs text-slate-300 break-words font-medium">{campaign.clientCompany}</p>}
                {campaign.clientAddress && (
                  <p className="text-[11px] text-slate-400 break-words mt-1 leading-relaxed flex items-center gap-1">
                    <FleetIcons.Pin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{campaign.clientAddress}</span>
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">{t('public_pay.contact_info')}</span>
                <p className="font-mono text-white text-xs break-all flex items-center gap-1.5 pt-0.5">
                  <FleetIcons.Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{campaign.clientPhone || 'N/A'}</span>
                </p>
                <p className="font-mono text-slate-300 text-[11px] break-all flex items-center gap-1.5">
                  <FleetIcons.Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{campaign.clientEmail || 'N/A'}</span>
                </p>
                {campaign.clientCity && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    {t('public_pay.city_state_label')} <strong className="text-slate-300 font-semibold">{campaign.clientCity}{campaign.clientState ? `, ${campaign.clientState}` : ''}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Campaign Flight Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">{t('public_pay.campaign_code')}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="font-mono font-bold text-slate-200 text-xs truncate">{campaign.code}</p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 shrink-0 cursor-pointer flex items-center gap-1"
                  title={t('public_pay.copy_campaign_code')}
                >
                  {copiedCode ? <FleetIcons.Check className="w-3 h-3 text-emerald-400" /> : <span>{t('common.copy', 'Copy')}</span>}
                </button>
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">{t('public_pay.objective')}</span>
              <p className="font-bold text-slate-200 text-xs break-words mt-1">{campaign.objective || 'Brand Awareness'}</p>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">{t('public_pay.schedule')}</span>
              <p className="font-mono font-bold text-slate-200 text-[11px] break-words mt-1 leading-tight flex items-center gap-1">
                <span>{campaign.startDate}</span>
                {campaign.endDate && (
                  <>
                    <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400 shrink-0 inline" />
                    <span>{campaign.endDate}</span>
                  </>
                )}
              </p>
            </div>
            <div className="min-w-0">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">{t('public_pay.network_status')}</span>
              <p className="font-bold text-emerald-400 uppercase tracking-wide text-xs mt-1">{t('common.approved', 'Approved')}</p>
            </div>
          </div>

          {/* Itemized Statutory Billing Ledger */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                {t('public_pay.billing_breakdown')}
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{t('public_pay.all_amounts_inr')}</span>
            </div>

            <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 space-y-3">
              {breakdownItems.length > 0 ? (
                breakdownItems.map((item, idx) => {
                  const amountVal = Number(item.amount || 0);
                  const isBase = item.type === 'base';
                  const isDiscount = item.type === 'discount' || amountVal < 0;
                  const isTax = item.type === 'tax';

                  let textColor = 'text-slate-200';
                  let signPrefix = '';
                  if (isDiscount) {
                    textColor = 'text-emerald-400 font-semibold';
                    signPrefix = '- ';
                  } else if (isTax) {
                    textColor = 'text-amber-300 font-semibold';
                    signPrefix = '+ ';
                  } else if (!isBase) {
                    textColor = 'text-blue-300 font-semibold';
                    signPrefix = '+ ';
                  }

                  return (
                    <div key={item.key || idx} className={`flex items-start justify-between gap-3 text-xs ${textColor}`}>
                      <span className="break-words min-w-0 flex-1 leading-relaxed font-medium">
                        {item.label}
                      </span>
                      <span className="font-mono font-bold shrink-0 whitespace-nowrap pt-0.5">
                        {signPrefix}₹ {Math.abs(amountVal).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 text-slate-200 text-xs">
                    <span className="break-words min-w-0 flex-1 leading-relaxed font-medium">{t('public_pay.airtime_slot')}</span>
                    <span className="font-mono font-bold text-white shrink-0 whitespace-nowrap pt-0.5">₹ {baseAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {Number(campaign.gstAmount || 0) > 0 && (
                    <div className="flex items-start justify-between gap-3 text-amber-300 text-xs">
                      <span className="break-words min-w-0 flex-1 leading-relaxed font-medium">{t('public_pay.gst_breakdown')}</span>
                      <span className="font-mono font-bold shrink-0 whitespace-nowrap pt-0.5">+ ₹ {Number(campaign.gstAmount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </>
              )}

              {/* Subtotal Row */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2.5 border-t border-slate-800">
                <span>{t('public_pay.subtotal_label')}</span>
                <span className="font-mono font-bold text-white">₹ {subtotalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Final Total Row */}
              <div className="flex items-center justify-between text-base font-black text-white pt-3 border-t-2 border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 block font-black">{t('public_pay.grand_total')}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{t('public_pay.checkout_link_amount')}</span>
                </div>
                <span className="text-emerald-400 font-mono text-2xl font-black shrink-0">
                  ₹ {totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Statutory & Legal Notice */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
            <p>
              <strong>{t('public_pay.statutory_notice')}</strong> {t('public_pay.statutory_notice_desc')} <strong>{campaign.clientEmail}</strong>.
            </p>
          </div>

          {paymentDone && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                  <FleetIcons.Check className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{t('public_pay.cleared_title')}</p>
                  <p className="text-[11px] text-emerald-400/90">{t('public_pay.cleared_subtitle')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrintInvoice}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <FleetIcons.Printer className="w-3.5 h-3.5" />
                <span>{t('public_pay.print_receipt')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column (Span 5): Payment Panel (Sticky on Desktop) */}
        <div id="payment-panel" className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-24 self-start min-w-0">
          {paymentDone ? (
            <div className="text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <FleetIcons.Check className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">{t('public_pay.payment_success')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t('public_pay.payment_success_sub')}
                </p>
              </div>

              {receiptData && (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5 font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 shrink-0">{t('public_pay.payment_rail')}</span>
                    <span className="text-indigo-400 font-bold text-right break-all">{receiptData.method}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">{t('public_pay.txn_ref')}</span>
                    <span className="text-white text-right break-all font-mono">{receiptData.txnId}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-400 shrink-0">{t('public_pay.utr_auth')}</span>
                    <span className="text-emerald-400 text-right break-all font-mono font-bold">{receiptData.utr}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 shrink-0">{t('public_pay.amount_paid')}</span>
                    <span className="text-white font-bold text-right whitespace-nowrap">₹ {Number(receiptData.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 shrink-0">{t('public_pay.date')}</span>
                    <span className="text-slate-300 text-right whitespace-nowrap">{receiptData.date}</span>
                  </div>
                </div>
              )}

              {/* Dual Action Buttons: Print & Download Tax Invoice */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] cursor-pointer"
                >
                  <FleetIcons.Printer className="w-4 h-4" />
                  <span>{t('public_pay.print_tax_invoice')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <FleetIcons.Download className="w-4 h-4" />
                  <span>{t('public_pay.download_pdf_invoice')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{t('public_pay.select_gateway')}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t('public_pay.select_gateway_sub')}</p>
              </div>

              {/* Razorpay Gateway Card */}
              <div className="space-y-4">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md shadow-blue-600/30">
                        RZ
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{t('public_pay.razorpay_title')}</span>
                        <span className="text-[10px] text-slate-400">{t('public_pay.razorpay_aggregator')}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                      {t('public_pay.instant_utr')}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-w-0">
                      <FleetIcons.Zap className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-[10px] text-slate-300 font-bold truncate w-full">{t('public_pay.upi_qr')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-w-0">
                      <FleetIcons.Bank className="w-4 h-4 text-blue-400 mb-1" />
                      <span className="text-[10px] text-slate-300 font-bold truncate w-full">{t('public_pay.netbanking')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-w-0">
                      <FleetIcons.CreditCard className="w-4 h-4 text-indigo-400 mb-1" />
                      <span className="text-[10px] text-slate-300 font-bold truncate w-full">{t('public_pay.card')}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed text-center pt-1">
                    {t('public_pay.razorpay_helper')}
                  </p>
                </div>

                {/* Primary Pay via Razorpay Button */}
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => handleGatewayCheckout(false)}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-base shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-center"
                >
                  {paying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="truncate">{t('public_pay.initializing_gateway')}</span>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{t('public_pay.pay_via_razorpay')}</span>
                      <span className="font-mono text-white font-black">₹ {totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </button>

                {/* Test Mode Simulation Option */}
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => handleGatewayCheckout(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <FleetIcons.Beaker className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('public_pay.simulate_razorpay')}</span>
                </button>

                {/* Security Trust Badges */}
                <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <FleetIcons.Lock className="w-3 h-3 text-slate-400" />
                    <span>{t('public_pay.ssl_256')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FleetIcons.Shield className="w-3 h-3 text-emerald-400" />
                    <span>{t('public_pay.rbi_authorized')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FleetIcons.Document className="w-3 h-3 text-blue-400" />
                    <span>{t('public_pay.instant_receipt')}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Sticky Quick-Pay Bar */}
      {!paymentDone && (
        <div className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{t('public_pay.total_payable')}</span>
            <span className="text-base font-black font-mono text-emerald-400 whitespace-nowrap">
              ₹ {totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            type="button"
            disabled={paying}
            onClick={() => handleGatewayCheckout(false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {paying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('common.processing', 'Processing...')}</span>
              </>
            ) : (
              <>
                <span>{t('public_pay.pay_via_razorpay')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-slate-950/60 border-t border-slate-800/80 py-5 text-center text-xs text-slate-500 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{t('public_pay.footer_cloud_platform')}</span>
          <span className="text-[11px] text-slate-500">{t('public_pay.footer_note')}</span>
        </div>
      </footer>
    </div>
  );
};

export default CampaignPublicPayPage;

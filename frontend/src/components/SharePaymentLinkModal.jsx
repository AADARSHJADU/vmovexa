import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';
import { copyToClipboard } from '../utils/clipboard';
import {
  IconShare,
  IconCopy,
  IconMail,
  IconMessage,
  IconWhatsApp,
  IconCheckCircle,
  IconCreditCard,
  IconUser,
  IconPhone,
} from './ui/CampaignIcons';

export const SharePaymentLinkModal = ({ isOpen, onClose, campaign, onShare }) => {
  const { t } = useTranslation();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sendingChannel, setSendingChannel] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (campaign) {
      setRecipientEmail(campaign.clientEmail || '');
      setRecipientPhone(campaign.clientPhone || '');
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const isApproved = campaign.status === 'Approved' || campaign.rawStatus === 'approved' || campaign.status === 'Live' || campaign.rawStatus === 'live' || campaign.paymentStatus === 'Paid';

  const baseBudget = Number(campaign.budget) || 0;
  const gstAmount = Math.round(baseBudget * 0.18);
  const totalAmount = baseBudget + gstAmount;

  const campaignDbId = campaign.dbId || campaign.id;
  const token = campaign.paymentToken || campaignDbId;
  const paymentUrl = `${window.location.origin}/campaigns/${campaignDbId}/pay?token=${token}`;

  const customerName = campaign.clientName || campaign.clientCompany || 'Valued Customer';
  const whatsappText = `Hello ${customerName}, please complete payment of ₹${totalAmount.toLocaleString('en-IN')} for your VMOVEXA DOOH Campaign "${campaign.name}". Click to pay securely: ${paymentUrl}`;
  const cleanPhone = (recipientPhone || campaign.clientPhone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappUrl = formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsappText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(paymentUrl);
    if (ok) {
      setCopied(true);
      toast.success('Payment checkout link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleSend = async (channel) => {
    if (!isApproved) {
      toast.error('Campaign must be approved before payment link can be dispatched.');
      return;
    }
    if (!onShare) {
      toast.error('Share service unavailable');
      return;
    }
    if (channel === 'email' && !recipientEmail) {
      toast.error('Please enter a recipient email address');
      return;
    }
    if (channel === 'sms' && !recipientPhone) {
      toast.error('Please enter a recipient phone number');
      return;
    }

    setSendingChannel(channel);
    try {
      const res = await onShare(campaignDbId, {
        recipientEmail,
        recipientPhone,
        recipientName: customerName,
        channel,
      });
      toast.success(res?.message || `Payment checkout link successfully sent via ${channel.toUpperCase()}!`);
    } catch (err) {
      toast.error(err?.message || `Failed to send link via ${channel.toUpperCase()}`);
    } finally {
      setSendingChannel(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs shrink-0">
              <IconShare className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t('payment.share_modal_title', 'Send Payment Link to Customer')}</h3>
              <p className="text-xs text-slate-500">{t('payment.share_modal_subtitle', 'Dispatch direct checkout URL via SMS, Email, or WhatsApp')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 font-bold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Campaign & Client Snapshot */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/90 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm truncate max-w-xs">{campaign.name}</span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              {campaign.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-[11px] text-slate-400">{t('campaign.customer_label', 'Customer:')}</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate">
                {campaign.clientName || 'External Customer'}
                {campaign.clientCompany ? ` (${campaign.clientCompany})` : ''}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">{t('payment.total_payable_gst', 'Total Payable (inc. 18% GST):')}</span>
              <p className="font-black text-emerald-700 text-sm mt-0.5">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Live Public Checkout URL Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>{t('payment.public_checkout_link', 'Public Checkout Link')}</span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                {t('payment.no_login_required', 'No Login Required')}
              </span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">{t('payment.secured_by_token', 'Secured by Token')}</span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={paymentUrl}
              className="flex-1 bg-transparent border-none text-[11px] font-mono text-blue-700 focus:outline-none truncate select-all px-1"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
              }`}
            >
              {copied ? (
                <>
                  <IconCheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>{t('common.copied', 'Copied!')}</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t('common.copy', 'Copy')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {!isApproved && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <span>⚠️ Approval Pending</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              This campaign is currently <strong className="uppercase font-bold">{campaign.rawStatus || campaign.status || 'Under Review'}</strong>. Payment links can only be dispatched after Super Admin approval.
            </p>
          </div>
        )}

        {/* Recipient Form Fields */}
        <div className="space-y-3 pt-1">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconMail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{t('payment.recipient_email_label', 'Recipient Email (Official GST Invoice & Checkout Link)')}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="customer@company.com"
                disabled={!isApproved}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
              <button
                type="button"
                disabled={!isApproved || sendingChannel === 'email' || !recipientEmail}
                onClick={() => handleSend('email')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                <IconMail className="w-3.5 h-3.5 text-white" />
                <span>{sendingChannel === 'email' ? t('common.sending', 'Sending...') : t('payment.send_email', 'Send Email')}</span>
              </button>
            </div>
          </div>

          {/* SMS */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconPhone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{t('payment.recipient_mobile_label', 'Recipient Mobile (Instant SMS Payment Gateway Link)')}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={!isApproved}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
              <button
                type="button"
                disabled={!isApproved || sendingChannel === 'sms' || !recipientPhone}
                onClick={() => handleSend('sms')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
              >
                <IconMessage className="w-3.5 h-3.5 text-white" />
                <span>{sendingChannel === 'sms' ? t('common.sending', 'Sending...') : t('payment.send_sms', 'Send SMS')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp & Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <IconWhatsApp className="w-4 h-4 text-white" />
            <span>{t('payment.share_whatsapp', 'Share via WhatsApp')}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            {t('common.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePaymentLinkModal;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { advertiserService } from '../../api/services/advertiser/advertiser.service';
import { useAuth } from '../../hooks/useAuth';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', desc: 'Direct cash collection at office', icon: 'Money', color: 'emerald' },
  { id: 'cheque', label: 'Cheque', desc: 'Bank clearance instrument', icon: 'Invoice', color: 'blue' },
  { id: 'demand_draft', label: 'Demand Draft', desc: 'Prepaid bank draft (DD)', icon: 'Invoice', color: 'purple' },
  { id: 'neft', label: 'NEFT', desc: 'National Electronic Fund Transfer', icon: 'Refresh', color: 'teal' },
  { id: 'rtgs', label: 'RTGS', desc: 'Real-Time Gross Settlement', icon: 'Speed', color: 'amber' },
  { id: 'imps', label: 'IMPS', desc: 'Instant mobile/bank payment', icon: 'CreditCard', color: 'pink' },
  { id: 'upi_manual', label: 'UPI / QR', desc: 'Manual UPI / QR settlement', icon: 'CreditCard', color: 'indigo' },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Direct wire / account deposit', icon: 'Bank', color: 'sky' },
  { id: 'other', label: 'Sanction / Treasury', desc: 'Dept order / Govt sanction / Other', icon: 'Depot', color: 'zinc' },
];

export const RecordOfflinePaymentModal = ({
  isOpen,
  onClose,
  campaign,
  isGov = false,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Parse breakdown or budget to calculate amount
  const initialAmount = (() => {
    if (!campaign) return 0;
    let b = campaign.payment_breakdown;
    if (typeof b === 'string') {
      try { b = JSON.parse(b); } catch (_) { b = null; }
    }
    if (b && b.totalAmount != null) return Number(b.totalAmount);
    const budget = Number(campaign.budget || 0);
    const gst = Math.round(budget * 0.18);
    return budget + gst;
  })();

  const [formData, setFormData] = useState({
    offlineMethod: 'cheque',
    amount: initialAmount,
    referenceNumber: '',
    bankName: '',
    branchName: '',
    accountHolder: '',
    chequeNumber: '',
    chequeDate: new Date().toISOString().slice(0, 10),
    utrNumber: '',
    transactionId: '',
    collectedAt: new Date().toISOString().slice(0, 10),
    verifiedByName: user?.name || '',
    remarks: '',
    proofUrl: '',
    currency: 'INR',
  });

  useEffect(() => {
    if (isOpen && campaign) {
      let b = campaign.payment_breakdown;
      if (typeof b === 'string') {
        try { b = JSON.parse(b); } catch (_) { b = null; }
      }
      const budget = Number(campaign.budget || 0);
      const total = b && b.totalAmount != null ? Number(b.totalAmount) : (budget + Math.round(budget * 0.18));

      setFormData((prev) => ({
        ...prev,
        offlineMethod: isGov ? 'other' : 'cheque',
        amount: total > 0 ? total : budget,
        verifiedByName: user?.name || prev.verifiedByName || '',
        referenceNumber: '',
        bankName: '',
        branchName: '',
        accountHolder: campaign.client_company || campaign.client_name || '',
        chequeNumber: '',
        chequeDate: new Date().toISOString().slice(0, 10),
        utrNumber: '',
        transactionId: '',
        collectedAt: new Date().toISOString().slice(0, 10),
        remarks: isGov ? 'Government Treasury budget sanction order recorded.' : '',
        proofUrl: '',
      }));
    }
  }, [isOpen, campaign, isGov, user]);

  if (!isOpen || !campaign) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (['cheque', 'demand_draft'].includes(formData.offlineMethod)) {
      if (!formData.chequeNumber && !formData.referenceNumber) {
        toast.error('Cheque / DD number is required for instrument verification.');
        return;
      }
    }

    if (['neft', 'rtgs', 'imps'].includes(formData.offlineMethod)) {
      if (!formData.utrNumber && !formData.referenceNumber && !formData.transactionId) {
        toast.error('UTR / Reference number is required for bank transfer verification.');
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading('Recording offline payment...');

    try {
      const payload = {
        amount: Number(formData.amount),
        offlineMethod: formData.offlineMethod,
        referenceNumber: formData.referenceNumber || formData.utrNumber || formData.chequeNumber || formData.transactionId || null,
        bankName: formData.bankName || null,
        branchName: formData.branchName || null,
        accountHolder: formData.accountHolder || null,
        chequeNumber: formData.chequeNumber || null,
        chequeDate: formData.chequeDate || null,
        utrNumber: formData.utrNumber || null,
        transactionId: formData.transactionId || null,
        remarks: formData.remarks || null,
        proofUrl: formData.proofUrl || null,
        collectedAt: formData.collectedAt ? new Date(formData.collectedAt).toISOString() : new Date().toISOString(),
        verifiedByName: formData.verifiedByName || user?.name || null,
        currency: 'INR',
      };

      const updated = await advertiserService.recordOfflinePayment(campaign.id, payload);

      toast.dismiss(toastId);
      toast.success(
        isGov
          ? 'Treasury payment details recorded successfully!'
          : 'Offline payment recorded! Campaign is marked as PAID.'
      );

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.message || 'Failed to record offline payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const isChequeOrDD = ['cheque', 'demand_draft'].includes(formData.offlineMethod);
  const isBankTransfer = ['neft', 'rtgs', 'imps', 'bank_transfer'].includes(formData.offlineMethod);
  const isUpi = formData.offlineMethod === 'upi_manual';
  const isCash = formData.offlineMethod === 'cash';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-zinc-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FleetIcons.Money className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isGov ? 'Record Treasury / Budget Sanction' : 'Record Offline Payment'}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  OFFLINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Campaign: <span className="font-semibold text-slate-700 dark:text-zinc-200">{campaign.title || campaign.name}</span>{' '}
                <span className="font-mono text-[11px] text-slate-400">({campaign.code})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <FleetIcons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Method Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = formData.offlineMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, offlineMethod: m.id }))}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-sm ring-1 ring-amber-500/30'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="text-xs font-bold">{m.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Due & Received */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Total Budget Amount
                </span>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Base Budget: ₹{Number(campaign.budget || 0).toLocaleString('en-IN')} + 18% GST
                </p>
              </div>
              <div className="w-full sm:w-56">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    Amount Received (₹) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    Locked
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    readOnly
                    disabled
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold bg-slate-100 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-700 dark:text-zinc-300 cursor-not-allowed select-none opacity-90"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Instrument Fields */}
          {isChequeOrDD && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {formData.offlineMethod === 'demand_draft' ? 'Demand Draft Details' : 'Cheque Details'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    {formData.offlineMethod === 'demand_draft' ? 'DD Number' : 'Cheque Number'} *
                  </label>
                  <input
                    type="text"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 000421"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Instrument Date *
                  </label>
                  <input
                    type="date"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Issuing Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. State Bank of India, HDFC"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Bank Branch
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {isBankTransfer && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Bank Transfer / UTR Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    UTR / Transaction Reference *
                  </label>
                  <input
                    type="text"
                    name="utrNumber"
                    value={formData.utrNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. SBIN22490123984"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Remitting Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. ICICI Bank, SBI"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Remitter / Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder="Account Name"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Branch Name / IFSC
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder="Branch or IFSC Code"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {isUpi && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                UPI Reference Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    UPI Reference / Transaction ID *
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 429810293810"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    UPI App / Remitter VPA
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    placeholder="e.g. client@okhdfcbank"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.offlineMethod === 'other' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Treasury / Sanction Order Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Sanction / Order Reference Number *
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. GOV/DIPR/2026/SNC-891"
                    className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                    Sanctioning Department / Authority
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. Department of Transport / Treasury"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Collection Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Collection / Receipt Date *
              </label>
              <input
                type="date"
                name="collectedAt"
                value={formData.collectedAt}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Verified & Recorded By *
              </label>
              <input
                type="text"
                name="verifiedByName"
                value={formData.verifiedByName}
                onChange={handleChange}
                required
                placeholder="Current User / Official Name"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Internal Remarks */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Internal Remarks / Settlement Notes (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Handover received by finance counter; clearance confirmation attached."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
          </div>

          {/* Proof Document URL */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Proof Document / Scanned Receipt URL (Optional)
            </label>
            <input
              type="text"
              name="proofUrl"
              value={formData.proofUrl}
              onChange={handleChange}
              placeholder="https://... or uploaded slip reference"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Warning / Audit Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 text-[11px] text-slate-600 dark:text-zinc-400">
            <FleetIcons.ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Recording this payment marks the campaign as <strong className="text-slate-900 dark:text-white">PAID</strong>, generates the official GST/tax invoice record in the finance ledger, and enables manual broadcast launch on transit screens.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <FleetIcons.Check className="w-4 h-4" />
                  Confirm & Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordOfflinePaymentModal;

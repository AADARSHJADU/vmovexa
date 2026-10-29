import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { useAdvertiserRole } from '../../hooks/advertiser/useAdvertiserRole';
import { useGovernmentRole } from '../../hooks/government/useGovernmentRole';
import { advertiserService } from '../../api/services/advertiser/advertiser.service';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

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

export const RecordOfflinePaymentPage = ({ ownerType = 'advertiser' }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isGov = ownerType === 'government' || location.pathname.includes('/government');

  const auth = useAuth?.() || {};
  const adv = useAdvertiserRole();
  const gov = useGovernmentRole();
  const user = auth.user || adv.user || gov.user;

  const rawCampaigns = isGov ? gov.campaigns : adv.campaigns;
  const rtkActiveCampaign = isGov ? gov.currentCampaign : (adv.currentCampaign || adv.activeCampaign);
  const loadCampaignDetails = isGov ? gov.loadCampaignById : adv.loadCampaignDetails;
  const loadCampaigns = isGov ? gov.loadCampaigns : adv.loadCampaigns;

  const isSuperAdmin = location.pathname.startsWith('/superadmin') || user?.role === 'ROLE-SUPER-ADMIN' || user?.role?.code === 'ROLE-SUPER-ADMIN' || user?.clearance === 'ROOT';
  const basePath = isSuperAdmin
    ? (isGov ? '/superadmin/government' : '/superadmin/advertiser')
    : (isGov ? '/government' : '/advertiser');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (id && typeof loadCampaignDetails === 'function') {
      setLoading(true);
      loadCampaignDetails(id)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    if (typeof loadCampaigns === 'function') {
      loadCampaigns().catch(() => {});
    }
  }, [id, loadCampaignDetails, loadCampaigns]);

  // Find active campaign from RTK
  const campaign = useMemo(() => {
    if (rtkActiveCampaign && (
      String(rtkActiveCampaign.id) === String(id) ||
      String(rtkActiveCampaign.code).toLowerCase() === String(id).toLowerCase() ||
      String(rtkActiveCampaign.code || '').replace(/[^a-z0-9]/gi, '').toLowerCase() === String(id).replace(/[^a-z0-9]/gi, '').toLowerCase()
    )) {
      return rtkActiveCampaign;
    }
    const rtkList = Array.isArray(rawCampaigns) ? rawCampaigns : (rawCampaigns?.items || rawCampaigns?.rows || []);
    return rtkList.find(c =>
      String(c.id) === String(id) ||
      String(c.code).toLowerCase() === String(id).toLowerCase() ||
      String(c.code || '').replace(/[^a-z0-9]/gi, '').toLowerCase() === String(id).replace(/[^a-z0-9]/gi, '').toLowerCase()
    ) || null;
  }, [rtkActiveCampaign, rawCampaigns, id]);

  // Financial Breakdown calculations
  const breakdownData = useMemo(() => {
    if (!campaign) return { baseBudget: 0, gstAmount: 0, totalAmount: 0, items: [] };
    let pb = campaign.payment_breakdown;
    if (typeof pb === 'string') {
      try { pb = JSON.parse(pb); } catch (_) { pb = null; }
    }
    const baseBudget = pb && pb.baseAmount != null ? Number(pb.baseAmount) : Number(campaign.budget || 0);
    const gstAmount = pb && pb.gstAmount != null ? Number(pb.gstAmount) : Math.round(baseBudget * 0.18);
    const totalAmount = pb && pb.totalAmount != null ? Number(pb.totalAmount) : (baseBudget + gstAmount);
    return {
      baseBudget,
      gstAmount,
      totalAmount,
      items: pb?.items || [],
    };
  }, [campaign]);

  const [formData, setFormData] = useState({
    offlineMethod: isGov ? 'other' : 'cheque',
    amount: breakdownData.totalAmount || '',
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
    remarks: isGov ? 'Government Treasury budget sanction order recorded.' : '',
    proofUrl: '',
    currency: 'INR',
  });

  useEffect(() => {
    if (campaign) {
      setFormData(prev => ({
        ...prev,
        offlineMethod: isGov ? 'other' : 'cheque',
        amount: breakdownData.totalAmount || campaign.budget || '',
        accountHolder: campaign.client_company || campaign.client_name || prev.accountHolder,
        verifiedByName: user?.name || prev.verifiedByName || '',
        remarks: isGov ? 'Government Treasury budget sanction order recorded.' : prev.remarks,
      }));
    }
  }, [campaign, breakdownData, isGov, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMethodSelect = (methodId) => {
    setFormData(prev => ({ ...prev, offlineMethod: methodId }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15 MB limit');
      return;
    }

    setUploadingFile(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const res = await uploadFile(file, 'campaign');
      const url = res?.fileUrl || res?.data?.fileUrl || res?.url || '';
      setFormData(prev => ({ ...prev, proofUrl: url }));
      toast.dismiss(toastId);
      toast.success('Payment instrument document uploaded successfully');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.message || 'File upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalAmount = Number(formData.amount || breakdownData.totalAmount || campaign?.budget || 0);
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Campaign total budget amount must be greater than zero.');
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

    if (formData.offlineMethod === 'other') {
      if (!formData.referenceNumber) {
        toast.error('Sanction / Order Reference number is required for department clearance.');
        return;
      }
    }

    setSubmitting(true);
    const toastId = toast.loading(isGov ? 'Recording treasury sanction clearance...' : 'Recording offline payment...');

    try {
      const payload = {
        amount: finalAmount,
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

      const targetCampaignId = campaign?.rawId || campaign?.id || id;
      await advertiserService.recordOfflinePayment(targetCampaignId, payload);

      toast.dismiss(toastId);
      toast.success(
        isGov
          ? 'Treasury clearance sanction recorded! Campaign is marked as PAID.'
          : 'Offline payment recorded! Campaign is marked as PAID.'
      );

      navigate(`${basePath}/campaigns/${campaign?.code || id}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.message || 'Failed to record payment clearance.');
    } finally {
      setSubmitting(false);
    }
  };

  const isChequeOrDD = ['cheque', 'demand_draft'].includes(formData.offlineMethod);
  const isBankTransfer = ['neft', 'rtgs', 'imps', 'bank_transfer'].includes(formData.offlineMethod);
  const isUpi = formData.offlineMethod === 'upi_manual';
  const isSanction = formData.offlineMethod === 'other';
  const isCash = formData.offlineMethod === 'cash';

  const breadcrumbItems = [
    { label: 'Campaigns', to: `${basePath}/campaigns` },
    { label: campaign?.code || id, to: `${basePath}/campaigns/${campaign?.code || id}` },
    { label: isGov ? 'Record Treasury / Sanction' : 'Record Offline Payment' },
  ];

  return (
    <div className="w-full space-y-6 pb-20 px-1 sm:px-0 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div>
        <Breadcrumb items={breadcrumbItems} className="mb-2" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                {isGov ? 'Record Treasury / Budget Sanction' : 'Record Offline Payment'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                OFFLINE CLEARANCE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Campaign: <strong className="text-slate-800 dark:text-zinc-200">{campaign?.title || campaign?.name || id}</strong>{' '}
              <span className="font-mono text-xs">({campaign?.code || id})</span>
              {campaign?.client_company ? ` · ${isGov ? 'Department' : 'Client'}: ${campaign.client_company}` : ''}
            </p>
          </div>

          <Link
            to={`${basePath}/campaigns/${campaign?.code || id}`}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold shadow-xs transition-all inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <span>{t('advertiser.offline_pay.back_campaign')}</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Summary Financial Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <FleetIcons.Money className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                TOTAL CAMPAIGN SANCTION BUDGET
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  ₹{breakdownData.totalAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  (Base: ₹{breakdownData.baseBudget.toLocaleString('en-IN')} + GST ₹{breakdownData.gstAmount.toLocaleString('en-IN')})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">
                {t('advertiser.offline_pay.transition_desc_1')} <span className="font-semibold text-amber-700 dark:text-amber-400">{t('common.approved')}</span> {t('advertiser.offline_pay.transition_desc_2')} <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('advertiser.offline_pay.paid')}</span> {t('advertiser.offline_pay.transition_desc_3')}
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 bg-white dark:bg-zinc-800/80 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Amount Received (₹) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <FleetIcons.Lock className="w-2.5 h-2.5" />
                Locked
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="text"
                name="amount"
                value={formData.amount || breakdownData.totalAmount || ''}
                readOnly
                disabled
                className="w-full h-10 pl-7 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-200 font-mono font-bold text-sm cursor-not-allowed select-none opacity-90"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              Sanctioned Budget (Base + 18% GST). Fixed.
            </p>
          </div>
        </div>

        {/* SECTION 2: Payment Method Selection */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <FleetIcons.CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Select Offline Clearance Method <span className="text-rose-500">*</span>
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {PAYMENT_METHODS.length} Instruments Supported
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PAYMENT_METHODS.map((m) => {
              const selected = formData.offlineMethod === m.id;
              const IconComponent = FleetIcons[m.icon] || FleetIcons.CreditCard;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMethodSelect(m.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    selected
                      ? 'border-amber-500 dark:border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800/40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selected
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200/70 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {m.label}
                      </span>
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1.5" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Dynamic Instrument / Sanction Fields */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {isSanction
                ? 'Treasury / Sanction Order Details'
                : isChequeOrDD
                ? 'Cheque / Demand Draft Instrument Details'
                : isBankTransfer
                ? 'Electronic Fund Transfer Details'
                : isUpi
                ? 'UPI / QR Reference Details'
                : 'Cash Voucher Collection Details'}
            </h2>
            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
              Method: {formData.offlineMethod.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {isChequeOrDD && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Cheque / DD Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_cheque')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Instrument Issue Date
                  </label>
                  <input
                    type="date"
                    name="chequeDate"
                    value={formData.chequeDate}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_bank')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Branch / IFSC
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_branch')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Account Holder / Drawer Name
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_holder')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {isBankTransfer && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    UTR / Bank Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="utrNumber"
                    value={formData.utrNumber}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_utr')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Remitter Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_dest_bank')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Remitter Branch / IFSC
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_ifsc')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Remitter Account / Entity Name
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_remitter')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {isUpi && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    UPI Transaction ID / Ref No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_upi_rrn')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Payer VPA / Mobile Handle
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_vpa')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {isSanction && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Sanction / Order Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_sanction_no')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Sanctioning Department / Authority
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_dept')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Treasury Office / Budget Head
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_budget_head')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Nodal Sanction Officer Name
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_auth_officer')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            {isCash && (
              <>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Cash Receipt / Voucher Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    required
                    placeholder={t('advertiser.offline_pay.ph_receipt_no')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Collection Counter / Office Branch
                  </label>
                  <input
                    type="text"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_depot')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                    Depositor / Client Representative Name
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleChange}
                    placeholder={t('advertiser.offline_pay.ph_cashier')}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 4: Audit & Verification Details */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Verification & Audit Documentation
            </h2>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
              Compliance Ledger Entry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Collection / Clearance Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="collectedAt"
                value={formData.collectedAt}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Verified / Recorded By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="verifiedByName"
                value={formData.verifiedByName}
                onChange={handleChange}
                required
                placeholder={t('advertiser.offline_pay.ph_staff_officer')}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Audit Remarks / Sanction Notes
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                placeholder={t('advertiser.offline_pay.ph_notes')}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-400 font-bold mb-1">
                Payment Proof / Instrument Scan / Sanction Order Copy
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto h-10 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-colors">
                  <FleetIcons.Download className="w-4 h-4 rotate-180" />
                  <span>{uploadingFile ? 'Uploading...' : 'Choose File (PDF/Image)'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  name="proofUrl"
                  value={formData.proofUrl}
                  onChange={handleChange}
                  placeholder={t('advertiser.offline_pay.ph_doc_url')}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {formData.proofUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <FleetIcons.Check className="w-4 h-4 shrink-0" />
                  <span className="truncate">Attached: {formData.proofUrl}</span>
                  <a
                    href={resolveFileUrl(formData.proofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-1 font-bold"
                  >
                    View Document ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: Submit & Actions Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Link
            to={`${basePath}/campaigns/${campaign?.code || id}`}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all text-center"
          >
            Cancel & Return
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>{t('advertiser.offline_pay.recording')}</span>
              </>
            ) : (
              <>
                <FleetIcons.Check className="w-4 h-4 text-white shrink-0" />
                <span>{t('advertiser.offline_pay.confirm_btn')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordOfflinePaymentPage;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { useFinanceRole } from '../../hooks/finance/useFinanceRole';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';

export const FinanceAccountSettingsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin/finance' : '/finance';
  const { settings, loadSettings, updateSettings } = useFinanceRole();

  const [activeTab, setActiveTab] = useState('vmovexa'); // 'vmovexa' | 'banking' | 'terms' | 'officer'
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: 'VMOVEXA PRIVATE LIMITED',
    tradeName: 'VMOVEXA',
    gstin: '27M4BCY934D12S',
    pan: 'AACCV1234F',
    email: 'billing@vmovexa.com',
    phone: '+91 98765 88990',
    website: 'https://vmovexa.com',
    address: '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
    bankName: 'HDFC Bank Ltd',
    accountName: 'VMOVEXA PRIVATE LIMITED',
    accountNumber: '50200088219012',
    ifscCode: 'HDFC0000123',
    branch: 'BKC Corporate Branch, Mumbai',
    upiId: 'vmovexa@hdfcbank',
    logoUrl: '/logo/logo_clinet.png',
    termsAndConditions: '1. Payment is due within 15 days of invoice issue date.\n2. Overdue payments incur interest at 18% p.a.\n3. Subject to Mumbai Jurisdiction only.\n4. Computer generated invoice under GST rules, signature not required.',
    footerNote: 'This is a computer-generated tax invoice under GST rules and requires no physical signature.',
    signatoryName: 'Rahul Sharma',
    signatoryDesignation: 'Finance Officer',
    signatoryEmail: 'rahul@vmovexa.com',
    signatoryPhone: '+91 98765 88990',
    signatoryEmpId: 'FIN-101',
    signatorySignatureUrl: '',
    signatorySealUrl: '',
  });

  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);

  // Populate from backend settings
  useEffect(() => {
    let isMounted = true;
    setLoadingSettings(true);
    loadSettings()
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSettings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      const design = settings.invoice_design || settings.invoiceDesign || {};
      setFormData({
        companyName: settings.company_name || settings.companyName || 'VMOVEXA PRIVATE LIMITED',
        tradeName: settings.trade_name || settings.tradeName || 'VMOVEXA',
        gstin: settings.gstin || '27M4BCY934D12S',
        pan: settings.pan || 'AACCV1234F',
        email: settings.billing_email || settings.email || 'billing@vmovexa.com',
        phone: settings.billing_phone || settings.phone || '+91 98765 88990',
        website: settings.website || 'https://vmovexa.com',
        address: settings.address || '101, Business Hub, Bandra Kurla Complex, Mumbai, Maharashtra - 400051',
        bankName: settings.bank_name || settings.bankName || 'HDFC Bank Ltd',
        accountName: settings.account_name || settings.accountName || 'VMOVEXA PRIVATE LIMITED',
        accountNumber: settings.account_number || settings.accountNumber || '50200088219012',
        ifscCode: settings.ifsc_code || settings.ifscCode || 'HDFC0000123',
        branch: settings.branch || 'BKC Corporate Branch, Mumbai',
        upiId: settings.upi_id || settings.upiId || design.upiId || design.upi_id || 'vmovexa@hdfcbank',
        logoUrl: settings.logo_url || settings.logoUrl || '/logo/logo_clinet.png',
        termsAndConditions: settings.terms_and_conditions || settings.termsAndConditions || '1. Payment is due within 15 days of invoice issue date.\n2. Overdue payments incur interest at 18% p.a.\n3. Subject to Mumbai Jurisdiction only.\n4. Computer generated invoice under GST rules, signature not required.',
        footerNote: settings.footer_note || settings.footerNote || design.footerNote || 'This is a computer-generated tax invoice under GST rules and requires no physical signature.',
        signatoryName: settings.signatory_name || settings.signatoryName || 'Rahul Sharma',
        signatoryDesignation: settings.signatory_designation || settings.signatoryDesignation || 'Finance Officer',
        signatoryEmail: settings.signatory_email || settings.signatoryEmail || 'rahul@vmovexa.com',
        signatoryPhone: settings.signatory_phone || settings.signatoryPhone || '+91 98765 88990',
        signatoryEmpId: settings.signatory_emp_id || settings.signatoryEmpId || 'FIN-101',
        signatorySignatureUrl: settings.signatory_signature_url || settings.signatorySignatureUrl || design.signatureUrl || design.signatory_signature_url || '',
        signatorySealUrl: settings.signatory_seal_url || settings.signatorySealUrl || design.sealUrl || design.signatory_seal_url || '',
      });
    }
  }, [settings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadSettings();
      toast.success('Finance settings refreshed successfully');
    } catch {
      toast.error('Failed to refresh finance settings');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    setUploadingLogo(true);
    const toastId = toast.loading('Uploading brand logo asset...');
    try {
      const res = await uploadFile(file, 'branding');
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : null);
      if (url) {
        setFormData((prev) => ({ ...prev, logoUrl: url }));
        toast.success('Brand logo uploaded! Click Save to apply.', { id: toastId });
      } else {
        toast.error('Logo uploaded, but no valid URL was returned.', { id: toastId });
      }
    } catch {
      toast.error('Failed to upload logo asset.', { id: toastId });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    setUploadingSignature(true);
    const toastId = toast.loading('Uploading signatory signature asset...');
    try {
      const res = await uploadFile(file, 'signatures');
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : null);
      if (url) {
        setFormData((prev) => ({ ...prev, signatorySignatureUrl: url }));
        toast.success('Signature uploaded! Click Save to apply to invoices.', { id: toastId });
      } else {
        toast.error('Failed to get signature URL.', { id: toastId });
      }
    } catch {
      toast.error('Failed to upload signature.', { id: toastId });
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleSealUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }
    setUploadingSeal(true);
    const toastId = toast.loading('Uploading company seal asset...');
    try {
      const res = await uploadFile(file, 'stamps');
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : null);
      if (url) {
        setFormData((prev) => ({ ...prev, signatorySealUrl: url }));
        toast.success('Company seal uploaded! Click Save to apply to invoices.', { id: toastId });
      } else {
        toast.error('Failed to get seal URL.', { id: toastId });
      }
    } catch {
      toast.error('Failed to upload seal.', { id: toastId });
    } finally {
      setUploadingSeal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await toast.promise(
        updateSettings(formData),
        {
          loading: 'Saving corporate & invoice settings...',
          success: 'Corporate & invoice settings updated successfully!',
          error: (err) => err?.message || 'Failed to save finance settings',
        }
      );
      await loadSettings();
    } catch {
      /* Handled by toast */
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedLogo = formData.logoUrl.startsWith('http') || formData.logoUrl.startsWith('/logo/') || formData.logoUrl.startsWith('data:')
    ? formData.logoUrl
    : resolveFileUrl(formData.logoUrl);

  const resolvedSignature = formData.signatorySignatureUrl
    ? (formData.signatorySignatureUrl.startsWith('http') || formData.signatorySignatureUrl.startsWith('data:')
        ? formData.signatorySignatureUrl
        : resolveFileUrl(formData.signatorySignatureUrl))
    : null;

  const resolvedSeal = formData.signatorySealUrl
    ? (formData.signatorySealUrl.startsWith('http') || formData.signatorySealUrl.startsWith('data:')
        ? formData.signatorySealUrl
        : resolveFileUrl(formData.signatorySealUrl))
    : null;

  const tabs = [
    {
      id: 'vmovexa',
      label: 'Corporate Info',
      icon: <FleetIcons.Building className="w-4 h-4 shrink-0" />,
      tag: 'Legal Entity',
    },
    {
      id: 'banking',
      label: 'Bank Account',
      icon: <FleetIcons.Bank className="w-4 h-4 shrink-0" />,
      tag: 'Settlement',
    },
    {
      id: 'terms',
      label: 'Terms & Logo',
      icon: <FleetIcons.FileText className="w-4 h-4 shrink-0" />,
      tag: 'Invoicing',
    },
    {
      id: 'officer',
      label: 'Signatory Profile',
      icon: <FleetIcons.User className="w-4 h-4 shrink-0" />,
      tag: 'Authorized',
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <Breadcrumb
            items={[
              { label: basePath.startsWith('/superadmin') ? 'Super Admin' : 'Finance Portal', path: `${basePath}/dashboard` },
              { label: 'Finance Settings' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Finance Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage corporate entity profile, GST/PAN credentials, bank wire accounts, invoice branding & signatory authorization
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RefreshButton onClick={handleRefresh} loading={refreshing || loadingSettings} />
          <Link
            to={`${basePath}/invoices/design`}
            title="Customize Invoice Template & Design"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 text-xs font-bold rounded-xl border border-indigo-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Settings className="w-3.5 h-3.5" />
            <span>Invoice Designer</span>
          </Link>
        </div>
      </div>

      {/* Quick Nav to Personal Profile Settings */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <FleetIcons.User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Looking to update your Personal Profile & Photo?</span>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Manage your officer name, contact email, phone, avatar picture and system language.</p>
          </div>
        </div>
        <Link
          to={`${basePath}/profile/account`}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shrink-0 text-center shadow-2xs"
        >
          Edit Personal Profile →
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loadingSettings ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-2xl w-full" />
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded-xl w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Navigation Tab Bar */}
          <div className="w-full flex items-center gap-1.5 p-1.5 bg-slate-100/90 dark:bg-zinc-800/80 rounded-2xl border border-slate-200/80 dark:border-zinc-700/80 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs border border-slate-200/70 dark:border-zinc-700/70'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-zinc-700/60'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: VMOVEXA CORPORATE INFO */}
            {activeTab === 'vmovexa' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                      <FleetIcons.Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        VMOVEXA Corporate & Tax Registration
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Official registered company legal name, tax identifiers, and registered business address printed on all tax invoices
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900/40 self-start sm:self-auto">
                    GST Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Official Legal Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. VMOVEXA PRIVATE LIMITED"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 font-medium">
                      Standardized legal entity name used across client invoices and contract agreements.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Trade Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tradeName}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                      placeholder="e.g. VMOVEXA"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      VMOVEXA Corporate GSTIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      placeholder="27M4BCY934D12S"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Income Tax PAN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      placeholder="AACCV1234F"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Official Billing Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="billing@vmovexa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Billing Desk Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 88990"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Corporate Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://vmovexa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Registered Corporate Office Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Full postal address for tax and invoice generation"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BANKING DETAILS */}
            {activeTab === 'banking' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
                      <FleetIcons.Bank className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        VMOVEXA Bank Settlement Account Details
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Bank Wire, NEFT/RTGS, and UPI settlement destination printed on customer tax invoices
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40 self-start sm:self-auto">
                    Verified Payout
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank Ltd"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Account Beneficiary Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      placeholder="e.g. VMOVEXA PRIVATE LIMITED"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="50200088219012"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      IFSC Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="HDFC0000123"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Branch Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="e.g. BKC Corporate Branch, Mumbai"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Corporate UPI ID / VPA (Printed on QR Code)
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="e.g. vmovexa@hdfcbank"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      Scanned by Google Pay, PhonePe & Paytm on customer invoices
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TERMS & LOGO */}
            {activeTab === 'terms' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
                      <FleetIcons.FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Invoice Terms, Conditions & Corporate Logo
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Customize the official brand logo displayed on PDF tax invoices and standard terms of payment
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-900/40 self-start sm:self-auto">
                    Invoice Branding
                  </span>
                </div>

                {/* Quick Link to Invoice Designer */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Need to customize the full invoice layout, colors & templates?
                    </h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                      Customize Modern, Classic, Minimal and Bold layouts with live preview, QR codes, and section toggles.
                    </p>
                  </div>
                  <Link
                    to={`${basePath}/invoices/design`}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <span>Open Invoice Studio</span>
                    <span>→</span>
                  </Link>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
                      Corporate Brand Logo Asset <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Logo Preview box */}
                      <div className="p-3 bg-slate-900 dark:bg-black rounded-xl border border-slate-800 shrink-0 flex items-center justify-center w-full sm:w-44 h-16 shadow-inner">
                        <img
                          src={resolvedLogo}
                          alt="Logo Preview"
                          className="h-10 max-w-[150px] object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        <input
                          type="text"
                          required
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          placeholder="/logo/logo_clinet.png or https://..."
                          className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                        <div className="flex items-center gap-3">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/60 transition-colors">
                            <FleetIcons.Upload className="w-3.5 h-3.5" />
                            <span>Choose Logo Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                              disabled={uploadingLogo}
                            />
                          </label>
                          {uploadingLogo && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                              <FleetIcons.Spinner className="w-3.5 h-3.5" />
                              Uploading…
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Standard Invoice Terms & Conditions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.termsAndConditions}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                      placeholder="Specify payment deadlines, late fees, jurisdiction, etc."
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Invoice Bottom Disclaimer / Computer-Generated Statement
                    </label>
                    <input
                      type="text"
                      value={formData.footerNote}
                      onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                      placeholder="This is a computer-generated tax invoice under GST rules and requires no physical signature."
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                      Printed in italics at the bottom of the invoice terms block across all templates
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: OFFICER PROFILE */}
            {activeTab === 'officer' && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center shrink-0">
                      <FleetIcons.User className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        Authorized Signatory Profile & Official Seal
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                        Finance officer designated as the authorized signatory for computer-generated GST tax invoices
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-900/40 self-start sm:self-auto">
                    Authorized Signer
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Authorized Officer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signatoryName}
                      onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Official Designation
                    </label>
                    <input
                      type="text"
                      value={formData.signatoryDesignation}
                      onChange={(e) => setFormData({ ...formData, signatoryDesignation: e.target.value })}
                      placeholder="e.g. Chief Finance Officer / Finance Manager"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Employee ID / Officer Code
                    </label>
                    <input
                      type="text"
                      value={formData.signatoryEmpId}
                      onChange={(e) => setFormData({ ...formData, signatoryEmpId: e.target.value })}
                      placeholder="e.g. FIN-101"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Corporate Finance Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.signatoryEmail}
                      onChange={(e) => setFormData({ ...formData, signatoryEmail: e.target.value })}
                      placeholder="rahul@vmovexa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Desk / Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signatoryPhone}
                      onChange={(e) => setFormData({ ...formData, signatoryPhone: e.target.value })}
                      placeholder="+91 98765 88990"
                      className="w-full px-3.5 py-2.5 bg-slate-50/60 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Signatory Signature Asset Upload */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Signatory Fountain Pen / Ink Signature Image
                    </label>
                    <div className="flex items-center gap-3">
                      {resolvedSignature && (
                        <div className="p-1.5 bg-white border border-slate-200 rounded-lg shrink-0 h-12 w-28 flex items-center justify-center shadow-xs">
                          <img src={resolvedSignature} alt="Signature Preview" className="h-9 w-auto object-contain" />
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800/60 transition-colors">
                        <FleetIcons.Upload className="w-3.5 h-3.5" />
                        <span>{formData.signatorySignatureUrl ? 'Change Signature' : 'Upload Signature'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSignatureUpload}
                          disabled={uploadingSignature}
                        />
                      </label>
                      {uploadingSignature && (
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <FleetIcons.Spinner className="w-3.5 h-3.5" /> Uploading…
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">If uploaded, overrides the default SVG signature on invoices</p>
                  </div>

                  {/* Corporate Rubber Stamp / Seal Upload */}
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Corporate Stamp / Accounts Seal Image
                    </label>
                    <div className="flex items-center gap-3">
                      {resolvedSeal && (
                        <div className="p-1 bg-white border border-slate-200 rounded-lg shrink-0 h-12 w-12 flex items-center justify-center shadow-xs">
                          <img src={resolvedSeal} alt="Seal Preview" className="h-10 w-auto object-contain" />
                        </div>
                      )}
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold border border-purple-200 dark:border-purple-800/60 transition-colors">
                        <FleetIcons.Upload className="w-3.5 h-3.5" />
                        <span>{formData.signatorySealUrl ? 'Change Seal' : 'Upload Stamp'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleSealUpload}
                          disabled={uploadingSeal}
                        />
                      </label>
                      {uploadingSeal && (
                        <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                          <FleetIcons.Spinner className="w-3.5 h-3.5" /> Uploading…
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">If uploaded, overrides the default SVG accounts stamp on invoices</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <Link
                to={`${basePath}/dashboard`}
                className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting || loadingSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <FleetIcons.Spinner className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <FleetIcons.Check className="w-4 h-4 text-white" />
                )}
                <span>{submitting ? 'Saving Changes…' : 'Save Settings & Update Invoices'}</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default FinanceAccountSettingsPage;

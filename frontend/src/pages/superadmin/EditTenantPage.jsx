import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { LocationAutocompleteInput } from '../../components/ui/LocationAutocompleteInput';
import { useOrganization } from '../../hooks/superadmin/useOrganization';
import billingService from '../../api/services/billing.service';
import uploadService from '../../api/services/shared/upload.service';
import { INDIAN_STATES_AND_UTS, PRESET_AVATARS } from './OnboardTenantPage';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const EditTenantPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { loadOrganization, updateOrganization } = useOrganization();

  const basePath = location.pathname.startsWith('/finance/subscriptions')
    ? '/finance/subscriptions'
    : location.pathname.startsWith('/superadmin/finance/subscriptions')
    ? '/superadmin/finance/subscriptions'
    : '/superadmin/tenants';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const [formData, setFormData] = useState({
    adminId: null,
    name: '',
    logoUrl: '',
    state: 'Maharashtra',
    city: '',
    cin: '',
    gstin: '',
    officeAddress: '',
    pincode: '',
    latitude: null,
    longitude: null,
    placeId: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    planId: null,
    planName: 'Standard',
    busesCount: '0',
    depotsCount: '0',
    adRevenueShareRate: '0',
    mrr: '0',
    status: 'active',
    paymentMode: 'offline',
    bankRef: '',
    bankName: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    acceptContract: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingPlans(true);
      const [orgData, plansData] = await Promise.all([
        loadOrganization(id),
        billingService.getPlans().catch(() => []),
      ]);

      if (plansData) setPlans(plansData);

      if (orgData) {
        const primaryAdmin = orgData.primaryAdmin
          || (Array.isArray(orgData.users) ? orgData.users.find((u) => u.role?.code === 'ROLE-TENANT-ADMIN' || u.role_id === 2) || orgData.users[0] : null)
          || {};
        const matchedPlan = plansData?.find((p) => String(p.id) === String(orgData.plan_id));

        setFormData({
          adminId: primaryAdmin.id || null,
          name: orgData.name || '',
          logoUrl: orgData.logo_url || '',
          state: orgData.state || 'Maharashtra',
          city: orgData.city || '',
          cin: orgData.cin || '',
          gstin: orgData.gstin || '',
          officeAddress: orgData.office_address || '',
          pincode: orgData.pincode || '',
          latitude: orgData.latitude != null ? orgData.latitude : null,
          longitude: orgData.longitude != null ? orgData.longitude : null,
          placeId: '',
          adminName: primaryAdmin.name || '',
          adminEmail: primaryAdmin.email || '',
          adminPhone: primaryAdmin.phone || '',
          adminPassword: '',
          planId: orgData.plan_id ? orgData.plan_id : null,
          planName: matchedPlan?.name || orgData.plan?.name || 'Standard',
          busesCount: orgData.buses_quota != null ? String(orgData.buses_quota) : '0',
          depotsCount: orgData.depots_count != null ? String(orgData.depots_count) : '0',
          adRevenueShareRate: orgData.ad_revenue_share_rate != null ? String(orgData.ad_revenue_share_rate) : '0',
          mrr: orgData.mrr != null ? String(orgData.mrr) : '0',
          status: orgData.status || 'active',
          paymentMode: 'offline',
          bankRef: '',
          bankName: '',
          amount: orgData.mrr != null ? String(orgData.mrr) : '',
          paymentDate: new Date().toISOString().split('T')[0],
          acceptContract: true,
        });
      }
    } catch (err) {
      toast.error('Failed to load tenant details: ' + (err?.message || 'Error'));
    } finally {
      setLoading(false);
      setLoadingPlans(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    toast.success('Image selected! It will be uploaded upon saving changes.');
  };

  const handleSelectPresetAvatar = (avatarUrl) => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormData((prev) => ({ ...prev, logoUrl: avatarUrl }));
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleLocationSelect = (displayName, lat, lng, fullAddress, parsed) => {
    const targetAddress = fullAddress || displayName || '';

    setFormData((prev) => {
      const updated = {
        ...prev,
        officeAddress: targetAddress,
      };

      if (parsed) {
        if (parsed.city) updated.city = parsed.city;
        if (parsed.state) {
          const matched = INDIAN_STATES_AND_UTS.find(
            (s) => s.toLowerCase() === parsed.state.toLowerCase()
          );
          updated.state = matched || parsed.state;
        }
        if (parsed.pincode) {
          updated.pincode = String(parsed.pincode).replace(/\D/g, '').slice(0, 6);
        }
        if (parsed.place_id) updated.placeId = parsed.place_id;
        if (lat != null) updated.latitude = Number(lat);
        if (lng != null) updated.longitude = Number(lng);
      } else {
        if (lat != null) updated.latitude = Number(lat);
        if (lng != null) updated.longitude = Number(lng);
      }
      return updated;
    });
  };

  const handleDigitsOnlyChange = (field, value) => {
    if (value === '' || /^\d+$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: null }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: 'Only numbers allowed' }));
    }
  };

  const handleSelectPlan = (p) => {
    const basePrice = Number(p.monthly_price) || 0;
    setFormData((prev) => ({
      ...prev,
      planId: p.id,
      planName: p.name,
      busesCount: String(p.buses_limit || prev.busesCount || 25),
      depotsCount: String(p.features?.depots_limit || prev.depotsCount || 2),
      adRevenueShareRate: String(p.ad_revenue_share_rate || prev.adRevenueShareRate || 65),
      amount: String(basePrice),
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!formData.name?.trim()) {
        toast.error('Company Name is required.');
        return;
      }
      if (!formData.city?.trim()) {
        toast.error('City is required.');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
        toast.error('Please enter a valid admin email address.');
        return;
      }
      if (formData.adminPhone && formData.adminPhone.trim().length > 0) {
        const cleanPhone = formData.adminPhone.trim();
        if (cleanPhone.length < 10) {
          toast.error('Mobile phone number must be at least 10 digits.');
          return;
        }
      }
      if (formData.adminPassword && formData.adminPassword.length < 6) {
        toast.error('New password must be at least 6 characters.');
        return;
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Company Name is required.');
      setCurrentStep(1);
      return;
    }
    if (!formData.city?.trim()) {
      toast.error('City is required.');
      setCurrentStep(1);
      return;
    }
    if (!formData.adminName?.trim()) {
      toast.error('Admin Full Name is required.');
      setCurrentStep(2);
      return;
    }
    if (!formData.adminEmail?.trim()) {
      toast.error('Admin Email is required.');
      setCurrentStep(2);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail.trim())) {
      toast.error('Please enter a valid admin email address.');
      setCurrentStep(2);
      return;
    }
    if (formData.adminPhone && formData.adminPhone.trim().length > 0) {
      const cleanPhone = formData.adminPhone.trim();
      if (cleanPhone.length < 10) {
        toast.error('Mobile phone number must be at least 10 digits.');
        setCurrentStep(2);
        return;
      }
    }
    if (formData.adminPassword && formData.adminPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      setCurrentStep(2);
      return;
    }

    let finalLogoUrl = formData.logoUrl || null;

    if (logoFile) {
      const uploadToastId = toast.loading('Uploading company logo...');
      try {
        setUploadingLogo(true);
        const res = await uploadService.uploadFile(logoFile, 'logos');
        if (res?.url) {
          finalLogoUrl = res.url;
          setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        }
        toast.dismiss(uploadToastId);
      } catch (err) {
        toast.dismiss(uploadToastId);
        setUploadingLogo(false);
        toast.error('Failed to upload logo: ' + (err?.message || 'Upload error'));
        return;
      } finally {
        setUploadingLogo(false);
      }
    }

    const payload = {
      name: formData.name.trim(),
      logo_url: finalLogoUrl,
      logoUrl: finalLogoUrl,
      state: formData.state || null,
      city: formData.city ? formData.city.trim() : null,
      cin: formData.cin ? formData.cin.trim() : null,
      gstin: formData.gstin ? formData.gstin.trim() : null,
      office_address: formData.officeAddress ? formData.officeAddress.trim() : null,
      officeAddress: formData.officeAddress ? formData.officeAddress.trim() : null,
      pincode: formData.pincode ? formData.pincode.trim() : null,
      latitude: formData.latitude != null && formData.latitude !== '' ? Number(formData.latitude) : null,
      longitude: formData.longitude != null && formData.longitude !== '' ? Number(formData.longitude) : null,
      plan_id: formData.planId ? Number(formData.planId) : null,
      planId: formData.planId ? Number(formData.planId) : null,
      buses_quota: formData.busesCount !== '' ? Number(formData.busesCount) : 0,
      busesCount: formData.busesCount !== '' ? Number(formData.busesCount) : 0,
      depots_count: formData.depotsCount !== '' ? Number(formData.depotsCount) : 0,
      depotsCount: formData.depotsCount !== '' ? Number(formData.depotsCount) : 0,
      ad_revenue_share_rate: formData.adRevenueShareRate !== '' ? Number(formData.adRevenueShareRate) : 0,
      adRevenueShareRate: formData.adRevenueShareRate !== '' ? Number(formData.adRevenueShareRate) : 0,
      mrr: formData.mrr !== '' ? Number(formData.mrr) : 0,
      status: formData.status,
      // Admin user account fields
      adminId: formData.adminId || null,
      adminName: formData.adminName ? formData.adminName.trim() : '',
      adminEmail: formData.adminEmail ? formData.adminEmail.trim().toLowerCase() : '',
      adminPhone: formData.adminPhone ? formData.adminPhone.trim() : '',
      adminPassword: formData.adminPassword ? formData.adminPassword.trim() : '',
    };

    try {
      setSaving(true);
      await toast.promise(
        updateOrganization(id, payload),
        {
          loading: 'Saving tenant changes...',
          success: 'Tenant updated successfully!',
          error: (err) => err?.message || 'Failed to update tenant.',
        }
      );
      navigate(`${basePath}/${id}`);
    } catch (_) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  const displayLogoUrl = logoPreview || (formData.logoUrl ? getMediaUrl(formData.logoUrl) : '');

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Standard Reusable Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'SuperAdmin', to: '/superadmin/dashboard' },
          { label: 'Tenants', to: basePath },
          { label: 'Edit Tenant Details' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Edit Tenant Details
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Update company profile, logo, location, plan limits, and account status
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full self-start sm:self-auto">
          Step {currentStep} of 4
        </span>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Company Info', desc: 'Name, Logo & Address' },
            { step: 2, title: 'Admin Account', desc: 'Admin User Info' },
            { step: 3, title: 'Plan & Billing', desc: 'Plan Quotas & Status' },
            { step: 4, title: 'Review & Save', desc: 'Confirm Changes' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                currentStep === s.step
                  ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white text-slate-900'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: COMPANY INFO */}
      {currentStep === 1 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Organization Details
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Company profile, logo, location, and tax registration numbers
            </p>
          </div>

          {/* Logo Upload & Avatar Picker Section */}
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">Company Logo / Profile Avatar</label>
              <span className="text-[10px] text-slate-400 font-medium">Select custom image or preset avatar</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Main Avatar Preview */}
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
                {displayLogoUrl ? (
                  <img
                    src={displayLogoUrl}
                    alt="Tenant Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center text-white font-bold text-xl shadow-inner"
                  style={{ display: displayLogoUrl ? 'none' : 'flex' }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : '🏢'}
                </div>
              </div>

              {/* Upload & Action Controls */}
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5">
                    <FleetIcons.Plus className="w-3.5 h-3.5" />
                    {displayLogoUrl ? 'Change Image' : 'Select Image'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>

                  {displayLogoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-medium border border-red-200 dark:border-red-800 transition-colors"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                {logoFile ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate max-w-[200px]" title={logoFile.name}>
                      {logoFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({(logoFile.size / 1024).toFixed(0)} KB) — Ready to upload on save
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400">PNG, JPG, WebP or SVG images allowed (Max 5MB)</p>
                )}
              </div>
            </div>

            {/* Quick Pick Preset Avatars */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-zinc-700/70 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Quick Select Preset Avatar:
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected = !logoFile && formData.logoUrl === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(avatar.url)}
                      title={avatar.title}
                      className={`w-9 h-9 rounded-xl border-2 transition-all shrink-0 overflow-hidden flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-400/50 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-700 hover:border-blue-300 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.title} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Maharashtra State Road Transport Corp"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <LocationAutocompleteInput
                label="Office Address"
                value={formData.officeAddress}
                coords={{ lat: formData.latitude, lng: formData.longitude }}
                placeholder="Search headquarters, depot, station, or enter address manually..."
                onChange={handleLocationSelect}
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex flex-wrap items-center justify-between gap-1">
                <span>Search via Google Maps or enter address manually. Selecting an address auto-fills City, State, and Pincode below.</span>
                {formData.latitude && formData.longitude && (
                  <span className="font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    GPS: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">State / Union Territory *</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
              >
                {INDIAN_STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pincode (6 Digits)</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, pincode: val });
                }}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">6-digit postal area code</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">CIN Number</label>
              <input
                type="text"
                placeholder="e.g. U60200MH2021PTC109921"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">GSTIN (15 Digits)</label>
              <input
                type="text"
                placeholder="e.g. 27AAACM1234F1Z8"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Next Step: Admin Account</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: ADMIN ACCOUNT */}
      {currentStep === 2 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Admin User Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Primary admin user credentials and contact details for this tenant organization
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Email *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@company.com"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Used for platform login and critical email notifications</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mobile Phone
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="9820012345"
                value={formData.adminPhone}
                onChange={(e) => handleDigitsOnlyChange('adminPhone', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.adminPhone && <p className="text-[10px] text-red-500 mt-1">{errors.adminPhone}</p>}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">10-digit number for SMS notifications and alerts</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Change Password (Optional)</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep existing password"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-xs font-bold"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Only enter a new password if you want to reset it</p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>Next Step: Plan & Quotas</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PLAN & BILLING */}
      {currentStep === 3 && (
        <form onSubmit={handleNext} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Subscription Plan, Quotas & Account Status
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Update plan tier, bus/depot limits, revenue share, and account status
            </p>
          </div>

          {/* Account Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Status *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full sm:w-64 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Plan Selection Cards */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Plan Tier *</label>
            {loadingPlans ? (
              <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading plans...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const isSelected = formData.planId === p.id;
                  const f = p.features || {};
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlan(p)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-950/30 ring-2 ring-blue-100 dark:ring-blue-900 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{p.name}</span>
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        ₹{Number(p.monthly_price).toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">(GST Included)</span>
                      </div>
                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <p><strong>{p.buses_limit ? `${p.buses_limit} Buses` : 'Unlimited Buses'}</strong> Quota</p>
                        <p>{f.depots_limit || 2} Depots</p>
                        <p>Ad Rev Share: <strong>{p.ad_revenue_share_rate || 65}%</strong></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quotas & Revenue Share inputs as text with validation */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Buses Quota *</label>
              <input
                type="text"
                required
                value={formData.busesCount}
                onChange={(e) => handleDigitsOnlyChange('busesCount', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              {errors.busesCount && <p className="text-[10px] text-red-500 mt-1">{errors.busesCount}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Depots Count *</label>
              <input
                type="text"
                required
                value={formData.depotsCount}
                onChange={(e) => handleDigitsOnlyChange('depotsCount', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              {errors.depotsCount && <p className="text-[10px] text-red-500 mt-1">{errors.depotsCount}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ad Rev Share (%) *</label>
              <input
                type="text"
                required
                value={formData.adRevenueShareRate}
                onChange={(e) => handleDigitsOnlyChange('adRevenueShareRate', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              {errors.adRevenueShareRate && <p className="text-[10px] text-red-500 mt-1">{errors.adRevenueShareRate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">MRR Amount (₹) *</label>
              <input
                type="text"
                required
                value={formData.mrr}
                onChange={(e) => handleDigitsOnlyChange('mrr', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              {errors.mrr && <p className="text-[10px] text-red-500 mt-1">{errors.mrr}</p>}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <span>Next Step: Review & Save</span>
              <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: REVIEW & SAVE */}
      {currentStep === 4 && (
        <form onSubmit={handleFinish} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              4. Review & Save Tenant Changes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Review updated tenant configuration before saving to database
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
            {displayLogoUrl && (
              <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <img src={displayLogoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-white block">Company Logo Selected</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {logoFile
                      ? `Custom image: ${logoFile.name} (${(logoFile.size / 1024).toFixed(0)} KB) — will upload on save`
                      : 'Avatar / Preset logo selected'}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Organization Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Location:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.city}, {formData.state}</span>
            </div>
            {formData.officeAddress && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Office Address:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[280px] text-right truncate">{formData.officeAddress}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Pincode:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.pincode || 'Not provided'}</span>
            </div>
            {formData.cin && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">CIN:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.cin}</span>
              </div>
            )}
            {formData.gstin && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">GSTIN:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.gstin}</span>
              </div>
            )}
            {formData.latitude && formData.longitude && (
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">GPS Coordinates:</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                  {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                </span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Admin Full Name:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.adminName || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Admin Email:</span>
              <span className="font-mono font-bold text-blue-700 dark:text-blue-400">{formData.adminEmail || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Admin Mobile Phone:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formData.adminPhone || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Password Status:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formData.adminPassword ? '•••••••• (Will be updated)' : 'Kept unchanged'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Plan Selected:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.planName} ({formData.busesCount} Buses Quota)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Depots & Rev Share:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formData.depotsCount} Depots | {formData.adRevenueShareRate}% Share</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Account Status:</span>
              <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 uppercase">
                {formData.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors text-center w-full sm:w-auto"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <FleetIcons.Check className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Tenant Changes'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditTenantPage;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperAdvertiser } from '../../hooks/superadmin/useSuperAdvertiser';
import { superAdvertiserService } from '../../api/services/superadmin/advertiser.service';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { getMediaUrl } from '../../utils/media';
import { LocationAutocompleteInput } from '../../components/ui/LocationAutocompleteInput';
import toast from 'react-hot-toast';

const INDUSTRY_CATEGORIES = [
  'FMCG & Consumer Goods',
  'Quick Commerce & Food Delivery',
  'FinTech, Banking & Insurance',
  'Automobile & Electric Vehicles',
  'Telecommunications & Tech',
  'Healthcare & Pharmaceuticals',
  'Real Estate & Infrastructure',
  'E-Commerce & Fashion Retail',
  'Entertainment & OTT Media',
  'Government & Public Sector',
  'Education & EdTech',
  'Travel, Hospitality & Aviation',
  'Media, Advertising & PR Agency',
  'Other / Freelance Creator',
];

const ADVERTISER_DOC_CATEGORIES = [
  'GST Registration Certificate',
  'Company PAN Card',
  'Certificate of Incorporation (RoC)',
  'Master Services Agreement (MSA)',
  'Identity & Address Proof',
  'Other Business Document',
];

export const OnboardAdvertiserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { createAdvertiser, updateAdvertiser } = useSuperAdvertiser();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    designation: '',
    email: '',
    phone: '',
    password: '',
    category: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: null,
    longitude: null,
    website: '',
    billingEmail: '',
    notes: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Logo / Avatar state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [existingLogo, setExistingLogo] = useState('');
  const logoInputRef = useRef(null);

  // Staged Documents state (selected locally, uploaded only upon form submit)
  const [documents, setDocuments] = useState([]);
  const [removedDocIds, setRemovedDocIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(ADVERTISER_DOC_CATEGORIES[0]);
  const docFileInputRef = useRef(null);

  // Fetch existing advertiser data in edit mode
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    setLoadingInitial(true);

    superAdvertiserService.getAdvertiser(id)
      .then((adv) => {
        if (!isMounted || !adv) return;

        setFormData({
          companyName: adv.company_name || '',
          name: adv.contact_name || adv.user?.name || adv.name || '',
          designation: adv.designation || adv.user?.department || '',
          email: adv.email || adv.user?.email || '',
          phone: adv.phone || adv.user?.phone || '',
          password: '', // Don't prefill password
          category: adv.business_type || '',
          gstin: adv.gstin || '',
          pan: adv.pan || '',
          address: adv.address || '',
          city: adv.city || '',
          state: adv.state || '',
          pincode: adv.pincode || '',
          country: adv.country || 'India',
          placeId: adv.place_id || '',
          latitude: adv.latitude != null ? Number(adv.latitude) : null,
          longitude: adv.longitude != null ? Number(adv.longitude) : null,
          website: adv.website || '',
          billingEmail: adv.billing_email || '',
          notes: '',
        });

        const logo = adv.user?.avatar_url || adv.avatar_url || adv.logo_url || adv.user?.avatarUrl || adv.avatarUrl || adv.logoUrl;
        if (logo) setExistingLogo(logo);

        if (Array.isArray(adv.documents)) {
          setDocuments(
            adv.documents.map((d) => ({
              id: d.id,
              name: d.file_name || d.fileName || d.storage_key?.split('/')?.pop() || `Document #${d.id}`,
              category: d.purpose || d.category || 'GST Registration Certificate',
              url: d.url,
              size: d.size,
              formattedSize: d.size ? `${(Number(d.size) / 1024).toFixed(1)} KB` : '',
              type: d.mime || 'application/pdf',
              verified: Boolean(d.status === 'verified'),
              isExisting: true,
              isPending: false,
            }))
          );
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load advertiser details.');
        navigate('/superadmin/advertisers');
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, navigate]);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    const generated = `Adv#${rand}`;
    setFormData((prev) => ({ ...prev, password: generated }));
    toast.success(`Generated secure password: ${generated}`);
  };

  // Handle Logo Select (staged locally)
  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Brand logo must be less than 5 MB.');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    setExistingLogo('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Handle Document Selection (staged locally - NOT uploaded until form submit)
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error(`File "${file.name}" exceeds 15 MB limit.`);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
      return;
    }

    // Check if category is already picked
    const alreadySelected = documents.find((d) => d.category === selectedCategory);
    if (alreadySelected) {
      toast.error(`"${selectedCategory}" is already added. Remove it first to replace.`);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
      return;
    }

    const newDoc = {
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      category: selectedCategory,
      size: file.size,
      formattedSize: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || 'application/pdf',
      isPending: true,
      isExisting: false,
    };

    setDocuments((prev) => [...prev, newDoc]);
    toast.success(`"${file.name}" added. Will upload when you submit.`);
    if (docFileInputRef.current) docFileInputRef.current.value = '';

    // Switch to next available category
    const remainingCats = ADVERTISER_DOC_CATEGORIES.filter(
      (c) => c !== selectedCategory && !documents.some((d) => d.category === c)
    );
    if (remainingCats.length > 0) {
      setSelectedCategory(remainingCats[0]);
    }
  };

  const handleRemoveDoc = (docToRemove) => {
    if (docToRemove.isExisting) {
      setRemovedDocIds((prev) => [...new Set([...prev, docToRemove.id])]);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docToRemove.id));
    toast.success('Document removed');
  };

  // Location selection handler for Google Places Autocomplete
  const handleLocationSelect = (displayName, lat, lng, fullAddress, parsed) => {
    setFormData((prev) => ({
      ...prev,
      address: fullAddress || displayName || prev.address,
      city: parsed?.city || prev.city,
      state: parsed?.state || prev.state,
      pincode: parsed?.pincode || prev.pincode,
      country: parsed?.country || prev.country || 'India',
      placeId: parsed?.place_id || prev.placeId,
      latitude: lat != null ? Number(lat) : prev.latitude,
      longitude: lng != null ? Number(lng) : prev.longitude,
    }));
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Full Name (required)
    if (!formData.name || formData.name.trim().length < 2) {
      toast.error('Please enter the full name (at least 2 characters).');
      return;
    }

    // 2. Validate Email Address (required, valid format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address for account access and notifications.');
      return;
    }

    // 3. Validate Phone Number (required, at least 10 digits)
    const cleanDigits = (formData.phone || '').replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      toast.error('Please enter a valid 10-digit mobile phone number for SMS notifications.');
      return;
    }

    // 4. Validate Password in create mode
    if (!isEdit && (!formData.password || formData.password.trim().length < 6)) {
      toast.error('Password must be at least 6 characters. You can click "Generate Password" to create one automatically.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload Logo if a new file was chosen
      let finalLogoUrl = existingLogo;
      if (logoFile) {
        const uploadToastId = toast.loading('Uploading brand logo...');
        try {
          const logoRes = await superAdvertiserService.uploadLogo(logoFile);
          finalLogoUrl = logoRes?.url || logoRes?.public_url || '';
          toast.dismiss(uploadToastId);
        } catch (uploadErr) {
          toast.dismiss(uploadToastId);
          toast.error('Failed to upload brand logo: ' + (uploadErr?.message || 'Server error'));
          setSubmitting(false);
          return;
        }
      }

      // 2. Upload Staged Documents now on Submit
      const pendingDocs = documents.filter((d) => d.isPending && d.file);
      const newlyUploadedDocs = [];
      if (pendingDocs.length > 0) {
        const docToastId = toast.loading(`Uploading ${pendingDocs.length} verification document(s)...`);
        try {
          for (const doc of pendingDocs) {
            const res = await uploadFile(doc.file, 'advertiser_kyc');
            const fileUrl = res?.url || res?.filePath || res;
            newlyUploadedDocs.push({
              url: fileUrl,
              purpose: doc.category || 'Business Document',
              name: doc.name,
              size: doc.size,
              fileType: doc.type,
              key: res?.key || null,
            });
          }
          toast.dismiss(docToastId);
        } catch (docErr) {
          toast.dismiss(docToastId);
          toast.error('Failed to upload document: ' + (docErr?.message || 'Upload error'));
          setSubmitting(false);
          return;
        }
      }

      // 3. Create or Update Advertiser
      if (isEdit) {
        const updatePayload = {
          companyName: formData.companyName.trim() || null,
          name: formData.name.trim(),
          designation: formData.designation.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          category: formData.category || 'Other',
          gstin: formData.gstin.trim() || null,
          pan: formData.pan.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          pincode: formData.pincode.trim() || null,
          country: formData.country.trim() || 'India',
          placeId: formData.placeId || null,
          latitude: formData.latitude != null && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
          longitude: formData.longitude != null && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
          website: formData.website.trim() || null,
          billingEmail: formData.billingEmail.trim() || formData.email.trim(),
          avatar_url: finalLogoUrl,
          logo_url: finalLogoUrl,
          avatarUrl: finalLogoUrl,
          logoUrl: finalLogoUrl,
          newDocuments: newlyUploadedDocs,
          removedDocumentIds: removedDocIds,
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await toast.promise(
          updateAdvertiser(id, updatePayload),
          {
            loading: 'Updating advertiser...',
            success: 'Advertiser updated successfully!',
            error: (err) => err?.message || 'Failed to update advertiser.',
          }
        );
      } else {
        const createPayload = {
          companyName: formData.companyName.trim() || null,
          name: formData.name.trim(),
          designation: formData.designation.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password || 'Adv@12345',
          category: formData.category || 'Other',
          gstin: formData.gstin.trim() || null,
          pan: formData.pan.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          pincode: formData.pincode.trim() || null,
          country: formData.country.trim() || 'India',
          placeId: formData.placeId || null,
          latitude: formData.latitude != null && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
          longitude: formData.longitude != null && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
          website: formData.website.trim() || null,
          billingEmail: formData.billingEmail.trim() || formData.email.trim(),
          avatar_url: finalLogoUrl,
          logo_url: finalLogoUrl,
          avatarUrl: finalLogoUrl,
          logoUrl: finalLogoUrl,
          documents: newlyUploadedDocs,
        };

        await toast.promise(
          createAdvertiser(createPayload),
          {
            loading: 'Creating advertiser...',
            success: 'Advertiser created! Login details sent via Email & SMS.',
            error: (err) => err?.message || 'Failed to create advertiser.',
          }
        );
      }

      navigate('/superadmin/advertisers');
    } catch (_) {
      // Toast handled
    } finally {
      setSubmitting(false);
    }
  };

  const activeLogoSrc = logoPreview || (existingLogo ? getMediaUrl(existingLogo) : '');

  if (loadingInitial) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading advertiser data...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation Header Banner */}
      <div className="w-full p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Link to="/superadmin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <FleetIcons.Dashboard className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <Link to="/superadmin/advertisers" className="text-blue-600 dark:text-blue-400 hover:underline">
            Advertisers
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {isEdit ? 'Edit Advertiser' : 'New Advertiser'}
          </span>
        </nav>

        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => navigate('/superadmin/advertisers')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Advertisers"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Advertiser' : 'New Advertiser'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
              {isEdit
                ? 'Update advertiser profile, contact person, and location details.'
                : 'Add a new advertiser account with login credentials.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Onboarding / Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Identification & Login Details (Top Section) */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
                <FleetIcons.Profile className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Personal Identification
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Account holder name, designation, and portal login credentials.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-full">
              LOGIN DETAILS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Malhotra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Designation
                </label>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Marketing Manager, Creator, Media Buyer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. vikram@brand.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Mobile Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +91 98200 11223"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {isEdit ? 'Reset Password (optional)' : 'Password *'}
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FleetIcons.Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Generate Password</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password (min 6 characters)'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                {isEdit
                  ? 'Leave blank to keep current password.'
                  : 'Credentials will be sent to the advertiser via email and SMS.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Business Details (Optional) */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <FleetIcons.Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Business Details (Optional)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Company name, industry category, website, and brand logo
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>

          {/* Brand Logo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden border-2 border-purple-500">
              {activeLogoSrc ? (
                <img
                  src={activeLogoSrc}
                  alt="Brand Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = formData.companyName
                        ? formData.companyName.charAt(0).toUpperCase()
                        : formData.name ? formData.name.charAt(0).toUpperCase() : 'A';
                    }
                  }}
                />
              ) : (
                formData.companyName
                  ? formData.companyName.charAt(0).toUpperCase()
                  : formData.name ? formData.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoSelect}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FleetIcons.Building className="w-3.5 h-3.5" />
                  <span>{activeLogoSrc ? 'Change Logo' : 'Upload Logo'}</span>
                </button>
                {activeLogoSrc && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Supports PNG, JPG, WEBP (Max 5 MB).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Company Name
                </label>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Acme Media (optional)"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                Optional. Leave blank for individual creators or freelancers.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Industry
                </label>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry (Optional)</option>
                {INDUSTRY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Website
                </label>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <input
                type="url"
                placeholder="e.g. https://brand.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Location & Address */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  3. Location & Address
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Search address to auto-fill city, state, pincode, and coordinates
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full flex items-center gap-1">
              <FleetIcons.Pin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>GOOGLE MAPS</span>
            </span>
          </div>

          <div className="space-y-4">
            {/* Google Places Autocomplete Bar */}
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40">
              <LocationAutocompleteInput
                label="Search Location / Address"
                value={formData.address}
                coords={{ lat: formData.latitude, lng: formData.longitude }}
                placeholder="Search area, landmark, or street name..."
                onChange={handleLocationSelect}
              />
              <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1.5 flex items-center gap-1 font-medium">
                <FleetIcons.Speed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Select an address suggestion to auto-fill the fields below.</span>
              </p>
            </div>

            {/* Location Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Street / building / area address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gurugram"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Haryana"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 122002"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 28.4908"
                  value={formData.latitude ?? ''}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="e.g. 77.0898"
                  value={formData.longitude ?? ''}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Tax & Invoicing (Optional) */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                <FleetIcons.CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  4. Tax & Billing (Optional)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  GSTIN, PAN number, and invoicing email
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                GST Number
              </label>
              <input
                type="text"
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                PAN Number
              </label>
              <input
                type="text"
                placeholder="e.g. AABBC1234D"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Billing Email
              </label>
              <input
                type="email"
                placeholder="e.g. billing@brand.com"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Verification Documents (Driver portal design, upload-on-submit) */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                <FleetIcons.Document className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  5. Verification Documents (Optional)
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Documents are selected here and will be uploaded automatically upon submitting the form.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>

          <div className="space-y-3.5 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 bg-slate-50/60 dark:bg-zinc-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <FleetIcons.Document className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Attached Verification Documents</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-bold">
                    {documents.length} File(s)
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Select a category and choose a file. Files will be uploaded when you click "{isEdit ? 'Save Changes' : 'Create Advertiser'}".
                </p>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-zinc-200 focus:outline-none cursor-pointer"
                >
                  {ADVERTISER_DOC_CATEGORIES.map((c) => {
                    const isAdded = documents.some((d) => d.category === c);
                    return (
                      <option
                        key={c}
                        value={c}
                        disabled={isAdded}
                        className={isAdded ? 'text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800 font-normal' : ''}
                      >
                        {c} {isAdded ? '(Added)' : ''}
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    if (documents.some((d) => d.category === selectedCategory)) {
                      toast.error(`"${selectedCategory}" is already added. Remove it first to choose a different file.`);
                      return;
                    }
                    docFileInputRef.current?.click();
                  }}
                  disabled={ADVERTISER_DOC_CATEGORIES.every((c) => documents.some((d) => d.category === c))}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <FleetIcons.Plus className="w-3.5 h-3.5" />
                  <span>Attach Document</span>
                </button>
                <input
                  ref={docFileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={handleFilePicked}
                  className="hidden"
                />
              </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-zinc-500 font-medium text-xs bg-white dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 border-dashed">
                No documents attached yet. Select a category and click "Attach Document".
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documents.map((doc) => {
                  const fullUrl = doc.url ? resolveFileUrl(doc.url) : '';

                  return (
                    <div
                      key={doc.id}
                      className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                          <FleetIcons.Document className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-xs truncate" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {doc.category || 'Document'}
                            </span>
                            {doc.formattedSize && (
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                {doc.formattedSize}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.isPending ? (
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <FleetIcons.Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" /> Ready to upload on submit
                              </span>
                            ) : (
                              <>
                                {fullUrl && (
                                  <a
                                    href={fullUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    View / Download
                                  </a>
                                )}
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                  Saved <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc)}
                        className="w-6 h-6 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center font-bold text-xs transition-colors shrink-0 cursor-pointer"
                        title="Remove document"
                      >
                        <FleetIcons.Close className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Section 6: Automatic Notifications Notice */}
        <div className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <FleetIcons.Bell className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200">
                {isEdit ? 'Account Details Updated' : 'Automatic Notifications'}
              </h4>
              <p className="text-xs text-purple-800 dark:text-purple-300 mt-0.5 leading-relaxed">
                {isEdit
                  ? 'Saving changes will update the advertiser profile, contact details, and location immediately.'
                  : 'When created, the advertiser account will be active and login details will be sent automatically:'}
              </p>
            </div>

            {!isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-medium text-purple-900 dark:text-purple-200">
                <div className="flex items-center gap-2 bg-white/80 dark:bg-purple-900/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs">
                  <FleetIcons.Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">Email</div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-400">Login ID & Password sent</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-purple-900/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs">
                  <FleetIcons.Phone className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">SMS</div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-400">Password sent to phone</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-purple-900/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-xs">
                  <FleetIcons.Bell className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">In-App Notice</div>
                    <div className="text-[10px] text-purple-700 dark:text-purple-400">Welcome alert in dashboard</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/superadmin/advertisers')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            <span>{isEdit ? 'Save Changes' : 'Create Advertiser'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardAdvertiserPage;

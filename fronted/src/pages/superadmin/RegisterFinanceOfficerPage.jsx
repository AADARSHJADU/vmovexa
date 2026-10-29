import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperFinanceOfficer } from '../../hooks/superadmin/useSuperFinanceOfficer';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import { uploadFile } from '../../api/services/upload.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

const CLEARANCE_LEVELS = [
  'Senior Financial Controller',
  'Chief Financial Officer (CFO)',
  'Lead Accounts Auditor',
  'Billing & Invoicing Specialist',
  'GST & Statutory Tax Compliance Officer',
  'Treasury & Settlement Officer',
];

const DEPARTMENTS = [
  'Corporate Treasury & Capital',
  'Invoicing, Billing & Subscriptions',
  'Taxation & Statutory Audit',
  'Transit Fleet Revenue Share',
  'Financial Operations & Payouts',
];

const FINANCE_DOCUMENT_CATEGORIES = [
  'Official Appointment Letter',
  'Chartered Accountant (CA) / ICWAI Certificate',
  'Identity Proof (Aadhaar / Passport)',
  'PAN Card Copy',
  'Statutory Financial Clearance',
  'Bank Background Verification',
  'Educational Degree / MBA Finance',
  'Address Proof',
  'Other Financial Credential',
];

export const RegisterFinanceOfficerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { registerFinanceOfficer, updateFinanceOfficer, loadFinanceOfficer } = useSuperFinanceOfficer();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    clearance: 'Senior Financial Controller',
    department: 'Corporate Treasury & Capital',
    mfaEnabled: false,
    status: 'active',
    avatarUrl: '',
    avatar_url: '',
    documents: [],
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: '',
    longitude: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const photoInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing officer data in edit mode
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    setLoadingInitial(true);

    loadFinanceOfficer(id)
      .then((officer) => {
        if (!isMounted || !officer) return;

        const rawAvatar = officer.avatar_url || officer.avatarUrl || officer.user?.avatar_url || officer.user?.avatarUrl || '';
        if (rawAvatar) {
          setPhotoPreview(getMediaUrl(rawAvatar));
        }
        const rawDocs = officer.documents || [];
        const normalizedDocs = Array.isArray(rawDocs)
          ? rawDocs.map((d) => ({
              id: d.id || d.url || Date.now() + Math.random(),
              name: d.file_name || d.name || d.fileName || d.storage_key?.split('/')?.pop() || d.purpose || 'Attached Credential',
              category: d.purpose || d.category || 'Official Appointment Letter',
              url: d.url || d.filePath || (typeof d === 'string' ? d : ''),
              size: d.size ? Number(d.size) : null,
              formattedSize: d.size ? `${(Number(d.size) / 1024).toFixed(1)} KB` : 'Attached File',
              type: d.mime || d.type || 'application/pdf',
              uploadedAt: d.created_at || d.createdAt || new Date().toISOString(),
              verified: true,
              isPendingUpload: false,
            }))
          : [];

        setFormData({
          name: officer.name || '',
          email: officer.email || '',
          phone: officer.phone || '',
          password: '', // Don't prefill password on edit
          clearance: officer.clearance || officer.designation || 'Senior Financial Controller',
          department: officer.department || 'Corporate Treasury & Capital',
          mfaEnabled: false,
          status: officer.status || 'active',
          avatarUrl: rawAvatar,
          avatar_url: rawAvatar,
          documents: normalizedDocs,
          address: officer.address || '',
          city: officer.city || officer.baseCity || officer.base_city || '',
          state: officer.state || '',
          pincode: officer.pincode || '',
          country: officer.country || 'India',
          placeId: officer.place_id || officer.placeId || '',
          latitude: officer.latitude != null ? officer.latitude : '',
          longitude: officer.longitude != null ? officer.longitude : '',
        });
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load finance officer details.');
        navigate('/superadmin/finance');
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, navigate]);

  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*';

    // Guaranteed to satisfy backend passwordPolicy:
    // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    let rand = '';
    rand += numbers.charAt(Math.floor(Math.random() * numbers.length));
    rand += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    rand += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    rand += special.charAt(Math.floor(Math.random() * special.length));

    const all = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 4; i++) {
      rand += all.charAt(Math.floor(Math.random() * all.length));
    }

    const generated = `Fin@${rand}`;
    setFormData((prev) => ({ ...prev, password: generated }));
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
    toast.success(`Generated secure officer password: ${generated}`);
  };

  // Local Avatar Selection (Uploads only on submit)
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be less than 5 MB.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoRemoved(false);
    toast.success('Profile photo selected (will upload on submit)');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview('');
    setPhotoRemoved(true);
    setFormData((prev) => ({ ...prev, avatarUrl: '', avatar_url: '' }));
    if (photoInputRef.current) photoInputRef.current.value = '';
    toast.success('Profile photo removed');
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAddressChange = (addressPayload) => {
    setFormData((prev) => ({
      ...prev,
      address: addressPayload.address != null ? addressPayload.address : prev.address,
      city: addressPayload.city != null ? addressPayload.city : prev.city,
      state: addressPayload.state != null ? addressPayload.state : prev.state,
      pincode: addressPayload.pincode != null ? addressPayload.pincode : prev.pincode,
      country: addressPayload.country != null ? addressPayload.country : prev.country,
      placeId: addressPayload.placeId != null ? addressPayload.placeId : prev.placeId,
      latitude: addressPayload.latitude != null ? addressPayload.latitude : prev.latitude,
      longitude: addressPayload.longitude != null ? addressPayload.longitude : prev.longitude,
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (addressPayload.address) delete next.address;
      if (addressPayload.city) delete next.city;
      if (addressPayload.state) delete next.state;
      if (addressPayload.pincode) delete next.pincode;
      return next;
    });
  };

  // Comprehensive Form Validations
  const validateForm = () => {
    const errors = {};

    // 1. Full Name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Finance officer full name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      errors.name = 'Full name can only contain letters, spaces, dots, and hyphens.';
    }

    // 2. Email Address
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Corporate email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // 3. Mobile Phone (Sanitize leading +91 / 91 / 0)
    let cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      cleanPhone = cleanPhone.substring(2);
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // Helper for backend password policy: min 8, 1 uppercase, 1 digit, 1 special char
    const checkPasswordPolicy = (pwd) => {
      if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters long.';
      if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter (A-Z).';
      if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number (0-9).';
      if (!/[^A-Za-z0-9]/.test(pwd)) return 'Password must contain at least one special character (!@#$%^&*).';
      return null;
    };

    // 4. Password validation
    if (!isEdit) {
      if (!formData.password || !formData.password.trim()) {
        errors.password = 'Password is required. You can also click "⚡ Generate Key".';
      } else {
        const policyErr = checkPasswordPolicy(formData.password.trim());
        if (policyErr) errors.password = policyErr;
      }
    } else if (formData.password && formData.password.trim()) {
      const policyErr = checkPasswordPolicy(formData.password.trim());
      if (policyErr) errors.password = policyErr;
    }

    // 5. Pincode validation (if entered)
    if (formData.pincode && formData.pincode.trim()) {
      const cleanPin = formData.pincode.trim();
      if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
        errors.pincode = 'Please enter a valid 6-digit Indian PIN code (e.g. 400051).';
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors, cleanPhone };
  };

  // Form Submit Handler: Uploads photo and documents here, then saves finance officer
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || submitting) return;

    setFieldErrors({});

    const { isValid, errors, cleanPhone } = validateForm();
    if (!isValid) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError || 'Please fix all highlighted validation errors.');
      return;
    }

    try {
      isSubmittingRef.current = true;
      setSubmitting(true);

      // 1. Upload Profile Photo ONLY on form submit
      let finalAvatarUrl = formData.avatarUrl || formData.avatar_url;
      if (photoRemoved) {
        finalAvatarUrl = null;
      } else if (photoFile) {
        const photoToastId = toast.loading('Uploading officer profile photo...');
        try {
          const res = await uploadFile(photoFile, 'avatars');
          finalAvatarUrl = res?.url || res?.filePath || res;
          toast.dismiss(photoToastId);
          setPhotoFile(null);
          setFormData((prev) => ({ ...prev, avatarUrl: finalAvatarUrl, avatar_url: finalAvatarUrl }));
        } catch (uploadErr) {
          toast.dismiss(photoToastId);
          toast.error(uploadErr?.message || 'Failed to upload profile photo.');
          setSubmitting(false);
          isSubmittingRef.current = false;
          return;
        }
      }

      // 2. Upload Pending Documents ONLY on form submit (and prevent re-upload on retries)
      const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
      let docToastId = null;
      if (pendingDocs.length > 0) {
        docToastId = toast.loading(`Uploading ${pendingDocs.length} attached credential document(s)...`);
      }

      const submitDocuments = [];
      const updatedDocsForState = [];

      for (const doc of formData.documents || []) {
        if (doc.isPendingUpload && doc.file) {
          try {
            const res = await uploadFile(doc.file, 'finance_document');
            const fileUrl = res?.url || res?.filePath || res;
            submitDocuments.push({
              category: doc.category || doc.purpose || 'Official Appointment Letter',
              purpose: doc.category || doc.purpose || 'Official Appointment Letter',
              name: doc.name || doc.file.name,
              url: fileUrl,
              size: doc.file.size,
              type: doc.file.type || 'application/pdf',
            });
            updatedDocsForState.push({
              ...doc,
              url: fileUrl,
              file: null,
              isPendingUpload: false,
            });
          } catch (docErr) {
            if (docToastId) toast.dismiss(docToastId);
            toast.error(`Failed to upload document: ${doc.name}`);
            setSubmitting(false);
            isSubmittingRef.current = false;
            return;
          }
        } else if (doc.url && !doc.url.startsWith('blob:')) {
          // Already saved / uploaded document
          submitDocuments.push({
            id: typeof doc.id === 'number' && doc.id < 1000000000 ? doc.id : undefined,
            category: doc.category || doc.purpose || 'Official Appointment Letter',
            purpose: doc.category || doc.purpose || 'Official Appointment Letter',
            name: doc.name,
            url: doc.url,
            size: doc.size,
            type: doc.type,
          });
          updatedDocsForState.push(doc);
        }
      }
      if (docToastId) toast.dismiss(docToastId);

      // Persist permanently uploaded docs into form state
      setFormData((prev) => ({ ...prev, documents: updatedDocsForState }));

      // Deduplicate documents by category/purpose to guarantee 1 file per category
      const uniqueSubmitDocuments = [];
      const seenCategories = new Set();
      for (const doc of submitDocuments) {
        const catKey = String(doc.category || doc.purpose || '').trim().toLowerCase();
        if (!seenCategories.has(catKey)) {
          seenCategories.add(catKey);
          uniqueSubmitDocuments.push(doc);
        }
      }

      const locationPayload = {
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        pincode: formData.pincode?.trim() || null,
        country: formData.country?.trim() || 'India',
        placeId: formData.placeId || null,
        place_id: formData.placeId || null,
        latitude: formData.latitude !== '' && formData.latitude != null && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : null,
        longitude: formData.longitude !== '' && formData.longitude != null && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : null,
      };

      if (isEdit) {
        const updatePayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
          clearance: formData.clearance,
          designation: formData.clearance,
          department: formData.department,
          mfaEnabled: false,
          status: formData.status,
          avatar_url: finalAvatarUrl || null,
          avatarUrl: finalAvatarUrl || null,
          documents: uniqueSubmitDocuments,
          ...locationPayload,
        };
        if (formData.password?.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await toast.promise(
          updateFinanceOfficer(id, updatePayload),
          {
            loading: 'Updating finance officer credentials & location...',
            success: 'Finance Officer updated successfully!',
            error: (err) => err?.message || 'Failed to update finance officer.',
          }
        );
      } else {
        const createPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
          password: formData.password || 'Fin@12345',
          clearance: formData.clearance,
          designation: formData.clearance,
          department: formData.department,
          mfaEnabled: false,
          status: formData.status || 'active',
          avatar_url: finalAvatarUrl || null,
          avatarUrl: finalAvatarUrl || null,
          documents: uniqueSubmitDocuments,
          ...locationPayload,
        };

        await toast.promise(
          registerFinanceOfficer(createPayload),
          {
            loading: 'Enrolling finance officer & dispatching credentials...',
            success: 'Finance Officer enrolled successfully! Credentials dispatched to background cron queue.',
            error: (err) => err?.message || 'Failed to register finance officer.',
          }
        );
      }

      navigate('/superadmin/finance');
    } catch (_) {
      // Handled by toast
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const currentPhotoSrc = photoPreview || (formData.avatarUrl || formData.avatar_url
    ? getMediaUrl(formData.avatarUrl || formData.avatar_url)
    : '');

  if (loadingInitial) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">{t('superadmin.finance_officer.loading_credentials', 'Loading officer credentials...')}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation Header Banner */}
      <div className="w-full p-6 rounded-2xl bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <Breadcrumb
          items={[
            { label: t('common.super_admin', 'Super Admin'), path: '/superadmin/dashboard' },
            { label: t('superadmin.finance_officers.title', 'Finance Officers'), path: '/superadmin/finance' },
            { label: isEdit ? t('superadmin.finance_officer.edit_title', 'Edit Finance Officer') : t('superadmin.finance_officer.register_title', 'Register Finance Officer') },
          ]}
          className="mb-2"
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FleetIcons.CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{isEdit ? 'Edit Finance Officer' : 'Register Finance Officer'}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {isEdit
                ? 'Update profile details, corporate office location, clearance status, and statutory credentials.'
                : 'Provision a new corporate finance officer with regional office location, statutory credentials, and background cron notifications.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => navigate('/superadmin/finance')}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profile Photo (Deferred local preview, uploaded on submit) */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <FleetIcons.Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Officer Profile Photo
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  Select an official portrait photo (will upload securely upon form submission)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0 overflow-hidden border-2 border-blue-500 relative">
                <span className="select-none">{formData.name ? formData.name.charAt(0).toUpperCase() : 'F'}</span>
                {currentPhotoSrc ? (
                  <img
                    src={currentPhotoSrc}
                    alt="Officer Portrait"
                    className="w-full h-full object-cover absolute inset-0 z-10"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
              </div>

              {currentPhotoSrc && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title={t('common.remove_photo', 'Remove Photo')}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors shadow-md cursor-pointer z-20"
                >
                  <FleetIcons.Close className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/png,image/jpeg,image/webp,image/jpg"
                className="hidden"
              />
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <FleetIcons.Upload className="w-3.5 h-3.5" />
                  <span>{currentPhotoSrc ? 'Change Photo' : 'Select Photo'}</span>
                </button>
                {currentPhotoSrc && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
                {photoFile && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Staged: {photoFile.name} ({(photoFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                Supports PNG, JPG, or WEBP (Max 5 MB). Uploads securely when you submit the form.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Role Designation Details */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800/80 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <FleetIcons.Profile className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Personal & Role Details
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  Contact credentials, division, statutory clearance, and portal authentication
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder={t('superadmin.finance_officer.ph_name', 'e.g. Ananya Mukherjee, CA')}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  fieldErrors.name
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Corporate Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Corporate Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="ananya.mukherjee@vmovexa.com"
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Phone Number (10 digits) *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder={t('common.ph_phone', 'e.g. 9820044551')}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 ${
                  fieldErrors.phone
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Division / Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Clearance Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Clearance Designation
              </label>
              <select
                value={formData.clearance}
                onChange={(e) => handleFieldChange('clearance', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {CLEARANCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Officer Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">{t('common.active', 'Active')}</option>
                <option value="suspended">{t('common.suspended', 'Suspended')}</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {isEdit ? 'Reset Password (optional)' : 'Password *'}
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <FleetIcons.Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{t('common.generate_key', 'Generate Key')}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter login password (e.g. Fin@7Kx#9)'}
                  className={`w-full px-3.5 py-2.5 pr-12 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                  Must be at least 8 chars with 1 uppercase letter, 1 number, and 1 special character.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Regional Finance Office Location & Google Places Location Picker */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <FleetIcons.Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  3. Corporate Finance Office Location & Map Search
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Live search regional corporate headquarters, finance tower, or zonal audit office via Google Places.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {formData.city || 'India HQ'}
              </span>
            </div>
          </div>

          <DriverAddressPicker
            addressData={{
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: formData.country,
              placeId: formData.placeId,
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onChange={handleAddressChange}
            fieldErrors={fieldErrors}
            disabled={submitting}
            searchLabel="Search Corporate Office / Finance Tower / Zonal Branch"
            searchPlaceholder="Search finance hub, corporate tower, street, or city in India..."
            searchHint="Search any financial landmark, corporate park, or commercial hub in India — or drag the pin on the map to set exact coordinates."
            pinEmoji=""
            pinColor="#2563eb"
            pinLabel="Finance Office Pin"
            addressLabel="Office Street Address / Corporate Suite *"
            addressPlaceholder="Tower name, floor/suite, business park, street address"
          />
        </div>

        {/* Section 4: Statutory Qualifications & Documents (MultipleDocumentUploader with deferUpload={true}) */}
        <div>
          <MultipleDocumentUploader
            documents={formData.documents}
            onChange={(docs) => {
              setFormData((prev) => ({ ...prev, documents: docs }));
              if (fieldErrors.documents) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next.documents;
                  return next;
                });
              }
            }}
            deferUpload={true}
            title={t('superadmin.finance_officer.sec4_title', '4. Statutory Documents & Professional Credentials')}
            purpose="finance_document"
            categories={FINANCE_DOCUMENT_CATEGORIES}
          />
          {fieldErrors.documents && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 mt-2">
              <FleetIcons.Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fieldErrors.documents}</span>
            </div>
          )}
        </div>

        {/* Section 5: Automated Email & System Notification Dispatch Notice */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <FleetIcons.Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              {isEdit ? 'Finance Officer Profile Synchronization' : 'Automated Email & Background Cron Notification Dispatch'}
            </h4>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
              {isEdit
                ? 'Updating this profile records an audit trail in Activity Logs, triggers Super Admin notifications, and synchronizes corporate finance access permissions across VMOVEXA ONE.'
                : 'Submitting this form generates an enrollment number (e.g. VMX-FN-26-XXXXXX), securely records the action in Activity Logs, and enqueues credentials into the background notification cron queue (delivered every 20 seconds) with direct portal login credentials.'}
            </p>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate('/superadmin/finance')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
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
            <FleetIcons.Shield className="w-4 h-4" />
            <span>{isEdit ? 'Save Changes' : 'Enroll Finance Officer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterFinanceOfficerPage;

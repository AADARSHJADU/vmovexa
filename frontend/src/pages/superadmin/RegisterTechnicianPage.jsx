import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperTechnician } from '../../hooks/superadmin/useSuperTechnician';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import { uploadFile } from '../../api/services/upload.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

const AVAILABLE_SKILLS = [
  'GPS Tracker Calibration',
  'HDMI Dual Displays',
  'CAN-bus Telematics',
  'Android RK3588 Board',
  'Audio PA & Mic Amplifier',
  'Emergency SOS Panic Button',
  '24V/12V Power Inverter',
  'CCTV NVR / Camera Rig',
];

const TECHNICIAN_DOCUMENT_CATEGORIES = [
  'Identity Proof (Aadhaar / Passport)',
  'PAN Card Copy',
  'Technical Certification / Diploma',
  'Police Verification Certificate',
  'Field Experience Certificate',
  'Driver / Heavy Equipment License',
  'Depot Safety Clearance',
  'OEM / Telematics Training Certificate',
  'Other Certificate',
];

export const RegisterTechnicianPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { loadTechnician, registerTechnician, updateTechnician } = useSuperTechnician();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    certLevel: 'Level 2 Senior Diagnostic',
    skills: ['GPS Tracker Calibration', 'HDMI Dual Displays', 'CAN-bus Telematics'],
    avatarUrl: '',
    documents: [],
    address: '',
    city: 'Bhopal Central Hub',
    state: 'Madhya Pradesh',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: '',
    longitude: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const avatarInputRef = useRef(null);

  // Load existing technician data in edit mode
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    setLoadingInitial(true);

    loadTechnician(id)
      .then((tech) => {
        if (!isMounted || !tech) return;

        const profile = tech.technicianProfile || {};
        let parsedSkills = [];
        if (Array.isArray(profile.skills)) {
          parsedSkills = profile.skills;
        } else if (typeof profile.skills === 'string') {
          try {
            parsedSkills = JSON.parse(profile.skills);
          } catch {
            parsedSkills = profile.skills.split(',').map((s) => s.trim()).filter(Boolean);
          }
        }

        const rawAvatar = tech.avatar_url || tech.avatarUrl || tech.user?.avatar_url || profile.avatar_url || '';
        const rawDocs = tech.documents || [];
        const normalizedDocs = Array.isArray(rawDocs)
          ? rawDocs.map((d) => ({
              id: d.id || d.url || Date.now() + Math.random(),
              name: d.file_name || d.name || d.fileName || d.storage_key?.split('/')?.pop() || d.purpose || 'Attached Certificate',
              category: d.purpose || d.category || 'Technical Certification / Diploma',
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
          name: tech.name || '',
          email: tech.email || '',
          phone: tech.phone || '',
          password: '', // Don't prefill password on edit
          certLevel: profile.cert_level || 'Level 2 Senior Diagnostic',
          skills: parsedSkills.length > 0 ? parsedSkills : ['GPS Tracker Calibration'],
          avatarUrl: rawAvatar,
          documents: normalizedDocs,
          address: profile.address || '',
          city: profile.city || profile.base_city || tech.baseCity || 'Bhopal Central Hub',
          state: profile.state || '',
          pincode: profile.pincode || '',
          country: profile.country || 'India',
          placeId: profile.place_id || '',
          latitude: profile.latitude != null ? profile.latitude : '',
          longitude: profile.longitude != null ? profile.longitude : '',
        });
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load technician details.');
        navigate('/superadmin/technicians');
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, loadTechnician, navigate]);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    const generated = `Tech#${rand}`;
    setFormData((prev) => ({ ...prev, password: generated }));
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
    toast.success(`Generated secure password: ${generated}`);
  };

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      const nextSkills = exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill];
      if (nextSkills.length > 0 && fieldErrors.skills) {
        setFieldErrors((errs) => {
          const next = { ...errs };
          delete next.skills;
          return next;
        });
      }
      return {
        ...prev,
        skills: nextSkills,
      };
    });
  };

  // Local Avatar Selection (Uploads only on submit)
  const handleAvatarSelect = (e) => {
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

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarRemoved(false);
    toast.success('Profile photo selected (will upload on submit)');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setAvatarRemoved(true);
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    if (avatarInputRef.current) avatarInputRef.current.value = '';
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
      errors.name = 'Technician full name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Full name must be at least 3 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.name.trim())) {
      errors.name = 'Full name can only contain letters, spaces, dots, and hyphens.';
    }

    // 2. Email Address
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // 3. Mobile Phone (Indian 10-digit check)
    const cleanPhone = (formData.phone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // 4. Password (in register mode)
    if (!isEdit && (!formData.password || formData.password.trim().length < 6)) {
      errors.password = 'Password must be at least 6 characters. You can also click "Generate Key".';
    }

    // 5. Skills
    if (!formData.skills || formData.skills.length === 0) {
      errors.skills = 'Please select at least one technical specialization or skill.';
    }

    return { isValid: Object.keys(errors).length === 0, errors, cleanPhone };
  };

  // Form Submit Handler: Uploads photo and documents here, then saves technician
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { isValid, errors, cleanPhone } = validateForm();
    if (!isValid) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError || 'Please fix all highlighted validation errors.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload Profile Photo ONLY on form submit
      let finalAvatarUrl = formData.avatarUrl;
      if (avatarRemoved) {
        finalAvatarUrl = null;
      } else if (avatarFile) {
        const avatarToastId = toast.loading('Uploading technician profile photo...');
        try {
          const res = await uploadFile(avatarFile, 'avatars');
          finalAvatarUrl = res?.url || res?.filePath || res;
          toast.dismiss(avatarToastId);
        } catch (uploadErr) {
          toast.dismiss(avatarToastId);
          toast.error(uploadErr?.message || 'Failed to upload profile photo.');
          setSubmitting(false);
          return;
        }
      }

      // 2. Upload Pending Documents ONLY on form submit
      const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
      let docToastId = null;
      if (pendingDocs.length > 0) {
        docToastId = toast.loading(`Uploading ${pendingDocs.length} attached document(s)...`);
      }

      const submitDocuments = [];
      for (const doc of formData.documents || []) {
        if (doc.isPendingUpload && doc.file) {
          try {
            const res = await uploadFile(doc.file, 'technician_document');
            const fileUrl = res?.url || res?.filePath || res;
            submitDocuments.push({
              category: doc.category || doc.purpose || 'Technical Certification / Diploma',
              purpose: doc.category || doc.purpose || 'Technical Certification / Diploma',
              name: doc.name || doc.file.name,
              url: fileUrl,
              size: doc.file.size,
              type: doc.file.type || 'application/pdf',
            });
          } catch (docErr) {
            if (docToastId) toast.dismiss(docToastId);
            toast.error(`Failed to upload document: ${doc.name}`);
            setSubmitting(false);
            return;
          }
        } else {
          // Already saved document from DB
          submitDocuments.push({
            id: typeof doc.id === 'number' && doc.id < 1000000000 ? doc.id : undefined,
            category: doc.category || doc.purpose || 'Technical Certification / Diploma',
            purpose: doc.category || doc.purpose || 'Technical Certification / Diploma',
            name: doc.name,
            url: doc.url,
            size: doc.size,
            type: doc.type,
          });
        }
      }
      if (docToastId) toast.dismiss(docToastId);

      const locationPayload = {
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || 'Bhopal Central Hub',
        baseCity: formData.city?.trim() || 'Bhopal Central Hub',
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
          certLevel: formData.certLevel,
          skills: formData.skills,
          avatar_url: finalAvatarUrl || null,
          avatarUrl: finalAvatarUrl || null,
          documents: submitDocuments,
          ...locationPayload,
        };
        if (formData.password?.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await toast.promise(
          updateTechnician(id, updatePayload),
          {
            loading: 'Updating technician profile & location...',
            success: 'Technician updated successfully!',
            error: (err) => err?.message || 'Failed to update technician.',
          }
        );
      } else {
        const createPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
          password: formData.password || 'Tech@12345',
          certLevel: formData.certLevel,
          skills: formData.skills,
          avatar_url: finalAvatarUrl || null,
          avatarUrl: finalAvatarUrl || null,
          documents: submitDocuments,
          ...locationPayload,
        };

        await toast.promise(
          registerTechnician(createPayload),
          {
            loading: 'Enrolling technician & dispatching credentials...',
            success: 'Technician registered successfully! Welcome credentials dispatched.',
            error: (err) => err?.message || 'Failed to register technician.',
          }
        );
      }

      navigate('/superadmin/technicians');
    } catch (_) {
      // Handled by toast
    } finally {
      setSubmitting(false);
    }
  };

  const activeAvatarSrc = avatarPreview || (formData.avatarUrl
    ? (formData.avatarUrl.startsWith('http') || formData.avatarUrl.startsWith('blob:') ? formData.avatarUrl : getMediaUrl(formData.avatarUrl))
    : '');

  if (loadingInitial) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">Loading technician data...</p>
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
          <Link to="/superadmin/technicians" className="text-blue-600 dark:text-blue-400 hover:underline">
            Central Technicians
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {isEdit ? 'Edit Technician' : 'Register Technician'}
          </span>
        </nav>

        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => navigate('/superadmin/technicians')}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Back to Technicians"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Technician' : 'Register Technician'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">
              {isEdit
                ? 'Update technician profile, base hub location, skills, and compliance certificates.'
                : 'Enroll a new field engineer or technician to your central pool.'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Registration / Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Details & Photo */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                1. Basic Details & Photo
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Technician photo, contact details, and field credentials
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full">
              CENTRAL POOL
            </span>
          </div>

          {/* Profile Photo Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0 overflow-hidden border-2 border-blue-500">
              {activeAvatarSrc ? (
                <img
                  src={activeAvatarSrc}
                  alt="Technician avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = formData.name ? formData.name.charAt(0).toUpperCase() : 'T';
                    }
                  }}
                />
              ) : (
                formData.name ? formData.name.charAt(0).toUpperCase() : 'T'
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarSelect}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>📷</span>
                  <span>{activeAvatarSrc ? 'Change Photo' : 'Select Photo'}</span>
                </button>
                {activeAvatarSrc && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Supports JPG, PNG, WEBP (Max 5 MB). File uploads only upon form submission.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Verma"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. ramesh.verma@vmovexa.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Phone Number (10 digits) *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {isEdit ? 'Reset Password (optional)' : 'Password *'}
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  ⚡ Generate Key
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter login password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full px-3.5 py-2.5 pr-12 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
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
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Base Hub Location & Google Places Location Picker */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold text-sm">
                📍
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Base Hub Location & Google Places Search
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Live search base hub / depot via Google Maps Places API and adjust exact technician base pin.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 hidden sm:inline">
                Diagnostic Level:
              </label>
              <select
                value={formData.certLevel}
                onChange={(e) => handleFieldChange('certLevel', e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Level 1 Hardware Installer">Level 1: Hardware & Cabling</option>
                <option value="Level 2 Senior Diagnostic">Level 2: Diagnostics & GPS</option>
                <option value="Level 3 Master Embedded RK3588">Level 3: Master Systems Specialist</option>
              </select>
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
            searchLabel="Search Field Technician Base / Operational Hub / Residence"
            searchPlaceholder="Search operational base, hub, street, or town in India..."
            searchHint="Search any hub, depot, or landmark in India — or drag the pin on the map to set exact coordinates."
            pinEmoji="🔧"
            pinColor="#2563eb"
            pinLabel="Technician Base Hub"
            addressLabel="Operational Hub Address / Base Depot *"
            addressPlaceholder="Hub building, depot gate, industrial area, street"
          />
        </div>

        {/* Section 3: Hardware Diagnostic Specializations */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                3. Specializations & Skills *
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Select field specializations applicable to this technician
              </p>
            </div>
            {formData.skills.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {formData.skills.length} Selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => {
              const active = formData.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {skill}
                </button>
              );
            })}
          </div>
          {fieldErrors.skills && (
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              {fieldErrors.skills}
            </p>
          )}
        </div>

        {/* Section 4: Documents & Certificates (MultipleDocumentUploader with deferUpload={true}) */}
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
            title="4. Documents & Certificates (Aadhaar, ITI/Diploma, Police Verification, OEM Training)"
            purpose="technician_document"
            categories={TECHNICIAN_DOCUMENT_CATEGORIES}
          />
          {fieldErrors.documents && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 mt-2">
              <span className="text-base">⚠️</span>
              <span>{fieldErrors.documents}</span>
            </div>
          )}
        </div>

        {/* Section 5: Automated Notifications & Dispatch Notice */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            ✉
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              {isEdit ? 'Technician Profile Synchronization' : 'Automated Email & System Notification Dispatch'}
            </h4>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
              {isEdit
                ? 'Updating this profile will immediately synchronize regional routing, work order dispatch tables, and technician credentials across VMOVEXA Central operations.'
                : 'Submitting this form will automatically generate an enrollment number (e.g. VMX-TC-26-XXXX), store credentials in the database, and trigger a branded welcome email to the technician with login access to the technician field portal.'}
            </p>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/superadmin/technicians')}
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
            <span>{isEdit ? 'Save Changes' : 'Register & Provision Technician'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterTechnicianPage;

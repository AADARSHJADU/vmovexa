import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useSuperGovernment } from '../../hooks/superadmin/useSuperGovernment';
import { DriverAddressPicker } from '../../components/driver/DriverAddressPicker';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { uploadFile } from '../../api/services/upload.service';
import { getMediaUrl } from '../../utils/media';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
  'Smart City Traffic & Disaster Response',
  'Traffic Police & Road Safety Directorate',
  'State Disaster Management Authority (SDMA)',
  'Municipal Corporation & Civic Services',
  'Public Health & Emergency Ambulance Services',
  'State Highway Transport & Safety Board',
  'District Collector & Magistrate Office',
  'Urban Transit & Metro Rail Corporation',
];

const JURISDICTIONS = [
  'Bhopal Metropolitan Area (Bhopal, MP)',
  'Mumbai Metropolitan Region (MMR, Maharashtra)',
  'Delhi NCR Federal Territory & Highways',
  'Indore Urban Zone (Western MP)',
  'Pune Smart City Corridor (Maharashtra)',
  'Bengaluru Urban & BBMP Limits (Karnataka)',
  'Pan-State Highway Network & Inter-City',
  'National Capital Region Direct Command',
];

const CLEARANCE_LEVELS = [
  'Level 1 City Advisory',
  'Level 2 Regional Public Safety',
  'Level 3 Emergency Direct Override',
  'Level 4 Critical Disaster Override',
];

const GOVERNMENT_DOCUMENT_CATEGORIES = [
  'Official Gazette Notification',
  'Department Authorization Letter',
  'Nodal Officer Identity Proof (Aadhaar / ID)',
  'Inter-Agency MoU / Protocol Agreement',
  'Emergency Broadcast Directive',
  'Municipal Council Resolution',
  'Traffic Management Charter',
  'Public Safety Mandate Copy',
  'Other Official Certificate',
];

export const AuthorizeGovernmentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { loadAgency, createAgency, updateAgency } = useSuperGovernment();

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [formData, setFormData] = useState({
    agencyName: '',
    department: 'Smart City Traffic & Disaster Response',
    jurisdiction: 'Bhopal Metropolitan Area (Bhopal, MP)',
    clearanceLevel: 'Level 3 Emergency Direct Override',
    status: 'active',
    // Location & Address (matching DriverAddressPicker in RegisterTechnicianPage)
    address: '',
    city: 'Bhopal Central',
    state: 'Madhya Pradesh',
    pincode: '',
    country: 'India',
    placeId: '',
    latitude: null,
    longitude: null,
    // Nodal Officer Contact
    name: '',
    email: '',
    phone: '',
    password: '',
    documents: [],
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Emblem / Logo states (upload deferred to form submission)
  const [emblemFile, setEmblemFile] = useState(null);
  const [emblemPreview, setEmblemPreview] = useState('');
  const [existingEmblem, setExistingEmblem] = useState('');
  const [emblemRemoved, setEmblemRemoved] = useState(false);
  const emblemInputRef = useRef(null);

  // Fetch existing agency in edit mode
  useEffect(() => {
    if (!isEdit) return;

    let isMounted = true;
    setLoadingInitial(true);

    loadAgency(id)
      .then((agency) => {
        if (!isMounted || !agency) return;

        // Map existing attached documents for MultipleDocumentUploader
        const formattedDocs = Array.isArray(agency.documents)
          ? agency.documents.map((d) => ({
              id: d.id,
              name: d.file_name || d.storage_key || d.purpose || `Doc #${d.id}`,
              url: d.url,
              size: d.size || d.file_size || null,
              type: d.mime || d.file_type || 'application/pdf',
              category: d.purpose || 'Department Authorization Letter',
              purpose: d.purpose || 'Department Authorization Letter',
            }))
          : [];

        setFormData({
          agencyName: agency.agency_name || agency.name || '',
          department: agency.department || 'Smart City Traffic & Disaster Response',
          jurisdiction: agency.jurisdiction || 'Bhopal Metropolitan Area (Bhopal, MP)',
          clearanceLevel: agency.clearance_level || 'Level 3 Emergency Direct Override',
          status: agency.status || agency.user?.status || 'active',
          address: agency.address || agency.office_address || '',
          city: agency.city || agency.authorized_city || 'Bhopal Central',
          state: agency.state || 'Madhya Pradesh',
          pincode: agency.pincode || '',
          country: agency.country || 'India',
          placeId: agency.place_id || '',
          latitude: agency.latitude !== '' && agency.latitude != null && !isNaN(Number(agency.latitude)) ? Number(agency.latitude) : null,
          longitude: agency.longitude !== '' && agency.longitude != null && !isNaN(Number(agency.longitude)) ? Number(agency.longitude) : null,
          name: agency.contact_name || agency.user?.name || '',
          email: agency.email || agency.user?.email || '',
          phone: agency.phone || agency.user?.phone || '',
          password: '',
          documents: formattedDocs,
        });

        const emblem =
          agency.user?.avatar_url ||
          agency.avatar_url ||
          agency.logo_url ||
          agency.emblem_url ||
          agency.user?.avatarUrl ||
          agency.avatarUrl ||
          agency.logoUrl ||
          agency.emblemUrl;
        if (emblem) setExistingEmblem(emblem);
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load government agency details.');
        navigate('/superadmin/government');
      })
      .finally(() => {
        if (isMounted) setLoadingInitial(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, loadAgency, navigate]);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let rand = '';
    for (let i = 0; i < 8; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    const generated = `Gov#${rand}`;
    setFormData((prev) => ({ ...prev, password: generated }));
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
    toast.success(`Generated secure agency key: ${generated}`);
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

  // Emblem selection
  const handleEmblemSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Emblem image size must not exceed 5 MB.');
      return;
    }

    setEmblemFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEmblemPreview(previewUrl);
    setEmblemRemoved(false);
    toast.success('Department seal selected (will upload on submit).');
    if (emblemInputRef.current) emblemInputRef.current.value = '';
  };

  const handleRemoveEmblem = () => {
    setEmblemFile(null);
    if (emblemPreview) URL.revokeObjectURL(emblemPreview);
    setEmblemPreview('');
    setExistingEmblem('');
    setEmblemRemoved(true);
    if (emblemInputRef.current) emblemInputRef.current.value = '';
    toast.success('Department seal removed.');
  };

  // Comprehensive Form Validation
  const validateForm = () => {
    const errors = {};

    // 1. Agency Name
    if (!formData.agencyName || !formData.agencyName.trim()) {
      errors.agencyName = 'Agency / Authority name is required.';
    } else if (formData.agencyName.trim().length < 3) {
      errors.agencyName = 'Agency name must be at least 3 characters.';
    }

    // 2. Nodal Officer Full Name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Nodal officer name is required.';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Officer name must be at least 3 characters.';
    }

    // 3. Official Email
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Official government email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid official email address.';
      }
    }

    // 4. Phone Number (10 digits)
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Official phone number is required.';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    // 5. Password (required for new authorizations)
    if (!isEdit) {
      if (!formData.password || !formData.password.trim()) {
        errors.password = 'Initial portal password is required. Use "Generate Key" or enter one.';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }
    }

    // 6. Address & Location
    if (!formData.address || !formData.address.trim()) {
      errors.address = 'Headquarters / Command Office address is required.';
    }
    if (!formData.city || !formData.city.trim()) {
      errors.city = 'Operating city is required.';
    }
    if (formData.pincode && formData.pincode.replace(/\D/g, '').length < 6) {
      errors.pincode = 'Pincode must be 6 digits (e.g. 462004).';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      setSubmitting(true);
      const cleanPhone = formData.phone.replace(/\D/g, '');

      // Step 1: Upload Emblem if newly selected
      let finalEmblemUrl = existingEmblem;
      if (emblemFile) {
        const emblemToast = toast.loading('Uploading department seal/emblem...');
        try {
          const res = await uploadFile(emblemFile, 'government_emblems');
          finalEmblemUrl = res?.url || res?.filePath || res;
          toast.success('Department seal uploaded!', { id: emblemToast });
        } catch (err) {
          toast.dismiss(emblemToast);
          toast.error('Failed to upload department seal.');
          setSubmitting(false);
          return;
        }
      } else if (emblemRemoved) {
        finalEmblemUrl = '';
      }

      // Step 2: Upload any pending attached documents
      const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
      let docToastId = null;
      if (pendingDocs.length > 0) {
        docToastId = toast.loading(`Uploading ${pendingDocs.length} authorization document(s)...`);
      }

      const submitDocuments = [];
      for (const doc of formData.documents || []) {
        if (doc.isPendingUpload && doc.file) {
          try {
            const res = await uploadFile(doc.file, 'government_document');
            const fileUrl = res?.url || res?.filePath || res;
            submitDocuments.push({
              category: doc.category || doc.purpose || 'Department Authorization Letter',
              purpose: doc.category || doc.purpose || 'Department Authorization Letter',
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
          // Previously saved document from database
          submitDocuments.push({
            id: typeof doc.id === 'number' && doc.id < 1000000000 ? doc.id : undefined,
            category: doc.category || doc.purpose || 'Department Authorization Letter',
            purpose: doc.category || doc.purpose || 'Department Authorization Letter',
            name: doc.name,
            url: doc.url,
            size: doc.size,
            type: doc.type,
          });
        }
      }
      if (docToastId) toast.dismiss(docToastId);

      // Step 3: Prepare Structured Location & Payload
      const locationPayload = {
        address: formData.address?.trim() || null,
        officeAddress: formData.address?.trim() || null,
        office_address: formData.address?.trim() || null,
        city: formData.city?.trim() || 'Bhopal Central',
        authorizedCity: formData.city?.trim() || 'Bhopal Central',
        authorized_city: formData.city?.trim() || 'Bhopal Central',
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
          agencyName: formData.agencyName.trim(),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: cleanPhone,
          department: formData.department,
          jurisdiction: formData.jurisdiction,
          clearanceLevel: formData.clearanceLevel,
          status: formData.status,
          avatar_url: finalEmblemUrl || null,
          logo_url: finalEmblemUrl || null,
          emblem_url: finalEmblemUrl || null,
          avatarUrl: finalEmblemUrl || null,
          documents: submitDocuments,
          ...locationPayload,
        };
        if (formData.password?.trim()) {
          updatePayload.password = formData.password.trim();
        }

        await toast.promise(
          updateAgency(id, updatePayload),
          {
            loading: 'Updating agency credentials and security clearance...',
            success: 'Government agency profile updated successfully!',
            error: (err) => err?.message || 'Failed to update agency.',
          }
        );
      } else {
        const createPayload = {
          agencyName: formData.agencyName.trim(),
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: cleanPhone,
          password: formData.password || 'Gov@12345',
          department: formData.department,
          jurisdiction: formData.jurisdiction,
          clearanceLevel: formData.clearanceLevel,
          status: formData.status || 'active',
          avatar_url: finalEmblemUrl || null,
          logo_url: finalEmblemUrl || null,
          emblem_url: finalEmblemUrl || null,
          avatarUrl: finalEmblemUrl || null,
          documents: submitDocuments,
          ...locationPayload,
        };

        await toast.promise(
          createAgency(createPayload),
          {
            loading: 'Authorizing government agency & provisioning credentials...',
            success: 'Government agency authorized successfully! Welcome credentials dispatched.',
            error: (err) => err?.message || 'Failed to authorize government agency.',
          }
        );
      }

      navigate('/superadmin/government');
    } catch (_) {
      // toast handles error
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading government agency credentials...</p>
      </div>
    );
  }

  const activeEmblemSrc = emblemPreview || (existingEmblem
    ? (existingEmblem.startsWith('http') || existingEmblem.startsWith('blob:') ? existingEmblem : getMediaUrl(existingEmblem))
    : '');

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
          <Link to="/superadmin/government" className="text-blue-600 dark:text-blue-400 hover:underline">
            Government Agencies
          </Link>
          <span className="text-slate-300 dark:text-zinc-600">/</span>
          <span className="text-slate-900 dark:text-white">
            {isEdit ? 'Edit Agency' : 'Authorize Agency'}
          </span>
        </nav>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FleetIcons.Building className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{isEdit ? 'Edit Government Agency' : 'Authorize Government Agency'}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {isEdit
                ? 'Update government agency profile, security clearance, headquarters coordinates, and authorization documents.'
                : 'Authorize a civic, municipal, or emergency authority profile with regional override and public safety dispatch access.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/superadmin/government')}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Department Seal / Crest & Authority Identity */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>1. Department Seal & Basic Authority Info</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Upload official government emblem or civic seal and configure administrative clearance level.
            </p>
          </div>

          {/* Department Seal / Logo Upload */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {activeEmblemSrc ? (
                  <img
                    src={activeEmblemSrc}
                    alt="Agency Seal"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-center p-2">
                    <FleetIcons.Shield className="w-8 h-8 text-slate-300 dark:text-zinc-600 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Seal</span>
                  </div>
                )}
              </div>

              {activeEmblemSrc && (
                <button
                  type="button"
                  onClick={handleRemoveEmblem}
                  title="Remove Seal"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
                >
                  <FleetIcons.Close className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <input
                type="file"
                ref={emblemInputRef}
                onChange={handleEmblemSelect}
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => emblemInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <FleetIcons.Upload className="w-3.5 h-3.5" />
                  <span>{activeEmblemSrc ? 'Change Seal / Emblem' : 'Upload Department Seal'}</span>
                </button>
                {emblemFile && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Staged: {emblemFile.name} ({(emblemFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Supports PNG, JPG, WEBP, or SVG (Max 5 MB). File uploads securely on form submission.
              </p>
            </div>
          </div>

          {/* Agency Name & Department Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Agency / Authority Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bhopal Smart City Traffic Directorate"
                value={formData.agencyName}
                onChange={(e) => handleFieldChange('agencyName', e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  fieldErrors.agencyName
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.agencyName && (
                <p className="mt-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  {fieldErrors.agencyName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Department Category
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Regional Jurisdiction
              </label>
              <select
                value={formData.jurisdiction}
                onChange={(e) => handleFieldChange('jurisdiction', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {JURISDICTIONS.map((jur) => (
                  <option key={jur} value={jur}>{jur}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Security Clearance Level
              </label>
              <select
                value={formData.clearanceLevel}
                onChange={(e) => handleFieldChange('clearanceLevel', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {CLEARANCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="active">Active (Full Access)</option>
                <option value="approved">Approved</option>
                <option value="pending_approval">Pending Clearance</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Headquarters Location & Google Places Location Picker */}
        {/* Identical to RegisterTechnicianPage / RegisterFinanceOfficerPage */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <FleetIcons.Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Headquarters Location & Google Places Search
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  Live search administrative secretariat / control room via Google Places API and adjust exact GPS coordinates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                HQ: {formData.city || 'Central Hub'}
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
            searchLabel="Search Headquarters / Secretariat / Command Center"
            searchPlaceholder="Search municipal secretariat, traffic HQ, street, or town in India..."
            searchHint="Search any government secretariat, police HQ, or landmark in India — or drag the pin on the map to set exact headquarters coordinates."
            pinEmoji=""
            pinColor="#0284c7"
            pinLabel="Government Agency Headquarters"
            addressLabel="Headquarters / Command Office Address *"
            addressPlaceholder="Secretariat building, room number, administrative corridor, street"
          />
        </div>

        {/* Section 3: Nodal Officer & Portal Access Credentials */}
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>3. Nodal Officer & Portal Login Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Designated commissioner / liaison officer details and official portal authentication keys.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Nodal Officer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajeshwari Sengupta"
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
                Official Government Email *
              </label>
              <input
                type="email"
                required
                placeholder="commissioner@traffic.mp.gov.in"
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
                Official Phone Number (10 digits) *
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
                  {isEdit ? 'Reset Access Key (optional)' : 'Portal Access Key *'}
                </label>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <FleetIcons.Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Generate Key</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Enter login password'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full px-3.5 py-2.5 pr-12 bg-white dark:bg-zinc-900 border rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 font-mono ${
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

        {/* Section 4: Legal Authorization Documents & Gazette Directives */}
        {/* Identical to RegisterTechnicianPage / RegisterFinanceOfficerPage using MultipleDocumentUploader */}
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
            title="4. Legal Authorization Documents & Gazette Directives (Gazette circular, SDMA appointment, Nodal ID)"
            purpose="government_document"
            categories={GOVERNMENT_DOCUMENT_CATEGORIES}
          />
          {fieldErrors.documents && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 mt-2">
              <FleetIcons.Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fieldErrors.documents}</span>
            </div>
          )}
        </div>

        {/* Section 5: Automated Notifications & Dispatch Notice */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <FleetIcons.Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              {isEdit ? 'Government Profile Synchronization' : 'Automated Email, System Notification & SMS Dispatch'}
            </h4>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
              {isEdit
                ? 'Saving changes will update the agency credentials, broadcast clearance matrix, and notify nodal officers across VMOVEXA Central Command.'
                : 'Submitting this form will automatically generate an official authority code (e.g. GOV-XXXX), configure security clearance, and trigger a branded credentials email along with an in-app activation alert.'}
            </p>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate('/superadmin/government')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Agency...</span>
              </>
            ) : (
              <>
                <FleetIcons.Shield className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Changes' : 'Authorize Government Agency'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorizeGovernmentPage;

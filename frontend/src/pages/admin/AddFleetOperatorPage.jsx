import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

const SHIFT_PRESETS = [
  { label: 'Full Transit', hours: '05:00 AM - 11:30 PM', start: '05:00', end: '23:30', icon: '☀️' },
  { label: 'Morning Shift', hours: '06:00 AM - 02:00 PM', start: '06:00', end: '14:00', icon: '🌅' },
  { label: 'Evening Shift', hours: '02:00 PM - 10:00 PM', start: '14:00', end: '22:00', icon: '🌇' },
  { label: 'Night Shift', hours: '10:00 PM - 06:00 AM', start: '22:00', end: '06:00', icon: '🌙' },
  { label: '24/7 Operations', hours: '12:00 AM - 11:59 PM', start: '00:00', end: '23:59', icon: '🔄' },
  { label: 'Custom Shift', hours: 'custom', icon: '⚙️' },
];

const FLEET_DOCUMENT_CATEGORIES = [
  'Fleet Registration Certificate',
  'Transport / Stage Carriage License',
  'GST Registration Certificate',
  'Operator PAN / Identity KYC',
  'Pollution & Fitness Certificate',
  'Depot Agreement & Contract',
  'Insurance Policy',
  'Other Compliance Paper',
];

const format24to12 = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

export const AddFleetOperatorPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/fleets' : '/admin/fleet-operators';
  const dashPath = isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard';

  const { hasPermission } = useAuth();
  const canCreate = !isFleetPortal || hasPermission('fleet.fleets.create');
  const canUpdate = !isFleetPortal || hasPermission('fleet.fleets.update');
  const canAccessForm = isEditMode ? canUpdate : canCreate;

  const {
    createFleetOperator,
    updateFleetOperator,
    loadFleetOperator,
    selectedOperator,
    uploadAvatar,
  } = useAdminFleetOperator();

  const { depots, loadDepots } = useAdminDepot();
  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);

  const [loadingData, setLoadingData] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Working shift hours state
  const [selectedShiftPreset, setSelectedShiftPreset] = useState('Full Transit');
  const [customStartTime, setCustomStartTime] = useState('05:00');
  const [customEndTime, setCustomEndTime] = useState('23:30');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    fleetType: 'Intracity Transit',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    designation: 'Fleet Operator Lead',
    department: 'Transit Operations',
    depotId: '',
    location: 'Bangalore Central Hub',
    timeZone: 'Asia/Kolkata (IST)',
    workingHours: '05:00 AM - 11:30 PM',
    assignedBuses: '50',
    activeDriversCount: '65',
    avatarUrl: '',
    documents: [],
  });

  // Helper to detect preset matching a given string
  const detectShiftPreset = (hoursStr) => {
    if (!hoursStr) return 'Custom Shift';
    const matched = SHIFT_PRESETS.find((p) => p.hours.toLowerCase() === hoursStr.trim().toLowerCase());
    return matched ? matched.label : 'Custom Shift';
  };

  // Initial Load (Depots & Operator Details if editing)
  const populateForm = (opr) => {
    if (!opr) return;
    const initialHours = opr.working_hours || opr.workingHours || '05:00 AM - 11:30 PM';
    const preset = detectShiftPreset(initialHours);
    setSelectedShiftPreset(preset);

    setFormData({
      name: opr.name || '',
      code: opr.code || opr.enrollment_no || '',
      description: opr.description || '',
      fleetType: opr.fleet_type || opr.fleetType || 'Intracity Transit',
      contactPerson: opr.contact_person || opr.contactPerson || opr.name || '',
      phone: opr.phone || '',
      email: opr.email || '',
      password: '',
      designation: opr.clearance || opr.designation || 'Fleet Operator Lead',
      department: opr.department || 'Transit Operations',
      depotId: opr.depotId || opr.depot_id || opr.depot?.id || '',
      location: opr.location || opr.city || opr.baseCity || 'Bangalore Central Hub',
      timeZone: opr.timezone || opr.time_zone || 'Asia/Kolkata (IST)',
      workingHours: initialHours,
      assignedBuses: String(opr.assignedBuses ?? opr.assigned_buses ?? '50'),
      activeDriversCount: String(opr.activeDriversCount ?? opr.active_drivers_count ?? '65'),
      avatarUrl: opr.avatarUrl || opr.avatar_url || opr.avatar || opr.profile_picture || '',
      documents: Array.isArray(opr.documents) ? opr.documents : [],
    });
  };

  useEffect(() => {
    loadDepots().catch(() => {});
    if (isEditMode && id) {
      setLoadingData(true);
      loadFleetOperator(id)
        .then((opr) => {
          if (opr) populateForm(opr);
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load fleet operator details');
          navigate('/admin/fleet-operators');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, loadDepots, loadFleetOperator, navigate]);

  // Prefill formData when selectedOperator updates in Edit Mode
  useEffect(() => {
    if (isEditMode && selectedOperator) {
      populateForm(selectedOperator);
    }
  }, [isEditMode, selectedOperator]);

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

  // Convert and sanitize number inputs (positive digits only)
  const handleNumericFieldChange = (field, rawValue) => {
    const sanitized = rawValue.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [field]: sanitized }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectShiftPreset = (preset) => {
    setSelectedShiftPreset(preset.label);
    if (preset.hours !== 'custom') {
      handleFieldChange('workingHours', preset.hours);
      if (preset.start) setCustomStartTime(preset.start);
      if (preset.end) setCustomEndTime(preset.end);
    } else {
      const formatted = `${format24to12(customStartTime)} - ${format24to12(customEndTime)}`;
      handleFieldChange('workingHours', formatted);
    }
  };

  const handleCustomTimeChange = (start, end) => {
    setCustomStartTime(start);
    setCustomEndTime(end);
    const formatted = `${format24to12(start)} - ${format24to12(end)}`;
    handleFieldChange('workingHours', formatted);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const res = await uploadAvatar(file);
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      toast.success('Fleet logo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Operator Name
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Fleet Operator / Company Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Company Name must be at least 2 characters';
    }

    // 2. Email
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email Address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // 3. Mobile Phone
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Mobile Phone number is required';
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        errors.phone = 'Please enter a valid phone number (10 to 15 digits)';
      }
    }

    // 4. Password
    if (!isEditMode) {
      if (formData.password && formData.password.length < 6) {
        errors.password = 'Initial password must be at least 6 characters';
      }
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'New password must be at least 6 characters';
    }

    // 5. Depot Base
    if (!formData.depotId) {
      errors.depotId = 'Please select an assigned home depot base';
    }

    // 6. Hub Location
    if (!formData.location || !formData.location.trim()) {
      errors.location = 'Primary Hub Location is required';
    }

    // 7. Assigned Buses
    if (formData.assignedBuses === '' || isNaN(Number(formData.assignedBuses))) {
      errors.assignedBuses = 'Assigned buses count is required';
    } else if (Number(formData.assignedBuses) < 0 || Number(formData.assignedBuses) > 10000) {
      errors.assignedBuses = 'Must be a positive integer up to 10,000';
    }

    // 8. Active Drivers
    if (formData.activeDriversCount === '' || isNaN(Number(formData.activeDriversCount))) {
      errors.activeDriversCount = 'Active drivers count is required';
    } else if (Number(formData.activeDriversCount) < 0 || Number(formData.activeDriversCount) > 10000) {
      errors.activeDriversCount = 'Must be a positive integer up to 10,000';
    }

    // 9. Working Shift Hours
    if (!formData.workingHours || !formData.workingHours.trim()) {
      errors.workingHours = 'Working shift hours are required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors before submitting.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code?.trim() || undefined,
      description: formData.description?.trim() || '',
      fleet_type: formData.fleetType,
      contact_person: formData.contactPerson?.trim() || formData.name.trim(),
      designation: formData.designation?.trim() || 'Fleet Operator Lead',
      department: formData.department?.trim() || 'Transit Operations',
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      ...(formData.password ? { password: formData.password } : {}),
      depotId: formData.depotId ? Number(formData.depotId) : null,
      location: formData.location.trim(),
      time_zone: formData.timeZone,
      working_hours: formData.workingHours.trim(),
      assignedBuses: Number(formData.assignedBuses) || 0,
      activeDriversCount: Number(formData.activeDriversCount) || 0,
      avatarUrl: formData.avatarUrl,
      documents: formData.documents,
    };

    setIsSubmitting(true);
    try {
      // Process pending document uploads on submit
      const submitDocuments = [];
      const pendingDocs = (formData.documents || []).filter((d) => d.isPendingUpload && d.file);
      let docToastId = null;
      if (pendingDocs.length > 0) {
        docToastId = toast.loading(`Uploading ${pendingDocs.length} compliance document(s)...`);
      }

      for (const doc of formData.documents || []) {
        if (doc.isPendingUpload && doc.file) {
          try {
            const res = await uploadFile(doc.file, 'fleet_document');
            const fileUrl = res?.url || res?.filePath || res;
            submitDocuments.push({
              category: doc.category || doc.purpose || 'Fleet Document',
              purpose: doc.category || doc.purpose || 'Fleet Document',
              name: doc.name || doc.file.name,
              url: fileUrl,
              size: doc.file.size,
              type: doc.file.type || 'application/pdf',
            });
          } catch (docErr) {
            if (docToastId) toast.dismiss(docToastId);
            toast.error(`Failed to upload document: ${doc.name}`);
            setIsSubmitting(false);
            return;
          }
        } else {
          submitDocuments.push(doc);
        }
      }
      if (docToastId) toast.dismiss(docToastId);

      const payload = {
        name: formData.name.trim(),
        code: formData.code?.trim() || undefined,
        description: formData.description?.trim() || '',
        fleet_type: formData.fleetType,
        contact_person: formData.contactPerson?.trim() || formData.name.trim(),
        designation: formData.designation?.trim() || 'Fleet Operator Lead',
        department: formData.department?.trim() || 'Transit Operations',
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        ...(formData.password ? { password: formData.password } : {}),
        depotId: formData.depotId ? Number(formData.depotId) : null,
        location: formData.location.trim(),
        time_zone: formData.timeZone,
        working_hours: formData.workingHours.trim(),
        assignedBuses: Number(formData.assignedBuses) || 0,
        activeDriversCount: Number(formData.activeDriversCount) || 0,
        avatarUrl: formData.avatarUrl,
        documents: submitDocuments,
      };

      if (isEditMode) {
        await toast.promise(updateFleetOperator(id, payload), {
          loading: 'Updating fleet operator profile...',
          success: 'Fleet operator updated successfully!',
          error: (err) => err?.message || 'Failed to update fleet operator',
        });
      } else if (isFleetPortal) {
        await toast.promise(createFleetOperator({ ...payload, status: 'pending_approval' }), {
          loading: 'Submitting fleet operator for approval...',
          success: 'Fleet operator submitted! Admin will review and approve.',
          error: (err) => err?.message || 'Failed to submit fleet operator',
        });
      } else {
        await toast.promise(createFleetOperator({ ...payload, status: 'active' }), {
          loading: 'Creating fleet operator...',
          success: 'Fleet operator created & auto-approved!',
          error: (err) => err?.message || 'Failed to create fleet operator',
        });
      }
      navigate(basePath);
    } catch {
      /* toast handles error */
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600 font-bold text-sm">Loading operator profile data for editing...</div>
        </div>
      </div>
    );
  }

  if (!canAccessForm) {
    return (
      <div className="w-full bg-white border border-rose-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-3xl">🚫</div>
        <h2 className="text-xl font-bold text-rose-900">Access Revoked / Permission Denied</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You do not have permission to {isEditMode ? 'update' : 'create'} fleet operators.
          Please contact your administrator to restore access.
        </p>
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Go Back to Fleet Operators
        </button>
      </div>
    );
  }

  const fleetTypes = ['Intracity Transit', 'Intercity Line', 'Airport Express', 'Corporate Charter', 'EV Clean Transit', 'School Fleet'];

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm min-w-0">
        <div className="min-w-0">
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: dashPath },
              { label: 'Fleet Operators', path: basePath },
              { label: isEditMode ? `Edit: ${formData.name || selectedOperator?.name || id}` : 'Add Fleet Operator' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? `Edit Operator: ${formData.name || selectedOperator?.name || id}` : 'Add Fleet Operator'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            {isEditMode
              ? 'Update enterprise fleet operator credentials, depot linkage, quotas, and compliance documents.'
              : 'Register enterprise fleet operator, base depot hub, user login, and compliance certificates.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/admin/fleet-operators')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                <span>{isEditMode ? '💾' : '+'}</span>
                <span>{isEditMode ? 'Save Operator Changes' : 'Create Fleet Operator (Auto-Approve)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Notice Banner */}
      <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs font-bold">
        <span className="text-base">⚡</span>
        <div>
          <div>Platform Admin Mode — {isEditMode ? 'Live Edit Access' : 'Auto Approval Active'}</div>
          <div className="font-normal text-[11px] mt-0.5">
            {isEditMode
              ? 'Changes made here immediately update database records and fleet operator profile scope across all transit modules.'
              : 'Fleet Operators created by Admin are auto-approved and immediately active across all transit systems.'}
          </div>
        </div>
      </div>

      {/* Top Validation Errors Banner */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-900 shadow-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
            <span>⚠️</span>
            <span>Please correct the following {Object.keys(fieldErrors).length} error(s) before saving:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-2 text-rose-700">
            {Object.entries(fieldErrors).map(([k, msg]) => (
              <li key={k}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        
        {/* Section 1: Fleet Division Details */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-sm">
              🏬
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Fleet Division & Enterprise Details
              </h2>
              <p className="text-xs text-slate-500">Core division naming, classification, and scope description.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Fleet Operator / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Fleet Operator Name (e.g. VMOVEXA Transit Services)"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 font-bold focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Fleet Type / Classification</label>
              <select
                value={formData.fleetType}
                onChange={(e) => handleFieldChange('fleetType', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {fleetTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold text-slate-700">Fleet Operational Description</label>
              <textarea
                rows={2}
                placeholder="Brief description of routes served, service level targets, and fleet scope"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person & Credentials */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm">
              👤
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Operator & Contact Person Credentials
              </h2>
              <p className="text-xs text-slate-500">Fleet lead, primary email, mobile phone, and login access.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Person Name</label>
              <input
                type="text"
                placeholder="Full Name (e.g. Ramesh Kumar)"
                value={formData.contactPerson}
                onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="operator@vmovexa.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Mobile Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 focus:outline-none font-mono transition-all ${
                  fieldErrors.phone
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Designation / Clearance</label>
              <input
                type="text"
                placeholder="Fleet Operator Lead"
                value={formData.designation}
                onChange={(e) => handleFieldChange('designation', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Department</label>
              <input
                type="text"
                placeholder="Transit Operations"
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {isEditMode ? 'Reset Password (Optional)' : 'Initial Login Password'}
                </label>
                {isEditMode && (
                  <span className="text-[10px] text-slate-400 font-medium">Leave blank to keep unchanged</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEditMode ? '•••••••• (Leave blank to keep unchanged)' : 'Enter login password (min. 6 chars)'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full h-11 pl-3.5 pr-11 rounded-xl border text-xs text-slate-900 focus:outline-none transition-all font-mono ${
                    fieldErrors.password
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-sm font-bold cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.password}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">
                  {isEditMode
                    ? 'Enter a new password only if you wish to reset or update this operator credentials.'
                    : 'If left blank, standard system temporary password Test@12345 will be assigned.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Base Hub & Operational Schedule */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              📍
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Base Hub & Operational Schedule
              </h2>
              <p className="text-xs text-slate-500">Home depot facility, regional hub, timezone, and operating hours.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Assigned Home Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.depotId}
                onChange={(e) => handleFieldChange('depotId', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 font-bold focus:outline-none transition-all ${
                  fieldErrors.depotId
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500'
                }`}
              >
                <option value="">Select Depot Base</option>
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name || d.code || `Depot #${d.id}`}</option>
                ))}
              </select>
              {fieldErrors.depotId && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.depotId}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Primary Hub Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Bangalore Central Hub"
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.location
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.location && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.location}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Time Zone</label>
              <input
                type="text"
                value={formData.timeZone}
                onChange={(e) => handleFieldChange('timeZone', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Flexible Working Shift Hours */}
            <div className="space-y-2.5 md:col-span-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-700">
                  Working Shift Hours <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  Active Schedule: <span className="font-bold text-blue-600">{formData.workingHours || 'Not configured'}</span>
                </span>
              </div>

              {/* Shift Presets */}
              <div className="flex flex-wrap gap-2">
                {SHIFT_PRESETS.map((preset) => {
                  const isSelected = selectedShiftPreset === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectShiftPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                      {preset.hours !== 'custom' && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          ({preset.hours})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Picker Row */}
              {selectedShiftPreset === 'Custom Shift' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Shift Start Time</label>
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => handleCustomTimeChange(e.target.value, customEndTime)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Shift End Time</label>
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => handleCustomTimeChange(customStartTime, e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Formatted Schedule Text</label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => handleFieldChange('workingHours', e.target.value)}
                      placeholder="e.g. 05:00 AM - 11:30 PM"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              {fieldErrors.workingHours && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.workingHours}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Operational Quotas & Targets (Converted Number to Text inputs) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                4. Operational Targets & Quotas
              </h2>
              <p className="text-xs text-slate-500">Target bus fleet capacity and active driver headcount.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Allowed Bus Capacity (Max Buses) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 50"
                value={formData.assignedBuses}
                onChange={(e) => handleNumericFieldChange('assignedBuses', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.assignedBuses
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.assignedBuses && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.assignedBuses}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Allowed Driver Headcount (Max Drivers) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 65"
                value={formData.activeDriversCount}
                onChange={(e) => handleNumericFieldChange('activeDriversCount', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all ${
                  fieldErrors.activeDriversCount
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white'
                }`}
              />
              {fieldErrors.activeDriversCount && (
                <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                  <span>⚠️</span> {fieldErrors.activeDriversCount}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Brand Logo / Avatar Media */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 flex items-center justify-center font-bold text-sm">
              🖼️
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                5. Fleet Brand Logo & Media
              </h2>
              <p className="text-xs text-slate-500">Upload fleet logo or operator profile picture (PNG/JPG up to 2MB).</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={resolveFileUrl(formData.avatarUrl)}
                  alt="Avatar Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-2xl text-slate-400">
                  🚌
                </div>
              )}
            </div>

            <label className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              <span>📷</span>
              <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo / Photo'}</span>
            </label>
          </div>
        </div>

        {/* Section 6: Compliance & Enterprise KYC Documents (Integrated MultipleDocumentUploader with Preview) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-sm">
              📋
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                6. Enterprise Compliance & KYC Papers
              </h2>
              <p className="text-xs text-slate-500">
                Upload registration papers, permits, and certificates. You can view/preview any file immediately after selecting.
              </p>
            </div>
          </div>

          <MultipleDocumentUploader
            documents={formData.documents}
            onChange={(docs) => setFormData((prev) => ({ ...prev, documents: docs }))}
            title="Fleet Compliance & Regulatory Documents"
            purpose="fleet_document"
            categories={FLEET_DOCUMENT_CATEGORIES}
            deferUpload={true}
          />
        </div>

        {/* Submit & Cancel Bottom Bar */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/fleet-operators')}
            className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? 'Saving Changes...' : 'Creating Fleet Operator...'}</span>
              </>
            ) : (
              <>
                <span>{isEditMode ? '💾' : '+'}</span>
                <span>{isEditMode ? 'Save Operator Changes' : 'Create Fleet Operator (Auto-Approve)'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFleetOperatorPage;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { resolveFileUrl, uploadFile } from '../../api/services/upload.service';
import { MultipleDocumentUploader } from '../../components/ui/MultipleDocumentUploader';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

const SHIFT_PRESETS = [
  { label: 'Full Transit', hours: '05:00 AM - 11:30 PM', start: '05:00', end: '23:30', icon: 'Clock' },
  { label: 'Morning Shift', hours: '06:00 AM - 02:00 PM', start: '06:00', end: '14:00', icon: 'Clock' },
  { label: 'Evening Shift', hours: '02:00 PM - 10:00 PM', start: '14:00', end: '22:00', icon: 'Clock' },
  { label: 'Night Shift', hours: '10:00 PM - 06:00 AM', start: '22:00', end: '06:00', icon: 'Clock' },
  { label: '24/7 Operations', hours: '12:00 AM - 11:59 PM', start: '00:00', end: '23:59', icon: 'Refresh' },
  { label: 'Custom Shift', hours: 'custom', icon: 'Settings' },
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
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/fleets' : '/admin/fleet-operators';
  const dashPath = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';
  const canAccessForm = true;

  const {
    createFleetOperator,
    updateFleetOperator,
    loadFleetOperator,
    selectedOperator,
    uploadAvatar,
    getQuotas,
  } = useAdminFleetOperator();

  const { depots, loadDepots } = useAdminDepot();
  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);

  const [loadingData, setLoadingData] = useState(isEditMode);
  const [quotas, setQuotas] = useState(null);
  const [loadingQuotas, setLoadingQuotas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const isOperatorQuotaExhausted = !isEditMode && Boolean(
    quotas?.operators && !quotas.operators.isUnlimited && quotas.operators.remaining <= 0
  );

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
    assignedBuses: '',
    activeDriversCount: '',
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
      assignedBuses: opr.max_buses != null ? String(opr.max_buses) : (opr.assignedBuses != null ? String(opr.assignedBuses) : (opr.assigned_buses != null ? String(opr.assigned_buses) : '')),
      activeDriversCount: opr.max_drivers != null ? String(opr.max_drivers) : (opr.target_drivers_count != null ? String(opr.target_drivers_count) : (opr.fleetOperatorProfile?.active_drivers_count != null ? String(opr.fleetOperatorProfile.active_drivers_count) : (opr.activeDriversCount != null ? String(opr.activeDriversCount) : ''))),
      avatarUrl: opr.avatarUrl || opr.avatar_url || opr.avatar || opr.profile_picture || '',
      documents: Array.isArray(opr.documents) ? opr.documents : [],
    });
  };

  // Fetch organization plan quotas
  useEffect(() => {
    let mounted = true;
    setLoadingQuotas(true);
    getQuotas(isEditMode && id ? { excludeId: id } : {})
      .then((res) => {
        if (mounted && res) {
          setQuotas(res);
        }
      })
      .catch((err) => {
        console.warn('Failed to load fleet plan quotas:', err);
      })
      .finally(() => {
        if (mounted) setLoadingQuotas(false);
      });
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, getQuotas]);

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
    } else if (quotas?.buses && Number(formData.assignedBuses) > quotas.buses.remaining) {
      const remaining = quotas.buses.remaining ?? 0;
      const limit = quotas.buses.limit ?? 0;
      const allocated = quotas.buses.allocated ?? 0;
      if (remaining === 0) {
        errors.assignedBuses = `Plan bus quota full! All ${allocated}/${limit} buses are already allocated to existing fleets.`;
      } else {
        errors.assignedBuses = `Cannot assign ${formData.assignedBuses} buses. Only ${remaining} bus(es) remaining out of ${limit} in your plan (${allocated} already allocated).`;
      }
    }

    // 8. Active Drivers
    if (formData.activeDriversCount === '' || isNaN(Number(formData.activeDriversCount))) {
      errors.activeDriversCount = 'Active drivers count is required';
    } else if (Number(formData.activeDriversCount) < 0 || Number(formData.activeDriversCount) > 10000) {
      errors.activeDriversCount = 'Must be a positive integer up to 10,000';
    } else if (quotas?.drivers && Number(formData.activeDriversCount) > quotas.drivers.remaining) {
      const remaining = quotas.drivers.remaining ?? 0;
      const limit = quotas.drivers.limit ?? 0;
      const allocated = quotas.drivers.allocated ?? 0;
      if (remaining === 0) {
        errors.activeDriversCount = `Plan driver quota full! All ${allocated}/${limit} drivers are already allocated to existing fleets.`;
      } else {
        errors.activeDriversCount = `Cannot assign ${formData.activeDriversCount} drivers. Only ${remaining} driver(s) remaining out of ${limit} in your plan (${allocated} already allocated).`;
      }
    }

    // 9. Working Shift Hours
    if (!formData.workingHours || !formData.workingHours.trim()) {
      errors.workingHours = 'Working shift hours are required';
    }

    // 10. Organization Plan Fleet Operator Quota validation
    if (!isEditMode && quotas?.operators && !quotas.operators.isUnlimited && quotas.operators.remaining <= 0) {
      errors.operatorQuota = `Plan fleet operator quota full! Your plan allows up to ${quotas.operators.limit} fleet operator account(s). All ${quotas.operators.used} account(s) have already been created. Please upgrade your subscription plan.`;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isEditMode && quotas?.operators && !quotas.operators.isUnlimited && quotas.operators.remaining <= 0) {
      toast.error(`Plan limit reached! Maximum ${quotas.operators.limit} fleet operator accounts allowed in your plan.`);
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the highlighted errors before submitting.');
      return;
    }

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
          <div className="text-slate-600 dark:text-zinc-400 font-bold text-sm">{t('admin.fleet_operators.loading_profile') || 'Loading operator profile data for editing...'}</div>
        </div>
      </div>
    );
  }

  if (!canAccessForm) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto">
          <FleetIcons.Close className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-rose-900 dark:text-rose-200">{t('common.access_revoked') || 'Access Revoked / Permission Denied'}</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          You do not have permission to {isEditMode ? 'update' : 'create'} fleet operators.
          Please contact your administrator to restore access.
        </p>
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {t('admin.fleet_operators.back_to_profile') || 'Go Back to Fleet Operators'}
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
            {isEditMode ? `${t('admin.fleet_operators.edit_page_title') || 'Edit Fleet Operator'}: ${formData.name || selectedOperator?.name || id}` : (t('admin.fleet_operators.add_page_title') || 'Add Fleet Operator')}
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
            onClick={() => navigate(basePath)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isOperatorQuotaExhausted}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? (t('common.saving') || 'Saving...') : (t('common.saving') || 'Creating...')}</span>
              </>
            ) : isOperatorQuotaExhausted ? (
              <>
                <FleetIcons.Alert className="w-4 h-4 text-white shrink-0" />
                <span>{t('admin.fleet_operators.limit_reached_title') || 'Plan Operator Limit Reached'}</span>
              </>
            ) : (
              <>
                {isEditMode ? (
                  <FleetIcons.Check className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
                )}
                <span>{isEditMode ? (t('admin.fleet_operators.save_changes_btn') || 'Save Operator Changes') : (t('admin.fleet_operators.create_operator_btn') || 'Create Fleet Operator (Auto-Approve)')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Fleet Operator Quota Status Banner */}
      {quotas?.operators && (
        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all ${
            isOperatorQuotaExhausted
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
              : 'bg-blue-50/80 dark:bg-zinc-900 border-blue-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isOperatorQuotaExhausted
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                  : 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
              }`}
            >
              {isOperatorQuotaExhausted ? (
                <FleetIcons.Alert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              ) : (
                <FleetIcons.Profile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  {quotas.plan_name ? `${quotas.plan_name} — ` : ''}Fleet Operator Account Quota
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    isOperatorQuotaExhausted
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : quotas.operators.isUnlimited
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {quotas.operators.isUnlimited
                    ? 'Unlimited Accounts'
                    : `${quotas.operators.remaining} of ${quotas.operators.limit} Accounts Available`}
                </span>
              </div>
              <p className="font-normal text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                {quotas.operators.isUnlimited
                  ? 'Your active subscription plan provides unlimited fleet operator accounts for this organization.'
                  : isOperatorQuotaExhausted
                  ? `Plan limit reached! Your plan allows up to ${quotas.operators.limit} fleet operator account(s). All ${quotas.operators.used} account(s) have been created. Please upgrade your subscription plan to add more operators.`
                  : `You have created ${quotas.operators.used} out of ${quotas.operators.limit} allowed fleet operator accounts according to your plan (${quotas.operators.remaining} more account(s) can be created).`}
              </p>
            </div>
          </div>
          {isOperatorQuotaExhausted && (
            <Link
              to="/admin/billing"
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{t('admin.fleet_operators.btn_upgrade_plan') || 'Upgrade Plan'}</span>
              <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          )}
        </div>
      )}

      {/* Admin Notice Banner */}
      <div className="p-4 rounded-2xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300 flex items-center gap-3 text-xs font-bold">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <FleetIcons.Key className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div>
          <div>Platform Admin Mode — {isEditMode ? 'Live Edit Access' : 'Auto Approval Active'}</div>
          <div className="font-normal text-[11px] mt-0.5 text-emerald-800 dark:text-emerald-400">
            {isEditMode
              ? 'Changes made here immediately update database records and fleet operator profile scope across all transit modules.'
              : 'Fleet Operators created by Admin are auto-approved and immediately active across all transit systems.'}
          </div>
        </div>
      </div>

      {/* Top Validation Errors Banner */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
            <FleetIcons.Alert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Please correct the following {Object.keys(fieldErrors).length} error(s) before saving:</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-2 text-rose-700 dark:text-rose-300">
            {Object.entries(fieldErrors).map(([k, msg]) => (
              <li key={k}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        
        {/* Section 1: Fleet Division Details */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Fleets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Fleet Division & Enterprise Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.sec_division_desc') || 'Core division naming, classification, and scope description.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Fleet Operator / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.fleet_operators.operator_name_ph') || 'Enter Fleet Operator Name (e.g. VMOVEXA Transit Services)'}
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.name}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.fleet_type') || 'Fleet Type / Classification'}</label>
              <select
                value={formData.fleetType}
                onChange={(e) => handleFieldChange('fleetType', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {fleetTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.operational_desc') || 'Fleet Operational Description'}</label>
              <textarea
                rows={2}
                placeholder={t('admin.fleet_operators.operational_desc_ph') || 'Brief description of routes served, service level targets, and fleet scope'}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person & Credentials */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center font-bold text-sm">
                <FleetIcons.Profile className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Operator & Contact Person Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.sec_manager_desc') || 'Fleet lead, primary email, mobile phone, and login access.'}</p>
              </div>
            </div>
            {quotas?.operators && (
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isOperatorQuotaExhausted
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                }`}
              >
                <FleetIcons.Profile className="w-3.5 h-3.5" />
                <span>
                  {quotas.operators.isUnlimited
                    ? 'Plan: Unlimited Accounts'
                    : `Plan Quota: ${quotas.operators.used}/${quotas.operators.limit} (${quotas.operators.remaining} Available)`}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.contact_name') || 'Contact Person Name'}</label>
              <input
                type="text"
                placeholder={t('admin.fleet_operators.contact_name_ph') || 'Full Name (e.g. Ramesh Kumar)'}
                value={formData.contactPerson}
                onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="operator@vmovexa.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Mobile Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none font-mono transition-all ${
                  fieldErrors.phone
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.designation') || 'Designation / Clearance'}</label>
              <input
                type="text"
                placeholder={t('admin.fleet_operators.designation_ph') || 'Fleet Operator Lead'}
                value={formData.designation}
                onChange={(e) => handleFieldChange('designation', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.department') || 'Department'}</label>
              <input
                type="text"
                placeholder={t('admin.fleet_operators.department_ph') || 'Transit Operations'}
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Password with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {isEditMode ? 'Reset Password (Optional)' : 'Initial Login Password'}
                </label>
                {isEditMode && (
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{t('admin.fleet_operators.pwd_leave_blank') || 'Leave blank to keep unchanged'}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEditMode ? '•••••••• (Leave blank to keep unchanged)' : 'Enter login password (min. 6 chars)'}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  className={`w-full h-11 pl-3.5 pr-11 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none transition-all font-mono ${
                    fieldErrors.password
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1 text-sm font-bold cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FleetIcons.EyeOff className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  ) : (
                    <FleetIcons.Eye className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  {isEditMode
                    ? 'Enter a new password only if you wish to reset or update this operator credentials.'
                    : 'If left blank, standard system temporary password Test@12345 will be assigned.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Base Hub & Operational Schedule */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Base Hub & Operational Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.sec_depot_schedule_desc') || 'Home depot facility, regional hub, timezone, and operating hours.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Assigned Home Depot <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.depotId}
                onChange={(e) => handleFieldChange('depotId', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.depotId
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500'
                }`}
              >
                <option value="">{t('admin.fleet_operators.select_depot_base') || 'Select Depot Base'}</option>
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>{d.name || d.code || `Depot #${d.id}`}</option>
                ))}
              </select>
              {fieldErrors.depotId && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.depotId}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Primary Hub Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={t('admin.fleet_operators.depot_ph') || 'Bangalore Central Hub'}
                value={formData.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white focus:outline-none transition-all ${
                  fieldErrors.location
                    ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/70 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                }`}
              />
              {fieldErrors.location && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.location}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.fleet_operators.timezone') || 'Time Zone'}</label>
              <input
                type="text"
                value={formData.timeZone}
                onChange={(e) => handleFieldChange('timeZone', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Flexible Working Shift Hours */}
            <div className="space-y-2.5 md:col-span-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Working Shift Hours <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                  Active Schedule: <span className="font-bold text-blue-600 dark:text-blue-400">{formData.workingHours || 'Not configured'}</span>
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
                          : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      {preset.icon === 'Refresh' ? (
                        <FleetIcons.Refresh className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500 dark:text-emerald-400'}`} />
                      ) : preset.icon === 'Settings' ? (
                        <FleetIcons.Settings className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-zinc-400'}`} />
                      ) : (
                        <FleetIcons.Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-sky-500 dark:text-sky-400'}`} />
                      )}
                      <span>{preset.label}</span>
                      {preset.hours !== 'custom' && (
                        <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-zinc-400'}`}>
                          ({preset.hours})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Time Picker Row */}
              {selectedShiftPreset === 'Custom Shift' && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end animate-in fade-in">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">{t('admin.fleet_operators.shift_start') || 'Shift Start Time'}</label>
                    <input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => handleCustomTimeChange(e.target.value, customEndTime)}
                      className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">{t('admin.fleet_operators.shift_end') || 'Shift End Time'}</label>
                    <input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => handleCustomTimeChange(customStartTime, e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">{t('admin.fleet_operators.formatted_schedule') || 'Formatted Schedule Text'}</label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => handleFieldChange('workingHours', e.target.value)}
                      placeholder={t('admin.fleet_operators.schedule_ph') || 'e.g. 05:00 AM - 11:30 PM'}
                      className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              {fieldErrors.workingHours && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{fieldErrors.workingHours}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Operational Quotas & Targets (Plan Quota Enforced) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center font-bold text-sm">
                <FleetIcons.Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  4. Operational Targets & Quotas
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.sec_quotas_desc') || 'Target bus fleet capacity, driver headcount, and operator accounts governed by subscription plan.'}</p>
              </div>
            </div>
            {quotas?.plan_name && (
              <div className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1.5">
                <FleetIcons.Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t('admin.fleet_operators.plan_label') || 'Plan:'}</span>
                <span>{quotas.plan_name}</span>
              </div>
            )}
          </div>

          {/* Quota Summary Cards (3-Column Grid) */}
          {quotas && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FleetIcons.BarChart className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t('admin.fleet_operators.plan_quota_status') || 'Organization Plan Quota Status'}</span>
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  {isEditMode ? '(Excluding this operator for edit allowance)' : '(Live across all fleet operators)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Fleet Operator Accounts Metric */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <FleetIcons.Profile className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>{t('admin.fleet_operators.operators_count') || 'Fleet Operators'}</span>
                    </span>
                    <span
                      className={
                        quotas.operators?.isUnlimited || (quotas.operators?.remaining > 0)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {quotas.operators?.isUnlimited
                        ? 'Unlimited'
                        : `${quotas.operators?.remaining ?? 0} Available`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        !quotas.operators?.isUnlimited && quotas.operators?.remaining === 0
                          ? 'bg-rose-500'
                          : ((quotas.operators?.used || 0) / (quotas.operators?.limit || 1) > 0.8
                          ? 'bg-amber-500'
                          : 'bg-blue-600')
                      }`}
                      style={{
                        width: quotas.operators?.isUnlimited
                          ? '10%'
                          : `${Math.min(
                              100,
                              Math.round(
                                ((quotas.operators?.used || 0) / (quotas.operators?.limit || 1)) * 100
                              )
                            )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>
                      Created: <strong>{quotas.operators?.used ?? 0}</strong> operators
                    </span>
                    <span>
                      Plan Limit:{' '}
                      <strong>
                        {quotas.operators?.isUnlimited
                          ? 'Unlimited'
                          : `${quotas.operators?.limit ?? 0} operators`}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* 2. Buses Metric */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>{t('admin.fleet_operators.buses_count') || 'Buses'}</span>
                    </span>
                    <span className={quotas.buses.remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {quotas.buses.remaining} Available
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        quotas.buses.remaining === 0 ? 'bg-rose-500' : (quotas.buses.allocated / quotas.buses.limit > 0.8 ? 'bg-amber-500' : 'bg-blue-600')
                      }`}
                      style={{ width: `${Math.min(100, Math.round(((quotas.buses.allocated || 0) / (quotas.buses.limit || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>{t('admin.fleet_operators.allocated') || 'Allocated:'} <strong>{quotas.buses.allocated}</strong> {t('admin.fleet_operators.buses_unit') || 'buses'}</span>
                    <span>{t('admin.fleet_operators.plan_limit') || 'Plan Limit:'} <strong>{quotas.buses.limit}</strong> {t('admin.fleet_operators.buses_unit') || 'buses'}</span>
                  </div>
                </div>

                {/* 3. Drivers Metric */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                      <FleetIcons.Driver className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{t('admin.fleet_operators.drivers_count') || 'Drivers'}</span>
                    </span>
                    <span className={quotas.drivers.remaining > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                      {quotas.drivers.remaining} Available
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        quotas.drivers.remaining === 0 ? 'bg-rose-500' : (quotas.drivers.allocated / quotas.drivers.limit > 0.8 ? 'bg-amber-500' : 'bg-indigo-600')
                      }`}
                      style={{ width: `${Math.min(100, Math.round(((quotas.drivers.allocated || 0) / (quotas.drivers.limit || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>{t('admin.fleet_operators.allocated') || 'Allocated:'} <strong>{quotas.drivers.allocated}</strong> {t('admin.fleet_operators.drivers_unit') || 'drivers'}</span>
                    <span>{t('admin.fleet_operators.plan_limit') || 'Plan Limit:'} <strong>{quotas.drivers.limit}</strong> {t('admin.fleet_operators.drivers_unit') || 'drivers'}</span>
                  </div>
                </div>
              </div>

              {/* Existing Fleets Allocations Breakdown */}
              {Array.isArray(quotas.fleets) && quotas.fleets.filter(f => !f.is_current && (f.assigned_buses > 0 || f.active_drivers_count > 0)).length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Assigned to Other Existing Fleet Operators:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quotas.fleets
                      .filter((f) => !f.is_current && (f.assigned_buses > 0 || f.active_drivers_count > 0))
                      .map((f) => (
                        <div
                          key={f.id}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-300 flex items-center gap-2 shadow-2xs"
                        >
                          <span className="font-bold text-slate-900 dark:text-white">{f.name}:</span>
                          <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{f.assigned_buses} buses</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{f.active_drivers_count} drivers</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {/* Input 1: Allowed Buses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Allowed Buses <span className="text-red-500">*</span>
                </label>
                {quotas?.buses && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0 border ${
                      quotas.buses.remaining > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    Max {quotas.buses.remaining} available
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <FleetIcons.Bus className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
                <input
                  type="text"
                  placeholder={quotas ? `Max ${quotas.buses.remaining} buses` : 'e.g. 10'}
                  value={formData.assignedBuses}
                  onChange={(e) => handleNumericFieldChange('assignedBuses', e.target.value)}
                  className={`w-full h-11 pl-10 pr-16 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                    fieldErrors.assignedBuses
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                  Buses
                </div>
              </div>
              {fieldErrors.assignedBuses ? (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-start gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{fieldErrors.assignedBuses}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {t('admin.fleet_operators.remaining_available') || 'Remaining available:'} <strong className="text-slate-800 dark:text-zinc-200">{quotas ? quotas.buses.remaining : '...'}</strong> {t('common.of') || 'of'} <strong className="text-slate-800 dark:text-zinc-200">{quotas ? quotas.buses.limit : '...'}</strong> {t('admin.fleet_operators.plan_quota_suffix') || 'plan quota.'}
                </p>
              )}
            </div>

            {/* Input 2: Allowed Drivers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Allowed Drivers <span className="text-red-500">*</span>
                </label>
                {quotas?.drivers && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg whitespace-nowrap shrink-0 border ${
                      quotas.drivers.remaining > 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    Max {quotas.drivers.remaining} available
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                  <FleetIcons.Driver className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <input
                  type="text"
                  placeholder={quotas ? `Max ${quotas.drivers.remaining} drivers` : 'e.g. 15'}
                  value={formData.activeDriversCount}
                  onChange={(e) => handleNumericFieldChange('activeDriversCount', e.target.value)}
                  className={`w-full h-11 pl-10 pr-16 rounded-xl border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none transition-all ${
                    fieldErrors.activeDriversCount
                      ? 'border-rose-400 dark:border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 focus:border-rose-500'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                  Drivers
                </div>
              </div>
              {fieldErrors.activeDriversCount ? (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 font-bold flex items-start gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{fieldErrors.activeDriversCount}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {t('admin.fleet_operators.remaining_available') || 'Remaining available:'} <strong className="text-slate-800 dark:text-zinc-200">{quotas ? quotas.drivers.remaining : '...'}</strong> {t('common.of') || 'of'} <strong className="text-slate-800 dark:text-zinc-200">{quotas ? quotas.drivers.limit : '...'}</strong> {t('admin.fleet_operators.plan_quota_suffix') || 'plan quota.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Brand Logo / Avatar Media */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Fleet Brand Logo & Media
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.logo_hint') || 'Upload fleet logo or operator profile picture (PNG/JPG up to 2MB).'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              {formData.avatarUrl ? (
                <img
                  src={resolveFileUrl(formData.avatarUrl)}
                  alt="Avatar Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 dark:border-zinc-700 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 border-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center text-slate-400 dark:text-zinc-500">
                  <FleetIcons.Bus className="w-8 h-8" />
                </div>
              )}
            </div>

            <label className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              <FleetIcons.Camera className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo / Photo'}</span>
            </label>
          </div>
        </div>

        {/* Section 6: Compliance & Enterprise KYC Documents (Integrated MultipleDocumentUploader with Preview) */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center font-bold text-sm">
              <FleetIcons.Document className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Enterprise Compliance & KYC Papers
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Upload registration papers, permits, and certificates. You can view/preview any file immediately after selecting.
              </p>
            </div>
          </div>

          <MultipleDocumentUploader
            documents={formData.documents}
            onChange={(docs) => setFormData((prev) => ({ ...prev, documents: docs }))}
            title={t('admin.fleet_operators.docs_title') || "Fleet Compliance & Regulatory Documents"}
            purpose="fleet_document"
            categories={FLEET_DOCUMENT_CATEGORIES}
            deferUpload={true}
          />
        </div>

        {/* Submit & Cancel Bottom Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isOperatorQuotaExhausted}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isEditMode ? (t('common.saving') || 'Saving Changes...') : (t('admin.fleet_operators.creating_status') || 'Creating Fleet Operator...')}</span>
              </>
            ) : isOperatorQuotaExhausted ? (
              <>
                <FleetIcons.Alert className="w-4 h-4 text-white shrink-0" />
                <span>{t('admin.fleet_operators.limit_reached_title') || 'Plan Operator Limit Reached'}</span>
              </>
            ) : (
              <>
                {isEditMode ? (
                  <FleetIcons.Check className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <FleetIcons.Plus className="w-4 h-4 text-white shrink-0" />
                )}
                <span>{isEditMode ? (t('admin.fleet_operators.save_changes_btn') || 'Save Operator Changes') : (t('admin.fleet_operators.create_operator_btn') || 'Create Fleet Operator (Auto-Approve)')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFleetOperatorPage;

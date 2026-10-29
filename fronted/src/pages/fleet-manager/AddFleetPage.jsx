/* eslint-disable react-hooks/set-state-in-effect -- edit data hydrates the fleet form */
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useAuth } from '../../hooks/useAuth';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { adminDepotService } from '../../api/services/admin/depot.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FleetIcons from '../../components/FleetIcons';

export const AddFleetPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const {
    createFleet,
    updateFleet,
    loadFleet,
    selectedFleet,
  } = useFleetManager();

  const { user, hasPermission } = useAuth();
  const isPlatformAdmin = Boolean(
    user && (user.role === 'ROLE-SUPER-ADMIN' || user.role === 'ROLE-ADMIN' || user.clearance === 'ROOT')
  );

  // RBAC Permission Check
  const canCreate = hasPermission('fleet.fleets.create');
  const canUpdate = hasPermission('fleet.fleets.update');
  const isPermitted = isEditMode ? canUpdate : canCreate;

  const [depotsList, setDepotsList] = useState([]);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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

  // Initial Load Depots
  useEffect(() => {
    let active = true;
    const fetchDepots = async () => {
      try {
        const res = await adminDepotService.getDepots();
        const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
        if (active) setDepotsList(list);
      } catch {
        /* fallback empty */
      }
    };
    fetchDepots();
    return () => { active = false; };
  }, []);

  // Populate form in edit mode
  const populateForm = (fleet) => {
    if (!fleet) return;
    setFormData({
      name: fleet.name || fleet.fleetName || '',
      code: fleet.code || '',
      description: fleet.description || '',
      fleetType: fleet.fleet_type || fleet.fleetType || 'Intracity Transit',
      contactPerson: fleet.contact_person || fleet.contactPerson || fleet.name || '',
      phone: fleet.phone || '',
      email: fleet.email || '',
      password: '',
      designation: fleet.designation || fleet.clearance || 'Fleet Operator Lead',
      department: fleet.department || 'Transit Operations',
      depotId: fleet.depot_id || fleet.depotId || fleet.depot?.id || '',
      location: fleet.location || fleet.city || 'Bangalore Central Hub',
      timeZone: fleet.time_zone || fleet.timezone || fleet.timeZone || 'Asia/Kolkata (IST)',
      workingHours: fleet.working_hours || fleet.workingHours || '05:00 AM - 11:30 PM',
      assignedBuses: fleet.assigned_buses ?? fleet.assignedBuses ?? '',
      activeDriversCount: fleet.active_drivers_count ?? fleet.activeDriversCount ?? '',
      avatarUrl: fleet.logo_url || fleet.logoUrl || fleet.avatarUrl || fleet.avatar_url || '',
      documents: Array.isArray(fleet.documents) ? fleet.documents : [],
    });
  };

  useEffect(() => {
    if (isEditMode && id) {
      setLoadingData(true);
      loadFleet(id)
        .then((f) => {
          if (f) populateForm(f);
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load fleet details');
          navigate('/fleet-operator/fleets');
        })
        .finally(() => setLoadingData(false));
    }
  }, [id, isEditMode, loadFleet, navigate]);

  useEffect(() => {
    if (isEditMode && selectedFleet) {
      populateForm(selectedFleet);
    }
  }, [isEditMode, selectedFleet]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const res = await uploadFile(file, 'fleet_logo');
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      toast.success('Fleet logo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDocumentUpload = async (e, categoryName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingDoc(true);
      const res = await uploadFile(file, 'fleet_document');
      const url = res?.url || res?.file_url || (typeof res === 'string' ? res : URL.createObjectURL(file));
      const docItem = {
        name: file.name,
        category: categoryName || 'Registration Paper',
        purpose: categoryName || 'Registration Paper',
        url,
        uploadedAt: new Date().toISOString(),
      };
      setFormData((prev) => ({ ...prev, documents: [...prev.documents, docItem] }));
      toast.success(`${categoryName} uploaded!`);
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDoc = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      toast.error('Fleet Operator Name is required');
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code || undefined,
      description: formData.description,
      fleet_type: formData.fleetType,
      fleetType: formData.fleetType,
      contact_person: formData.contactPerson || formData.name,
      contactPerson: formData.contactPerson || formData.name,
      designation: formData.designation,
      department: formData.department,
      phone: formData.phone,
      email: formData.email,
      ...(formData.password ? { password: formData.password } : {}),
      depot_id: formData.depotId ? Number(formData.depotId) : null,
      depotId: formData.depotId ? Number(formData.depotId) : null,
      location: formData.location,
      time_zone: formData.timeZone,
      working_hours: formData.workingHours,
      assigned_buses: Number(formData.assignedBuses) || 0,
      assignedBuses: Number(formData.assignedBuses) || 0,
      active_drivers_count: Number(formData.activeDriversCount) || 0,
      activeDriversCount: Number(formData.activeDriversCount) || 0,
      logo_url: formData.avatarUrl,
      avatarUrl: formData.avatarUrl,
      documents: formData.documents,
    };

    try {
      if (isEditMode) {
        await toast.promise(updateFleet(id, payload), {
          loading: 'Updating fleet operation profile...',
          success: 'Fleet updated successfully!',
          error: (err) => err?.message || 'Failed to update fleet',
        });
      } else {
        await toast.promise(createFleet(payload), {
          loading: 'Submitting fleet operation profile...',
          success: isPlatformAdmin
            ? 'Fleet created & auto-approved!'
            : 'Fleet submitted for Admin approval!',
          error: (err) => err?.message || 'Failed to create fleet',
        });
      }
      navigate('/fleet-operator/fleets');
    } catch {
      /* handled by toast */
    }
  };

  // Permission Guard Screen
  if (!isPermitted) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto mt-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <FleetIcons.Key className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('fleet.add.access_restricted')}</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isEditMode
              ? 'You do not have permission (fleet.fleets.update) to edit fleet operations.'
              : 'You do not have permission (fleet.fleets.create) to register new fleet operations.'}
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/fleets')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            {t('fleet.add.return_fleets')}
          </button>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600 dark:text-zinc-300 font-bold text-sm">{t('fleet.add.loading_edit')}</div>
        </div>
      </div>
    );
  }

  const fleetTypes = [
    'Intracity Transit',
    'Intercity Line',
    'Airport Express',
    'Corporate Charter',
    'EV Clean Transit',
    'School Fleet',
  ];

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Fleet Operators', path: '/fleet-operator/fleets' },
            { label: isEditMode ? `Edit Fleet #${id}` : 'Add Fleet Operator' },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/fleet-operator/fleets')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={t('fleet.add.return_fleets')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditMode ? `Edit Fleet: ${formData.name || selectedFleet?.name || id}` : 'Add Fleet Operator'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isEditMode
                  ? 'Update fleet credentials, depot allocation, operational quotas, and KYC documents.'
                  : 'Register a new fleet operation, base depot hub, operational quotas, and compliance papers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/fleet-operator/fleets')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {isEditMode ? <FleetIcons.Check className="w-4 h-4 text-white" /> : <FleetIcons.Plus className="w-4 h-4 text-white" />}
              <span>
                {isEditMode
                  ? 'Save Fleet Changes'
                  : isPlatformAdmin
                  ? 'Create Fleet (Auto-Approve)'
                  : 'Submit Fleet for Approval'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode & Approval Notice Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3 text-xs font-bold ${
          isPlatformAdmin
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : isEditMode
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
        }`}
      >
        <span className="shrink-0">
          {isPlatformAdmin ? (
            <FleetIcons.Speed className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : isEditMode ? (
            <FleetIcons.Document className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <FleetIcons.Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
        </span>
        <div>
          <div>
            {isPlatformAdmin
              ? `Platform Admin Mode — ${isEditMode ? 'Live Edit Access' : 'Auto Approval Active'}`
              : isEditMode
              ? 'Fleet Manager Mode — Live Profile Edit'
              : 'Fleet Manager Mode — Submission Enters Admin Approval Queue'}
          </div>
          <div className="font-normal text-[11px] mt-0.5 opacity-90">
            {isPlatformAdmin
              ? isEditMode
                ? 'Changes made here immediately update database records and fleet operational scope.'
                : 'Fleets created by Admin are auto-approved and immediately active across all transit systems.'
              : isEditMode
              ? 'Profile edits are applied to your fleet. Operational status remains intact.'
              : 'Newly registered fleets enter "Pending Review" status until approved by a Platform Administrator.'}
          </div>
        </div>
      </div>

      {/* Main 6-Section Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Section 1: Fleet Division Details */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <FleetIcons.Fleets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Fleet Division & Enterprise Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('fleet.add.division_info_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Fleet Operator / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('fleet.add.operator_name_ph')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.classification_label')}</label>
              <select
                value={formData.fleetType}
                onChange={(e) => setFormData({ ...formData, fleetType: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                {fleetTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.op_desc_label')}</label>
              <textarea
                rows={2}
                placeholder={t('fleet.add.op_desc_ph')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person & Credentials */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
              <FleetIcons.Profile className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Operator & Contact Person Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('fleet.add.contact_sec_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.contact_name_label')}</label>
              <input
                type="text"
                placeholder={t('fleet.add.contact_name_ph')}
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('common.email', 'Email Address')}</label>
              <input
                type="email"
                placeholder="operator@vmovexa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.details.phone_number')}</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.designation_label')}</label>
              <input
                type="text"
                placeholder={t('fleet.add.designation_ph')}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.details.department')}</label>
              <input
                type="text"
                placeholder={t('fleet.details.department')}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                {isEditMode ? 'Security Access PIN / Password (Optional)' : 'Initial Access Password'}
              </label>
              <input
                type="password"
                placeholder={isEditMode ? 'Leave blank to keep unchanged' : '••••••••'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Base Hub & Operational Schedule */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <FleetIcons.Pin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. Base Hub & Operational Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('fleet.add.depot_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.assigned_depot')}</label>
              <select
                value={formData.depotId}
                onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">{t('fleet.add.select_depot')}</option>
                {depotsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.code || `Depot #${d.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.primary_hub_loc')}</label>
              <input
                type="text"
                placeholder={t('fleet.add.primary_hub_loc')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.details.shift_hours')}</label>
              <input
                type="text"
                placeholder={t('fleet.add.working_hours_placeholder')}
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Operational Quotas & Targets */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
              <FleetIcons.Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. Operational Targets & Quotas
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('fleet.add.target_cap_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.target_buses')}</label>
              <input
                type="number"
                min="0"
                value={formData.assignedBuses}
                onChange={(e) => setFormData({ ...formData, assignedBuses: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.add.target_drivers')}</label>
              <input
                type="number"
                min="0"
                value={formData.activeDriversCount}
                onChange={(e) => setFormData({ ...formData, activeDriversCount: e.target.value })}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Brand Logo / Media */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0">
              <FleetIcons.Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                5. Fleet Brand Logo & Media
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{t('fleet.add.upload_logo_desc')}</p>
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

            <label className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
              <FleetIcons.Camera className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo / Photo'}</span>
            </label>
          </div>
        </div>

        {/* Section 6: Compliance & Enterprise KYC Documents */}
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="pb-4 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <FleetIcons.Document className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                6. Enterprise Compliance & KYC Papers
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Registration certificate, transport license, GST records, identity documents.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { type: 'Registration Paper', label: 'Fleet Registration' },
              { type: 'Transport License', label: 'Transport License' },
              { type: 'GST Certificate', label: 'GST Certificate' },
              { type: 'Identity KYC', label: 'Operator Aadhaar/PAN' },
            ].map(({ type, label }) => {
              const uploadedDoc = formData.documents.find(
                (d) => d.category === type || d.purpose === type
              );
              return (
                <label
                  key={type}
                  className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    uploadedDoc
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-zinc-800/60'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, type)}
                    disabled={uploadingDoc}
                  />
                  {uploadedDoc ? (
                    <>
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                        <FleetIcons.Check className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {uploadedDoc.name || uploadedDoc.purpose || uploadedDoc.category || label}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{t('fleet.details.uploaded')}</div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1">
                        <FleetIcons.Document className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{label}</div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{t('fleet.add.upload_doc')}</div>
                    </>
                  )}
                </label>
              );
            })}
          </div>

          {formData.documents.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Uploaded Documents ({formData.documents.length})
              </div>
              <div className="space-y-1.5">
                {formData.documents.map((doc, idx) => {
                  const docUrl = doc.url || doc.filePath;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-750 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {doc.category || doc.purpose || `Doc #${idx + 1}`}:
                        </span>
                        <span className="text-slate-600 dark:text-zinc-300 truncate max-w-xs">{doc.name || docUrl}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {docUrl && (
                          <a
                            href={resolveFileUrl(docUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold text-[11px]"
                          >
                            View File
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(idx)}
                          className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title={t('fleet.add.remove_doc')}
                        >
                          <FleetIcons.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit & Cancel Bottom Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/fleets')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isEditMode ? <FleetIcons.Check className="w-4 h-4 text-white" /> : <FleetIcons.Plus className="w-4 h-4 text-white" />}
            <span>
              {isEditMode
                ? 'Save Fleet Changes'
                : isPlatformAdmin
                ? 'Create Fleet (Auto-Approve)'
                : 'Submit Fleet for Approval'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFleetPage;

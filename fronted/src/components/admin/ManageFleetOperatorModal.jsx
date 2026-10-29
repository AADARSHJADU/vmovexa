import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { Pagination } from '../ui/Pagination';
import { MultipleDocumentUploader } from '../ui/MultipleDocumentUploader';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { adminRoleService } from '../../api/services/admin/role.service';
import { resolveFileUrl } from '../../api/services/upload.service';

export const ManageFleetOperatorModal = ({ operatorId, onClose, onUpdated }) => {
  const {
    selectedOperator,
    operatorActivity,
    activityPagination,
    operatorPermissions,
    loadFleetOperator,
    updateFleetOperator,
    loadOperatorActivity,
    loadOperatorPermissions,
    updateOperatorPermissions,
    uploadAvatar,
    getQuotas,
    resetSelectedOperator,
  } = useAdminFleetOperator();

  const { depots, loadDepots } = useAdminDepot();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'permissions' | 'activity'
  const [loading, setLoading] = useState(true);
  const [quotas, setQuotas] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    clearance: '', // Designation
    department: '',
    depotId: '',
    assignedBuses: 0,
    activeDriversCount: 0,
    description: '',
    status: 'active',
    avatarUrl: '',
    documents: [],
  });


  // Permissions state
  const [modules, setModules] = useState({});
  const [selectedPermKeys, setSelectedPermKeys] = useState([]);
  const [rolePermKeys, setRolePermKeys] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Activity state
  const [activityPage, setActivityPage] = useState(1);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const fileInputRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (operatorId) {
      setLoading(true);
      Promise.all([
        loadFleetOperator(operatorId),
        loadDepots().catch(() => []),
        getQuotas ? getQuotas({ excludeId: operatorId }).then(q => setQuotas(q)).catch(() => {}) : Promise.resolve(),
      ])
        .finally(() => setLoading(false));
    }
    return () => {
      resetSelectedOperator();
    };
  }, [operatorId, loadFleetOperator, loadDepots, getQuotas, resetSelectedOperator]);

  // Populate profile form when selectedOperator updates
  useEffect(() => {
    if (selectedOperator) {
      setFormData({
        name: selectedOperator.name || '',
        email: selectedOperator.email || '',
        phone: selectedOperator.phone || '',
        clearance: selectedOperator.clearance || selectedOperator.designation || '',
        department: selectedOperator.department || '',
        depotId: selectedOperator.depotId || selectedOperator.depot_id || selectedOperator.depot?.id || '',
        assignedBuses: selectedOperator.max_buses ?? selectedOperator.assignedBuses ?? selectedOperator.assigned_buses ?? 0,
        activeDriversCount: selectedOperator.max_drivers ?? selectedOperator.target_drivers_count ?? selectedOperator.allowed_drivers ?? selectedOperator.activeDriversCount ?? selectedOperator.active_drivers_count ?? 0,
        description: selectedOperator.description || '',
        status: selectedOperator.status || 'active',
        avatarUrl: selectedOperator.avatarUrl || selectedOperator.avatar || selectedOperator.profile_picture || '',
        documents: selectedOperator.documents || selectedOperator.attachments || [],
      });
    }
  }, [selectedOperator]);

  // Load Permissions tab data
  useEffect(() => {
    if (activeTab === 'permissions' && operatorId) {
      setLoadingPerms(true);
      Promise.all([
        adminRoleService.getPermissionModules().catch(() => ({})),
        loadOperatorPermissions(operatorId).catch(() => null),
      ])
        .then(([mods, permsData]) => {
          if (mods) setModules(mods);
          if (permsData) {
            const roleKeys = permsData.rolePermissions || [];
            const hasCustom = !!permsData.hasCustom;
            const effectiveKeys = permsData.effectivePermissions || (hasCustom ? (permsData.directPermissions || []) : roleKeys);
            setRolePermKeys(roleKeys);
            setSelectedPermKeys(effectiveKeys);
          }
        })
        .finally(() => setLoadingPerms(false));
    }
  }, [activeTab, operatorId, loadOperatorPermissions]);

  // Load Activity tab data
  useEffect(() => {
    if (activeTab === 'activity' && operatorId) {
      setLoadingActivity(true);
      loadOperatorActivity(operatorId, { page: activityPage, limit: 8 })
        .finally(() => setLoadingActivity(false));
    }
  }, [activeTab, operatorId, activityPage, loadOperatorActivity]);

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading avatar photo...');
    try {
      const res = await uploadAvatar(file);
      const url = res?.url || res?.filePath || res;
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (err) {
      toast.error(err?.message || 'Failed to upload avatar', { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle profile update submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const name = formData.name?.trim();
    const email = formData.email?.trim();
    const phone = formData.phone?.trim();

    if (!name) {
      toast.error('Full Name is required.');
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number (min 10 digits).');
      return;
    }

    if (quotas?.buses && Number(formData.assignedBuses) > quotas.buses.remaining) {
      toast.error(`Bus capacity limit exceeded! Max ${quotas.buses.remaining} available in your plan (${quotas.buses.allocated} allocated to other fleets).`);
      return;
    }
    if (quotas?.drivers && Number(formData.activeDriversCount) > quotas.drivers.remaining) {
      toast.error(`Driver headcount limit exceeded! Max ${quotas.drivers.remaining} available in your plan (${quotas.drivers.allocated} allocated to other fleets).`);
      return;
    }

    setSavingProfile(true);

    const payload = {
      name,
      email,
      phone,
      clearance: formData.clearance,
      department: formData.department,
      depotId: formData.depotId ? Number(formData.depotId) : null,
      assignedBuses: Number(formData.assignedBuses) || 0,
      activeDriversCount: Number(formData.activeDriversCount) || 0,
      description: formData.description,
      status: formData.status,
      avatarUrl: formData.avatarUrl,
      documents: formData.documents,
    };

    toast.promise(
      updateFleetOperator(operatorId, payload),
      {
        loading: 'Saving profile changes...',
        success: () => {
          if (onUpdated) onUpdated();
          return 'Fleet operator profile updated successfully!';
        },
        error: (err) => {
          if (err?.message) return err.message;
          if (typeof err === 'string') return err;
          return 'Failed to update profile.';
        },
      }
    ).finally(() => setSavingProfile(false));
  };

  // Handle Permission Checkbox Toggle
  const togglePermissionKey = (key) => {
    setSelectedPermKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Save Permissions
  const handleSavePermissions = async () => {
    setSavingPerms(true);
    toast.promise(
      updateOperatorPermissions(operatorId, selectedPermKeys),
      {
        loading: 'Updating permissions...',
        success: 'Custom permissions updated successfully!',
        error: (err) => err?.message || 'Failed to update permissions',
      }
    ).finally(() => setSavingPerms(false));
  };

  // Reset Permissions to Role Defaults
  const handleResetPermissions = async () => {
    setSavingPerms(true);
    toast.promise(
      updateOperatorPermissions(operatorId, 'RESET'),
      {
        loading: 'Resetting permissions to role defaults...',
        success: (res) => {
          const roleKeys = res?.rolePermissions || rolePermKeys;
          setSelectedPermKeys(roleKeys);
          return 'Permissions reset to role defaults!';
        },
        error: (err) => err?.message || 'Failed to reset permissions',
      }
    ).finally(() => setSavingPerms(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-sm">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'FO'}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Manage Fleet Operator</h2>
              <p className="text-xs text-slate-500 font-mono">
                {selectedOperator?.code || selectedOperator?.enrollment_no || `FO-${operatorId}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200 bg-white flex gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Profile & Details
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Permissions</span>
            {operatorPermissions?.hasCustom && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-800 font-black">
                Custom
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'activity'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Activity Logs
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {loading ? (
            <div className="h-full flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Photo Upload Header */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-black text-xl">
                        {formData.avatarUrl ? (
                          <img
                            src={resolveFileUrl(formData.avatarUrl)}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          formData.name.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute inset-0 rounded-full bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                      >
                        {uploadingAvatar ? '...' : 'Change'}
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Profile Photo</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        JPEG, PNG or WEBP. Max size 5MB.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                      >
                        {uploadingAvatar ? 'Uploading image...' : 'Upload new picture'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Depot Manager"
                        value={formData.clearance}
                        onChange={(e) => setFormData({ ...formData, clearance: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fleet Operations"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Assigned Depot
                      </label>
                      <select
                        value={formData.depotId}
                        onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      >
                        <option value="">Select Depot...</option>
                        {depots.map((depot) => (
                          <option key={depot.id} value={depot.id}>
                            {depot.name} ({depot.code || `DEP-${depot.id}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">
                          Assigned Buses
                        </label>
                        {quotas?.buses && (
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            Max {quotas.buses.remaining} avail
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.assignedBuses}
                        onChange={(e) => setFormData({ ...formData, assignedBuses: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">
                          Active Drivers
                        </label>
                        {quotas?.drivers && (
                          <span className="text-[10px] font-mono font-bold text-indigo-600">
                            Max {quotas.drivers.remaining} avail
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={formData.activeDriversCount}
                        onChange={(e) => setFormData({ ...formData, activeDriversCount: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Fleet Operational Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Brief description of routes served, service level targets, and fleet scope"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-300 focus:outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Account Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended / Deactivated</option>
                      </select>
                    </div>
                  </div>

                  {/* Multiple Documents Section */}
                  <MultipleDocumentUploader
                    documents={formData.documents || []}
                    onChange={(docs) => setFormData((prev) => ({ ...prev, documents: docs }))}
                    title="Operator Verification & Contract Documents"
                    purpose="fleet_operator_doc"
                  />


                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingProfile && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: PERMISSIONS */}
              {activeTab === 'permissions' && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-amber-900">Custom User Permissions</h4>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Permissions granted directly to this Fleet Operator over and above their default role permissions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetPermissions}
                      disabled={savingPerms}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-100 disabled:opacity-50 text-[11px]"
                    >
                      Reset to Role Default
                    </button>
                  </div>

                  {loadingPerms ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-900 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(modules).length === 0 ? (
                        <p className="text-slate-400 italic">No permission modules available</p>
                      ) : (
                        Object.entries(modules).map(([moduleName, perms]) => (
                          <div key={moduleName} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-3.5 py-2 font-bold text-slate-800 border-b border-slate-200 uppercase tracking-wider text-[10px]">
                              {moduleName}
                            </div>
                            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {perms.map((perm) => {
                                const isChecked = selectedPermKeys.includes(perm.key);
                                const isRoleDefault = rolePermKeys.includes(perm.key);
                                const isRevoked = !isChecked && isRoleDefault;

                                return (
                                  <label
                                    key={perm.id || perm.key}
                                    className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer ${
                                      isRevoked
                                        ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                                        : isChecked
                                        ? 'bg-slate-50 border-slate-300'
                                        : 'bg-white border-slate-100 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermissionKey(perm.key)}
                                      className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                    />
                                    <div className="flex-1">
                                      <div className="font-bold text-slate-900 flex items-center justify-between">
                                        <span className={isRevoked ? 'line-through text-rose-700' : ''}>{perm.label || perm.key}</span>
                                        {isRevoked && (
                                          <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-black uppercase">
                                            Revoked
                                          </span>
                                        )}
                                        {isChecked && isRoleDefault && (
                                          <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                            Role
                                          </span>
                                        )}
                                        {isChecked && !isRoleDefault && (
                                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                            Direct
                                          </span>
                                        )}
                                      </div>
                                      <div className={`text-[10px] font-mono mt-0.5 ${isRevoked ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {perm.key}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}

                      <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePermissions}
                          disabled={savingPerms}
                          className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                        >
                          {savingPerms && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          <span>Save Permissions</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ACTIVITY LOGS */}
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {loadingActivity ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-900 border-t-transparent"></div>
                    </div>
                  ) : operatorActivity.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-100">
                      No activity logs recorded for this operator yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {operatorActivity.map((act) => (
                          <div key={act.id} className="relative group">
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{act.action || act.description || 'System Activity'}</span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'Recently'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                {act.details || act.payload ? JSON.stringify(act.details || act.payload) : act.action}
                              </p>
                              {act.ipAddress && (
                                <div className="text-[9px] font-mono text-slate-400">
                                  IP: {act.ipAddress}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <Pagination
                          currentPage={activityPagination?.page || activityPage}
                          totalPages={activityPagination?.totalPages || 1}
                          totalItems={activityPagination?.total || operatorActivity.length}
                          pageSize={8}
                          onPageChange={(p) => setActivityPage(p)}
                          pageSizeOptions={[8]}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFleetOperatorModal;

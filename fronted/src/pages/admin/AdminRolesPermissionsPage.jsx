import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminRole } from '../../hooks/admin/useAdminRole';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

/* Simple Clean Role Name Formatter for Tenant Roles */
function formatSimpleRoleName(role) {
  if (!role) return 'Role';
  const code = String(role.code || '').toUpperCase();
  const name = String(role.name || '');

  if (code === 'TROLE-ADMIN' || name.includes('Tenant Administrator')) return 'Tenant Administrator';
  if (code === 'TROLE-DEPOT-MANAGER' || name.includes('Depot')) return 'Depot Manager';
  if (code === 'TROLE-SHIFT-SUPERVISOR' || name.includes('Shift')) return 'Shift Supervisor';
  if (code === 'TROLE-COMPLIANCE-OFFICER' || name.includes('Compliance')) return 'Compliance Officer';
  if (code === 'TROLE-ACCOUNTANT' || name.includes('Accountant')) return 'Accountant';
  if (code === 'ROLE-FLEET-OPERATOR' || name.includes('Fleet')) return 'Fleet Operator';
  if (code === 'ROLE-DRIVER' || name.includes('Driver')) return 'Driver';
  return name.replace(/\(.*\)/g, '').trim();
}

const ROLE_ICONS = {
  'TROLE-ADMIN':              '🏢',
  'TROLE-DEPOT-MANAGER':      '📋',
  'TROLE-SHIFT-SUPERVISOR':   '⏱️',
  'TROLE-COMPLIANCE-OFFICER': '🛡️',
  'TROLE-ACCOUNTANT':         '💰',
  'ROLE-FLEET-OPERATOR':      '🚌',
  'ROLE-DRIVER':              '🧑‍✈️',
};

const MODULE_ICONS = {
  Platform:   '🔑',
  Tenant:     '🏢',
  Fleet:      '🚌',
  Driver:     '🧑‍✈️',
  Technician: '🔧',
  Advertiser: '📢',
  Government: '🏛️',
  Finance:    '💰',
  General:    '⚙️',
};

export const AdminRolesPermissionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    roles, permissions,
    loadRoles, createRole, deleteRole, updateRole, loadPermissions,
  } = useAdminRole();

  const orgName = user?.organization?.name || user?.org?.name || 'Organization';

  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [activePermIds, setActivePermIds] = useState(new Set());
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('ALL');
  const [permSearch, setPermSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  useEffect(() => {
    loadRoles().catch(() => {});
    loadPermissions().catch(() => {});
  }, [loadRoles, loadPermissions]);

  const roleList = useMemo(() => (Array.isArray(roles) ? roles : []), [roles]);

  const selectedRole = useMemo(() => {
    if (!selectedRoleId) return null;
    return roleList.find((r) => r.id === selectedRoleId) || null;
  }, [roleList, selectedRoleId]);

  // Sync active permissions whenever selectedRole changes
  useEffect(() => {
    if (!selectedRole) {
      setActivePermIds(new Set());
      return;
    }
    const ids = (selectedRole.permissions || []).map((p) => (typeof p === 'object' ? p.id : p));
    setActivePermIds(new Set(ids));
    setPermSearch('');
    if (selectedRole.category && selectedRole.category !== 'Platform') {
      setSelectedModuleFilter(selectedRole.category);
    } else {
      setSelectedModuleFilter('ALL');
    }
  }, [selectedRole]);

  const allPermsList = useMemo(() => (Array.isArray(permissions) ? permissions : []), [permissions]);

  // Unique list of available modules
  const availableModules = useMemo(() => {
    const set = new Set();
    allPermsList.forEach((p) => {
      if (p.module) set.add(p.module);
    });
    return Array.from(set);
  }, [allPermsList]);

  // Check if permissions were modified
  const isDirty = useMemo(() => {
    if (!selectedRole) return false;
    const initialIds = new Set((selectedRole.permissions || []).map((p) => (typeof p === 'object' ? p.id : p)));
    if (initialIds.size !== activePermIds.size) return true;
    for (const id of activePermIds) {
      if (!initialIds.has(id)) return true;
    }
    return false;
  }, [selectedRole, activePermIds]);

  // Filtered permissions based on module filter and search
  const filteredPermissions = useMemo(() => {
    return allPermsList.filter((p) => {
      if (selectedModuleFilter !== 'ALL' && p.module !== selectedModuleFilter) {
        return false;
      }
      if (permSearch.trim()) {
        const query = permSearch.toLowerCase();
        const matchesKey = (p.key || '').toLowerCase().includes(query);
        const matchesLabel = (p.label || '').toLowerCase().includes(query);
        const matchesModule = (p.module || '').toLowerCase().includes(query);
        if (!matchesKey && !matchesLabel && !matchesModule) return false;
      }
      return true;
    });
  }, [allPermsList, selectedModuleFilter, permSearch]);

  const isSystemRole = selectedRole?.is_system || selectedRole?.isSystem;

  const handleTogglePerm = (permId) => {
    const next = new Set(activePermIds);
    if (next.has(permId)) {
      next.delete(permId);
    } else {
      next.add(permId);
    }
    setActivePermIds(next);
  };

  const handleSelectAllVisible = () => {
    const next = new Set(activePermIds);
    filteredPermissions.forEach((p) => next.add(p.id));
    setActivePermIds(next);
    toast.success(`Selected all visible permissions (${filteredPermissions.length})`);
  };

  const handleDeselectAllVisible = () => {
    const next = new Set(activePermIds);
    filteredPermissions.forEach((p) => next.delete(p.id));
    setActivePermIds(next);
    toast.success('Deselected visible permissions');
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      await updateRole(selectedRole.id, Array.from(activePermIds));
      await loadRoles();
      toast.success(`Permissions saved for ${formatSimpleRoleName(selectedRole)}!`);
    } catch (err) {
      toast.error(err?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return;
    try {
      const created = await toast.promise(
        createRole({ ...newRole, category: 'Tenant', permissionIds: [] }),
        { loading: 'Creating role...', success: 'Role created!', error: (err) => err?.message || 'Failed' }
      );
      if (created?.id) setSelectedRoleId(created.id);
      setShowCreateModal(false);
      setNewRole({ name: '', description: '' });
      await loadRoles();
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!selectedRole || isSystemRole) return;
    try {
      await toast.promise(
        deleteRole(selectedRole.id),
        { loading: 'Deleting role...', success: 'Role deleted!', error: (err) => err?.message || 'Failed' }
      );
      setSelectedRoleId(null);
      setShowDeleteModal(false);
      await loadRoles();
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Tenant Admin', path: '/admin/dashboard' },
              { label: 'Users & Team', path: '/admin/users' },
              { label: 'Roles & Permissions' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {orgName} — {t('admin.roles.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('admin.roles.select_role_prompt')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/activity"
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FleetIcons.Clock className="w-4 h-4" />
            <span>{t('admin.roles.activity_stream')}</span>
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Plus className="w-4 h-4" />
            <span>{t('admin.roles.create_designation')}</span>
          </button>
        </div>
      </div>

      {/* STEP 1: SELECT ROLE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black">
              1
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {t('admin.roles.step1_title')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-zinc-400 font-bold whitespace-nowrap">{t('admin.roles.choose_role_label')}</label>
            <select
              value={selectedRoleId || ''}
              onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) || e.target.value : null)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">{t('admin.roles.select_role_ph')}</option>
              {roleList.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatSimpleRoleName(r)} ({r.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Role Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {roleList.map((r) => {
            const isSelected = selectedRoleId === r.id;
            const simpleName = formatSimpleRoleName(r);
            const RoleIcon = getRoleIcon(r.code, r.category);
            const permCount = (r.permissions || []).length;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoleId(r.id)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 select-none group ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'
                }`}
              >
                <div className="mt-0.5 group-hover:scale-110 transition-transform flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600"><RoleIcon className="w-5 h-5" /></div>
                <div className="w-full">
                  <div className={`text-xs font-black truncate leading-tight ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                    {simpleName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate mt-0.5">
                    {r.code}
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {isSelected ? t('common.selected') || 'Selected' : `${permCount} ${t('admin.users.permissions') || 'perms'}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PERMISSIONS MANAGEMENT FOR SELECTED ROLE */}
      {!selectedRole ? (
        <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
            👆
          </div>
          <h3 className="text-base font-black text-slate-800">
            {t('admin.roles.select_role_prompt')}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {t('admin.roles.select_hint')}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          
          {/* Active Role Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20 font-bold">
                {ROLE_ICONS[selectedRole.code] || MODULE_ICONS[selectedRole.category] || '🛡️'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                    2
                  </span>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {formatSimpleRoleName(selectedRole)} Permissions
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedRole.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedRole.category || 'Tenant'} Module
                  </span>
                  {isDirty && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      ● Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Configure default permissions for <strong>{formatSimpleRoleName(selectedRole)}</strong> in {orgName}.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                ✅ {activePermIds.size} Permissions Active
              </div>

              {!isSystemRole && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                >
                  Delete Role
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-2 ${
                  isDirty
                    ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {saving ? t('common.saving') : t('admin.roles.save_permissions')}
              </button>
            </div>
          </div>

          {/* Search and Module Filter Tabs */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedModuleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedModuleFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                All Modules ({allPermsList.length})
              </button>
              {availableModules.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModuleFilter(mod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedModuleFilter === mod
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {(() => { const MIcon = getRoleIcon('', mod); return <MIcon className="w-3.5 h-3.5" />; })()}
                  <span>{mod}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder={t('admin.roles.search_permissions_ph')}
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs px-3 py-1.5 pl-8 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <FleetIcons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              <div className="flex items-center gap-1 whitespace-nowrap">
                <button
                  type="button"
                  onClick={handleSelectAllVisible}
                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllVisible}
                  className="px-2.5 py-1.5 text-[11px] font-bold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Permissions Grid */}
          {filteredPermissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              {t('admin.roles.no_permissions_found')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPermissions.map((perm) => {
                const isChecked = activePermIds.has(perm.id);

                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePerm(perm.id)}
                    className={`p-3.5 rounded-xl border transition-all select-none cursor-pointer ${
                      isChecked
                        ? 'bg-blue-50/60 border-blue-300 hover:border-blue-400 shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            {perm.label || perm.key}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {perm.key}
                          </div>
                          <div className="text-[9px] text-slate-400 font-semibold mt-1">
                            {perm.module} Module
                          </div>
                        </div>
                      </div>

                      <div>
                        {isChecked ? (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                            Off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Save Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-slate-500 font-medium">
              {t('admin.roles.toggle_perm_help')}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                  isDirty
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {saving ? t('common.saving') : isDirty ? t('admin.roles.save_permissions') : t('common.saved') || 'Saved'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600 font-bold text-xl">
                ⚠️
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('admin.roles.delete_custom_role')}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('admin.roles.confirm_delete')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{t('admin.roles.create_staff_designation')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.roles.designation_name_req')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('admin.roles.designation_name_ph')}
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">{t('admin.roles.description_label')}</label>
                <textarea
                  rows={2}
                  placeholder={t('admin.roles.description_ph')}
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

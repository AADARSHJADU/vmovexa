import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';

const ALL_MODULES = ['All', 'Platform', 'Tenant', 'Fleet', 'Technician', 'Advertiser', 'Government', 'Finance', 'Driver'];

export const UserPermissionModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  userRole,
  fetchPermissionsFn,
  updatePermissionsFn,
  isTenantAdmin = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [activePermissions, setActivePermissions] = useState([]);
  const [hasCustom, setHasCustom] = useState(false);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState([]);
  const [selectedModule, setSelectedModule] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);

    Promise.all([
      fetchPermissionsFn(userId),
      fetch('/api/v1/permissions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('vmovexa_token')}` },
      }).then((res) => res.json()).catch(() => ({ data: [] })),
    ])
      .then(([permData, catalogRes]) => {
        const rPerms = permData?.rolePermissions || [];
        const dPerms = permData?.directPermissions || [];
        const custom = !!permData?.hasCustom;

        setRolePermissions(rPerms);
        setHasCustom(custom);

        // If user has custom permissions saved, set activePermissions to dPerms.
        // Otherwise default activePermissions to rPerms (Role default permissions).
        if (custom) {
          setActivePermissions(dPerms);
        } else {
          setActivePermissions(rPerms);
        }

        const catalog = catalogRes?.data || catalogRes?.items || [];
        if (catalog.length > 0) {
          setAllAvailablePermissions(catalog);
        } else {
          const fallbackKeys = Array.from(new Set([...rPerms, ...dPerms]));
          setAllAvailablePermissions(fallbackKeys.map((k) => ({ key: k, label: k.replace(/_/g, ' '), module: 'General' })));
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load user permissions');
      })
      .finally(() => setLoading(false));
  }, [isOpen, userId, fetchPermissionsFn]);

  const displayedModules = useMemo(() => {
    if (isTenantAdmin) {
      return ['All', 'Tenant', 'Fleet', 'Driver', 'Finance', 'Technician'];
    }
    return ALL_MODULES;
  }, [isTenantAdmin]);

  const filteredPermissions = useMemo(() => {
    return allAvailablePermissions.filter((p) => {
      if (isTenantAdmin && !['Tenant', 'Fleet', 'Driver', 'Finance', 'Technician'].includes(p.module)) {
        return false;
      }
      const matchesModule = selectedModule === 'All' || p.module === selectedModule;
      const matchesSearch =
        (p.key || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.module || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesModule && matchesSearch;
    });
  }, [allAvailablePermissions, selectedModule, searchQuery, isTenantAdmin]);

  const handleTogglePermission = (key) => {
    if (activePermissions.includes(key)) {
      setActivePermissions(activePermissions.filter((k) => k !== key));
    } else {
      setActivePermissions([...activePermissions, key]);
    }
  };

  const handleResetToRoleDefault = async () => {
    setSaving(true);
    try {
      await updatePermissionsFn(userId, 'RESET');
      setActivePermissions(rolePermissions);
      setHasCustom(false);
      toast.success('Reset to Role default permissions');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to reset permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePermissionsFn(userId, activePermissions);
      toast.success('User specific permissions saved successfully!');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save user permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{userName || 'User Direct Permissions'}</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {userRole || 'User'}
                </span>
                {hasCustom && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Custom Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{userEmail} — Select specific permissions allowed for this user.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FleetIcons.Close className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <span className="text-slate-400">Role Total:</span>
              <span className="font-bold text-slate-200">{rolePermissions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">User Allowed:</span>
              <span className="font-bold text-emerald-400">{activePermissions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="text-slate-400">Disabled/Revoked:</span>
              <span className="font-bold text-red-400">{Math.max(0, rolePermissions.length - activePermissions.length)}</span>
            </div>
          </div>

          {hasCustom && (
            <button
              onClick={handleResetToRoleDefault}
              disabled={saving}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 transition-colors inline-flex items-center gap-1"
            >
              <FleetIcons.Refresh className="w-3.5 h-3.5" />
              <span>Reset to Role Defaults ({rolePermissions.length})</span>
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-900/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {displayedModules.map((mod) => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedModule === mod
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {mod}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg text-xs px-3 py-1.5 pl-8 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <FleetIcons.Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <span className="inline-block animate-spin mr-2">⏳</span> Loading user permissions...
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No permissions found matching query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPermissions.map((p) => {
                const isRoleDefault = rolePermissions.includes(p.key);
                const isAllowed = activePermissions.includes(p.key);

                return (
                  <div
                    key={p.key}
                    onClick={() => handleTogglePermission(p.key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isAllowed
                        ? isRoleDefault
                          ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                          : 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-500/60'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-60 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => {}}
                          className="mt-0.5 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white leading-tight">{p.label || p.key}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.key}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isAllowed ? (
                          isRoleDefault ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              ✅ Role Active
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ⚡ Custom Granted
                            </span>
                          )
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-red-500/15 text-red-400 border border-red-500/30">
                            🚫 Access Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Check or uncheck permissions to grant or revoke specific access for this user.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60 transition-all shadow-lg shadow-blue-600/30"
            >
              {saving ? 'Saving...' : 'Save User Permissions'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserPermissionModal;

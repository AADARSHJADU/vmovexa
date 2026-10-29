import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

// ============================================================
// ROLE-SPECIFIC PERMISSION GROUPS
// Each group maps to a sidebar section for that role.
// ============================================================

const ROLE_PERMISSION_CONFIG = {
  ADVERTISER: {
    label: 'Advertiser',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Overview Dashboard',
        icon: '📊',
        keys: ['advertiser.dashboard.view'],
      },
      {
        id: 'CAMPAIGNS_VIEW',
        label: 'Campaigns Hub (View)',
        icon: '📢',
        keys: ['campaigns.view', 'campaigns.list'],
      },
      {
        id: 'CAMPAIGNS_CREATE',
        label: 'Create New Campaign',
        icon: '➕',
        keys: ['campaigns.create'],
      },
      {
        id: 'CAMPAIGNS_MANAGE',
        label: 'Manage Campaigns (Edit/Delete)',
        icon: '✏️',
        keys: ['campaigns.update', 'campaigns.delete', 'campaigns.manage'],
      },
      {
        id: 'CAMPAIGNS_VERIFY',
        label: 'Campaign Verification',
        icon: '✅',
        keys: ['campaigns.verify', 'campaigns.approve', 'campaigns.reject'],
      },
      {
        id: 'CAMPAIGNS_PAYMENT',
        label: 'Send Payment Link',
        icon: '💳',
        keys: ['campaigns.payment.send', 'campaigns.payment.manage', 'campaigns.payment.view'],
      },
      {
        id: 'CAMPAIGNS_LIFECYCLE',
        label: 'Lifecycle & Flow (Start/Pause/End)',
        icon: '🔄',
        keys: ['campaigns.start', 'campaigns.pause', 'campaigns.resume', 'campaigns.end', 'campaigns.lifecycle.manage'],
      },
      {
        id: 'ANALYTICS',
        label: 'Analytics & Heatmaps',
        icon: '📈',
        keys: ['campaigns.analytics.view', 'campaigns.analytics.export'],
      },
      {
        id: 'REPORTS',
        label: 'Proof-of-Play Reports',
        icon: '📋',
        keys: ['reports.view', 'reports.generate', 'reports.export'],
      },
      {
        id: 'BILLING',
        label: 'Billing & Wallet',
        icon: '💰',
        keys: ['finance.invoices.view', 'finance.payments.view', 'billing.view'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Alerts & Messages',
        icon: '🔔',
        keys: ['notifications.view', 'notifications.manage'],
      },
      {
        id: 'PROFILE',
        label: 'Brand Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update', 'account.settings'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage', 'uploads.manage'],
      },
    ],
  },

  GOVERNMENT: {
    label: 'Government Agency',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Authority Dashboard',
        icon: '🏛️',
        keys: ['government.dashboard.view'],
      },
      {
        id: 'CAMPAIGNS_VIEW',
        label: 'Public Campaigns (View)',
        icon: '📢',
        keys: ['government.campaigns.view', 'government.campaigns.list'],
      },
      {
        id: 'CAMPAIGNS_CREATE',
        label: 'Broadcast Campaign (Create)',
        icon: '📡',
        keys: ['government.campaigns.create'],
      },
      {
        id: 'CAMPAIGNS_MANAGE',
        label: 'Manage Campaigns (Edit/Verify)',
        icon: '✏️',
        keys: ['government.campaigns.update', 'government.campaigns.manage', 'government.campaigns.verify'],
      },
      {
        id: 'EMERGENCY',
        label: 'Emergency Override',
        icon: '🚨',
        keys: ['government.emergency.manage', 'government.emergency.broadcast'],
      },
      {
        id: 'TRACKING',
        label: 'Sovereign Tracking',
        icon: '🗺️',
        keys: ['government.tracking.view'],
      },
      {
        id: 'ANALYTICS',
        label: 'Transit Analytics',
        icon: '📈',
        keys: ['government.analytics.view'],
      },
      {
        id: 'REPORTS',
        label: 'Compliance Reports',
        icon: '📋',
        keys: ['government.reports.view', 'government.reports.export'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Critical Alerts',
        icon: '🔔',
        keys: ['notifications.view', 'notifications.manage'],
      },
      {
        id: 'PROFILE',
        label: 'Agency Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update', 'account.settings'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage'],
      },
    ],
  },

  TECHNICIAN: {
    label: 'Technician',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Overview Dashboard',
        icon: '📊',
        keys: ['technician.dashboard.view'],
      },
      {
        id: 'WORK_ORDERS',
        label: 'Field Work Orders (View/Update)',
        icon: '🔧',
        keys: ['work_orders.view', 'work_orders.update', 'technician.work_orders.view'],
      },
      {
        id: 'DEVICES',
        label: 'Display Devices (View/Register)',
        icon: '📺',
        keys: ['technician.devices.view', 'technician.devices.register'],
      },
      {
        id: 'HARDWARE_CONFIG',
        label: 'Hardware Configuration',
        icon: '⚙️',
        keys: ['technician.hardware-config.manage', 'technician.hardware.configure'],
      },
      {
        id: 'GPS',
        label: 'GPS Installation',
        icon: '📡',
        keys: ['technician.gps.manage', 'technician.gps.install'],
      },
      {
        id: 'HARDWARE_STATUS',
        label: 'Hardware Status',
        icon: '🖥️',
        keys: ['technician.hardware-status.view'],
      },
      {
        id: 'DIAGNOSTICS',
        label: 'Diagnostics Tests',
        icon: '🔬',
        keys: ['technician.diagnostics.manage'],
      },
      {
        id: 'CONNECTIVITY',
        label: 'Connectivity Matrix',
        icon: '🌐',
        keys: ['technician.connectivity.view'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Alerts & Events',
        icon: '🔔',
        keys: ['notifications.view'],
      },
      {
        id: 'PROFILE',
        label: 'Technician Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update', 'account.settings'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage'],
      },
    ],
  },

  FINANCE: {
    label: 'Finance Officer',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Overview Dashboard',
        icon: '📊',
        keys: ['finance.dashboard.view'],
      },
      {
        id: 'SUBSCRIPTIONS',
        label: 'Subscriptions (View)',
        icon: '📦',
        keys: ['finance.subscriptions.view'],
      },
      {
        id: 'INVOICES',
        label: 'Invoices & Billing (View/Generate)',
        icon: '🧾',
        keys: ['finance.invoices.view', 'finance.invoices.generate', 'finance.invoices.create'],
      },
      {
        id: 'CAMPAIGN_PAYMENTS',
        label: 'Campaign Payments',
        icon: '💳',
        keys: ['finance.payments.view', 'campaigns.payment.view', 'campaigns.payment.manage'],
      },
      {
        id: 'PAYMENTS',
        label: 'Payments Ledger',
        icon: '💰',
        keys: ['finance.payments.export'],
      },
      {
        id: 'REPORTS',
        label: 'Revenue Reports',
        icon: '📈',
        keys: ['finance.reports.view', 'finance.reports.generate', 'finance.reports.export'],
      },
      {
        id: 'GST',
        label: 'GST & Tax Returns',
        icon: '🏦',
        keys: ['finance.gst.view', 'finance.gst.manage'],
      },
      {
        id: 'RECONCILIATION',
        label: 'Bank Reconciliation',
        icon: '🔄',
        keys: ['finance.reconciliation.view', 'finance.reconciliation.manage'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Financial Alerts',
        icon: '🔔',
        keys: ['notifications.view'],
      },
      {
        id: 'PROFILE',
        label: 'Finance Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update', 'account.settings'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage'],
      },
    ],
  },

  FLEET: {
    label: 'Fleet Operator',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Overview Dashboard',
        icon: '📊',
        keys: ['fleet.dashboard.view'],
      },
      {
        id: 'FLEETS',
        label: 'Fleet Management (Fleets & Depots)',
        icon: '🏢',
        keys: [
          'fleet.fleets.view', 'fleet.fleets.create', 'fleet.fleets.update', 'fleet.fleets.delete',
          'fleet.depots.view', 'fleet.depots.create', 'fleet.depots.update', 'fleet.depots.delete',
        ],
      },
      {
        id: 'VEHICLES',
        label: 'Vehicles & Displays',
        icon: '🚌',
        keys: [
          'fleet.vehicles.view', 'fleet.vehicles.create', 'fleet.vehicles.update', 'fleet.vehicles.delete',
          'devices.displays.view', 'devices.displays.manage',
        ],
      },
      {
        id: 'DRIVERS',
        label: 'Drivers & Staff',
        icon: '👷',
        keys: [
          'fleet.drivers.view', 'fleet.drivers.create', 'fleet.drivers.update', 'fleet.drivers.delete',
          'fleet.drivers.approve', 'fleet.drivers.assign',
          'users.view', 'users.create', 'users.update',
          'invitations.view', 'invitations.manage',
        ],
      },
      {
        id: 'ROUTES',
        label: 'Transit Routes',
        icon: '🗺️',
        keys: ['fleet.routes.view', 'fleet.routes.create', 'fleet.routes.update', 'fleet.routes.delete', 'fleet.routes.assign'],
      },
      {
        id: 'GPS',
        label: 'GPS / Edge Units',
        icon: '📡',
        keys: ['fleet.devices.read', 'fleet.devices.create', 'fleet.devices.update', 'fleet.devices.delete', 'fleet.devices.assign'],
      },
      {
        id: 'TRIPS',
        label: 'Trips & Dispatch / Live Telematics',
        icon: '🔴',
        keys: ['fleet.trips.view', 'fleet.trips.create', 'fleet.trips.update', 'fleet.trips.delete', 'fleet.tracking.view'],
      },
      {
        id: 'WORK_ORDERS',
        label: 'Technician Requests / Work Orders',
        icon: '🔧',
        keys: ['work_orders.view', 'work_orders.create', 'work_orders.assign', 'work_orders.update'],
      },
      {
        id: 'INCIDENTS',
        label: 'Emergency Incidents',
        icon: '🚨',
        keys: ['fleet.incidents.view', 'fleet.incidents.create', 'fleet.incidents.update', 'fleet.incidents.delete'],
      },
      {
        id: 'REPORTS',
        label: 'Analytics & Reports',
        icon: '📈',
        keys: ['fleet.reports.view', 'reports.generate', 'reports.export'],
      },
      {
        id: 'ACTIVITY',
        label: 'Activity Logs',
        icon: '📝',
        keys: ['activity.view'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Alerts & Events',
        icon: '🔔',
        keys: ['notifications.view'],
      },
      {
        id: 'PROFILE',
        label: 'Operator Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage', 'uploads.manage'],
      },
    ],
  },

  DRIVER: {
    label: 'Driver',
    sections: [
      {
        id: 'DASHBOARD',
        label: 'Overview Dashboard',
        icon: '📊',
        keys: ['drivers.dashboard.view', 'drivers.portal.view'],
      },
      {
        id: 'ROUTES',
        label: 'My Routes',
        icon: '🗺️',
        keys: ['fleet.routes.view', 'fleet.tracking.view'],
      },
      {
        id: 'SCHEDULE',
        label: 'Shift Schedules',
        icon: '📅',
        keys: ['fleet.trips.view', 'drivers.duty.manage', 'fleet.vehicles.view'],
      },
      {
        id: 'INCIDENTS',
        label: 'Report Incident & Incidents Log',
        icon: '🚨',
        keys: ['drivers.incidents.report', 'fleet.incidents.view', 'fleet.incidents.update'],
      },
      {
        id: 'DOCUMENTS',
        label: 'Driver Documents',
        icon: '📁',
        keys: ['drivers.documents.manage', 'uploads.manage'],
      },
      {
        id: 'NOTIFICATIONS',
        label: 'Operational Alerts',
        icon: '🔔',
        keys: ['notifications.view'],
      },
      {
        id: 'PROFILE',
        label: 'Driver Profile & Account',
        icon: '👤',
        keys: ['profile.view', 'profile.update'],
      },
      {
        id: 'SUPPORT',
        label: 'Help & Support',
        icon: '🛟',
        keys: ['support.view', 'support.manage'],
      },
    ],
  },
};

// Resolve which role config to use based on user's role code/name
function getRoleConfig(userRole) {
  const code = String(userRole || '').toUpperCase();
  if (code.includes('ADVERTISER')) return ROLE_PERMISSION_CONFIG.ADVERTISER;
  if (code.includes('GOVT') || code.includes('GOVERNMENT')) return ROLE_PERMISSION_CONFIG.GOVERNMENT;
  if (code.includes('TECH') && !code.includes('TENANT')) return ROLE_PERMISSION_CONFIG.TECHNICIAN;
  if (code.includes('FINANCE')) return ROLE_PERMISSION_CONFIG.FINANCE;
  if (code.includes('DRIVER')) return ROLE_PERMISSION_CONFIG.DRIVER;
  if (code.includes('FLEET') || code.includes('OPERATOR')) return ROLE_PERMISSION_CONFIG.FLEET;
  return null; // Super Admin / Tenant Admin: show all
}

export const UserPermissionSection = ({
  userId,
  userName,
  userEmail,
  userRole,
  fetchPermissionsFn,
  updatePermissionsFn,
  isTenantAdmin = false,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [activePermissions, setActivePermissions] = useState([]);
  const [hasCustom, setHasCustom] = useState(false);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');

  const roleConfig = useMemo(() => getRoleConfig(userRole), [userRole]);

  // Load permissions on mount
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      fetchPermissionsFn(userId),
      apiClient
        .get(ENDPOINTS.RBAC.PERMISSIONS)
        .then((res) => {
          const d = res?.data;
          if (Array.isArray(d?.data)) return d.data;
          if (Array.isArray(d)) return d;
          return [];
        })
        .catch(() => []),
    ])
      .then(([permData, catalogRes]) => {
        const rPerms = permData?.rolePermissions || [];
        const dPerms = permData?.directPermissions || [];
        const custom = !!permData?.hasCustom;

        setRolePermissions(rPerms);
        setHasCustom(custom);
        setActivePermissions(custom ? dPerms : rPerms);

        const catalog = Array.isArray(catalogRes)
          ? catalogRes
          : Array.isArray(catalogRes?.data)
          ? catalogRes.data
          : [];

        if (catalog.length > 0) {
          setAllAvailablePermissions(catalog);
        } else {
          const fallbackKeys = Array.from(new Set([...rPerms, ...dPerms]));
          setAllAvailablePermissions(
            fallbackKeys.map((k) => ({ key: k, label: k.replace(/[._]/g, ' '), module: 'General' }))
          );
        }
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load user permissions');
      })
      .finally(() => setLoading(false));
  }, [userId, fetchPermissionsFn]);

  // Build role-scoped permission list
  const scopedPermissions = useMemo(() => {
    if (!allAvailablePermissions.length) return [];

    if (!roleConfig) {
      // No role config (Super Admin, Tenant Admin) → show all
      return allAvailablePermissions;
    }

    // All keys defined in this role's sections
    const roleKeys = new Set();
    roleConfig.sections.forEach((sec) => sec.keys.forEach((k) => roleKeys.add(k)));

    // Include permissions in role key set OR already assigned to the user
    return allAvailablePermissions.filter((p) => {
      return roleKeys.has(p.key) || rolePermissions.includes(p.key) || activePermissions.includes(p.key);
    });
  }, [allAvailablePermissions, roleConfig, rolePermissions, activePermissions]);

  // Section tabs
  const sectionTabs = useMemo(() => {
    const baseTabs = [{ id: 'ALL', label: 'All Permissions', icon: '🔑' }];
    if (!roleConfig) return baseTabs;
    return [
      ...baseTabs,
      ...roleConfig.sections.map((s) => ({ id: s.id, label: s.label, icon: s.icon })),
    ];
  }, [roleConfig]);

  // Section counts
  const sectionCounts = useMemo(() => {
    const counts = { ALL: scopedPermissions.length };
    if (roleConfig) {
      roleConfig.sections.forEach((sec) => {
        counts[sec.id] = scopedPermissions.filter((p) => sec.keys.includes(p.key)).length;
      });
    }
    return counts;
  }, [scopedPermissions, roleConfig]);

  // Filtered permissions
  const filteredPermissions = useMemo(() => {
    return scopedPermissions.filter((p) => {
      if (activeSectionFilter !== 'ALL') {
        const sec = roleConfig?.sections.find((s) => s.id === activeSectionFilter);
        if (!sec || !sec.keys.includes(p.key)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesKey = (p.key || '').toLowerCase().includes(q);
        const matchesLabel = (p.label || '').toLowerCase().includes(q);
        const matchesModule = (p.module || '').toLowerCase().includes(q);
        if (!matchesKey && !matchesLabel && !matchesModule) return false;
      }
      return true;
    });
  }, [scopedPermissions, activeSectionFilter, searchQuery, roleConfig]);

  const revokedCount = useMemo(
    () => scopedPermissions.filter((p) => !activePermissions.includes(p.key)).length,
    [scopedPermissions, activePermissions]
  );

  const handleTogglePermission = (key) => {
    if (activePermissions.includes(key)) {
      setActivePermissions(activePermissions.filter((k) => k !== key));
    } else {
      setActivePermissions([...activePermissions, key]);
    }
  };

  // Section-level bulk toggle
  const handleToggleSection = (sectionId, enable) => {
    const sec = roleConfig?.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    if (enable) {
      setActivePermissions(Array.from(new Set([...activePermissions, ...sec.keys])));
      toast.success(`Enabled all "${sec.label}" permissions`);
    } else {
      setActivePermissions(activePermissions.filter((k) => !sec.keys.includes(k)));
      toast.success(`Disabled all "${sec.label}" permissions`);
    }
  };

  const handleResetToRoleDefault = async () => {
    setSaving(true);
    try {
      await updatePermissionsFn(userId, 'RESET');
      setActivePermissions(rolePermissions);
      setHasCustom(false);
      toast.success('Reset to Role default permissions');
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
    } catch (err) {
      toast.error(err?.message || 'Failed to save user permissions');
    } finally {
      setSaving(false);
    }
  };

  const getPermSectionLabel = (key) => {
    if (!roleConfig) return null;
    const sec = roleConfig.sections.find((s) => s.keys.includes(key));
    return sec ? `${sec.icon} ${sec.label}` : null;
  };

  const roleName = roleConfig?.label || userRole || 'User';

  return (
    <div className="w-full space-y-6 text-slate-900 dark:text-white font-sans">
      {/* User Info Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-transparent dark:border-zinc-700"
            >
              <span>← Back to Users</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/20 shrink-0">
              {(userName || 'U')[0].toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {userName || 'User Permissions'}
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {roleName}
                </span>
                {hasCustom ? (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                    <FleetIcons.Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Custom Configured</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                    <FleetIcons.Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Role Default Standard</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                {userEmail} — Managing <strong className="text-slate-800 dark:text-zinc-200">{roleName}</strong> role permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasCustom && (
              <button
                onClick={handleResetToRoleDefault}
                disabled={saving}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <FleetIcons.Refresh className="w-3.5 h-3.5" />
                <span>Reset to Role Defaults ({rolePermissions.length})</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-60 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {saving ? 'Saving Changes...' : 'Save User Permissions'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Role Base Standard</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{rolePermissions.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-300">
              <FleetIcons.Shield className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">User Active Allowed</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activePermissions.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FleetIcons.Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">Revoked / Disabled</div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{revokedCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100/80 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <FleetIcons.Close className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Permissions Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{roleName} Role Permissions</h3>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activePermissions.length} Active / {scopedPermissions.length} Total
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder={`Search ${roleName} permissions...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs px-3.5 py-2 pl-9 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all"
            />
            <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-zinc-800 text-xs font-bold no-scrollbar">
          {sectionTabs.map((tab) => {
            const isActive = activeSectionFilter === tab.id;
            const count = sectionCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSectionFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                <span className={`px-1.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : count > 0
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-200/80 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section Enable/Disable All Bar */}
        {activeSectionFilter !== 'ALL' && roleConfig && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 rounded-xl p-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
              {sectionTabs.find((t) => t.id === activeSectionFilter)?.icon}{' '}
              <strong>{sectionTabs.find((t) => t.id === activeSectionFilter)?.label}</strong>{' '}
              — {sectionCounts[activeSectionFilter] || 0} permissions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSection(activeSectionFilter, true)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer flex items-center gap-1"
              >
                <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Enable All</span>
              </button>
              <button
                onClick={() => handleToggleSection(activeSectionFilter, false)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer flex items-center gap-1"
              >
                <FleetIcons.Close className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Disable All</span>
              </button>
            </div>
          </div>
        )}

        {/* Permission Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 dark:text-zinc-500 text-sm flex items-center justify-center gap-2">
            <FleetIcons.Refresh className="w-4 h-4 animate-spin text-blue-500" />
            <span>Fetching {roleName} permissions...</span>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 text-sm">
            {scopedPermissions.length === 0
              ? `No permissions found for the "${roleName}" role in the system.`
              : `No matching permissions found in this section.`}
            <button
              onClick={() => setActiveSectionFilter('ALL')}
              className="ml-2 text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer"
            >
              Show All ({scopedPermissions.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredPermissions.map((p) => {
              const isRoleDefault = rolePermissions.includes(p.key);
              const isAllowed = activePermissions.includes(p.key);
              const sectionLabel = getPermSectionLabel(p.key);

              return (
                <div
                  key={p.key}
                  onClick={() => handleTogglePermission(p.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
                    isAllowed
                      ? isRoleDefault
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs'
                        : 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 opacity-70 hover:opacity-100 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug break-words">
                          {p.label || p.key?.replace(/[._]/g, ' ')}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-1 break-all">{p.key}</div>
                        {sectionLabel && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5 truncate">
                            Section: {sectionLabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAllowed ? (
                        isRoleDefault ? (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 whitespace-nowrap inline-flex items-center gap-1">
                            <FleetIcons.Check className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>Role Active</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 whitespace-nowrap inline-flex items-center gap-1">
                            <FleetIcons.Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Custom Granted</span>
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 whitespace-nowrap inline-flex items-center gap-1">
                          <FleetIcons.Close className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Access Revoked</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Showing {filteredPermissions.length} of {scopedPermissions.length} permissions for{' '}
            <strong className="text-slate-800 dark:text-zinc-200">{roleName}</strong>. Click cards to toggle direct access.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-transparent dark:border-zinc-700"
            >
              Cancel / Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-60 transition-all shadow-sm cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save User Permissions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionSection;

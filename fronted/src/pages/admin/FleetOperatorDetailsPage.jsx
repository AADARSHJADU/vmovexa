import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { adminRoleService } from '../../api/services/admin/role.service';
import { resolveFileUrl } from '../../api/services/upload.service';
import { ManageFleetOperatorModal } from '../../components/admin/ManageFleetOperatorModal';
import { AssignVehicleSection } from '../../components/admin/AssignVehicleSection';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const FleetOperatorDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/fleets' : '/admin/fleet-operators';
  const { hasPermission } = useAuth();
  const canView = !isFleetPortal || hasPermission('fleet.fleets.view');

  const {
    selectedOperator,
    operatorActivity,
    activityPagination,
    operatorPermissions,
    loadFleetOperator,
    loadOperatorActivity,
    loadOperatorPermissions,
    updateOperatorPermissions,
    updateOperatorStatus,
  } = useAdminFleetOperator();

  const queryTab = new URLSearchParams(location.search).get('tab');
  const queryAction = new URLSearchParams(location.search).get('action');
  const [activeTab, setActiveTab] = useState(
    ['overview', 'vehicles', 'permissions', 'activity'].includes(queryTab) ? queryTab : 'overview'
  );
  const isAssignMode = activeTab === 'vehicles' && queryAction === 'assign';
  const [loading, setLoading] = useState(true);
  const [activityPage, setActivityPage] = useState(1);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const currentTab = new URLSearchParams(location.search).get('tab');
    if (currentTab && ['overview', 'vehicles', 'permissions', 'activity'].includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [location.search]);

  const { vehicles: rawVehicles, loading: loadingVehicles, loadVehicles, updateVehicle } = useAdminVehicle();

  const [unassigningVehicleId, setUnassigningVehicleId] = useState(null);
  const [vehicleSearch, setVehicleSearch] = useState('');

  const openAssignMode = () => {
    setActiveTab('vehicles');
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', 'vehicles');
    nextParams.set('action', 'assign');
    navigate(`${location.pathname}?${nextParams.toString()}`);
  };

  const closeAssignMode = () => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('tab', 'vehicles');
    nextParams.delete('action');
    const newSearch = nextParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`);
  };

  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    const nextParams = new URLSearchParams(location.search);
    nextParams.delete('action');
    if (tabKey === 'overview') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tabKey);
    }
    const newSearch = nextParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
  };

  const refreshVehiclesAndDetails = () => {
    if (id) {
      loadVehicles({ fleet_id: id, limit: 100 }).catch(() => {});
      loadFleetOperator(id).catch(() => {});
    }
  };

  const handleUnassignVehicle = async (veh, e) => {
    if (e) e.stopPropagation();
    const busPlate = veh.bus_number || veh.busNumber || veh.code || `Vehicle #${veh.id}`;
    if (!window.confirm(`Are you sure you want to unassign vehicle "${busPlate}" from this fleet? It will return to available/unassigned status.`)) {
      return;
    }
    setUnassigningVehicleId(veh.id);
    try {
      await toast.promise(
        updateVehicle(veh.id, { fleet_id: null }),
        {
          loading: `Unassigning vehicle ${busPlate}...`,
          success: `Vehicle ${busPlate} unassigned from fleet!`,
          error: (err) => err?.message || 'Failed to unassign vehicle',
        }
      );
      refreshVehiclesAndDetails();
    } finally {
      setUnassigningVehicleId(null);
    }
  };

  useEffect(() => {
    if (id) {
      loadVehicles({ fleet_id: id, limit: 100 }).catch(() => {});
    }
  }, [id, loadVehicles]);

  // Permission editing state inside details page
  const [permissionModules, setPermissionModules] = useState({});
  const [selectedPermKeys, setSelectedPermKeys] = useState([]);
  const [rolePermKeys, setRolePermKeys] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [editPermsMode, setEditPermsMode] = useState(false);

  // Manage Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const fetchDetails = () => {
    if (isFleetPortal && !canView) return;
    if (id) {
      setLoading(true);
      loadFleetOperator(id)
        .catch((err) => {
          toast.error(err?.message || 'Failed to load operator details');
          navigate('/admin/fleet-operators');
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, canView, isFleetPortal, loadFleetOperator, navigate]);

  useEffect(() => {
    if (activeTab === 'permissions' && id) {
      setLoadingPerms(true);
      Promise.all([
        adminRoleService.getPermissionModules().catch(() => ({})),
        loadOperatorPermissions(id).catch(() => null),
      ])
        .then(([mods, permsData]) => {
          if (mods) setPermissionModules(mods);
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
  }, [activeTab, id, loadOperatorPermissions]);

  const revokedPermKeys = useMemo(() => {
    return rolePermKeys.filter((k) => !selectedPermKeys.includes(k));
  }, [rolePermKeys, selectedPermKeys]);

  const directAddedKeys = useMemo(() => {
    return selectedPermKeys.filter((k) => !rolePermKeys.includes(k));
  }, [rolePermKeys, selectedPermKeys]);

  const directVehicles = Array.isArray(selectedOperator?.vehicles)
    ? selectedOperator.vehicles
    : Array.isArray(selectedOperator?.assignedVehicles)
    ? selectedOperator.assignedVehicles
    : [];
  const fetchedVehicles = Array.isArray(rawVehicles) ? rawVehicles : (rawVehicles?.items || rawVehicles?.rows || []);
  const vehiclesList = directVehicles.length > 0 ? directVehicles : fetchedVehicles;

  const displayedVehicles = useMemo(() => {
    if (!vehicleSearch.trim()) return vehiclesList;
    const q = vehicleSearch.trim().toLowerCase();
    return vehiclesList.filter((v) => {
      const busNum = String(v.bus_number || v.busNumber || v.code || '').toLowerCase();
      const model = String(v.model || v.vehicle_type || '').toLowerCase();
      const driver = String(v.driver?.name || v.assignedDriver || '').toLowerCase();
      const depotName = String(v.depot?.name || v.depot_name || '').toLowerCase();
      const routeName = String(v.assigned_route || v.assignedRoute || '').toLowerCase();
      return busNum.includes(q) || model.includes(q) || driver.includes(q) || depotName.includes(q) || routeName.includes(q);
    });
  }, [vehiclesList, vehicleSearch]);

  useEffect(() => {
    if (activeTab === 'activity' && id) {
      setLoadingActivity(true);
      loadOperatorActivity(id, { page: activityPage, limit: 10 }).finally(() =>
        setLoadingActivity(false)
      );
    }
  }, [activeTab, id, activityPage, loadOperatorActivity]);

  const handleToggleStatus = async (newStatus) => {
    if (!selectedOperator) return;
    setUpdatingStatus(true);
    try {
      await toast.promise(
        updateOperatorStatus(selectedOperator.id, newStatus),
        {
          loading: `Updating account status...`,
          success: `Operator account set to ${newStatus}!`,
          error: (err) => err?.message || 'Failed to update status',
        }
      );
      fetchDetails();
    } catch {
      /* toast handles error */
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTogglePermission = (key) => {
    setSelectedPermKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedOperator) return;
    setSavingPerms(true);
    try {
      await toast.promise(
        updateOperatorPermissions(selectedOperator.id, selectedPermKeys),
        {
          loading: 'Saving user permissions...',
          success: 'Direct user permissions updated successfully!',
          error: (err) => err?.message || 'Failed to update permissions',
        }
      );
      setEditPermsMode(false);
      const res = await loadOperatorPermissions(selectedOperator.id);
      if (res) {
        const roleKeys = res.rolePermissions || [];
        const hasCustom = !!res.hasCustom;
        const effectiveKeys = res.effectivePermissions || (hasCustom ? (res.directPermissions || []) : roleKeys);
        setRolePermKeys(roleKeys);
        setSelectedPermKeys(effectiveKeys);
      }
    } catch {
      /* toast handles error */
    } finally {
      setSavingPerms(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!selectedOperator) return;
    if (!window.confirm('Reset all direct permission overrides back to role default?')) return;
    setSavingPerms(true);
    try {
      await toast.promise(
        updateOperatorPermissions(selectedOperator.id, 'RESET'),
        {
          loading: 'Resetting permissions to role defaults...',
          success: 'Permissions reset to role default!',
          error: (err) => err?.message || 'Failed to reset permissions',
        }
      );
      setEditPermsMode(false);
      const res = await loadOperatorPermissions(selectedOperator.id);
      if (res) {
        const roleKeys = res.rolePermissions || [];
        setRolePermKeys(roleKeys);
        setSelectedPermKeys(roleKeys);
      }
    } catch {
      /* toast handles error */
    } finally {
      setSavingPerms(false);
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <FleetIcons.Lock className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked') || 'Access Revoked'}</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to view fleet operations.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          {t('admin.fleet_operators.back_to_profile') || 'Back to Fleets'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-600 dark:text-zinc-400 font-bold text-sm">{t('admin.fleet_operators.loading_details') || 'Loading complete operator profile & permission records...'}</div>
        </div>
      </div>
    );
  }

  if (!selectedOperator) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="text-slate-500 dark:text-zinc-400 font-bold text-base">{t('admin.fleet_operators.not_found') || 'Fleet operator account not found.'}</div>
        <Link
          to={basePath}
          className="inline-block px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors"
        >
          Back to Fleet Operators List
        </Link>
      </div>
    );
  }

  const avatar = selectedOperator.avatarUrl || selectedOperator.avatar_url || selectedOperator.avatar || selectedOperator.profile_picture;
  const code = selectedOperator.code || selectedOperator.enrollment_no || `FO-${selectedOperator.id}`;
  const depot = selectedOperator.depot?.name || selectedOperator.depot_name || selectedOperator.fleetOperatorProfile?.depot?.name || formatName(selectedOperator.depot);
  // Bus Quota & Active Count
  const currentBuses = vehiclesList.length > 0 ? vehiclesList.length : (selectedOperator.current_buses ?? selectedOperator.vehicles_count ?? 0);
  const maxBuses = selectedOperator.max_buses ?? selectedOperator.target_buses_count ?? selectedOperator.assigned_buses ?? selectedOperator.assignedBuses ?? selectedOperator.fleetOperatorProfile?.assigned_buses ?? 0;
  const buses = maxBuses;

  // Driver Quota & Enrolled Count
  const driverCountFromVehicles = vehiclesList.filter((v) => v.assigned_driver_id || v.driver?.id).length;
  const currentDrivers = selectedOperator.current_drivers ?? selectedOperator.drivers_count ?? (driverCountFromVehicles > 0 ? driverCountFromVehicles : 0);
  const maxDrivers = selectedOperator.max_drivers ?? selectedOperator.target_drivers_count ?? selectedOperator.allowed_drivers ?? selectedOperator.activeDriversCount ?? selectedOperator.active_drivers_count ?? selectedOperator.fleetOperatorProfile?.active_drivers_count ?? 0;
  const drivers = maxDrivers;
  const status = selectedOperator.status || 'active';
  const designation = selectedOperator.clearance || selectedOperator.designation || 'Fleet Operator Lead';
  const department = selectedOperator.department || 'Transit Operations';
  const timezone = selectedOperator.timezone || 'Asia/Kolkata';
  const baseCity = selectedOperator.location || selectedOperator.city || selectedOperator.baseCity || selectedOperator.base_city || selectedOperator.fleetOperatorProfile?.location || selectedOperator.fleetOperatorProfile?.base_city || '—';
  const docsList = Array.isArray(selectedOperator.documents) ? selectedOperator.documents : [];
  const createdAt = selectedOperator.createdAt ? new Date(selectedOperator.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const roleName = selectedOperator.role?.name || 'Depot Fleet Operator';
  const roleCode = selectedOperator.role?.code || 'ROLE-FLEET-OPERATOR';

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Breadcrumb Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <Breadcrumb
          items={[
            { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
            { label: isFleetPortal ? 'Fleets' : 'Fleet Operators', path: basePath },
            ...(activeTab === 'overview'
              ? [{ label: selectedOperator.name }]
              : [
                  { label: selectedOperator.name, path: `${basePath}/${selectedOperator.id}` },
                  ...(isAssignMode
                    ? [
                        { label: 'Assigned Vehicles', path: `${basePath}/${selectedOperator.id}?tab=vehicles` },
                        { label: 'Assign Vehicle' },
                      ]
                    : [
                        {
                          label:
                            activeTab === 'vehicles'
                              ? 'Assigned Vehicles'
                              : activeTab === 'permissions'
                              ? 'Security & Permissions'
                              : 'Activity Audit Log',
                        },
                      ]),
                ]),
          ]}
        />

        {isAssignMode ? (
          <button
            type="button"
            onClick={closeAssignMode}
            className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.fleet_operators.back_to_assigned_vehicles') || 'Back to Assigned Vehicles'}</span>
          </button>
        ) : activeTab !== 'overview' ? (
          <button
            type="button"
            onClick={() => switchTab('overview')}
            className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.fleet_operators.back_to_profile') || 'Back to Fleet Profile'}</span>
          </button>
        ) : null}
      </div>

      {isAssignMode ? (
        /* Dedicated In-Page Section: Assign Vehicle to Fleet */
        <AssignVehicleSection
          fleet={selectedOperator}
          onAssigned={() => {
            refreshVehiclesAndDetails();
            closeAssignMode();
          }}
          onCancel={closeAssignMode}
        />
      ) : (
        <>
          {/* Regular Operator Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                to={basePath}
                className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors font-bold text-xs flex items-center gap-1.5"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <span>{selectedOperator.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : status === 'pending_approval'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {status}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                  Code: <strong className="text-slate-800 dark:text-zinc-200">{code}</strong> · {t('admin.fleet_operators.role_label') || 'Role:'} <strong className="text-blue-700 dark:text-blue-400">{roleName} ({roleCode})</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {status === 'pending_approval' && !isFleetPortal && (
                <>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleToggleStatus('active')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FleetIcons.Check className="w-3.5 h-3.5" />
                    <span>{t('admin.fleet_operators.btn_approve') || 'Approve Account'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleToggleStatus('rejected')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FleetIcons.Close className="w-3.5 h-3.5" />
                    <span>{t('admin.drivers.btn_reject') || 'Reject'}</span>
                  </button>
                </>
              )}

              {status !== 'pending_approval' && !isFleetPortal && (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleToggleStatus(status === 'active' ? 'suspended' : 'active')}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    status === 'active'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  }`}
                >
                  <FleetIcons.CheckCircle className="w-3.5 h-3.5" />
                  <span>{status === 'active' ? 'Deactivate Account' : 'Activate Account'}</span>
                </button>
              )}

              {!isFleetPortal && (
                <Link
                  to={`${basePath}/edit/${selectedOperator.id}`}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FleetIcons.Edit className="w-4 h-4 text-white" />
                  <span>{t('admin.fleet_operators.btn_edit_profile') || 'Edit Operator Profile'}</span>
                </Link>
              )}
            </div>
          </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Selection Bar */}
        <div className="px-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 flex gap-6 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => switchTab('overview')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.User className="w-4 h-4" />
            <span>{t('admin.fleet_operators.tab_overview') || 'Overview & Profile Details'}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('vehicles')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'vehicles'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.Bus className="w-4 h-4 text-blue-600" />
            <span>{t('admin.fleet_operators.tab_vehicles') || 'Assigned Vehicles'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'vehicles' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
            }`}>
              {vehiclesList.length}
            </span>
          </button>

          {!isFleetPortal && (
            <button
              type="button"
              onClick={() => switchTab('permissions')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
                activeTab === 'permissions'
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <FleetIcons.ShieldCheck className="w-4 h-4" />
              <span>{t('admin.fleet_operators.tab_security') || 'Security & Custom Permissions'}</span>
              {operatorPermissions?.hasCustom && (
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black tracking-wider uppercase">
                  Custom Overrides
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => switchTab('activity')}
            className={`py-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'activity'
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <FleetIcons.Activity className="w-4 h-4" />
            <span>{t('admin.fleet_operators.tab_audit') || 'Activity Audit Log'}</span>
          </button>
        </div>

        {/* Tab 1: OVERVIEW */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Card Banner */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 shadow-sm flex items-center justify-center text-slate-800 dark:text-white font-black text-2xl overflow-hidden shrink-0">
                    {avatar ? (
                      <img src={resolveFileUrl(avatar)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedOperator.name?.charAt(0).toUpperCase() || 'O'
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedOperator.name}</h3>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 bg-slate-200/70 dark:bg-zinc-700 px-2 py-0.5 rounded-md">{designation}</span>
                      <span>·</span>
                      <span>{department}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pt-1 font-mono">
                      <span className="inline-flex items-center gap-1.5">
                        <FleetIcons.Mail className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        <span>{selectedOperator.email}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1.5">
                        <FleetIcons.Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        <span>{selectedOperator.phone || '—'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end text-xs text-slate-500 dark:text-zinc-400 space-y-1 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-zinc-700 w-full md:w-auto">
                  <div>{t('common.status') || 'Status:'} <strong className="text-slate-900 dark:text-white uppercase font-mono">{status}</strong></div>
                  <div>{t('admin.fleet_operators.account_code') || 'Account Code:'} <strong className="text-slate-900 dark:text-white font-mono">{code}</strong></div>
                  <div>{t('admin.fleet_operators.provisioned') || 'Provisioned:'} <strong className="text-slate-800 dark:text-zinc-200">{createdAt}</strong></div>
                </div>
              </div>

              {/* 4 Stat Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.fleet_operators.col_depot') || 'Assigned Depot'}</span>
                  <div className="text-base font-black text-slate-900 dark:text-white truncate">{depot}</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{baseCity}</p>
                </div>
                <div
                  onClick={() => switchTab('vehicles')}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs rounded-xl space-y-1 shadow-2xs cursor-pointer transition-all group"
                  title={t('admin.fleet_operators.tab_vehicles') || "Click to view assigned vehicles"}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.fleet_operators.bus_quota') || 'Bus Fleet Quota'}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{t('common.details') || 'View'} →</span>
                  </div>
                  <div className="text-base font-black text-blue-700 dark:text-blue-400">{currentBuses} Active / {maxBuses} Max</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.assigned_max_buses') || 'Assigned / Max Bus Capacity'}</p>
                </div>
                <Link
                  to={isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers'}
                  className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xs rounded-xl space-y-1 shadow-2xs transition-all group block cursor-pointer"
                  title={t('admin.fleet_operators.drivers_count') || "Click to view enrolled drivers"}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.fleet_operators.driver_quota') || 'Driver Quota Capacity'}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{t('common.details') || 'View'} →</span>
                  </div>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400">{currentDrivers} Active / {maxDrivers} Max</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.assigned_max_drivers') || 'Assigned / Max Driver Headcount'}</p>
                </Link>
                <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('admin.fleet_operators.kyc_verification') || 'KYC Verification'}</span>
                  <div className="text-base font-black text-purple-700 dark:text-purple-400">{docsList.length} {t('admin.fleet_operators.uploaded') || 'Uploaded'} Docs</div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.legal_identity') || 'Legal & identity proofs'}</p>
                </div>
              </div>

              {/* Fleet Operational Scope & Description */}
              <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl space-y-2 shadow-2xs min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    <FleetIcons.Document className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Fleet Operational Description & Scope
                  </h4>
                </div>
                <div className="bg-white/80 dark:bg-zinc-800/80 border border-blue-100/80 dark:border-zinc-700/60 rounded-xl p-3.5 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium break-words break-all whitespace-pre-wrap min-w-0 max-w-full overflow-hidden">
                  {selectedOperator.description || 'No operational description provided.'}
                </div>
              </div>

              {/* Information Field Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal & Account Information */}
                <div className="bg-slate-50/60 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <FleetIcons.User className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <span>{t('admin.fleet_operators.personal_details') || 'Personal & Account Details'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.drivers.full_name') || 'Full Name'}</span>
                      <div className="text-slate-900 dark:text-white font-bold truncate">{selectedOperator.name}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.drivers.email_address') || 'Email Address'}</span>
                      <div className="text-slate-900 dark:text-white font-mono truncate">{selectedOperator.email}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.drivers.phone_number') || 'Phone Number'}</span>
                      <div className="text-slate-900 dark:text-white font-mono">{selectedOperator.phone || '—'}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.role_label') || 'Role Title'}</span>
                      <div className="text-blue-700 dark:text-blue-400 font-bold">{roleName}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.designation') || 'Designation / Clearance'}</span>
                      <div className="text-slate-900 dark:text-white font-bold">{designation}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.department') || 'Department'}</span>
                      <div className="text-slate-900 dark:text-white font-bold">{department}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.timezone') || 'Timezone'}</span>
                      <div className="text-slate-900 dark:text-white font-mono">{timezone}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.primary_city') || 'Primary Base City'}</span>
                      <div className="text-slate-900 dark:text-white font-bold">{baseCity}</div>
                    </div>
                  </div>
                </div>

                {/* Operations & Depot Scope */}
                <div className="bg-slate-50/60 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 min-w-0 overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('admin.fleet_operators.depot_ops_scope') || 'Depot & Vehicle Operations Scope'}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium divide-y divide-slate-100 dark:divide-zinc-800">
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.col_depot') || 'Assigned Depot Base'}</span>
                      <div className="text-slate-900 dark:text-white font-bold truncate">{depot}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.fleet_category') || 'Fleet Category'}</span>
                      <div className="text-slate-900 dark:text-white font-bold">{selectedOperator.fleet_type || 'Intracity Transit'}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.allowed_bus_capacity') || 'Allowed Bus Fleet Capacity'}</span>
                      <div className="text-blue-700 dark:text-blue-400 font-black text-sm">{maxBuses} Max Buses ({currentBuses} Assigned)</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.allowed_driver_capacity') || 'Allowed Driver Headcount'}</span>
                      <div className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{maxDrivers} Max Drivers ({currentDrivers} Assigned)</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('admin.fleet_operators.working_hours') || 'Working Hours'}</span>
                      <div className="text-slate-900 dark:text-white font-mono">{selectedOperator.working_hours || selectedOperator.workingHours || '05:00 AM - 11:30 PM'}</div>
                    </div>
                    <div className="space-y-0.5 pt-2 min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase">{t('common.status') || 'Account Status'}</span>
                      <div className="font-bold uppercase text-slate-900 dark:text-white">{status}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* {t('admin.fleet_operators.uploaded') || 'Uploaded'} Verification & KYC Documents Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <FleetIcons.FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{t('admin.fleet_operators.kyc_docs_title') || 'Verification & Legal KYC Documents'}</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">{docsList.length} files attached</span>
                </div>

                {docsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {docsList.map((doc, idx) => {
                      const docUrl = doc.url || doc.file_url || doc.filePath || (typeof doc === 'string' ? doc : null);
                      const title = doc.category || doc.purpose || doc.name || `Legal Document #${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl flex items-center justify-between shadow-2xs transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center shrink-0">
                              <FleetIcons.FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 truncate">
                                {title}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                                <span>{t('admin.fleet_operators.kyc_attached') || 'KYC Attached'}</span>
                                <span>•</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('admin.fleet_operators.uploaded') || 'Uploaded'}</span>
                              </div>
                            </div>
                          </div>

                          {docUrl && (
                            <a
                              href={resolveFileUrl(docUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                            >
                              <span>{t('common.details') || 'View'}</span>
                              <FleetIcons.ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                    No legal or KYC documents uploaded for this operator account yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              {/* Dedicated Vehicles Section Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center font-bold text-xl shrink-0">
                    <FleetIcons.Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                        Fleet: {selectedOperator.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        {code} · {depot}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mt-1">
                      Assigned Vehicles ({vehiclesList.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Manage commercial transit buses, assigned drivers, and telematics operating under this fleet allocation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <RefreshButton
                    onClick={refreshVehiclesAndDetails}
                    loading={loadingVehicles || loading}
                    title={t('common.refresh') || "Refresh vehicle roster"}
                  />
                  <Link
                    to={`${isFleetPortal ? '/fleet-operator/vehicles' : '/admin/vehicles'}?fleetId=${selectedOperator.id}`}
                    className="px-4 py-2.5 border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <FleetIcons.Search className="w-3.5 h-3.5" />
                    <span>{t('admin.fleet_operators.all_vehicles_dir') || 'All Vehicles Directory'}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={openAssignMode}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>+</span>
                    <span>{t('admin.fleet_operators.assign_vehicle_btn') || 'Assign Vehicle to Fleet'}</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter assigned vehicles bar */}
              {vehiclesList.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="relative flex-1 max-w-sm">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-zinc-500">
                      <FleetIcons.Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder={t('admin.fleet_operators.filter_vehicles_ph') || 'Filter assigned vehicles by plate, model, driver...'}
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                      className="w-full h-8.5 pl-9 pr-3 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Showing <strong>{displayedVehicles.length}</strong> of {vehiclesList.length} assigned units
                  </span>
                </div>
              )}

              {vehiclesList.length === 0 ? (
                <div className="p-12 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-3xl shadow-xs">
                    <FleetIcons.Bus className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{t('admin.fleet_operators.no_vehicles') || 'No Vehicles Bound to this Fleet Yet'}</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                    Select an existing transit bus to allocate under this fleet operator, or create new vehicles.
                  </p>
                  <button
                    type="button"
                    onClick={openAssignMode}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>+</span>
                    <span>{t('admin.fleet_operators.select_assign_vehicle') || 'Select & Assign Vehicle'}</span>
                  </button>
                </div>
              ) : displayedVehicles.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 space-y-1">
                  <p className="font-bold text-slate-700 dark:text-zinc-300">No vehicles match your search query "{vehicleSearch}".</p>
                  <button
                    type="button"
                    onClick={() => setVehicleSearch('')}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedVehicles.map((v) => {
                    const busNumber = v.bus_number || v.busNumber || v.code || `Vehicle #${v.id}`;
                    const vehicleType = v.vehicle_type || v.vehicleType || 'Standard Bus';
                    const driverName = v.driver?.name || v.assignedDriver || (v.assigned_driver_id ? `Driver #${v.assigned_driver_id}` : 'Unassigned');
                    const depotName = v.depot?.name || v.depot_name || (v.depot_id ? `Depot #${v.depot_id}` : '—');
                    const routeName = v.assigned_route || v.assignedRoute || v.route?.name || 'Flexible Route';
                    const status = (v.status || 'in_depot').toLowerCase();
                    const isMoving = status === 'moving' || status === 'on_route';
                    const isIdle = status === 'idle' || status === 'in_depot';

                    return (
                      <div
                        key={v.id}
                        onClick={() => navigate(`${isFleetPortal ? '/fleet-operator/vehicles' : '/admin/vehicles'}/${v.id}`)}
                        className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-sm font-black text-slate-900 dark:text-white font-mono group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                <span>{busNumber}</span>
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{vehicleType}</p>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                isMoving
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                  : isIdle
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                              }`}
                            >
                              {status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('admin.fleet_operators.assigned_driver') || 'Assigned Driver:'}</span>
                              <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[140px]">{driverName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('admin.fleet_operators.home_depot') || 'Home Depot:'}</span>
                              <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[140px]">{depotName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('admin.fleet_operators.transit_route') || 'Transit Route:'}</span>
                              <span className="font-medium text-slate-700 dark:text-zinc-300 truncate max-w-[140px]">{routeName}</span>
                            </div>
                            {v.edgeDevice && (
                              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                                <span className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('admin.fleet_operators.gps_device') || 'GPS Device:'}</span>
                                <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                  {v.edgeDevice.box_id || 'Active GPS'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                          <span className="text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                            <span>{t('admin.fleet_operators.view_specs') || 'View Specs & Telematics'}</span>
                            <FleetIcons.ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                          </span>
                          <button
                            type="button"
                            disabled={unassigningVehicleId === v.id}
                            onClick={(e) => handleUnassignVehicle(v, e)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title={t('admin.fleet_operators.unassign_title') || "Unassign from this fleet"}
                          >
                            {unassigningVehicleId === v.id ? 'Removing...' : 'Unassign ✕'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}



          {/* TAB 2: PERMISSIONS (READ-ONLY DISPLAY) */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {/* Permission Banner & Information Header */}
              <div className="p-5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FleetIcons.ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('admin.fleet_operators.role_permissions') || 'Role & Direct User Permissions'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Base Role: <strong className="text-slate-800 dark:text-zinc-200">{roleName} ({roleCode})</strong>. Standard role permissions are inherited automatically unless overridden per-user.
                  </p>
                </div>
                {operatorPermissions?.hasCustom && (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-black tracking-wider uppercase shrink-0">
                    Custom Overrides Active
                  </span>
                )}
              </div>

              {loadingPerms ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <div className="text-xs text-slate-500 dark:text-zinc-400 font-bold">{t('admin.fleet_operators.loading_permissions') || 'Loading permission matrix...'}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">{t('admin.fleet_operators.role_standard') || 'Role Base Standard'}</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{rolePermKeys.length}</div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-zinc-700/60 flex items-center justify-center text-base">
                        <FleetIcons.ShieldCheck className="w-5 h-5 text-slate-600 dark:text-zinc-300" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{t('admin.fleet_operators.active_allowed') || 'Active Effective Allowed'}</div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedPermKeys.length}</div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-base text-emerald-700 dark:text-emerald-400">
                        <FleetIcons.Check className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">{t('admin.fleet_operators.access_denied') || 'Revoked / Access Denied'}</div>
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{revokedPermKeys.length}</div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-base text-rose-700 dark:text-rose-400">
                        <FleetIcons.Close className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* REVOKED PERMISSIONS (RED DISPLAY) */}
                  {revokedPermKeys.length > 0 && (
                    <div className="p-5 bg-rose-50/80 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                          <h5 className="text-xs font-black uppercase tracking-wider text-rose-950 dark:text-rose-200">
                            Revoked / Denied Role Permissions ({revokedPermKeys.length})
                          </h5>
                        </div>
                        <span className="text-[10px] font-black tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 px-2.5 py-0.5 rounded-full uppercase">
                          Access Revoked
                        </span>
                      </div>
                      <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                        The following permissions are defined in base role <strong>{roleName}</strong>, but have been explicitly revoked / turned off for this user:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                        {revokedPermKeys.map((key) => (
                          <div
                            key={key}
                            className="p-2.5 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-900/60 rounded-xl text-xs font-mono text-rose-950 dark:text-rose-200 flex items-center justify-between shadow-2xs group"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                              <span className="truncate font-bold line-through text-rose-700 dark:text-rose-400 group-hover:text-rose-950 dark:group-hover:text-rose-200">{key}</span>
                            </div>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase font-sans bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                              Revoked
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE GRANTED PERMISSIONS SUMMARY (GREEN) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>Active Effective Permission Keys ({selectedPermKeys.length})</span>
                      </div>
                      {directAddedKeys.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full uppercase">
                          +{directAddedKeys.length} Direct Added
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {selectedPermKeys.map((key) => {
                        const isInherited = rolePermKeys.includes(key);
                        return (
                          <div
                            key={key}
                            className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-slate-800 dark:text-zinc-200 flex items-center justify-between shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate font-bold">{key}</span>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase font-sans shrink-0 ${
                                isInherited ? 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              }`}
                            >
                              {isInherited ? 'Role' : 'Direct'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVITY LOGS */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {loadingActivity ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <div className="text-xs text-slate-500 dark:text-zinc-400 font-bold">{t('admin.fleet_operators.loading_audit') || 'Loading audit logs...'}</div>
                </div>
              ) : operatorActivity.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 font-medium bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                  No activity logs recorded for this operator yet.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-700">
                    {operatorActivity.map((act) => (
                      <div key={act.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 dark:bg-blue-500 ring-4 ring-white dark:ring-zinc-900" />
                        <div className="bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                              {act.action || act.description || 'System Activity'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                              {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'Recently'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-mono">
                            {act.details || act.payload ? JSON.stringify(act.details || act.payload) : act.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                    <Pagination
                      currentPage={activityPagination?.page || activityPage}
                      totalPages={activityPagination?.totalPages || 1}
                      totalItems={activityPagination?.total || operatorActivity.length}
                      pageSize={10}
                      onPageChange={(p) => setActivityPage(p)}
                      pageSizeOptions={[10]}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Slide-over Manage Modal */}
      {isManageModalOpen && (
        <ManageFleetOperatorModal
          operatorId={selectedOperator.id}
          onClose={() => setIsManageModalOpen(false)}
          onUpdated={() => {
            fetchDetails();
            setIsManageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default FleetOperatorDetailsPage;

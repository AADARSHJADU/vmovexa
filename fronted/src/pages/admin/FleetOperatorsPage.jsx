import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useAuth } from '../../hooks/useAuth';
import { ManageFleetOperatorModal } from '../../components/admin/ManageFleetOperatorModal';
import { resolveFileUrl } from '../../api/services/upload.service';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

const formatName = (v, fallback = '—') => {
  if (!v) return fallback;
  if (typeof v === 'object') return v.name || v.code || fallback;
  return String(v);
};

export const FleetOperatorsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/fleets' : '/admin/fleet-operators';

  const {
    fleetOperators,
    pagination,
    loading,
    loadFleetOperators,
    updateOperatorStatus,
    deleteFleetOperator,
  } = useAdminFleetOperator();

  const { hasPermission } = useAuth();
  const canView = !isFleetPortal || hasPermission('fleet.fleets.view');
  const canCreate = !isFleetPortal || hasPermission('fleet.fleets.create');
  const canUpdate = !isFleetPortal || hasPermission('fleet.fleets.update');
  const canDelete = !isFleetPortal || hasPermission('fleet.fleets.delete');

  const { kpis, loadKpis } = useAdminDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('fo_view_mode') || 'table'); // 'table' | 'grid'

  const [manageOperatorId, setManageOperatorId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Sync view preference
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('fo_view_mode', mode);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshList = () => {
    if (isFleetPortal && !canView) return;
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== 'all') params.status = statusFilter;
    loadFleetOperators(params).catch(() => {});
  };

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    refreshList();
  }, [currentPage, pageSize, debouncedSearch, statusFilter, loadFleetOperators, isFleetPortal, canView]);

  useEffect(() => {
    loadKpis().catch(() => {});
  }, [loadKpis]);

  const operatorsList = Array.isArray(fleetOperators) ? fleetOperators : (fleetOperators?.items || fleetOperators?.rows || []);
  const activeCount = operatorsList.filter((o) => (o.status || 'active') === 'active').length;

  // Status Toggle
  const handleToggleStatus = (opr) => {
    const newStatus = opr.status === 'active' ? 'suspended' : 'active';
    setUpdatingStatusId(opr.id);
    toast.promise(
      updateOperatorStatus(opr.id, newStatus),
      {
        loading: `Updating status for ${opr.name}...`,
        success: () => {
          refreshList();
          return `Account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`;
        },
        error: (err) => err?.message || 'Failed to update status',
      }
    ).finally(() => setUpdatingStatusId(null));
  };

  // Delete Action
  const handleDelete = async (opr) => {
    if (!window.confirm(`Are you sure you want to delete operator "${opr.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(opr.id);
    try {
      await toast.promise(
        deleteFleetOperator(opr.id),
        {
          loading: `Deleting operator ${opr.name}...`,
          success: 'Fleet operator deleted successfully!',
          error: (err) => err?.message || 'Failed to delete operator',
        }
      );
      refreshList();
    } catch {
      /* toast handles error */
    } finally {
      setDeletingId(null);
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <FleetIcons.Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked') || 'Access Revoked'}</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          {t('common.access_revoked_desc') || 'Your administrator has revoked your permission to view fleet operations. Please contact your admin.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Fleet Operators' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Fleet Operators
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Depot operators responsible for vehicle registration, GPS linkage, and driver shift scheduling
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton onClick={refreshList} loading={loading} />
          {canCreate && (
            <Link
              to={`${basePath}/add`}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial cursor-pointer active:scale-95"
            >
              <FleetIcons.Plus className="w-4 h-4 text-white" />
              <span>{t('admin.fleet_operators.add_operator') || 'Add Fleet Operator'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 3 Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('admin.fleet_operators.stat_total') || 'Total Operators'}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{pagination?.total ?? operatorsList.length} Operators</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('admin.fleet_operators.stat_active') || 'Active Status'}</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{activeCount} Active</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t('admin.fleet_operators.stat_depots') || 'Depots'}</span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">{kpis?.depotsCount ?? '—'} Depots</div>
        </div>
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.fleet_operators.search_ph') || 'Search operator name, email or depot...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
          >
            <option value="all">{t('admin.fleet_operators.filter_all') || 'All Status'}</option>
            <option value="active">{t('admin.fleet_operators.filter_active') || 'Active Only'}</option>
            <option value="suspended">{t('admin.fleet_operators.filter_suspended') || 'Suspended Only'}</option>
          </select>
        </div>

        {/* View Toggle Buttons */}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={toggleViewMode}
          tableValue="table"
          cardValue="grid"
        />
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Skeleton Loader */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : operatorsList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          No fleet operators found matching your criteria.
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_operator') || 'Operator'}</th>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_designation') || 'Designation'}</th>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_depot') || 'Assigned Depot'}</th>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_scope') || 'Vehicle Scope'}</th>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_drivers') || 'Drivers'}</th>
                  <th className="py-3 px-4">{t('admin.fleet_operators.col_status') || 'Status'}</th>
                  <th className="py-3 px-4 text-right">{t('admin.fleet_operators.col_actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {operatorsList.map((opr) => {
                  const avatar = opr.avatarUrl || opr.avatar_url || opr.avatar || opr.profile_picture;
                  const code = opr.code || opr.enrollment_no || `FO-${opr.id}`;
                  const depot = opr.depot?.name || opr.depot_name || opr.fleetOperatorProfile?.depot?.name || formatName(opr.depot);
                  const currentBuses = opr.current_buses ?? opr.vehicles_count ?? opr.vehicles?.length ?? opr.assignedVehicles?.length ?? 0;
                  const maxBuses = opr.max_buses ?? opr.target_buses_count ?? opr.assignedBuses ?? opr.assigned_buses ?? opr.fleetOperatorProfile?.assigned_buses ?? 0;
                  const currentDrivers = opr.current_drivers ?? opr.drivers_count ?? opr.drivers?.length ?? 0;
                  const maxDrivers = opr.max_drivers ?? opr.target_drivers_count ?? opr.allowed_drivers ?? opr.activeDriversCount ?? opr.active_drivers_count ?? opr.fleetOperatorProfile?.active_drivers_count ?? 0;
                  const status = opr.status || 'active';
                  const designation = opr.clearance || opr.designation || 'Fleet Operator';

                  return (
                    <tr key={opr.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 overflow-hidden text-xs shrink-0">
                            {avatar ? (
                              <img src={resolveFileUrl(avatar)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              opr.name ? opr.name.charAt(0).toUpperCase() : 'O'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{opr.name}</div>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{code} · {opr.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-medium">{designation}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200">{depot}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-700 dark:text-blue-400">
                        <Link
                          to={`${basePath}/${opr.id}?tab=vehicles`}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                          title={`View ${currentBuses} vehicles (Quota: ${maxBuses}) assigned to ${opr.name}`}
                        >
                          <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          <span>{currentBuses} / {maxBuses} Buses</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <Link
                          to={isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers'}
                          className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
                          title={`View enrolled drivers (Quota: ${maxDrivers})`}
                        >
                          <FleetIcons.Driver className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          <span>{currentDrivers} / {maxDrivers} Drivers</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                            status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown buttonTitle={`Actions for ${opr.name}`}>
                            {({ close }) => (
                              <>
                                <Link
                                  to={`${basePath}/${opr.id}`}
                                  onClick={close}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                  <span>{t('admin.fleet_operators.btn_view_details') || 'View Details'}</span>
                                </Link>
                                {canUpdate && (
                                  <Link
                                    to={`${basePath}/edit/${opr.id}`}
                                    onClick={close}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    <span>{t('admin.fleet_operators.btn_edit_operator') || 'Edit Operator'}</span>
                                  </Link>
                                )}
                                {status === 'pending_approval' && !isFleetPortal ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={updatingStatusId === opr.id}
                                      onClick={() => {
                                        setUpdatingStatusId(opr.id);
                                        toast.promise(updateOperatorStatus(opr.id, 'active'), {
                                          loading: 'Approving operator account...',
                                          success: () => { refreshList(); return 'Operator account approved & activated!'; },
                                          error: (err) => err?.message || 'Failed to approve operator',
                                        }).finally(() => setUpdatingStatusId(null));
                                        close();
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>{updatingStatusId === opr.id ? '...' : 'Approve Account'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={updatingStatusId === opr.id}
                                      onClick={() => {
                                        setUpdatingStatusId(opr.id);
                                        toast.promise(updateOperatorStatus(opr.id, 'rejected'), {
                                          loading: 'Rejecting operator account...',
                                          success: () => { refreshList(); return 'Operator account rejected'; },
                                          error: (err) => err?.message || 'Failed to reject operator',
                                        }).finally(() => setUpdatingStatusId(null));
                                        close();
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                      <span>{updatingStatusId === opr.id ? '...' : 'Reject Account'}</span>
                                    </button>
                                  </>
                                ) : status !== 'pending_approval' && canUpdate ? (
                                  <button
                                    type="button"
                                    disabled={updatingStatusId === opr.id}
                                    onClick={() => {
                                      handleToggleStatus(opr);
                                      close();
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>{updatingStatusId === opr.id ? '...' : status === 'active' ? 'Deactivate Account' : 'Activate Account'}</span>
                                  </button>
                                ) : null}
                                {canDelete && (
                                  <>
                                    <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                                    <button
                                      type="button"
                                      disabled={deletingId === opr.id}
                                      onClick={() => {
                                        handleDelete(opr);
                                        close();
                                      }}
                                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                      <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                      <span>{deletingId === opr.id ? 'Deleting...' : 'Delete Operator'}</span>
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </ActionDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Pagination
              currentPage={pagination?.page || currentPage}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.total ?? operatorsList.length}
              pageSize={pagination?.limit || pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operatorsList.map((opr) => {
              const avatar = opr.avatarUrl || opr.avatar_url || opr.avatar || opr.profile_picture;
              const code = opr.code || opr.enrollment_no || `FO-${opr.id}`;
              const depot = opr.depot?.name || opr.depot_name || opr.fleetOperatorProfile?.depot?.name || formatName(opr.depot);
              const currentBuses = opr.current_buses ?? opr.vehicles_count ?? opr.vehicles?.length ?? opr.assignedVehicles?.length ?? 0;
              const maxBuses = opr.max_buses ?? opr.target_buses_count ?? opr.assignedBuses ?? opr.assigned_buses ?? opr.fleetOperatorProfile?.assigned_buses ?? 0;
              const currentDrivers = opr.current_drivers ?? opr.drivers_count ?? opr.drivers?.length ?? 0;
              const maxDrivers = opr.max_drivers ?? opr.target_drivers_count ?? opr.allowed_drivers ?? opr.activeDriversCount ?? opr.active_drivers_count ?? opr.fleetOperatorProfile?.active_drivers_count ?? 0;
              const status = opr.status || 'active';
              const designation = opr.clearance || opr.designation || 'Fleet Operator';

              return (
                <div key={opr.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300 overflow-hidden text-sm shrink-0">
                        {avatar ? (
                          <img src={resolveFileUrl(avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          opr.name ? opr.name.charAt(0).toUpperCase() : 'O'
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{opr.name}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">{code} · {opr.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                        status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('admin.fleet_operators.depot_base') || 'Depot Base:'}</span>
                      <div className="font-bold text-slate-900 dark:text-white">{depot}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">{designation}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px]">{t('admin.fleet_operators.scope') || 'Scope:'}</span>
                      <div>
                        <Link
                          to={`${basePath}/${opr.id}?tab=vehicles`}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1 transition-colors"
                          title={`View ${currentBuses} vehicles (Quota: ${maxBuses}) assigned to ${opr.name}`}
                        >
                          <FleetIcons.Bus className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                          <span>{currentBuses} / {maxBuses} Buses</span>
                        </Link>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-zinc-400 font-bold flex items-center gap-1">
                        <FleetIcons.Driver className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        <span>{currentDrivers} / {maxDrivers} Drivers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                    <span className="font-mono text-[11px]">{opr.phone || '—'}</span>

                    {/* 3-Dot Action Menu */}
                    <ActionDropdown buttonTitle={`Actions for ${opr.name}`}>
                      {({ close }) => (
                        <>
                          <Link
                            to={`${basePath}/${opr.id}`}
                            onClick={close}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                            <span>{t('admin.fleet_operators.btn_view_details') || 'View Details'}</span>
                          </Link>

                          {canUpdate && (
                            <Link
                              to={`${basePath}/edit/${opr.id}`}
                              onClick={close}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                            >
                              <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>{t('admin.fleet_operators.btn_edit_operator') || 'Edit Operator'}</span>
                            </Link>
                          )}
                          {status === 'pending_approval' && !isFleetPortal ? (
                            <>
                              <button
                                type="button"
                                disabled={updatingStatusId === opr.id}
                                onClick={() => {
                                  setUpdatingStatusId(opr.id);
                                  toast.promise(updateOperatorStatus(opr.id, 'active'), {
                                    loading: 'Approving operator account...',
                                    success: () => { refreshList(); return 'Operator account approved & activated!'; },
                                    error: (err) => err?.message || 'Failed to approve operator',
                                  }).finally(() => setUpdatingStatusId(null));
                                  close();
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{updatingStatusId === opr.id ? '...' : 'Approve Account'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingStatusId === opr.id}
                                onClick={() => {
                                  setUpdatingStatusId(opr.id);
                                  toast.promise(updateOperatorStatus(opr.id, 'rejected'), {
                                    loading: 'Rejecting operator account...',
                                    success: () => { refreshList(); return 'Operator account rejected'; },
                                    error: (err) => err?.message || 'Failed to reject operator',
                                  }).finally(() => setUpdatingStatusId(null));
                                  close();
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                <FleetIcons.X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                <span>{updatingStatusId === opr.id ? '...' : 'Reject Account'}</span>
                              </button>
                            </>
                          ) : status !== 'pending_approval' && canUpdate ? (
                            <button
                              type="button"
                              disabled={updatingStatusId === opr.id}
                              onClick={() => {
                                handleToggleStatus(opr);
                                close();
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <FleetIcons.CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{updatingStatusId === opr.id ? '...' : status === 'active' ? 'Deactivate Account' : 'Activate Account'}</span>
                            </button>
                          ) : null}
                          {canDelete && (
                            <>
                              <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                              <button
                                type="button"
                                disabled={deletingId === opr.id}
                                onClick={() => {
                                  handleDelete(opr);
                                  close();
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                                <span>{deletingId === opr.id ? 'Deleting...' : 'Delete Operator'}</span>
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </ActionDropdown>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <Pagination
              currentPage={pagination?.page || currentPage}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.total ?? operatorsList.length}
              pageSize={pagination?.limit || pageSize}
              onPageChange={(p) => setCurrentPage(p)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[6, 10, 20, 50]}
            />
          </div>
        </div>
      )}

      {/* Slide-over Manage Modal */}
      {manageOperatorId && (
        <ManageFleetOperatorModal
          operatorId={manageOperatorId}
          onClose={() => setManageOperatorId(null)}
          onUpdated={refreshList}
        />
      )}
    </div>
  );
};

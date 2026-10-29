import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAdminRoute } from '../../../hooks/admin/useAdminRoute';
import { Pagination } from '../../../components/ui/Pagination';
import { RefreshButton } from '../../../components/ui/RefreshButton';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { ActionDropdown } from '../../../components/ui/ActionDropdown';
import { FleetIcons } from '../../../components/FleetIcons';
import { fleetVehicleService } from '../../../api/services/fleet/vehicle.service';

export const RoutesListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();
  const {
    routes,
    pagination,
    loading,
    loadRoutes,
    deleteRoute,
    approveRoute,
    rejectRoute,
    assignVehicle,
  } = useAdminRoute();

  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/routes' : '/admin/routes';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';

  // Permission checks
  const canView = hasPermission('fleet.routes.view');
  const canCreate = hasPermission('fleet.routes.create');
  const canUpdate = hasPermission('fleet.routes.update');
  const canDelete = hasPermission('fleet.routes.delete');
  const canApprove = !isFleetPortal && hasPermission('fleet.routes.approve');

  // Filters & State
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'active', 'pending_approval', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rejectModalRoute, setRejectModalRoute] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Assign Vehicle to Route State
  const [assignModalRoute, setAssignModalRoute] = useState(null);
  const [operatorVehicles, setOperatorVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [assigningVehicle, setAssigningVehicle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = React.useCallback(async () => {
    try {
      const params = {
        page,
        limit: pageSize,
      };
      if (activeTab !== 'ALL') params.status = activeTab;
      if (debouncedSearch) params.search = debouncedSearch;
      await loadRoutes(params);
    } catch (err) {
      toast.error(err?.message || 'Failed to load routes.');
    }
  }, [page, pageSize, activeTab, debouncedSearch, loadRoutes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async (route) => {
    if (!window.confirm(`Are you sure you want to delete route "${route.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteRoute(route.id);
      toast.success(`Route "${route.name}" deleted successfully.`);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete route.');
    }
  };

  const handleApprove = async (route) => {
    try {
      setActionLoading(true);
      await approveRoute(route.id);
      toast.success(`Route "${route.name}" approved successfully.`);
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve route.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModalRoute) return;
    if (!rejectReason.trim()) {
      toast.error('Please specify a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await rejectRoute(rejectModalRoute.id, rejectReason.trim());
      toast.success(`Route "${rejectModalRoute.name}" has been rejected.`);
      setRejectModalRoute(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject route.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAssignModal = async (route) => {
    setAssignModalRoute(route);
    setSelectedVehicleId('');
    setVehicleSearch('');
    setLoadingVehicles(true);
    try {
      const res = await fleetVehicleService.getVehicles({
        limit: 100,
        exclude_status: 'pending_approval,pending,rejected',
      });
      const raw = Array.isArray(res) ? res : res?.items || res?.rows || [];
      const approvedOnly = raw.filter((v) => {
        const st = String(v?.status || '').toLowerCase().trim();
        return st !== 'pending_approval' && st !== 'pending' && st !== 'rejected';
      });
      setOperatorVehicles(approvedOnly);
    } catch (err) {
      console.error('Failed to load fleet vehicles:', err);
      toast.error('Failed to load fleet vehicles.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleAssignVehicleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVehicleId || !assignModalRoute) {
      toast.error('Please select a vehicle to assign.');
      return;
    }
    try {
      setAssigningVehicle(true);
      await assignVehicle(assignModalRoute.id, { vehicle_id: selectedVehicleId });
      toast.success(`Vehicle assigned to "${assignModalRoute.name}" successfully!`);
      setAssignModalRoute(null);
      setSelectedVehicleId('');
      fetchData();
    } catch (err) {
      toast.error(err?.message || 'Failed to assign vehicle to route.');
    } finally {
      setAssigningVehicle(false);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const all = Array.isArray(routes) ? routes : [];
    const active = all.filter((r) => r.status === 'active').length;
    const pending = all.filter((r) => r.status === 'pending_approval').length;
    const totalStops = all.reduce((acc, r) => acc + (r.stops?.length || 0), 0);
    return { total: pagination?.total || all.length, active, pending, totalStops };
  }, [routes, pagination]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <FleetIcons.Lock className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          You do not have permission to view routes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet' : 'Admin', to: dashboardLink },
              { label: 'Routes' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Routes
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Manage bus routes, stops, and schedules.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <RefreshButton
            onClick={fetchData}
            loading={loading}
            title={t('admin.routes.refresh_routes')}
          />
          {canCreate && (
            <button
              onClick={() => navigate(`${basePath}/add`)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
            >
              <FleetIcons.Plus className="w-4 h-4 text-white" />
              <span>{t('admin.routes.add_route')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('admin.routes.total_routes')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{metrics.total}</div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('admin.routes.active_routes')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{metrics.active}</div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('admin.routes.pending_approval')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FleetIcons.Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{metrics.pending}</div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{t('admin.routes.total_stops')}</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FleetIcons.Pin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">{metrics.totalStops}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
          {[
            { key: 'ALL', label: 'All Routes' },
            { key: 'active', label: 'Active' },
            { key: 'pending_approval', label: 'Pending Approval' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('admin.routes.search_ph')}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
            <FleetIcons.Search className="w-3.5 h-3.5" />
          </div>
        </form>
      </div>

      {/* Routes Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-sm">{t('admin.routes.loading_routes')}</span>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <FleetIcons.Bus className="w-6 h-6 text-slate-400 dark:text-zinc-500" />
            </div>
            <div className="text-base font-bold text-slate-800 dark:text-zinc-200">{t('admin.routes.no_routes_found')}</div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              {searchTerm ? t('admin.routes.no_routes_search_hint') : t('admin.routes.no_routes_create_hint')}
            </p>
            {canCreate && (
              <button
                onClick={() => navigate(`${basePath}/add`)}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
                <span>{t('admin.routes.add_route')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
              <thead className="bg-slate-50 dark:bg-zinc-800/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">{t('admin.routes.th_route')}</th>
                  <th className="py-3 px-4">{t('admin.routes.th_origin_destination')}</th>
                  <th className="py-3 px-4">{t('admin.routes.th_distance_time')}</th>
                  <th className="py-3 px-4">{t('admin.routes.th_stops')}</th>
                  <th className="py-3 px-4">{t('admin.routes.th_buses')}</th>
                  <th className="py-3 px-4">{t('admin.routes.th_status')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.routes.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-normal">
                {routes.map((r) => {
                  const assignedCount = r.assignments?.filter((a) => a.status === 'active')?.length || 0;
                  const stopsCount = r.stops?.length || 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`${basePath}/${r.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-sm block"
                        >
                          {r.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">{r.code}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-900 dark:text-zinc-200 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="truncate max-w-[140px]">{r.start_point || t('admin.routes.start_point')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] mt-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span className="truncate max-w-[140px]">{r.end_point || t('admin.routes.destination_point')}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-200">
                          {r.distance_km ? `${r.distance_km} km` : '—'}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {r.total_duration_min ? `~${r.total_duration_min} mins` : '—'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-[11px]">
                          <FleetIcons.Pin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          {stopsCount} {t('admin.routes.stops_count')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                          <FleetIcons.Bus className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          {assignedCount} {t('admin.routes.buses_count')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {getStatusBadge(r.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown
                            items={[
                              {
                                label: t('admin.routes.view_details'),
                                icon: <FleetIcons.Eye className="w-4 h-4 text-slate-500 dark:text-zinc-400" />,
                                onClick: () => navigate(`${basePath}/${r.id}`),
                              },
                              {
                                label: 'Assign Vehicle',
                                icon: <FleetIcons.Bus className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
                                onClick: () => handleOpenAssignModal(r),
                              },
                              ...(canUpdate
                                ? [
                                    {
                                      label: t('admin.routes.edit_route'),
                                      icon: <FleetIcons.Edit className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
                                      onClick: () => navigate(`${basePath}/edit/${r.id}`),
                                    },
                                  ]
                                : []),
                              ...(canApprove && r.status === 'pending_approval'
                                ? [
                                    {
                                      label: t('admin.routes.approve_route'),
                                      icon: <FleetIcons.Check className="w-4 h-4 text-emerald-600" />,
                                      onClick: () => handleApprove(r),
                                    },
                                    {
                                      label: t('admin.routes.reject_route'),
                                      icon: <FleetIcons.Close className="w-4 h-4 text-rose-600" />,
                                      onClick: () => setRejectModalRoute(r),
                                    },
                                  ]
                                : []),
                              ...(canDelete
                                ? [
                                    {
                                      label: t('admin.routes.delete_route'),
                                      icon: <FleetIcons.Trash className="w-4 h-4 text-rose-600" />,
                                      danger: true,
                                      onClick: () => handleDelete(r),
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
          <Pagination
            currentPage={page}
            totalPages={pagination?.totalPages || 1}
            totalItems={pagination?.total ?? (Array.isArray(routes) ? routes.length : 0)}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </div>
      </div>

      {/* Assign Vehicle to Route Modal */}
      {assignModalRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Assign Vehicle to Route
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Route: <strong className="text-slate-800 dark:text-zinc-200">{assignModalRoute.name}</strong>
                  {assignModalRoute.code && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                      {assignModalRoute.code}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!assigningVehicle) {
                    setAssignModalRoute(null);
                    setSelectedVehicleId('');
                  }
                }}
                disabled={assigningVehicle}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Live Search */}
            <div className="relative">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by bus number, plate, or model..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Vehicle List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px] max-h-[340px]">
              {loadingVehicles ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  <span className="text-xs">Loading approved fleet buses...</span>
                </div>
              ) : operatorVehicles.length === 0 ? (
                <div className="text-center py-10 px-4 text-slate-500 dark:text-zinc-400">
                  <FleetIcons.Bus className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No approved vehicles found.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Please ensure your fleet has vehicles with approved status.</p>
                </div>
              ) : (
                (() => {
                  const filtered = operatorVehicles.filter((v) => {
                    const q = vehicleSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (v.bus_number && v.bus_number.toLowerCase().includes(q)) ||
                      (v.plate && v.plate.toLowerCase().includes(q)) ||
                      (v.model && v.model.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No vehicles matching "{vehicleSearch}"
                      </div>
                    );
                  }

                  return filtered.map((v) => {
                    const isSelected = String(selectedVehicleId) === String(v.id);
                    const isCurrentlyOnThisRoute = Number(v.route_id) === Number(assignModalRoute.id);

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(String(v.id))}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-500'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-slate-300 dark:border-zinc-600'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {v.bus_number || v.plate || `Vehicle #${v.id}`}
                              </span>
                              {v.plate && (
                                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                  {v.plate}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                              {v.model ? `${v.model} • ` : ''}
                              {v.capacity ? `${v.capacity} Seats` : 'Standard Transit'}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          {isCurrentlyOnThisRoute ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <FleetIcons.Check className="w-3 h-3 text-emerald-600" /> On this Route
                            </span>
                          ) : v.route_id ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                              Route #{v.route_id}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setAssignModalRoute(null);
                  setSelectedVehicleId('');
                }}
                disabled={assigningVehicle}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignVehicleSubmit}
                disabled={assigningVehicle || !selectedVehicleId}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assigningVehicle ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <FleetIcons.Check className="w-3.5 h-3.5" />
                    <span>Assign Vehicle</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('admin.routes.reject_modal_title')}: {rejectModalRoute.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t('admin.routes.reject_modal_desc')}
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('admin.routes.reject_reason_ph')}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalRoute(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm cursor-pointer"
              >
                Reject Route
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutesListPage;

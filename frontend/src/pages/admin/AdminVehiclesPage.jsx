import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAdminFleetOperator } from '../../hooks/admin/useAdminFleetOperator';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import { ActionDropdown } from '../../components/ui/ActionDropdown';

// ─── Inline Reject Modal ────────────────────────────────────────────────────
const RejectModal = ({ vehicle, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const busNum = vehicle?.bus_number || vehicle?.busNumber || vehicle?.code || `Vehicle #${vehicle?.id}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <FleetIcons.Close className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Reject Vehicle</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Rejecting <span className="font-bold text-slate-800 font-mono">{busNum}</span>
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reject-reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Vehicle registration details incomplete, insurance expired, chassis number mismatch..."
              rows={4}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none resize-none transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              This reason will be recorded in the ApprovalRequest log and shown to the Fleet Operator.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              id="cancel-reject-btn"
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-reject-btn"
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Rejecting...' : 'Confirm Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

export const AdminVehiclesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Portal context detection
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/vehicles' : '/admin/vehicles';
  const dashboardLink = isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard';

  const {
    vehicles,
    pagination,
    loading,
    loadVehicles,
    deleteVehicle,
    approveVehicle,
    rejectVehicle,
  } = useAdminVehicle();

  const { hasPermission } = useAuth();

  // RBAC permissions (always true in Admin portal)
  const canView = !isFleetPortal || hasPermission('fleet.vehicles.view');
  const canCreate = !isFleetPortal || hasPermission('fleet.vehicles.create');
  const canUpdate = !isFleetPortal || hasPermission('fleet.vehicles.update');
  const canDelete = !isFleetPortal || hasPermission('fleet.vehicles.delete');

  const [searchParams, setSearchParams] = useSearchParams();
  const fleetIdParam = searchParams.get('fleetId') || searchParams.get('fleet_id') || '';

  const { fleetOperators, loadFleetOperators } = useAdminFleetOperator();

  useEffect(() => {
    loadFleetOperators({ limit: 100 }).catch(() => {});
  }, [loadFleetOperators]);

  const operatorList = Array.isArray(fleetOperators) ? fleetOperators : (fleetOperators?.items || fleetOperators?.rows || []);
  const activeFleet = operatorList.find((f) => String(f.id) === String(fleetIdParam));
  const activeFleetName = activeFleet?.name || (fleetIdParam ? `Fleet #${fleetIdParam}` : '');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Pending Approval, Moving, Idle, Offline
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('vehicle_view_mode') || 'table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deletingId, setDeletingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, vehicle: null });

  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    const params = { page: currentPage, limit: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (fleetIdParam) params.fleet_id = fleetIdParam;
    loadVehicles(params).catch(() => {});
  }, [currentPage, pageSize, debouncedSearch, fleetIdParam, loadVehicles, isFleetPortal, canView]);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('vehicle_view_mode', mode);
  };

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const filteredVehicles = vehicleList.filter((v) => {
    const s = String(v.status || '').toLowerCase();
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending Approval') return s === 'pending_approval';
    if (activeTab === 'Moving') return s === 'moving' || s === 'on_route';
    if (activeTab === 'Idle') return s === 'idle' || s === 'in_depot';
    if (activeTab === 'Offline') return s === 'offline' || s === 'maintenance' || s === 'rejected';
    return true;
  });

  const handleApprove = async (veh, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    setApprovingId(veh.id);
    try {
      await toast.promise(approveVehicle(veh.id), {
        loading: 'Approving vehicle...',
        success: `Vehicle ${veh.bus_number || veh.busNumber || veh.code} approved! Status set to In Depot.`,
        error: (err) => err?.message || 'Failed to approve vehicle',
      });
      await loadVehicles({ page: currentPage, limit: pageSize });
    } catch {
      /* handled */
    } finally {
      setApprovingId(null);
    }
  };

  const openRejectModal = (veh, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    setRejectModal({ open: true, vehicle: veh });
  };

  const handleConfirmReject = async (reason) => {
    const veh = rejectModal.vehicle;
    if (!veh) return;
    setRejectingId(veh.id);
    try {
      await toast.promise(rejectVehicle(veh.id, reason), {
        loading: 'Rejecting vehicle...',
        success: `Vehicle ${veh.bus_number || veh.busNumber || veh.code} rejected.`,
        error: (err) => err?.message || 'Failed to reject vehicle',
      });
      setRejectModal({ open: false, vehicle: null });
      await loadVehicles({ page: currentPage, limit: pageSize });
    } catch {
      /* handled */
    } finally {
      setRejectingId(null);
    }
  };

  const handleDelete = async (veh) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${veh.bus_number || veh.code}?`)) return;
    setDeletingId(veh.id);
    try {
      await toast.promise(deleteVehicle(veh.id), {
        loading: 'Deleting vehicle...',
        success: 'Vehicle deleted successfully.',
        error: (err) => err?.message || 'Failed to delete vehicle',
      });
      await loadVehicles({ page: currentPage, limit: pageSize });
    } catch {
      /* handled */
    } finally {
      setDeletingId(null);
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <FleetIcons.Shield className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Your administrator has revoked your permission to view vehicles. Please contact your admin.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-16" ref={dropdownRef}>
      {/* 1. Web Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: dashboardLink },
              { label: 'Vehicles Directory' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Vehicles Directory</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Real-time status, assignments, telematics, and approval workflows for all fleet vehicles
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <RefreshButton
            onClick={() => loadVehicles({ page: currentPage, limit: pageSize })}
            loading={loading}
            title="Refresh vehicles fleet"
          />
          {canCreate && (
            <button 
              id="add-vehicle-btn"
              onClick={() => navigate(`${basePath}/add`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <FleetIcons.Plus className="w-4 h-4 text-white" />
              <span>Add New Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Search, Filter Bar & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <FleetIcons.Search className="w-4 h-4 text-slate-400" />
            </span>
            <input 
              placeholder="Search Vehicle plate, model, fleet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Fleet Dropdown Filter */}
          <select
            value={fleetIdParam}
            onChange={(e) => {
              const val = e.target.value;
              const next = new URLSearchParams(searchParams);
              if (val) {
                next.set('fleetId', val);
              } else {
                next.delete('fleetId');
                next.delete('fleet_id');
              }
              setSearchParams(next);
              setCurrentPage(1);
            }}
            className="w-full sm:w-48 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All Fleets</option>
            {operatorList.map((opr) => (
              <option key={opr.id} value={opr.id}>
                {opr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Pending Approval', 'Moving', 'Idle', 'Offline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab 
                    ? tab === 'Pending Approval' 
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm' 
                    : tab === 'Pending Approval'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* View Mode Toggle Switch */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={toggleViewMode}
            tableValue="table"
            cardValue="grid"
            className="shrink-0"
          />
        </div>
      </div>

      {/* Active Fleet Filter Tag */}
      {fleetIdParam && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/90 border border-blue-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-bold">Filtered by Fleet:</span>
            <span className="font-bold text-blue-900">{activeFleetName}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('fleetId');
              next.delete('fleet_id');
              setSearchParams(next);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
            title="Remove fleet filter"
          >
            <span className="flex items-center gap-1">Clear Filter <FleetIcons.Close className="w-3 h-3" /></span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400 animate-pulse">
          Loading fleet vehicles...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredVehicles.length === 0 && (
        <div className="p-12 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-3">
          <p className="font-bold text-slate-700">No vehicles match your criteria.</p>
          {canCreate && (
            <button
              onClick={() => navigate(`${basePath}/add`)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              + Add New Vehicle
            </button>
          )}
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && viewMode === 'grid' && filteredVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((v) => {
            const busNumber = v.bus_number || v.busNumber || v.code || '—';
            const vehicleType = v.vehicle_type || v.vehicleType || 'Standard Bus';
            const fleetName = v.fleet?.name || v.fleet_name || (v.fleet_id ? `Fleet #${v.fleet_id}` : 'General Fleet');
            const driverName = v.driver?.name || v.assignedDriver || (v.assigned_driver_id ? `Driver #${v.assigned_driver_id}` : 'Unassigned');
            const depotName = v.depot?.name || v.depot_name || (v.depot_id ? `Depot #${v.depot_id}` : '—');
            const status = v.status || 'in_depot';
            const isPending = status === 'pending_approval';
            const isRejected = status === 'rejected';

            const photoDoc = Array.isArray(v.documents) ? v.documents.find((d) => d.doc_type === 'bus_photo' || d.category === 'bus_photo' || d.purpose === 'bus_photo') : null;
            const busPhoto = photoDoc?.file_url || photoDoc?.url || (Array.isArray(v.photos) ? v.photos[0] : null) || (Array.isArray(v.bus_images) ? v.bus_images[0] : null);

            return (
              <div 
                key={v.id} 
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all shadow-sm flex flex-col justify-between group overflow-hidden"
              >
                <div>
                  {busPhoto && (
                    <div className="-mx-5 -mt-5 mb-4 h-32 overflow-hidden rounded-t-2xl bg-slate-900 border-b border-slate-100 relative group-hover:brightness-105 transition-all">
                      <img src={resolveFileUrl(busPhoto)} alt={busNumber} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link 
                        to={`${basePath}/${v.id}`}
                        className="font-mono text-sm font-black text-slate-900 tracking-wider hover:text-blue-600 hover:underline"
                      >
                        {busNumber}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5">{vehicleType}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                        isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        status === 'on_route' || status === 'moving' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        status === 'in_depot' || status === 'idle' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{status.replace(/_/g, ' ')}</span>
                      </span>

                      {/* 3-Dot Menu */}
                      <ActionDropdown menuWidth="w-52">
                        {({ close }) => (
                          <div className="py-1 space-y-0.5 text-xs font-semibold">
                            <button
                              type="button"
                              onClick={() => {
                                close();
                                navigate(`${basePath}/${v.id}`);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>View Specs & Details</span>
                            </button>

                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  navigate(`${basePath}/edit/${v.id}`);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600" />
                                <span>Edit Vehicle Profile</span>
                              </button>
                            )}

                            {/* Admin Approve / Reject actions */}
                            {!isFleetPortal && isPending && (
                              <>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  disabled={approvingId === v.id}
                                  onClick={() => handleApprove(v, close)}
                                  className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                                >
                                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>{approvingId === v.id ? 'Approving...' : 'Approve Vehicle'}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={rejectingId === v.id}
                                  onClick={() => openRejectModal(v, close)}
                                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                                >
                                  <FleetIcons.Close className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>Reject Vehicle</span>
                                </button>
                              </>
                            )}

                            {canDelete && (
                              <>
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  type="button"
                                  disabled={deletingId === v.id}
                                  onClick={() => {
                                    close();
                                    handleDelete(v);
                                  }}
                                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                  <span>{deletingId === v.id ? 'Deleting...' : 'Delete Vehicle'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </ActionDropdown>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 text-xs space-y-2 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Fleet:</span>
                      {v.fleet_id || v.fleet?.id ? (
                        <Link
                          to={`${isFleetPortal ? '/fleet-manager/fleets' : '/admin/fleet-operators'}/${v.fleet?.id || v.fleet_id}`}
                          className="font-bold text-blue-600 hover:underline truncate max-w-[130px]"
                          title={`View ${fleetName} details`}
                        >
                          {fleetName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">{fleetName}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-semibold text-slate-900">{driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">VIN:</span>
                      <span className="font-bold text-slate-900 font-mono">{v.vin ?? '—'}</span>
                    </div>
                  </div>
                </div>

                {/* Inline Admin Approval Buttons for Pending Vehicles */}
                {!isFleetPortal && isPending && (
                  <div className="mt-4 pt-3 border-t border-amber-200 bg-amber-50/50 p-2.5 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-amber-800">Pending Approval</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApprove(v)}
                        disabled={approvingId === v.id}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => openRejectModal(v)}
                        disabled={rejectingId === v.id}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {!(!isFleetPortal && isPending) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1">
                      <FleetIcons.Gps className="w-3.5 h-3.5 text-slate-500" />
                      <span>{depotName}</span>
                    </span>
                    <Link to={`${basePath}/${v.id}`} className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Specs</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && filteredVehicles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Bus Number / Code</th>
                  <th className="py-3.5 px-4">Vehicle Type</th>
                  <th className="py-3.5 px-4">Assigned Fleet</th>
                  <th className="py-3.5 px-4">Assigned Driver</th>
                  <th className="py-3.5 px-4 font-mono">VIN</th>
                  <th className="py-3.5 px-4">Depot Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredVehicles.map((v) => {
                  const busNumber = v.bus_number || v.busNumber || v.code || '—';
                  const vehicleType = v.vehicle_type || v.vehicleType || 'Standard Bus';
                  const fleetName = v.fleet?.name || v.fleet_name || (v.fleet_id ? `Fleet #${v.fleet_id}` : 'General Fleet');
                  const driverName = v.driver?.name || v.assignedDriver || (v.assigned_driver_id ? `Driver #${v.assigned_driver_id}` : 'Unassigned');
                  const depotName = v.depot?.name || v.depot_name || (v.depot_id ? `Depot #${v.depot_id}` : '—');
                  const status = v.status || 'in_depot';
                  const isPending = status === 'pending_approval';
                  const isRejected = status === 'rejected';

                  const photoDoc = Array.isArray(v.documents) ? v.documents.find((d) => d.doc_type === 'bus_photo' || d.category === 'bus_photo' || d.purpose === 'bus_photo') : null;
                  const busPhoto = photoDoc?.file_url || photoDoc?.url || (Array.isArray(v.photos) ? v.photos[0] : null) || (Array.isArray(v.bus_images) ? v.bus_images[0] : null);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Bus Number */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2.5">
                          {busPhoto ? (
                            <img src={resolveFileUrl(busPhoto)} alt={busNumber} className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs shrink-0">
                              <FleetIcons.Bus className="w-4 h-4 text-blue-500" />
                            </div>
                          )}
                          <Link to={`${basePath}/${v.id}`} className="font-bold text-blue-600 hover:underline">
                            {busNumber}
                          </Link>
                        </div>
                      </td>

                      {/* Vehicle Type */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {vehicleType}
                      </td>

                      {/* Fleet */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {v.fleet_id || v.fleet?.id ? (
                          <Link
                            to={`${isFleetPortal ? '/fleet-manager/fleets' : '/admin/fleet-operators'}/${v.fleet?.id || v.fleet_id}`}
                            className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                            title={`View ${fleetName} details`}
                          >
                            <span>{fleetName}</span>
                          </Link>
                        ) : (
                          fleetName
                        )}
                      </td>

                      {/* Driver */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {driverName}
                      </td>

                      {/* VIN */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {v.vin ?? '—'}
                      </td>

                      {/* Depot */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {depotName}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize inline-flex items-center gap-1 ${
                          isPending ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          status === 'on_route' || status === 'moving' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          status === 'in_depot' || status === 'idle' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{status.replace(/_/g, ' ')}</span>
                        </span>
                      </td>

                      {/* 3-Dot Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <ActionDropdown menuWidth="w-52">
                          {({ close }) => (
                            <div className="py-1 space-y-0.5 text-xs font-semibold text-left">
                              <button
                                type="button"
                                onClick={() => {
                                  close();
                                  navigate(`${basePath}/${v.id}`);
                                }}
                                className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Specs & Details</span>
                              </button>

                              {canUpdate && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    close();
                                    navigate(`${basePath}/edit/${v.id}`);
                                  }}
                                  className="w-full px-3.5 py-2 text-left hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <FleetIcons.Edit className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Edit Vehicle Profile</span>
                                </button>
                              )}

                              {!isFleetPortal && isPending && (
                                <>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    type="button"
                                    disabled={approvingId === v.id}
                                    onClick={() => handleApprove(v, close)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                                  >
                                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{approvingId === v.id ? 'Approving...' : 'Approve Vehicle'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={rejectingId === v.id}
                                    onClick={() => openRejectModal(v, close)}
                                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors cursor-pointer font-bold"
                                  >
                                    <FleetIcons.Close className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <span>Reject Vehicle</span>
                                  </button>
                                </>
                              )}

                              {canDelete && (
                                <>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    type="button"
                                    disabled={deletingId === v.id}
                                    onClick={() => {
                                      close();
                                      handleDelete(v);
                                    }}
                                    className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                    <span>{deletingId === v.id ? 'Deleting...' : 'Delete Vehicle'}</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </ActionDropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={pagination?.page || currentPage}
        totalPages={pagination?.totalPages || 1}
        totalItems={pagination?.total ?? filteredVehicles.length}
        pageSize={pagination?.limit || pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />

      {/* Inline Reject Modal */}
      {rejectModal.open && (
        <RejectModal
          vehicle={rejectModal.vehicle}
          onConfirm={handleConfirmReject}
          onCancel={() => setRejectModal({ open: false, vehicle: null })}
          loading={Boolean(rejectingId)}
        />
      )}
    </div>
  );
};

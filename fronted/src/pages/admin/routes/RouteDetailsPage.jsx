import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAdminRoute } from '../../../hooks/admin/useAdminRoute';
import { useAdminVehicle } from '../../../hooks/admin/useAdminVehicle';
import { RouteMapViewer } from '../../../components/maps/RouteMapViewer';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { FleetIcons } from '../../../components/FleetIcons';

export const RouteDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const {
    selectedRoute,
    routeVehicles,
    loading,
    loadRouteDetails,
    approveRoute,
    rejectRoute,
    deleteRoute,
    assignVehicle,
    loadRouteVehicles,
    approveAssignment,
    rejectAssignment,
    deleteAssignment,
  } = useAdminRoute();

  const { vehicles: availableVehicles, loadVehicles } = useAdminVehicle();

  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/routes' : '/admin/routes';

  // Permissions
  const canUpdate = hasPermission('fleet.routes.update');
  const canDelete = hasPermission('fleet.routes.delete');
  const canApprove = hasPermission('fleet.routes.approve');
  const canViewVehicles = hasPermission('fleet.vehicles.view');
  const canAssign = hasPermission('fleet.routes.assign') && canViewVehicles;

  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'stops' | 'vehicles'
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Allocate Vehicle Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [assignShift, setAssignShift] = useState('Full Day');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadRouteDetails(id).catch((err) => {
        toast.error(err?.message || 'Failed to load route details.');
        navigate(basePath);
      });
      loadRouteVehicles(id).catch(() => {});
      if (canAssign) loadVehicles({ limit: 100 }).catch(() => {});
    }
  }, [id, loadRouteDetails, loadRouteVehicles, loadVehicles, navigate, basePath, canAssign]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveRoute(id);
      toast.success('Route has been approved and activated.');
      loadRouteDetails(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to approve route.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await rejectRoute(id, rejectReason.trim());
      toast.success('Route has been rejected.');
      setShowRejectModal(false);
      setRejectReason('');
      loadRouteDetails(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to reject route.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this route?`)) return;
    try {
      await deleteRoute(id);
      toast.success('Route deleted successfully.');
      navigate(basePath);
    } catch (err) {
      toast.error(err?.message || 'Failed to delete route.');
    }
  };

  const handleAssignVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle.');
      return;
    }
    try {
      setAssignLoading(true);
      const res = await assignVehicle(id, {
        vehicle_id: selectedVehicleId,
        shift: assignShift,
        notes: assignNotes,
      });

      if (res?.status === 'pending_approval') {
        toast.success('Vehicle allocation submitted for Admin approval.');
      } else {
        toast.success('Vehicle allocated to route successfully.');
      }

      setShowAssignModal(false);
      setSelectedVehicleId('');
      setAssignNotes('');
      loadRouteVehicles(id);
      loadRouteDetails(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to assign vehicle to route.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleApproveAssignment = async (assignmentId) => {
    try {
      await approveAssignment(assignmentId);
      toast.success('Vehicle assignment approved.');
      loadRouteVehicles(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to approve assignment.');
    }
  };

  const handleRejectAssignment = async (assignmentId) => {
    const reason = window.prompt('Enter rejection reason:') || 'Assignment rejected by Admin';
    try {
      await rejectAssignment(assignmentId, reason);
      toast.success('Vehicle assignment rejected.');
      loadRouteVehicles(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to reject assignment.');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this vehicle assignment?')) return;
    try {
      await deleteAssignment(assignmentId);
      toast.success('Vehicle assignment removed.');
      loadRouteVehicles(id);
    } catch (err) {
      toast.error(err?.message || 'Failed to remove assignment.');
    }
  };

  if (loading || !selectedRoute) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="text-sm">{t('admin.routes.loading_details')}</span>
      </div>
    );
  }

  const r = selectedRoute;
  const stops = Array.isArray(r.stops) ? r.stops : [];
  const assignments = Array.isArray(routeVehicles) ? routeVehicles : (r.assignments || []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Transit Routes', path: basePath },
              { label: r.name },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {r.name}
            </h1>
            {getStatusBadge(r.status)}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3">
            <span>Code: {r.code}</span>
            {r.creator && <span>Created by: {r.creator.name || r.creator.email}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canUpdate && (
            <button
              type="button"
              onClick={() => navigate(`${basePath}/edit/${r.id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-colors"
            >
              <FleetIcons.Edit className="w-3.5 h-3.5" />
              <span>{t('admin.routes.edit_route')}</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
              title={t('admin.routes.delete_route')}
            >
              <FleetIcons.Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Admin Approval Banner if Pending */}
      {r.status === 'pending_approval' && canApprove && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {t('admin.routes.action_required_title')}
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5">
                Submitted by {r.creator?.name || 'Fleet Operator'}. Review the corridor and stops below before publishing to the fleet network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white dark:bg-zinc-900 hover:bg-rose-50 border border-rose-300 dark:border-rose-800 rounded-xl shadow-sm transition-colors"
            >
              {t('admin.routes.reject_with_reason')}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
              <span>{t('admin.routes.approve_activate')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.routes.origin_terminal')}</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {r.start_point || 'Not specified'}
          </div>
          {(r.start_city || r.start_state) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {r.start_city && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-px rounded-full">{r.start_city}</span>}
              {r.start_state && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-px rounded-full">{r.start_state}</span>}
              {r.start_pincode && <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-px rounded-full font-mono">{r.start_pincode}</span>}
            </div>
          )}
          {r.start_latitude && (
            <div className="text-[10px] text-emerald-600 font-mono mt-1">
              {Number(r.start_latitude).toFixed(4)}, {Number(r.start_longitude).toFixed(4)}
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.routes.dest_terminal')}</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
            {r.end_point || 'Not specified'}
          </div>
          {(r.end_city || r.end_state) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {r.end_city && <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-1.5 py-px rounded-full">{r.end_city}</span>}
              {r.end_state && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-px rounded-full">{r.end_state}</span>}
              {r.end_pincode && <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-px rounded-full font-mono">{r.end_pincode}</span>}
            </div>
          )}
          {r.end_latitude && (
            <div className="text-[10px] text-rose-600 font-mono mt-1">
              {Number(r.end_latitude).toFixed(4)}, {Number(r.end_longitude).toFixed(4)}
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.routes.corridor_length')}</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {r.distance_km ? `${r.distance_km} km` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {r.total_duration_min ? `Duration ~${r.total_duration_min} min` : 'Duration unestimated'}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('admin.routes.allocated_buses')}</span>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
            {assignments.length} {t('admin.routes.vehicles_suffix')}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stops.length} {t('admin.routes.intermediate_stops_suffix')}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'map'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Interactive Route Map
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stops')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'stops'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {t('admin.routes.tab_stops')} ({stops.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'vehicles'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          {t('admin.routes.tab_vehicles')} ({assignments.length})
        </button>
      </div>

      {/* Tab 1: Interactive Route Map */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <RouteMapViewer
            start={{
              name: r.start_point,
              lat: r.start_latitude,
              lng: r.start_longitude,
            }}
            end={{
              name: r.end_point,
              lat: r.end_latitude,
              lng: r.end_longitude,
            }}
            stops={stops}
            polyline={r.polyline}
            height="520px"
          />
        </div>
      )}

      {/* Tab 2: Stops Timeline */}
      {activeTab === 'stops' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('admin.routes.stations_sequence_title')}
            </h3>
            <span className="text-xs text-slate-500">{stops.length} {t('admin.routes.stations_suffix')}</span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-6">
            {/* Origin Node */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow"></div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {t('common.origin')}: {r.start_point || t('admin.routes.start_point')}
              </div>
              {r.start_latitude && (
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Lat: {Number(r.start_latitude).toFixed(6)}, Lng: {Number(r.start_longitude).toFixed(6)}
                </div>
              )}
            </div>

            {/* Intermediate Stops */}
            {stops.map((s, idx) => (
              <div key={s.id || idx} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow"></div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700/60">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Stop #{s.sequence || idx + 1}: {s.name}
                    </span>
                    {s.eta && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        ETA: {s.eta}
                      </span>
                    )}
                  </div>
                  {s.address && (
                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{s.full_address || s.address}</div>
                  )}
                  {/* Address chips for stops */}
                  {(s.city || s.state || s.pincode) && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {s.city && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-px rounded-full font-medium">{s.city}</span>}
                      {s.state && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-px rounded-full font-medium">{s.state}</span>}
                      {s.pincode && <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-px rounded-full font-mono">{s.pincode}</span>}
                    </div>
                  )}
                  {s.halt_reason && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-700 dark:text-blue-300">
                      <span className="font-bold">{t('admin.routes.halt_reason')}</span>
                      <span>{s.halt_reason}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono mt-2">
                    {s.latitude && (
                      <span>GPS: {Number(s.latitude).toFixed(5)}, {Number(s.longitude).toFixed(5)}</span>
                    )}
                    {s.distance_km && <span>Distance: {s.distance_km} km</span>}
                    {s.geofence_radius && <span>Geofence: {s.geofence_radius}m</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Destination Node */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-rose-500 border-4 border-white dark:border-slate-900 shadow"></div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                {t('common.destination')}: {r.end_point || t('admin.routes.destination_point')}
              </div>
              {r.end_latitude && (
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Lat: {Number(r.end_latitude).toFixed(6)}, Lng: {Number(r.end_longitude).toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Assigned Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('admin.routes.vehicles_allocated_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('admin.routes.vehicles_allocated_desc')}
              </p>
            </div>

            {canAssign && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
              >
                <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
                <span>{t('admin.routes.allocate_vehicle_btn')}</span>
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{t('admin.routes.no_vehicles_assigned')}</div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('admin.routes.no_vehicles_assigned_desc')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-400">
                <thead className="bg-slate-50 dark:bg-zinc-800/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">{t('admin.routes.th_bus_reg')}</th>
                    <th className="py-3 px-4">{t('admin.routes.th_model_type')}</th>
                    <th className="py-3 px-4">{t('admin.routes.th_shift')}</th>
                    <th className="py-3 px-4">{t('admin.routes.th_status')}</th>
                    <th className="py-3 px-4 text-right">{t('admin.routes.th_actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {assignments.map((a) => {
                    const veh = a.vehicle || {};
                    return (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {veh.bus_number || `Vehicle #${a.vehicle_id}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 dark:text-zinc-300">{veh.model || 'Standard Bus'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium">
                            {a.shift || 'Full Day'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {a.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : a.status === 'pending_approval' ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Review
                            </span>
                          ) : (
                            <span className="text-slate-500">{a.status}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {canApprove && a.status === 'pending_approval' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveAssignment(a.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectAssignment(a.id)}
                                  className="px-2.5 py-1 text-[11px] font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {canAssign && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAssignment(a.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title={t('admin.routes.remove_assignment')}
                              >
                                <FleetIcons.Trash className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Allocate Vehicle Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Allocate Vehicle to Route
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              {t('admin.routes.allocate_modal_desc')} "{r.name}".
            </p>

            <form onSubmit={handleAssignVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  {t('admin.routes.select_vehicle_label')} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">{t('admin.routes.choose_bus_ph')}</option>
                  {(availableVehicles || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.bus_number} ({v.model || 'Bus'} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Operating Shift
                </label>
                <select
                  value={assignShift}
                  onChange={(e) => setAssignShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Morning">{t('admin.routes.shift_morning')}</option>
                  <option value="Evening">{t('admin.routes.shift_evening')}</option>
                  <option value="Night">{t('admin.routes.shift_night')}</option>
                  <option value="Full Day">{t('admin.routes.shift_fullday')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder={t('admin.routes.notes_ph')}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {assignLoading ? t('admin.routes.allocating') : t('admin.routes.confirm_allocation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Reject Transit Route
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
              {t('admin.routes.reject_route_desc')}
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('admin.routes.rejection_feedback_ph')}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetailsPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminRoute } from '../../../hooks/admin/useAdminRoute';
import { useAdminVehicle } from '../../../hooks/admin/useAdminVehicle';
import { RouteMapViewer } from '../../../components/maps/RouteMapViewer';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';

export const RouteDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

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

  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/routes' : '/admin/routes';

  // Permissions
  const canUpdate = hasPermission('fleet.routes.update');
  const canDelete = hasPermission('fleet.routes.delete');
  const canApprove = hasPermission('fleet.routes.approve');
  const canAssign = hasPermission('fleet.routes.assign');

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
      loadVehicles({ limit: 100 }).catch(() => {});
    }
  }, [id, loadRouteDetails, loadRouteVehicles, loadVehicles, navigate, basePath]);

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
        <span className="text-sm">Loading transit route details...</span>
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Route</span>
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
              title="Delete Route"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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
                Action Required: Route Awaiting Administrative Approval
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
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-white dark:bg-slate-900 hover:bg-rose-50 border border-rose-300 dark:border-rose-800 rounded-xl shadow-sm transition-colors"
            >
              Reject with Reason
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Approve & Activate</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Origin Terminal</span>
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

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Destination Terminal</span>
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

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Corridor Length</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {r.distance_km ? `${r.distance_km} km` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {r.total_duration_min ? `Duration ~${r.total_duration_min} min` : 'Duration unestimated'}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Allocated Buses</span>
          <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
            {assignments.length} Vehicles
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {stops.length} intermediate stops
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
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
          Stops Timeline ({stops.length})
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
          Assigned Vehicles ({assignments.length})
        </button>
      </div>

      {/* Tab 1: Interactive Route Map */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Stops & Station Waypoints Sequence
            </h3>
            <span className="text-xs text-slate-500">{stops.length} stations</span>
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {/* Origin Node */}
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 shadow"></div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">
                Origin: {r.start_point || 'Start'}
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
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
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
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.full_address || s.address}</div>
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
                      <span className="font-bold">Halt Reason:</span>
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
                Destination: {r.end_point || 'End'}
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Vehicles Allocated to Route
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage buses dispatched on this transit corridor.
              </p>
            </div>

            {canAssign && (
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Allocate Vehicle</span>
              </button>
            )}
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">No vehicles assigned yet</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Allocate a bus to this route to schedule trips and bind telematics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Bus / Registration</th>
                    <th className="py-3 px-4">Model & Type</th>
                    <th className="py-3 px-4">Shift</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                          <span className="text-slate-700 dark:text-slate-300">{veh.model || 'Standard Bus'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
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
                                title="Remove Assignment"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Allocate Vehicle to Route
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Bind a bus to corridor "{r.name}".
            </p>

            <form onSubmit={handleAssignVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose a Bus --</option>
                  {(availableVehicles || []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.bus_number} ({v.model || 'Bus'} - Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Operating Shift
                </label>
                <select
                  value={assignShift}
                  onChange={(e) => setAssignShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Morning">Morning Shift (06:00 - 14:00)</option>
                  <option value="Evening">Evening Shift (14:00 - 22:00)</option>
                  <option value="Night">Night Shift (22:00 - 06:00)</option>
                  <option value="Full Day">Full Day Corridor Allocation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Peak hour replacement bus..."
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {assignLoading ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Reject Transit Route
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Please enter feedback for the fleet operator explaining the rejection reason.
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Route conflicts with existing corridor..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
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

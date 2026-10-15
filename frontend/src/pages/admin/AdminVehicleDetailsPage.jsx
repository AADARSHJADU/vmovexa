import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAuth } from '../../hooks/useAuth';
import { resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';

// ─── Inline Reject Modal ────────────────────────────────────────────────────
const RejectModal = ({ busNum, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');

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

export const AdminVehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Portal context detection
  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/vehicles' : '/admin/vehicles';
  const dashboardLink = isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard';

  const { vehicles, loadVehicles, approveVehicle, rejectVehicle, deleteVehicle } = useAdminVehicle();
  const { hasPermission } = useAuth();

  const canView = !isFleetPortal || hasPermission('fleet.vehicles.view');
  const canUpdate = !isFleetPortal || hasPermission('fleet.vehicles.update');
  const canDelete = !isFleetPortal || hasPermission('fleet.vehicles.delete');

  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (isFleetPortal && !canView) return;
    let mounted = true;
    setIsLoading(true);
    loadVehicles({ page: 1, limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
        const found = list.find((v) => String(v.id) === String(id) || String(v.code) === String(id));
        if (mounted) setVehicle(found || null);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, [id, canView, isFleetPortal, loadVehicles]);

  const handleApprove = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    try {
      await toast.promise(approveVehicle(vehicle.id), {
        loading: 'Approving vehicle...',
        success: 'Vehicle approved successfully! Status set to In Depot.',
        error: (err) => err?.message || 'Failed to approve vehicle',
      });
      // Refresh vehicle details
      const res = await loadVehicles({ page: 1, limit: 100 });
      const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
      const found = list.find((v) => String(v.id) === String(id));
      if (found) setVehicle(found);
    } catch {
      /* handled */
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason) => {
    if (!vehicle) return;
    setActionLoading(true);
    try {
      await toast.promise(rejectVehicle(vehicle.id, reason), {
        loading: 'Rejecting vehicle...',
        success: 'Vehicle rejected.',
        error: (err) => err?.message || 'Failed to reject vehicle',
      });
      setShowRejectModal(false);
      // Refresh vehicle details
      const res = await loadVehicles({ page: 1, limit: 100 });
      const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
      const found = list.find((v) => String(v.id) === String(id));
      if (found) setVehicle(found);
    } catch {
      /* handled */
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicle || !window.confirm(`Are you sure you want to delete vehicle ${vehicle.bus_number || vehicle.code}?`)) return;
    setActionLoading(true);
    try {
      await toast.promise(deleteVehicle(vehicle.id), {
        loading: 'Deleting vehicle...',
        success: 'Vehicle deleted.',
        error: (err) => err?.message || 'Failed to delete vehicle',
      });
      navigate(basePath);
    } catch {
      setActionLoading(false);
    }
  };

  if (isFleetPortal && !canView) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <FleetIcons.Shield className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Access Revoked</h2>
        <p className="text-sm text-slate-500 font-medium">
          Your administrator has revoked your permission to view vehicles.
        </p>
        <Link
          to={basePath}
          className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          ← Back to Vehicles
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-12 text-center text-xs text-slate-500 animate-pulse">
        Loading vehicle specification & diagnostic parameters...
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="w-full p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <p className="text-sm font-bold text-slate-700">Vehicle spec sheet not found.</p>
        <button
          onClick={() => navigate(basePath)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
        >
          ← Back to Vehicles Directory
        </button>
      </div>
    );
  }

  const busNum = vehicle.bus_number || vehicle.busNumber || vehicle.code || '—';
  const status = (vehicle.status || 'in_depot').toLowerCase();
  const isPending = status === 'pending_approval';
  const isRejected = status === 'rejected';
  const driverName = vehicle.driver?.name || vehicle.assignedDriver || (vehicle.assigned_driver_id ? `Driver #${vehicle.assigned_driver_id}` : 'Unassigned');
  const gpsSerial = vehicle.edgeDevice?.serial_number || vehicle.gps_device_id || (vehicle.edge_device_id ? `EDG-${vehicle.edge_device_id}` : 'GPS Telematics');

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. Breadcrumb Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: dashboardLink },
              { label: 'Vehicles Directory', to: basePath },
              { label: busNum }
            ]}
            className="mb-2"
          />

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight flex flex-wrap items-center gap-2">
              <span>Vehicle {busNum}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 uppercase ${
                isPending ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' :
                isRejected ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' :
                status === 'on_route' || status === 'moving' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{status.replace(/_/g, ' ')}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                ● Live Telemetry
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              {vehicle.fleet?.name || vehicle.fleet_name || 'General Fleet'} • {vehicle.vehicle_type || 'Transit Bus'} • Continuous IoT Diagnostics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Approval / Rejection Actions */}
          {!isFleetPortal && isPending && (
            <div className="flex items-center gap-2">
              <button
                id="approve-vehicle-btn"
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                <span>Approve Vehicle</span>
              </button>
              <button
                id="reject-vehicle-btn"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <FleetIcons.Close className="w-3.5 h-3.5 text-white" />
                <span>Reject Vehicle</span>
              </button>
            </div>
          )}

          {canUpdate && (
            <button 
              onClick={() => navigate(`${basePath}/edit/${vehicle.id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <FleetIcons.Edit className="w-4 h-4 text-blue-600" />
              <span>Edit Specs</span>
            </button>
          )}

          <button 
            onClick={() => navigate(isFleetPortal ? '/fleet-manager/tracking' : '/admin/tracking')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <span>((•))</span>
            <span>Live Radar Tracking</span>
          </button>
        </div>
      </div>

      {/* Status Warning Banners */}
      {isPending && isFleetPortal && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FleetIcons.Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Awaiting Admin Approval</p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                This vehicle was submitted to the directory and is currently pending review by an Admin. It will transition to active once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPending && !isFleetPortal && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FleetIcons.Bell className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="font-bold">Approval Request Pending</p>
              <p className="text-purple-700 text-[11px] mt-0.5">
                Review this vehicle registration request and click <span className="font-bold">Approve</span> or <span className="font-bold">Reject</span> above.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FleetIcons.Alert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Vehicle Rejected by Admin</p>
              <p className="text-rose-700 text-[11px] mt-0.5">
                Reason: <span className="font-semibold">{vehicle.rejection_reason || vehicle.rejectionReason || 'Registration details incomplete or non-compliant.'}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top 3 Stat Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fleet Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <FleetIcons.Bus className="w-6 h-6 text-blue-600" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Fleet</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {vehicle.fleet?.name || vehicle.fleet_name || (vehicle.fleet_id ? `Fleet #${vehicle.fleet_id}` : 'General Fleet')}
            </div>
          </div>
        </div>

        {/* Driver Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 font-bold">
            <FleetIcons.Driver className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Driver</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
              {driverName}
            </div>
          </div>
        </div>

        {/* GPS Device Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <FleetIcons.Gps className="w-6 h-6 text-amber-600" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GPS Device Serial / ID</div>
            <div className="font-mono text-sm font-bold text-slate-900 mt-0.5 truncate">
              {gpsSerial}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Specs & Display Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Full Vehicle Specifications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FleetIcons.Document className="w-4 h-4 text-blue-600" />
              <span>Vehicle Specification Sheet</span>
            </h2>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {vehicle.vehicle_type || 'Standard Bus'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Bus Plate Number</span>
              <p className="font-mono font-black text-slate-900 text-sm mt-1">{busNum}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">VIN / Chassis No.</span>
              <p className="font-mono font-bold text-slate-800 text-xs mt-1">{vehicle.vin || vehicle.chassis_number || '—'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Make / Model</span>
              <p className="font-bold text-slate-800 text-xs mt-1">{vehicle.model || vehicle.vehicle_type || 'Standard Bus'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Fuel / Energy Type</span>
              <p className="font-bold text-slate-800 text-xs mt-1">{vehicle.fuel_type || 'Electric (EV)'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Seating Capacity</span>
              <p className="font-bold text-slate-800 text-xs mt-1">{vehicle.capacity ? `${vehicle.capacity} Seats` : '42 Seats'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Depot Location</span>
              <p className="font-bold text-slate-800 text-xs mt-1">{vehicle.depot?.name || vehicle.depot_name || 'Central Depot'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Fleet</span>
              <p className="font-bold text-slate-800 text-xs mt-1">
                {vehicle.fleet || vehicle.fleet_id ? (
                  <Link
                    to={`${isFleetPortal ? '/fleet-manager/fleets' : '/admin/fleet-operators'}/${vehicle.fleet?.id || vehicle.fleet_id}`}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold"
                    title="View Fleet Operator Profile"
                  >
                    <span>{vehicle.fleet?.name || vehicle.fleet_name || `Fleet #${vehicle.fleet_id}`}</span>
                    <span className="text-xs">↗</span>
                  </Link>
                ) : (
                  '—'
                )}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Route & Corridor</span>
              <p className="font-bold text-slate-900 text-xs mt-1">{vehicle.assigned_route || 'Route 101: Indiranagar to Majestic'}</p>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1"><FleetIcons.Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" /> Source: <strong>{vehicle.source || 'Indiranagar Central'}</strong></span>
                <span className="flex items-center gap-1"><FleetIcons.Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Destination: <strong>{vehicle.destination || 'Kempegowda Bus Station'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Display Screen Configuration (IoT Matrix) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FleetIcons.Monitor className="w-4 h-4 text-purple-600" />
              <span>Display Screen Config</span>
            </h2>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-mono">
              {(vehicle.displayLayout?.total || vehicle.displays_count || 6)} Screens
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="text-slate-700 font-bold">Left Side Displays:</span>
              </div>
              <span className="font-mono font-black text-purple-800 text-sm">
                {vehicle.displayLayout?.left_side ?? 2} Units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="text-slate-700 font-bold">Right Side Displays:</span>
              </div>
              <span className="font-mono font-black text-purple-800 text-sm">
                {vehicle.displayLayout?.right_side ?? 2} Units
              </span>
            </div>

            <div className="p-3 rounded-xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                <span className="text-slate-700 font-bold">Rear Display:</span>
              </div>
              <span className="font-mono font-black text-pink-800 text-sm">
                {vehicle.displayLayout?.rear ?? 1} Unit
              </span>
            </div>

            <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                <span className="text-slate-700 font-bold">Emergency Exit Display:</span>
              </div>
              <span className="font-mono font-black text-cyan-800 text-sm">
                {vehicle.displayLayout?.emergency_exit ?? 1} Unit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Vehicle Compliance Documents List */}
      {(() => {
        const docList = Array.isArray(vehicle.documents)
          ? vehicle.documents.filter((d) => d.doc_type !== 'bus_photo' && d.category !== 'bus_photo' && d.purpose !== 'bus_photo')
          : [];

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FleetIcons.Document className="w-4 h-4 text-blue-600" />
                <span>Vehicle Compliance Documents ({docList.length})</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Verified Registration & Insurance Papers</span>
            </div>

            {docList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {docList.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 uppercase">
                          {(doc.doc_type || doc.docType || 'Document').replace(/_/g, ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        doc.approval_status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {doc.approval_status || 'Pending'}
                      </span>
                    </div>

                    {doc.file_url && (
                      <a
                        href={resolveFileUrl(doc.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="flex items-center justify-center gap-1"><FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600" /> View Document</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No compliance documents uploaded yet.
              </div>
            )}
          </div>
        );
      })()}

      {/* 5. Bus Exterior & Interior Photos Gallery */}
      {(() => {
        const photoDocs = Array.isArray(vehicle.documents)
          ? vehicle.documents.filter((d) => d.doc_type === 'bus_photo' || d.category === 'bus_photo' || d.purpose === 'bus_photo')
          : [];
        const rawList = photoDocs.length > 0
          ? photoDocs.map((d) => d.file_url || d.url)
          : (Array.isArray(vehicle.photos) ? vehicle.photos : (Array.isArray(vehicle.bus_images) ? vehicle.bus_images : []));
        const photoList = Array.from(new Set(rawList.filter(Boolean)));

        if (!photoList.length) return null;

        return (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FleetIcons.Camera className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                <span>Vehicle Exterior & Interior Photos ({photoList.length})</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Click photo to view high-res</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photoList.map((url, idx) => (
                <a
                  key={idx}
                  href={resolveFileUrl(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square shadow-sm block"
                >
                  <img
                    src={resolveFileUrl(url)}
                    alt={`Bus Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <FleetIcons.Search className="w-3.5 h-3.5 text-white" /> View Full
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          busNum={busNum}
          onConfirm={handleConfirmReject}
          onCancel={() => setShowRejectModal(false)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

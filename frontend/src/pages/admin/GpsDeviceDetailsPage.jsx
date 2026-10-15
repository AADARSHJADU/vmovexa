import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useAuth } from '../../hooks/useAuth';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl } from '../../api/services/upload.service';

const StatusBadge = ({ status }) => {
  const s = String(status || '').toLowerCase();
  let cls = 'bg-slate-100 text-slate-600 border-slate-200';
  let label = status || '—';
  if (s === 'available' || s === 'online') {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    label = 'Available';
  } else if (s === 'assigned') {
    cls = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Assigned';
  } else if (s === 'pending_approval') {
    cls = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Pending Approval';
  } else if (s === 'rejected') {
    cls = 'bg-red-50 text-red-700 border-red-200';
    label = 'Rejected';
  }
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-lg uppercase border shrink-0 ${cls}`}>
      {label}
    </span>
  );
};

export const GpsDeviceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/gps' : '/admin/gps';
  const isAdmin = user?.role === 'ROLE-TENANT-ADMIN' || user?.role === 'ROLE-SUPER-ADMIN' || user?.role === 'TROLE-ADMIN' || user?.role === 'ROLE-ADMIN' || !isFleetPortal;

  const { loadDevice, selectedDevice, approveDevice, rejectDevice, deleteDevice, assignVehicle } = useFleetGps();
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleUnassign = async () => {
    const busLabel = selectedDevice?.vehicle?.bus_number || `Bus #${selectedDevice?.vehicle_id}`;
    if (!window.confirm(`Are you sure you want to unassign GPS tracker ${selectedDevice?.code || selectedDevice?.id} from ${busLabel}?`)) return;
    try {
      await toast.promise(assignVehicle(id, null), {
        loading: 'Unassigning GPS device...',
        success: 'GPS device unassigned from vehicle!',
        error: (err) => err?.message || 'Failed to unassign GPS device',
      });
      loadDevice(id);
    } catch (_) {}
  };

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        await loadDevice(id);
      } catch (err) {
        toast.error(err?.message || 'Failed to load device specification');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [id, loadDevice]);

  if (loading) {
    return (
      <div className="w-full py-24 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-bold text-xs">Loading GPS telematics hardware specifications & telemetry...</p>
      </div>
    );
  }

  const d = selectedDevice || {};
  const photoUrl = d.image_url ? resolveFileUrl(d.image_url) : null;
  const isPending = String(d.status || '').toLowerCase() === 'pending_approval';
  const isAssigned = Boolean(d.vehicle_id);

  const handleApprove = async () => {
    try {
      await toast.promise(approveDevice(d.id), {
        loading: 'Approving GPS device...',
        success: 'GPS Device approved successfully!',
        error: (err) => err?.message || 'Failed to approve device',
      });
      loadDevice(id);
    } catch (_) {}
  };

  const handleReject = async () => {
    try {
      await toast.promise(rejectDevice(d.id, rejectionReason), {
        loading: 'Rejecting GPS device...',
        success: 'GPS Device rejected.',
        error: (err) => err?.message || 'Failed to reject device',
      });
      setRejecting(false);
      loadDevice(id);
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (d.vehicle_id) {
      toast.error('Cannot delete a GPS device that is assigned to a vehicle.');
      return;
    }
    if (!window.confirm(`Delete GPS device ${d.code || d.imei}?`)) return;
    try {
      await toast.promise(deleteDevice(d.id), {
        loading: 'Deleting GPS device...',
        success: 'Device deleted successfully.',
        error: (err) => err?.message || 'Failed to delete device',
      });
      navigate(basePath);
    } catch (_) {}
  };

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Top Header Banner */}
      <div className="w-full p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'GPS Devices', path: basePath },
              { label: d.code || `GPS-TRK-${d.id}` },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {d.code || `GPS-TRK-${d.id}`}
            </h1>
            <StatusBadge status={d.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono flex items-center gap-3 flex-wrap">
            <span>IMEI: <strong className="text-slate-800">{d.imei || '—'}</strong></span>
            <span>•</span>
            <span>S/N: <strong className="text-slate-800">{d.serial_number || 'N/A'}</strong></span>
            <span>•</span>
            <span>Vendor: <strong className="text-slate-800">{d.vendor || 'Teltonika'} {d.model || ''}</strong></span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin && isPending && (
            <>
              <button
                onClick={handleApprove}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>✓</span>
                <span>Approve Device</span>
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-all cursor-pointer"
              >
                <span>✕ Reject</span>
              </button>
            </>
          )}

          <button
            onClick={() => navigate(`${basePath}/edit/${d.id}`)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Edit className="w-3.5 h-3.5" />
            <span>Edit Config</span>
          </button>

          <button
            onClick={() => navigate(`${basePath}/${d.id}/assign`)}
            className="px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FleetIcons.Bus className="w-3.5 h-3.5" />
            <span>{isAssigned ? 'Reassign Vehicle' : 'Assign Vehicle'}</span>
          </button>

          {isAssigned && (
            <button
              onClick={handleUnassign}
              className="px-3.5 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Unassign GPS tracker from vehicle"
            >
              <span>Unassign Vehicle</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs transition-all cursor-pointer"
            title="Delete Hardware Record"
          >
            Delete
          </button>
        </div>
      </div>

      {/* 2. Full-Width Top Metric Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Vendor & Model */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <FleetIcons.Gps className="w-6 h-6 text-blue-600" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hardware Spec</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
              {d.vendor || 'Teltonika'} {d.model || 'FMB920'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Ver: {d.firmware || 'v3.2.14'}</div>
          </div>
        </div>

        {/* Gauge 2: Vehicle Binding */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
            isAssigned ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
          }`}>
            <FleetIcons.Bus className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bound Vehicle</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
              {d.vehicle ? d.vehicle.bus_number : (d.vehicle_id ? `Bus #${d.vehicle_id}` : 'Unassigned Hardware')}
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              {isAssigned ? (d.vehicle?.model || 'Actively Telemetering') : 'Ready for Binding'}
            </div>
          </div>
        </div>

        {/* Gauge 3: SIM & Network */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0 text-xl font-bold">
            📶
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SIM Mobile Line</div>
            <div className="text-sm font-black font-mono text-slate-900 mt-0.5 truncate">
              {d.sim || 'Unassigned'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {d.network_type || '4G LTE-M'} ({d.sim_provider || d.network || 'Jio IoT'})
            </div>
          </div>
        </div>

        {/* Gauge 4: Battery & Power */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0 text-xl font-bold">
            🔋
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Backup Battery</div>
            <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
              {d.battery_capacity || '1200 mAh'}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>External 12V Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Photo + Main Spec Cards Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hardware Specifications Profile Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FleetIcons.Gps className="w-5 h-5 text-amber-500" />
                  <span>Telematics Unit Specification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Hardware identity keys and factory parameters</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                {d.alias_name || d.code}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo Avatar / Device Blueprint */}
              {photoUrl ? (
                <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-50 relative group">
                  <img
                    src={photoUrl}
                    alt={d.code}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <a
                    href={photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                  >
                    <span>🔍 View Image</span>
                  </a>
                </div>
              ) : (
                <div className="w-full sm:w-44 h-44 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col items-center justify-center font-bold shrink-0 text-amber-700 p-4 text-center shadow-inner">
                  <FleetIcons.Gps className="w-12 h-12 mb-2 text-amber-500" />
                  <span className="text-xs font-extrabold">Teltonika Tracker</span>
                  <span className="text-[10px] text-amber-600/80 mt-1 font-mono">No Image Uploaded</span>
                </div>
              )}

              {/* Hardware Parameters Dense Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs flex-1 w-full">
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Vendor</span>
                  <span className="font-extrabold text-slate-900 text-xs">{d.vendor || 'Teltonika'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hardware Model</span>
                  <span className="font-extrabold text-slate-900 text-xs">{d.model || 'FMB920'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IMEI Code</span>
                  <span className="font-mono font-black text-slate-900 text-xs">{d.imei || '—'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serial Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{d.serial_number || 'N/A'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SIM Line Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{d.sim || 'Unassigned'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Network Technology</span>
                  <span className="font-bold text-slate-800 text-xs">{d.network_type || '4G LTE-M'} ({d.network || 'Cellular'})</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Carrier Provider</span>
                  <span className="font-bold text-slate-800 text-xs">{d.sim_provider || d.network || 'Jio 4G IoT'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Firmware Release</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">{d.firmware || 'v3.2.14-PROD'}</span>
                </div>

                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-0.5 sm:col-span-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Installation Date</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {d.installed_at ? new Date(d.installed_at).toLocaleString() : 'Not Installed / Pending Assignment'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System & Power Telematics Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>⚡ Power & Diagnostics Telematics</span>
              <span className="text-xs font-normal text-slate-500">Live Hardware Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Backup Battery Capacity</span>
                  <span className="font-black text-slate-900">{d.battery_capacity || '1200 mAh'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Input Power Voltage Range</span>
                  <span className="font-bold text-slate-800">10V - 30V DC (Vehicle Power)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Power Protection</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Overvoltage & Surge Protected
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">GNSS / GPS Receiver</span>
                  <span className="font-bold text-slate-900">GPS, GLONASS, GALILEO</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Tracking Sensitivity</span>
                  <span className="font-bold text-slate-800">-165 dBm High Accuracy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Update Ping Frequency</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    Every 5 Seconds
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle Assignment & Notes */}
        <div className="space-y-6">
          {/* Bound Vehicle Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FleetIcons.Bus className="w-4 h-4 text-blue-600" />
                <span>Vehicle Binding Status</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isAssigned ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isAssigned ? 'Assigned' : 'Unassigned'}
              </span>
            </div>

            {isAssigned ? (
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border border-blue-200/80 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Assigned Fleet Bus</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {d.vehicle?.bus_number || `Bus #${d.vehicle_id}`}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {d.vehicle?.model || 'Transit Bus'}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                    d.vehicle?.status === 'on_route'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {String(d.vehicle?.status || 'in_depot').replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white/90 p-3 rounded-xl border border-blue-100/80 shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Vehicle ID</span>
                    <span className="font-mono font-bold text-slate-800">#{d.vehicle?.id || d.vehicle_id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">VIN / Chassis</span>
                    <span className="font-mono font-bold text-slate-800">{d.vehicle?.vin || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Mounting Location</span>
                    <span className="font-medium text-slate-800">{d.mounting_position || 'Behind Driver Dashboard'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Power Wiring</span>
                    <span className="font-medium text-slate-800">{d.power_wire || 'Direct Battery Constant (+12V/24V)'}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Real-time telematics coordinates, GPS speed, and engine telemetry are being received continuously from this vehicle.
                </p>

                <div className="space-y-2 pt-1">
                  <Link
                    to={isFleetPortal ? `/fleet-manager/vehicles/${d.vehicle?.id || d.vehicle_id}` : `/admin/vehicles/${d.vehicle?.id || d.vehicle_id}`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <FleetIcons.Bus className="w-3.5 h-3.5" />
                    <span>View Bus Details & Telemetry →</span>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/${d.id}/assign`)}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Reassign Bus
                    </button>
                    <button
                      type="button"
                      onClick={handleUnassign}
                      className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Unassign Bus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="text-xs font-bold text-amber-900">Ready for Vehicle Binding</div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This GPS device is currently unassigned and in stock. Bind it to an active fleet vehicle to begin telemetry tracking.
                </p>
                <button
                  onClick={() => navigate(`${basePath}/${d.id}/assign`)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FleetIcons.Bus className="w-3.5 h-3.5" />
                  <span>Assign to Vehicle Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Mounting & Installation Notes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span>🔧</span>
              <span>Mounting & Installation Notes</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                {d.notes || 'No custom mounting notes or installation instructions specified for this GPS unit.'}
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Technician Installer:</span>
                <span className="font-bold text-slate-800">Depot Maintenance Team</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Mounting Location:</span>
                <span className="font-bold text-slate-800">Under Front Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reject GPS Device</h3>
              <button onClick={() => setRejecting(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Please enter reason for rejecting device <span className="font-bold text-slate-900">{d.code}</span>.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Serial mismatch, duplicate IMEI..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejecting(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
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

export default GpsDeviceDetailsPage;

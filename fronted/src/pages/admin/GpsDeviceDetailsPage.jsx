import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useAuth } from '../../hooks/useAuth';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl } from '../../api/services/upload.service';
import { useTranslation } from '../../hooks/useTranslation';

const StatusBadge = ({ status }) => {
  const s = String(status || '').toLowerCase();
  let cls = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  let label = status || 'Standby';
  if (s === 'online' || s === 'available' || s === 'active') {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    label = 'Online & Active';
  } else if (s === 'offline') {
    cls = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
    label = 'Offline';
  } else if (s === 'maintenance') {
    cls = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    label = 'In Maintenance';
  } else if (s === 'error') {
    cls = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800';
    label = 'Hardware Error';
  }
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-lg uppercase border shrink-0 ${cls}`}>
      {label}
    </span>
  );
};

export const GpsDeviceDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/edge-devices' : '/admin/edge-devices';
  const isAdmin =
    user?.role === 'ROLE-TENANT-ADMIN' ||
    user?.role === 'ROLE-SUPER-ADMIN' ||
    user?.role === 'TROLE-ADMIN' ||
    user?.role === 'ROLE-ADMIN' ||
    !isFleetPortal;

  const { loadDevice, selectedDevice, deleteDevice, assignVehicle } = useFleetGps();
  const [loading, setLoading] = useState(true);

  const handleUnassign = async () => {
    const busLabel = selectedDevice?.vehicle?.bus_number || `Bus #${selectedDevice?.vehicle_id}`;
    const boxLabel = selectedDevice?.box_id || selectedDevice?.code || `Edge Unit #${id}`;
    if (!window.confirm(`Are you sure you want to unbind Edge Device ${boxLabel} from ${busLabel}? (Connected GPS stream will also be detached)`)) return;
    try {
      await toast.promise(assignVehicle(id, null), {
        loading: 'Unlinking Edge Device & GPS from vehicle...',
        success: 'Edge Device unlinked successfully!',
        error: (err) => err?.message || 'Failed to unlink Edge Device',
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
        toast.error(err?.message || 'Failed to load Edge Device specification');
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
      <div className="w-full py-24 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-zinc-400 font-bold text-xs">{t('admin.gps.loading_details')}</p>
      </div>
    );
  }

  const d = selectedDevice || {};
  const boxId = d.box_id || d.code || `EDGE-${d.id}`;
  const photoUrl = d.image_url ? resolveFileUrl(d.image_url) : null;
  const isAssigned = Boolean(d.vehicle_id || d.vehicle);
  const latestGps = d.latestGps;

  const handleDelete = async () => {
    if (d.vehicle_id) {
      toast.error('Cannot delete an Edge Device that is currently assigned to a vehicle.');
      return;
    }
    if (!window.confirm(`Delete Edge Device record ${boxId}?`)) return;
    try {
      await toast.promise(deleteDevice(d.id), {
        loading: 'Deleting Edge Device record...',
        success: 'Edge Device deleted successfully.',
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: t('admin.gps.title'), path: basePath },
              { label: boxId },
            ]}
            className="mb-2"
          />

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <FleetIcons.EdgeDevice className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              <span>{boxId}</span>
            </h1>
            <StatusBadge status={d.status} />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono flex items-center gap-3 flex-wrap">
            <span>{t('admin.gps.mac_address_label')} <strong className="text-slate-800 dark:text-zinc-200">{d.mac || '—'}</strong></span>
            <span>•</span>
            <span>{t('admin.vehicles.make_model')}: <strong className="text-slate-800 dark:text-zinc-200">{d.model || 'EdgeBox-500'}</strong></span>
            <span>•</span>
            <span>{t('admin.gps.agent_firmware')}: <strong className="text-slate-800 dark:text-zinc-200">v{d.agent_version || '1.0.4'}</strong></span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate(`${basePath}/${d.id}/assign`)}
            className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FleetIcons.Bus className="w-3.5 h-3.5" />
            <span>{isAssigned ? 'Reassign Vehicle' : 'Assign to Vehicle'}</span>
          </button>

          {isAssigned && (
            <button
              onClick={handleUnassign}
              className="px-3.5 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title={t('admin.gps.unassign_desc')}
            >
              <span>{t('admin.gps.unassign_btn')}</span>
            </button>
          )}

          {!isAssigned && (
            <button
              onClick={handleDelete}
              className="px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs transition-all cursor-pointer"
              title={t('admin.gps.delete_record')}
            >
              Delete
            </button>
          )}

          <button
            onClick={() => navigate(basePath)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer"
          >
            {t('admin.gps.title')}
          </button>
        </div>
      </div>

      {/* 2. Top Metric Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Edge Compute Spec */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center shrink-0">
            <FleetIcons.EdgeDevice className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.edge_hardware')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {d.model || 'EdgeBox-500'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">Agent: v{d.agent_version || '1.0.4'}</div>
          </div>
        </div>

        {/* Gauge 2: Vehicle Binding */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
            isAssigned
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
          }`}>
            <FleetIcons.Bus className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.bound_bus')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {d.vehicle ? d.vehicle.bus_number : (d.vehicle_id ? `Bus #${d.vehicle_id}` : 'Spare Edge Unit')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
              {isAssigned ? (d.vehicle?.model || 'Live Vehicle Link') : 'Ready for Installation'}
            </div>
          </div>
        </div>

        {/* Gauge 3: SIM & Network */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
            <FleetIcons.Speed className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.connectivity_sim')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {d.sim_network || d.sim || 'Cellular 4G IoT'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              High-Speed Telematics Bus
            </div>
          </div>
        </div>

        {/* Gauge 4: Onboard Storage */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
            <FleetIcons.Battery className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.local_storage')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {d.storage_used_gb || 0} / {d.storage_total_gb || 64} GB
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{t('admin.gps.storage_healthy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Hardware Profile + Connected GPS Telematics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edge Unit Specifications Box */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FleetIcons.EdgeDevice className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>{t('admin.gps.compute_unit_spec')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Core processing unit installed on transit vehicle for media playback &amp; sensor telemetry
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-mono font-bold">
                {boxId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.box_serial')}</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-xs">{boxId}</span>
              </div>

              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.mac_address_label')}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs">{d.mac || '—'}</span>
              </div>

              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.hw_arch')}</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">{d.model || 'EdgeBox-500 (ARM64)'}</span>
              </div>

              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.agent_firmware')}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs">v{d.agent_version || '1.0.4'}</span>
              </div>

              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.sim_mobile_data')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{d.sim_network || d.sim || '4G LTE IoT'}</span>
              </div>

              <div className="bg-slate-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.storage_allocated')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{d.storage_used_gb || 0} / {d.storage_total_gb || 64} GB</span>
              </div>
            </div>
          </div>

          {/* Connected GPS Module & Telemetry Feed */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FleetIcons.Gps className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{t('admin.gps.connected_gps_telemetry')}</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{t('admin.gps.gps_connected_desc')}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              The high-accuracy GNSS/GPS tracking receiver is directly attached to this Edge Device, transmitting continuous real-time satellite coordinates, velocity, and breadcrumbs to the cloud.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.latest_latitude')}</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {latestGps?.latitude ? Number(latestGps.latitude).toFixed(6) : '18.520430° N'}
                </p>
                <span className="text-[10px] text-slate-400">{t('admin.gps.live_gnss_lock')}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.latest_longitude')}</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {latestGps?.longitude ? Number(latestGps.longitude).toFixed(6) : '73.856744° E'}
                </p>
                <span className="text-[10px] text-slate-400">{t('admin.gps.transit_zone_label')}</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('admin.gps.gps_speed')}</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {latestGps?.speed != null ? `${latestGps.speed} km/h` : '32.4 km/h'}
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{t('admin.gps.active_telemetry')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Vehicle, Fleet & Tenant Hierarchy */}
        <div className="space-y-6">
          {/* Organization & Fleet Context Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Depot className="w-4 h-4 text-blue-600" />
                <span>{t('admin.gps.org_hierarchy')}</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isAssigned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
              }`}>
                {isAssigned ? 'Assigned' : 'Spare Hardware'}
              </span>
            </div>

            {/* Hierarchy Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">{t('admin.gps.tenant_organization')}</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {d.vehicle?.organization?.name || d.organization?.name || 'Mahrashtra transports'}
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">{t('admin.gps.fleet_operator')}</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {d.vehicle?.fleet?.name || (isAssigned ? 'General Fleet' : 'Spare Pool')}
                  </p>
                </div>
                {d.vehicle?.depot?.name && (
                  <div className="pt-2 border-t border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.home_depot')}</span>
                    <p className="font-medium text-slate-700 dark:text-zinc-300 text-xs mt-0.5">
                      {d.vehicle.depot.name} {d.vehicle.depot.city ? `(${d.vehicle.depot.city})` : ''}
                    </p>
                  </div>
                )}
              </div>

              {isAssigned ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">{t('admin.gps.installed_on_bus')}</span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                        {d.vehicle?.bus_number || `Bus #${d.vehicle_id}`}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {d.vehicle?.model || 'Transit Bus'} {d.vehicle?.vin ? `• ${d.vehicle.vin}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to={isFleetPortal ? `/fleet-operator/vehicles/${d.vehicle?.id || d.vehicle_id}` : `/admin/vehicles/${d.vehicle?.id || d.vehicle_id}`}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <FleetIcons.Bus className="w-3.5 h-3.5" />
                      <span>{t('admin.gps.view_bus_profile')}</span>
                      <FleetIcons.ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`${basePath}/${d.id}/assign`)}
                      className="w-full py-2 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Reassign to Another Bus
                    </button>
                    <button
                      type="button"
                      onClick={handleUnassign}
                      className="w-full py-2 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Unassign from Bus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-3">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300">{t('admin.gps.ready_for_installation')}</div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    This Edge Device and its connected GPS receiver are unassigned. Bind them to a fleet bus to activate real-time telemetry.
                  </p>
                  <button
                    onClick={() => navigate(`${basePath}/${d.id}/assign`)}
                    className="w-full py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FleetIcons.Bus className="w-3.5 h-3.5" />
                    <span>{t('admin.gps.assign_to_vehicle_now')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpsDeviceDetailsPage;

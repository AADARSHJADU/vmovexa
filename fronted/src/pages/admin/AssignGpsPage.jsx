import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

export const AssignGpsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/edge-devices' : '/admin/edge-devices';
  const canAssign = hasPermission(['fleet.devices.assign', 'fleet.devices.update', 'devices.gps.manage']);

  const { loadDevice, assignVehicle, selectedDevice } = useFleetGps();
  const { vehicles, loadVehicles } = useFleetVehicle();

  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dev] = await Promise.all([loadDevice(id), loadVehicles()]);
        if (mounted && dev?.vehicle_id) {
          setSelectedVehicleId(String(dev.vehicle_id));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load device details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, loadDevice, loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const filteredVehicles = vehicleList.filter((v) => {
    const q = vehicleSearch.toLowerCase();
    return (
      String(v.bus_number || '').toLowerCase().includes(q) ||
      String(v.registration_number || '').toLowerCase().includes(q) ||
      String(v.model || '').toLowerCase().includes(q) ||
      String(v.fleet?.name || '').toLowerCase().includes(q) ||
      String(v.depot_name || v.depot?.name || '').toLowerCase().includes(q)
    );
  });

  const device = selectedDevice || {};
  const boxId = device.box_id || device.code || `EDGE-${id}`;
  const isAssigned = Boolean(device.vehicle_id || device.vehicle);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle to assign this Edge Device.');
      return;
    }

    setIsSubmitting(true);
    try {
      await toast.promise(assignVehicle(id, selectedVehicleId), {
        loading: 'Assigning Edge Device & GPS to Vehicle...',
        success: 'Edge Device & GPS receiver assigned successfully!',
        error: (err) => err?.message || 'Failed to assign Edge Device',
      });
      navigate(basePath);
    } catch {
      // toast.promise reports the API error.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    const busLabel = device.vehicle?.bus_number || (device.vehicle_id ? `Bus #${device.vehicle_id}` : 'vehicle');
    if (!window.confirm(`Unassign Edge Device ${boxId} from ${busLabel}? (Connected GPS stream will also detach)`)) return;
    setIsSubmitting(true);
    try {
      await toast.promise(assignVehicle(id, null), {
        loading: 'Unlinking Edge Device from vehicle...',
        success: 'Edge Device unlinked successfully!',
        error: (err) => err?.message || 'Failed to unlink Edge Device',
      });
      navigate(basePath);
    } catch {
      // toast.promise reports the API error.
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-24 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="w-8 h-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 dark:text-zinc-400 font-bold text-xs">{t('admin.gps.loading_assign_roster')}</p>
      </div>
    );
  }

  if (!canAssign) {
    return (
      <div className="w-full p-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center my-8">
        <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('common.access_denied')}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
          {t('admin.gps.assign_access_denied_desc')}
        </p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-5 px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          {t('admin.gps.back_to_edge_devices')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Top Header Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: 'Edge Devices', path: basePath },
              { label: boxId, path: `${basePath}/${id}` },
              { label: 'Assign Vehicle' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5 flex items-center gap-3 flex-wrap">
            <span>{t('admin.gps.assign_edge_device_title')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 uppercase font-mono">
              {boxId}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {t('admin.gps.assign_edge_device_desc')}
          </p>
        </div>

        <button
          onClick={() => navigate(basePath)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          {t('common.cancel')}
        </button>
      </div>

      {/* 2. Edge Device Hardware Spec Profile Banner */}
      <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex flex-col items-center justify-center font-black text-xs shrink-0 p-2 text-center">
          <FleetIcons.EdgeDevice className="w-10 h-10 mb-1 text-cyan-600 dark:text-cyan-400" />
          <span className="font-mono text-[10px]">{device.model || 'EdgeBox'}</span>
        </div>

        <div className="space-y-3 flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-mono">{boxId}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 uppercase border border-emerald-200 dark:border-emerald-800">
                  {device.status || 'Standby'}
                </span>
                {isAssigned && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 uppercase border border-blue-200 dark:border-blue-800">
                    {t('admin.gps.currently_bound_to')} {device.vehicle ? device.vehicle.bus_number : `Bus #${device.vehicle_id}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                MAC: <strong className="text-slate-800 dark:text-zinc-200">{device.mac || device.imei || '—'}</strong> | {t('admin.gps.agent_label')}: <strong className="text-slate-800 dark:text-zinc-200">v{device.agent_version || '1.0.4'}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-center md:self-auto text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              <FleetIcons.Gps className="w-3.5 h-3.5" />
              <span>{t('admin.gps.receiver_connects_info')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.gps.sim_network')}</span>
              <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs mt-0.5">{device.sim_network || device.sim || '4G Cellular IoT'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.gps.storage')}</span>
              <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs mt-0.5">{device.storage_used_gb || 0} / {device.storage_total_gb || 64} GB</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.gps.connected_screens')}</span>
              <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs mt-0.5">{t('admin.gps.dual_hdmi')}</p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">{t('admin.gps.gps_antenna')}</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">{t('admin.gps.sma_gnss')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Vehicle Selector Form */}
      <form onSubmit={handleAssign} className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FleetIcons.Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{t('admin.gps.select_target_vehicle')}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('admin.gps.select_target_vehicle_desc')}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 self-start sm:self-auto">
              {filteredVehicles.length} {t('admin.gps.vehicles_available')}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <FleetIcons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder={t('admin.gps.search_vehicle_ph')}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500"
            />
          </div>

          {/* Vehicle List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredVehicles.map((v) => {
              const isSelected = String(v.id) === String(selectedVehicleId);
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(String(v.id))}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-600/30'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                      }`}>
                        <FleetIcons.Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 dark:text-white text-sm block">
                          {v.bus_number}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">
                          {v.model || 'Transit Bus'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <FleetIcons.Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">
                      Fleet: <strong className="text-slate-800 dark:text-zinc-200">{v.fleet?.name || 'General'}</strong>
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500">
                      {v.depot?.name || v.depot_name || 'Depot'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800 flex-wrap gap-3">
          {isAssigned && (
            <button
              type="button"
              onClick={handleUnassign}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all cursor-pointer"
            >
              {t('admin.gps.unbind_current_vehicle')}
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedVehicleId}
              className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('admin.gps.assigning') : t('admin.gps.confirm_vehicle_assignment')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignGpsPage;

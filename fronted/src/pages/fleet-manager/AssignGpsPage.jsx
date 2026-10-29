import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';

export const AssignGpsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, loadVehicles } = useFleetVehicle();
  const { devices, loadDevices, assignVehicle } = useFleetGps();

  useEffect(() => { loadVehicles().catch(() => {}); }, [loadVehicles]);
  useEffect(() => { loadDevices().catch(() => {}); }, [loadDevices]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const targetVehicle = vehicleList.find(
    (v) => String(v.id) === String(id) || String(v.code) === String(id) || String(v.bus_number) === String(id)
  ) || {};

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Available'); // 'Available' or 'Assigned'
  const [selectedGpsId, setSelectedGpsId] = useState(null);

  const availableDevices = gpsList.filter(g => ['available', 'online'].includes(String(g.status || '').toLowerCase()));
  const assignedDevices = gpsList.filter(g => String(g.status || '').toLowerCase() === 'assigned');

  const currentList = activeTab === 'Available' ? availableDevices : assignedDevices;

  const filteredDevices = currentList.filter(g => {
    const q = search.toLowerCase();
    return String(g.code || g.id || '').toLowerCase().includes(q) ||
           String(g.model || '').toLowerCase().includes(q) ||
           (g.sim && String(g.sim).toLowerCase().includes(q)) ||
           (g.sim_number && String(g.sim_number).toLowerCase().includes(q)) ||
           (g.imei && String(g.imei).toLowerCase().includes(q));
  });

  const detailsRoute = `/fleet-operator/vehicles/${targetVehicle.id ?? id}`;

  const handleAssign = async () => {
    if (selectedGpsId && targetVehicle?.id) {
      try {
        await toast.promise(assignVehicle(selectedGpsId, targetVehicle.id), {
          loading: 'Assigning GPS device...',
          success: 'GPS device assigned successfully!',
          error: (err) => err?.message || 'Failed to assign GPS device',
        });
        await loadDevices().catch(() => {});
      } catch {
        return; // stay on page so the user can retry
      }
    }
    navigate(detailsRoute);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
          { label: 'Vehicles Directory', path: '/fleet-operator/vehicles' },
          { label: String(targetVehicle.bus_number ?? targetVehicle.code ?? id) },
          { label: t('fleet.assign.assign_gps_device') },
        ]}
        className="mb-2"
      />

      {/* Header Container */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/fleet-operator/vehicles')} 
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title={t('fleet.vehicle.back_vehicles')}
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('fleet.assign.iot_gps_title')}</h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Pair an active OBD-II or hardwired IoT GPS tracker for real-time speed, battery, and route telemetry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => navigate(detailsRoute)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all text-center"
          >
            Skip for Now
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <FleetIcons.Gps className="w-4 h-4 text-white" />
            <span>{t('fleet.assign.gps_finish')}</span>
          </button>
        </div>
      </div>

      {/* 2. Target Vehicle Summary Context Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center shrink-0 shadow-inner">
            <FleetIcons.Gps className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Vehicle {targetVehicle.bus_number ?? targetVehicle.code ?? id}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{t('common.active')}</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>{t('common.driver')}: <strong className="text-slate-800 dark:text-zinc-200 font-bold">{targetVehicle.assigned_driver_id ?? 'Unassigned'}</strong></span>
              <span>•</span>
              <span>{t('common.fleet')}: <strong className="text-slate-800 dark:text-zinc-200 font-bold">{targetVehicle.fleet_id ?? '—'}</strong></span>
              <span>•</span>
              <span>{t('common.type')}: <strong className="text-slate-800 dark:text-zinc-200 font-bold">{targetVehicle.vehicle_type ?? '—'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold">
            Step 3 of 3: Telematics Hardware
          </span>
        </div>
      </div>

      {/* 3. Hardware Search & Device Roster */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 transition-colors">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('fleet.assign.assign_gps_device')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.assign.select_gps_desc')}</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
              <FleetIcons.Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('fleet.assign.search_gps_sim_ph')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('Available')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'Available'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Available ({availableDevices.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Assigned')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'Assigned'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Assigned ({assignedDevices.length})
            </button>
          </div>
        </div>

        {/* GPS Cards List */}
        <div className="space-y-3">
          {filteredDevices.map((device) => {
            const isSelected = selectedGpsId === device.id;
            return (
              <div
                key={device.id}
                onClick={() => setSelectedGpsId(device.id)}
                className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'
                }`}
              >
                {/* Left: Device Icon / Box & Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white border border-slate-800 dark:border-zinc-700 flex flex-col items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                    <span className="text-[10px] text-cyan-400">{t('common.iot')}</span>
                    <span className="text-xs">{t('common.gps')}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{device.code ?? device.id}</h4>
                    <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 font-medium">Model: {device.model || device.vendor || '—'}</div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5">SIM: {device.sim || device.sim_number || '—'}</div>
                  </div>
                </div>

                {/* Center & Right: Battery + Signal + Action */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="text-left sm:text-right space-y-1">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center sm:justify-end gap-1.5">
                      <FleetIcons.Battery className="w-3.5 h-3.5" />
                      <span>Battery: {device.battery || device.battery_capacity || '1200 mAh'}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FleetIcons.Signal className="w-3 h-3" />
                        <span>Signal: {device.signal ?? '—'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{device.status ?? '—'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGpsId(device.id);
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                        <span>{t('common.selected')}</span>
                      </>
                    ) : (
                      <span>{t('common.assign')}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fallback Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left transition-colors">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <FleetIcons.Gps className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('fleet.assign.no_gps_avail')}</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Add a new GPS tracker to enable real-time telemetry and speed telemetry monitoring.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/fleet-operator/gps/add?assignVehicle=${targetVehicle.id ?? id}`)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" />
              <span>{t('fleet.gps.register_device')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(detailsRoute)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all"
            >
              Skip for Now
            </button>
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-center">
          <button
            type="button"
            onClick={handleAssign}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <FleetIcons.Gps className="w-4 h-4 text-white" />
            <span>{t('fleet.assign.assign_gps_complete')}</span>
          </button>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-center gap-1">
            <FleetIcons.Info className="w-3.5 h-3.5" />
            <span>{t('fleet.assign.only_avail_gps_desc')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssignGpsPage;

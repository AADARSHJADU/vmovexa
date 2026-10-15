import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';

export const SetupCompletePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, loadVehicles } = useFleetVehicle();

  useEffect(() => { loadVehicles().catch(() => {}); }, [loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const vehicle = vehicleList.find(v => String(v.id) === String(id) || String(v.code) === String(id)) || {};

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
          { label: 'Vehicles', path: '/fleet-manager/vehicles' },
          { label: 'Configuration Complete' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Configuration Complete</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Hardware telematics bindings and vehicle operational readiness verified.</p>
        </div>

        <button 
          type="button"
          onClick={() => navigate('/fleet-manager/vehicles')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>Vehicles List</span>
        </button>
      </div>

      {/* 2. Main Success Card */}
      <div className="w-full p-8 md:p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm text-center space-y-8 transition-colors">
        
        {/* Animated Visual Shield & Bus IoT Illustration */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          {/* Shield Badge */}
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white flex items-center justify-center shadow-md mb-4">
            <FleetIcons.Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Bus & IoT Telemetry Graphic */}
          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-zinc-800 text-white w-full max-w-md shadow-xl relative overflow-hidden flex flex-col items-center justify-center border border-slate-800 dark:border-zinc-700">
            <div className="absolute top-2.5 right-3.5 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>TELEMETRY ONLINE</span>
            </div>

            <div className="flex items-center justify-center gap-6 my-4 text-slate-300">
              <FleetIcons.Bus className="w-8 h-8 text-blue-400" />
              <FleetIcons.Speed className="w-6 h-6 text-amber-400" />
              <FleetIcons.Gps className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="font-mono text-sm font-black text-white">{vehicle.bus_number ?? vehicle.code ?? '—'}</div>
            <div className="text-xs text-slate-400 mt-0.5">{vehicle.vehicle_type ?? '—'} • {vehicle.fleet_id ?? '—'}</div>
          </div>
        </div>

        {/* Success Headers */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Vehicle Successfully Configured
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-medium">
            All onboarding steps and hardware telematics bindings have been verified.
          </p>
        </div>

        {/* Configuration Summary Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 font-medium">
              <FleetIcons.Bus className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Fleet Division</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{vehicle.fleet_id ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 font-medium">
              <FleetIcons.Car className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Vehicle Identifier</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{vehicle.bus_number ?? vehicle.code ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 font-medium">
              <FleetIcons.Driver className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Assigned Driver</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">{vehicle.assigned_driver_id ?? 'Unassigned'}</span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-700">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 font-medium">
              <FleetIcons.Gps className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Connected GPS Device</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{vehicle.gps_device_id ?? '—'}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-400 font-medium">
              <FleetIcons.Check className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Readiness Status</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Ready for Dispatch</span>
            </span>
          </div>
        </div>

        {/* 4-Step Lifecycle Verification Checklist */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-left space-y-3.5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Lifecycle Verification & Audit Trail
          </h3>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Fleet Created</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{vehicle.fleet_id ?? 'Fleet'} has been verified and registered.</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Vehicle Added</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Vehicle {vehicle.bus_number ?? vehicle.code ?? '—'} specifications and display screens enrolled.</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Driver Assigned</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">{vehicle.assigned_driver_id ?? 'Driver'} has been assigned to this vehicle.</div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                <FleetIcons.Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">GPS Device Connected</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">GPS device {vehicle.gps_device_id ?? '—'} telematics stream confirmed online.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/fleet-manager/vehicles/${vehicle.id ?? ''}`)}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FleetIcons.Bus className="w-4 h-4 text-white" />
            <span>View Vehicle Details & Telemetry</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/fleet-manager/fleets')}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fleet Management</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupCompletePage;

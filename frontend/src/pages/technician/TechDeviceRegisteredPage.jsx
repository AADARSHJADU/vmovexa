import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const TechDeviceRegisteredPage = () => {
  const location = useLocation();
  const device = location.state?.device || {
    id: 'VMX-DP-1001',
    name: 'Passenger Display Bulkhead',
    type: 'Passenger Display',
    busId: 'Bus MH12 AB 1234',
    depot: 'Mumbai Central Depot',
    registeredOn: '16 May 2025 · 09:38 AM',
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <div className="flex justify-start">
        <Breadcrumb
          items={[
            { label: 'Technician', path: '/technician/dashboard' },
            { label: 'Devices', path: '/technician/devices' },
            { label: 'Device Registered' },
          ]}
          className="mb-2"
        />
      </div>

      {/* Success Animation / Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Device Registered!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your display device has been provisioned and registered successfully in the VMOVEXA ledger.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Device ID</span>
          <span className="text-sm font-mono font-black px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg">
            {device.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Display / Device Type:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{device.type}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Vehicle Assignment:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{device.busId}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Depot Location:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{typeof device.depot === 'object' && device.depot !== null ? (device.depot.name || device.depot.code || '—') : (device.depot ?? '—')}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Registered On:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{device.registeredOn}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          to="/technician/devices"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>Go to Display Devices</span>
          <span>→</span>
        </Link>
        <Link
          to="/technician/devices/register"
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Register Another Device
        </Link>
      </div>
    </div>
  );
};


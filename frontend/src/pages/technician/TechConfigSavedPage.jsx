import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const TechConfigSavedPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const device = location.state?.device || { id: id ?? '—' };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <div className="flex justify-start">
        <Breadcrumb
          items={[
            { label: 'Technician', path: '/technician/dashboard' },
            { label: 'Devices', path: '/technician/devices' },
            { label: 'Configuration Saved' },
          ]}
          className="mb-2"
        />
      </div>

      {/* Green Check Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configuration Saved!</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Display and network parameters have been applied and synced to device hardware over the air.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Device Hardware ID</span>
          <span className="text-sm font-mono font-black px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg">
            {device.box_id ?? device.id ?? '—'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Vehicle / Org:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">Vehicle {device.vehicle_id ?? '—'} (Org {device.organization_id ?? '—'})</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Saved By:</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{user?.name ?? '—'}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Configuration Version:</span>
            <div className="font-bold text-blue-700 dark:text-blue-400 font-mono mt-0.5">1.2.latest (OTA Synced)</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">Sections Updated:</span>
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">6 of 6 Sections Verified</div>
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
          to={`/technician/devices/${device.id}/config`}
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center"
        >
          Configure Another Parameter
        </Link>
      </div>
    </div>
  );
};


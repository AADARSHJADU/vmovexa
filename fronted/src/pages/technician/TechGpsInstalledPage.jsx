import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const TechGpsInstalledPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isSuperAdmin = window.location.pathname.startsWith('/superadmin');
  const basePath = isSuperAdmin ? '/superadmin/technician' : '/technician';
  const data = location.state || {
    busNumber: 'Bus MH12 AB 1234',
    depot: 'Mumbai Central Depot',
    vehicleType: 'Tata Starbus Ultra AC',
    gpsDeviceId: 'GPS-MX-00123',
    assignedOn: '14 May 2025 · 10:15 AM',
    assignedBy: 'Ranjit Patil',
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <div className="flex justify-start">
        <Breadcrumb
          items={[
            { label: isSuperAdmin ? 'Super Admin' : 'Technician', path: isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard' },
            ...(isSuperAdmin ? [{ label: 'Technician', path: `${basePath}/gps` }] : []),
            { label: 'GPS Installation', path: `${basePath}/gps` },
            { label: 'Installed' },
          ]}
          className="mb-2"
        />
      </div>

      {/* Green Check Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.gps.installed_success')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          The telematics unit has been registered and assigned. Live satellite telemetry is now active.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('technician.devices.assigned_vehicle')}</span>
            <div className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5">{data.busNumber}</div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            Assigned & Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('technician.gps.device_id_label')}</span>
            <div className="font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5">{data.gpsDeviceId}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('technician.registered.depot_location')}</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{typeof data.depot === 'object' && data.depot !== null ? (data.depot.name || data.depot.code || '—') : (data.depot ?? '—')}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('technician.gps.assigned_on')}</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{data.assignedOn}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium">{t('technician.gps.technician_label')}</span>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">{data.assignedBy}</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          to={`${basePath}/hardware-status`}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shadow-blue-600/20"
        >
          <span>{t('technician.gps.view_hw_gps_status')}</span>
          <FleetIcons.ArrowRight className="w-4 h-4 ml-1 inline" />
        </Link>
        <Link
          to={isSuperAdmin ? '/superadmin/dashboard' : '/technician/dashboard'}
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-all block text-center shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};


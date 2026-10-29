import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverIncidentSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const incident = location.state?.incident || {
    id: 'INC-2026-58-19-00021',
    type: 'Road Condition',
    severity: 'Low',
    location: 'Andheri Depot, Mumbai, Maharashtra',
    dateTime: 'May 14, 2025 · 05:45 AM',
    status: 'Under Review',
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <Breadcrumb
        items={[
          { label: 'Driver', path: '/driver/dashboard' },
          { label: 'Incidents', path: '/driver/incidents' },
          { label: 'Success' },
        ]}
        className="mb-4 justify-center"
      />

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver.incidents.success_title')}</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          Your report has been logged and forwarded to the VMOVEXA transit control room and maintenance desk.
        </p>
      </div>

      {/* Incident Summary Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('driver.incidents.ticket_id')}</span>
            <div className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5">{incident.id}</div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg">
            {incident.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.cat_sev')}</span>
            <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5">{incident.type}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.cat_sev')}</span>
            <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">● {incident.severity}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.loc_addr')}</span>
            <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5">{incident.location}</div>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.reported_time')}</span>
            <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5">{incident.dateTime}</div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        <Link
          to="/driver/dashboard"
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all block text-center"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/driver/routes"
          className="w-full py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all block text-center"
        >
          View Assigned Routes
        </Link>
      </div>
    </div>
  );
};

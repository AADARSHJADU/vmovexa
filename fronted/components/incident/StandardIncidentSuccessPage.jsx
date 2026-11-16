import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../FleetIcons';
import Breadcrumb from '../ui/Breadcrumb';

export const StandardIncidentSuccessPage = ({
  roleTitle = 'Fleet Operator',
  basePath = '/fleet-operator',
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const incident = location.state?.incident || {
    id: 'INC-2026-DISPATCH-001',
    incident_type: 'Road Condition',
    severity: 'low',
    location: 'Central Transit Corridor',
    reported_at: new Date().toISOString(),
    status: 'open',
  };

  const formattedDate = incident.reported_at
    ? new Date(incident.reported_at).toLocaleString('en-GB')
    : new Date().toLocaleString('en-GB');

  return (
    <section className="flex min-h-[calc(100dvh-10rem)] w-full flex-col items-center gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 sm:p-6 lg:p-8">
      <Breadcrumb
        items={[
          { label: t(`roles.${roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`, roleTitle), to: `${basePath}/dashboard` },
          { label: t('nav.incidents_log', 'Incidents Log'), to: `${basePath}/incidents` },
          { label: t('incident.report_success', 'Report Success') },
        ]}
        className="w-full justify-start"
      />

      <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col justify-center gap-5 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-emerald-300 bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-500/10 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 sm:h-20 sm:w-20">
          <FleetIcons.Check className="h-8 w-8 stroke-[2.5] sm:h-10 sm:w-10" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {t('ag.shared.standardincidentsuccesspage.incident_reported_successfully', 'Incident Reported Successfully!')}
          </h1>
          <p className="mx-auto mt-1.5 max-w-xl text-xs font-medium text-slate-500 dark:text-zinc-400 sm:text-sm">
            {t('ag.shared.standardincidentsuccesspage.incident_saved_notifications_queued', 'Incident saved successfully. Emergency notifications have been queued for dispatch.')}
          </p>
        </div>

        <div className="w-full min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
          <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-zinc-800">
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('ag.shared.standardincidentsuccesspage.incident_record_id', 'Incident Record ID')}
              </span>
              <div className="mt-0.5 break-all font-mono text-sm font-black text-slate-900 dark:text-white">
                #{incident.id}
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold uppercase text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
              {incident.status ? t(`incident.status.${incident.status.toLowerCase()}`, incident.status.toUpperCase()) : t('incident.status.open', 'OPEN')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-[11px] font-medium text-slate-400">{t('ag.shared.standardincidentsuccesspage.category', 'Category:')}</span>
              <div className="mt-0.5 font-bold text-slate-900 dark:text-zinc-200">
                {incident.incident_type || incident.incidentType
                  ? t(`incident.types.${(incident.incident_type || incident.incidentType).toLowerCase().replace(/[^a-z0-9]/g, '_')}`, incident.incident_type || incident.incidentType)
                  : t('incident.types.road_condition', 'Road Condition')}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">{t('ag.shared.standardincidentsuccesspage.severity_level', 'Severity Level:')}</span>
              <div className="mt-0.5 flex items-center gap-1.5 font-bold uppercase text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                {incident.severity ? t(`incident.severity.${incident.severity.toLowerCase()}`, incident.severity) : t('incident.severity.low', 'low')}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">{t('ag.shared.standardincidentsuccesspage.location', 'Location:')}</span>
              <div className="mt-0.5 font-bold text-slate-900 [overflow-wrap:anywhere] dark:text-zinc-200">
                {incident.location || incident.landmark || t('incident.gps_coordinated', 'GPS Coordinated')}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400">{t('ag.shared.standardincidentsuccesspage.timestamp', 'Timestamp:')}</span>
              <div className="mt-0.5 font-bold text-slate-900 dark:text-zinc-200">
                {formattedDate}
              </div>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <Link
            to={`${basePath}/incidents`}
            className="block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {t('ag.shared.standardincidentsuccesspage.view_in_incidents_command_log', 'View in Incidents Command Log')}
          </Link>
          <Link
            to={`${basePath}/dashboard`}
            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            {t('ag.shared.standardincidentsuccesspage.return_to_dashboard', 'Return to Dashboard')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StandardIncidentSuccessPage;

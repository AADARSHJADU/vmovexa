import { useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useLocation } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useDriverApp } from '../../hooks/driver/useDriverApp';

export const DriverIncidentSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { incidents: incidentsRaw, loadIncidents } = useDriverApp();

  useEffect(() => {
    loadIncidents().catch(() => {});
  }, [loadIncidents]);

  const incidentsList = Array.isArray(incidentsRaw)
    ? incidentsRaw
    : (incidentsRaw?.incidents || incidentsRaw?.items || incidentsRaw?.rows || []);

  const incidentRaw = location.state?.incident || (incidentsList.length > 0 ? incidentsList[0] : null);

  const ticketId = incidentRaw?.code || incidentRaw?.ticket_id || (incidentRaw?.id ? `INC-${incidentRaw.id}` : null);
  const status = incidentRaw?.status ? String(incidentRaw.status).toUpperCase() : 'UNDER REVIEW';
  const type = incidentRaw?.incident_type || incidentRaw?.incidentType || incidentRaw?.type || null;
  const severity = incidentRaw?.severity ? String(incidentRaw.severity).toUpperCase() : null;
  const locationText = incidentRaw?.location || incidentRaw?.address || incidentRaw?.city || null;
  const reportedTime = incidentRaw?.createdAt
    ? new Date(incidentRaw.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : incidentRaw?.dateTime || null;

  return (
    <div className="w-full max-w-xl mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
      <Breadcrumb
        items={[
          { label: t('ag.driver.driverincidentsuccesspage.driver', 'Driver'), path: '/driver/dashboard' },
          { label: t('ag.driver.driverincidentsuccesspage.incidents', 'Incidents'), path: '/driver/incidents' },
          { label: t('ag.driver.driverincidentsuccesspage.report_status', 'Report Status') },
        ]}
        className="mb-4 justify-center"
      />

      {/* Green Checkmark */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <FleetIcons.Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('driver.incidents.success_title', 'Incident Report Logged')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1.5 max-w-sm mx-auto">
          {t('ag.driver.driverincidentsuccesspage.your_report_has_been_recorded_in_the_central', 'Your report has been recorded in the central dispatch telemetry and forwarded to the operations desk.')}
        </p>
      </div>

      {/* Incident Summary Card if real report is available */}
      {incidentRaw ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('driver.incidents.ticket_id', 'Ticket / Report Code')}
              </span>
              <div className="text-sm font-mono font-black text-slate-900 dark:text-white mt-0.5">
                {ticketId || '—'}
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg">
              {status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.cat_sev', 'Incident Type')}</span>
              <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5">{type || '—'}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.severity', 'Severity Level')}</span>
              <div className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {severity ? `● ${severity}` : '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.loc_addr', 'Location / Coordinates')}</span>
              <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5 truncate" title={locationText || ''}>
                {locationText || '—'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] font-medium">{t('driver.incidents.reported_time', 'Timestamp')}</span>
              <div className="font-bold text-slate-900 dark:text-zinc-200 mt-0.5 font-mono">{reportedTime || '—'}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-2xl text-xs text-slate-500 dark:text-zinc-400">
          {t('ag.driver.driverincidentsuccesspage.no_recent_incident_submission_found_in_activ', 'No recent incident submission found in active session.')}
        </div>
      )}

      {/* CTAs with Signature Gradient */}
      <div className="space-y-3 pt-2">
        <Link
          to="/driver/dashboard"
          className="w-full py-3 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all block text-center active:scale-[0.99]"
        >
          {t('ag.driver.driverincidentsuccesspage.go_to_dashboard', 'Go to Dashboard')}
        </Link>
        <Link
          to="/driver/incidents"
          className="w-full py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all block text-center active:scale-[0.99]"
        >
          {t('ag.driver.driverincidentsuccesspage.view_incident_log', 'View Incident Log')}
        </Link>
      </div>
    </div>
  );
};

export default DriverIncidentSuccessPage;

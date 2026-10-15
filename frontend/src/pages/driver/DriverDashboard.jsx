import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';

export const DriverDashboard = () => {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const {
    profile,
    activeRoute,
    schedule,
    loadProfile,
    loadActiveRoute,
    loadSchedule,
    loadDocuments,
    loadIncidents,
  } = useDriverApp();

  const canReportIncident = hasPermission('drivers.incidents.report');

  useEffect(() => {
    loadProfile().catch(() => {});
    loadActiveRoute().catch(() => {});
    loadSchedule().catch(() => {});
    loadDocuments().catch(() => {});
    loadIncidents().catch(() => {});
  }, [loadProfile, loadActiveRoute, loadSchedule, loadDocuments, loadIncidents]);

  const todaySchedule = Array.isArray(schedule)
    ? schedule
    : (schedule?.schedules || schedule?.items || schedule?.rows || []);
  const currentActiveRoute = activeRoute?.activeTrip !== undefined ? activeRoute.activeTrip : activeRoute;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('common.welcome', 'Good Morning')}, {profile?.name ?? 'Driver'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Have a safe and smooth journey · {typeof profile?.organization === 'object' && profile?.organization !== null ? (profile.organization.name || profile.organization.code || '—') : (profile?.organization ?? 'VMovexa Transit')} · {profile?.badge_id || profile?.code || (profile?.id ? `DRV-${profile.id}` : '—')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canReportIncident && (
            <Link
              to="/driver/report"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
            >
              <FleetIcons.Target className="w-4 h-4 text-red-600" />
              <span>SOS / Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* Pending Document Verification Banner */}
      {(!profile?.documents_verified && !profile?.verified) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Document Verification Pending
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                Your KYC & driving documents are currently pending verification by Admin. Once verified, full route dispatch and schedule access will be unlocked.
              </p>
            </div>
          </div>
          <Link
            to="/driver/documents"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all shrink-0"
          >
            Upload / View Documents →
          </Link>
        </div>
      )}

      {/* Today's Route Featured Hero Card */}
      {currentActiveRoute ? (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                <FleetIcons.Bus className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('driver.assigned_route', 'Active Shift Route')}</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {currentActiveRoute?.routeNumber ?? currentActiveRoute?.route?.code ?? '—'}
                </h2>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentActiveRoute?.status ?? '—'}</span>
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">{currentActiveRoute?.routeName ?? currentActiveRoute?.route?.name ?? '—'}</div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">{currentActiveRoute?.busNumber ?? currentActiveRoute?.vehicle?.bus_number ?? '—'} · {currentActiveRoute?.vehicleType ?? currentActiveRoute?.vehicle?.vehicle_type ?? '—'}</div>
          </div>

          {/* 3 Inline Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('driver.shift_start', 'Departure')}</span>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{currentActiveRoute?.departureTime ?? currentActiveRoute?.start_time ?? '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">Departure</div>
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('driver.current_stop', 'Next Stop')}</span>
              <div className="text-sm font-black text-blue-700 dark:text-blue-400 mt-1">{currentActiveRoute?.nextStop ?? '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">ETA: {currentActiveRoute?.nextStopEta ?? '—'}</div>
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{t('driver.shift_end', 'End of Route')}</span>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{currentActiveRoute?.endTime ?? currentActiveRoute?.end_time ?? '—'}</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">Terminus</div>
            </div>
          </div>

          <Link
            to="/driver/routes"
            className="w-full py-3 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{t('driver.my_routes', 'View Route Details & Waypoints Map')}</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
          <FleetIcons.Bus className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.no_active_route', 'No active route')}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('driver.no_active_route', 'You have no route assigned right now.')}</p>
        </div>
      )}

      {/* Today's Schedule Strip */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('driver.shifts', "Today's Schedule")}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{todaySchedule.length} {t('nav.trips', 'Scheduled Trips')}</p>
          </div>
          <Link to="/driver/schedule" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {t('common.view_details', 'View Full Schedule')} →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {todaySchedule.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">{t('driver.no_trips', 'No scheduled trips')}</p>
          ) : (
            todaySchedule.map((trip) => (
              <div key={trip.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white w-16 shrink-0">{trip.startTime ?? trip.shift_start ?? '—'}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{trip.routeNumber ?? trip.route_id ?? (trip.date ? `Shift ${trip.date}` : 'Scheduled Shift')}</div>
                    <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium truncate">
                      {(trip.startDepot ?? trip.start_depot ?? 'Depot')} ➔ {(trip.endDepot ?? trip.end_depot ?? 'Terminus')} {trip.distance ? `(${trip.distance})` : ''}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${
                    trip.status === 'On Duty'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {trip.status ?? '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Operational Notifications Strip */}
      <div className="bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">{t('common.alerts', 'Operational Notifications')}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Road closures, traffic advisories & vehicle telemetry</p>
          </div>
          <Link to="/driver/notifications" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
            {t('common.view_details', 'View All')} →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">No notifications</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{t('dashboard.quick_actions', 'Quick Navigation')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('driver.my_routes', 'My Routes'), path: '/driver/routes', icon: <FleetIcons.Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
            { label: t('driver.shifts', 'Schedules'), path: '/driver/schedule', icon: <FleetIcons.Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
            { label: t('nav.documents', 'Documents'), path: '/driver/documents', icon: <FleetIcons.Document className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
            { label: t('driver.report_incident', 'Report Incident'), path: '/driver/report', icon: <FleetIcons.Alert className="w-5 h-5 text-red-600 dark:text-red-400" /> },
          ].map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="p-4 bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
            >
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 group-hover:bg-slate-100 dark:group-hover:bg-zinc-700 transition-colors">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mt-2">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

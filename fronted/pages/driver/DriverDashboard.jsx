import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';

export const DriverDashboard = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
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

  const [loading, setLoading] = useState(true);

  const canReportIncident = hasPermission('drivers.incidents.report');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      loadProfile(),
      loadActiveRoute(),
      loadSchedule(),
      loadDocuments(),
      loadIncidents(),
    ]).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [loadProfile, loadActiveRoute, loadSchedule, loadDocuments, loadIncidents]);

  // Check if driver documents and KYC are officially verified
  const isDocumentsVerified = useMemo(() => {
    if (user?.driver) {
      if (!user.driver.documents_verified) return false;
      if (
        user.driver.status === 'pending_approval' ||
        user.driver.status === 'rejected' ||
        user.driver.status === 'compliance_blocked'
      )
        return false;
    }
    if (user?.status === 'pending_approval') return false;
    if (!profile) return false;
    // Must be verified and not pending/blocked/rejected
    const isDocVerified = Boolean(profile.documents_verified || profile.verified);
    const isStatusValid =
      profile.status !== 'pending_approval' &&
      profile.status !== 'compliance_blocked' &&
      profile.status !== 'rejected';
    const isKycOk = !profile.kyc_rejected && !profile.kycRejected;
    return isDocVerified && isStatusValid && isKycOk;
  }, [profile, user]);

  const scheduleList = useMemo(() => {
    const raw = schedule;
    return Array.isArray(raw)
      ? raw
      : (raw?.schedules || raw?.items || raw?.rows || []);
  }, [schedule]);

  // Latest 5 shifts for the dashboard
  const latestFiveShifts = useMemo(() => {
    return scheduleList.slice(0, 5);
  }, [scheduleList]);

  const currentActiveRoute =
    activeRoute?.activeTrip !== undefined && activeRoute.activeTrip !== null
      ? activeRoute.activeTrip
      : (activeRoute || null);

  const slot = currentActiveRoute?.slot || activeRoute?.slot || null;
  const isTripCompleted =
    (currentActiveRoute?.rawStatus || currentActiveRoute?.status || '').toLowerCase() ===
    'completed';
  const isTripInProgress =
    (currentActiveRoute?.rawStatus || currentActiveRoute?.status || '').toLowerCase() ===
    'in_progress';

  const driverName = profile?.name || profile?.user?.name || user?.name || 'Driver';
  const orgName =
    typeof profile?.organization === 'object' && profile?.organization !== null
      ? profile.organization.name || profile.organization.code || '—'
      : (profile?.organization || user?.tenant_name || user?.tenant?.name || '—');
  const badgeId =
    profile?.badge_id ||
    profile?.badgeId ||
    profile?.code ||
    (profile?.id ? `DRV-${profile.id}` : user?.id ? `DRV-${user.id}` : '—');

  const activeSlotId = currentActiveRoute?.slotId || currentActiveRoute?.slot_id || slot?.id || '';
  const activeRouteUrl = activeSlotId ? `/driver/routes?slotId=${activeSlotId}` : '/driver/routes';

  // Skeleton state on initial load
  if (loading && !profile) {
    return (
      <div className="w-full space-y-6 animate-pulse p-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-4 w-72 bg-slate-100 dark:bg-zinc-800/60 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-48 w-full bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
        <div className="h-56 w-full bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
            <span>
              {t('common.welcome', 'Good Day')}, {driverName}!
            </span>
            {isDocumentsVerified ? (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shadow-sm">
                <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                <span>{t('driver.dashboard.kyc_verified', 'KYC Verified')}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center gap-1 shadow-sm">
                <FleetIcons.Clock className="w-3 h-3 text-amber-500" />
                <span>{t('driver.dashboard.verification_pending', 'Verification Pending')}</span>
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.driver.driverdashboard.safe_corridor_transit', 'Safe corridor transit ·')} <span className="font-semibold text-slate-700 dark:text-zinc-300">{orgName}</span> {t('ag.driver.driverdashboard.badge', '· Badge:')}{' '}
            <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{badgeId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canReportIncident && (
            <Link
              to="/driver/incident-report"
              className="px-4 py-2.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/30 hover:shadow-[#DA29F4]/40 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <FleetIcons.Target className="w-4 h-4 text-white" />
              <span>{t('driver.dashboard.sos_report', 'Report SOS / Incident')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. COMPLIANCE & KYC VERIFICATION GATEWAY (Only Shown When Not Verified) */}
      {!isDocumentsVerified ? (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 dark:from-amber-950/30 dark:via-zinc-900 dark:to-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD] to-[#DA29F4] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1C68FD]/30">
                <FleetIcons.Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950 dark:text-amber-200">
                  {t('ag.driver.driverdashboard.compliance_documents_pending_admin_verificat', 'Compliance Documents Pending Admin Verification')}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-300/80 font-medium mt-1 max-w-2xl">
                  {t('ag.driver.driverdashboard.your_commercial_driving_license_aadhaar_iden', 'Your commercial driving license, Aadhaar identity, and medical fitness certificates are currently pending review by fleet operations. Active route dispatch and live trip tracking will be unlocked once your profile is verified.')}
                </p>
              </div>
            </div>

            <Link
              to="/driver/documents"
              className="px-5 py-2.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/30 hover:shadow-[#DA29F4]/40 transition-all shrink-0 flex items-center gap-1.5 active:scale-[0.98]"
            >
              <FleetIcons.Document className="w-4 h-4 text-white" />
              <span>{t('driver.dashboard.upload_docs', 'Upload Documents')}</span>
              <FleetIcons.ArrowRight className="w-3.5 h-3.5 ml-0.5 text-white" />
            </Link>
          </div>

          {/* Compliance Checklist Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white/90 dark:bg-zinc-900/90 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs space-y-1 shadow-sm">
              <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FleetIcons.Profile className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{t('driver.dashboard.kyc_step1', 'Aadhaar / National ID')}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                {profile?.aadhaar_verified ? t('ag.driver.driverdashboard.verified_by_operations', 'Verified by Operations') : t('ag.driver.driverdashboard.pending_verification_review', 'Pending verification review')}
              </div>
            </div>

            <div className="p-3 bg-white/90 dark:bg-zinc-900/90 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs space-y-1 shadow-sm">
              <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FleetIcons.Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t('driver.dashboard.kyc_step2', 'Driving License')}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {profile?.dl_number ? `DL: ${profile.dl_number}` : t('ag.driver.driverdashboard.driving_license_required', 'Driving license required')}
              </div>
            </div>

            <div className="p-3 bg-white/90 dark:bg-zinc-900/90 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs space-y-1 shadow-sm">
              <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FleetIcons.Heart className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>{t('driver.dashboard.kyc_step3', 'Medical Fitness')}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                {profile?.medical_fitness_valid_until
                  ? `Valid until ${profile.medical_fitness_valid_until}`
                  : t('ag.driver.driverdashboard.certificate_required', 'Certificate required')}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3. ACTIVE ROUTE DISPATCH COCKPIT CARD (Unlocked When Verified) */
        <>
          {currentActiveRoute ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD] to-[#DA29F4] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1C68FD]/30">
                    <FleetIcons.Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                      {t('driver.assigned_route', 'Active Shift Route')}
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
                      <span>{currentActiveRoute?.routeNumber ?? currentActiveRoute?.route?.code ?? '—'}</span>
                      <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
                        ({currentActiveRoute?.busNumber ?? currentActiveRoute?.vehicle?.bus_number ?? '—'})
                      </span>
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {slot?.shift_type_label && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-sm">
                      {slot.shift_type_label}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                      isTripInProgress
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : isTripCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {isTripInProgress && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                    {isTripCompleted && <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{isTripCompleted ? t('ag.driver.driverdashboard.completed', 'Completed') : isTripInProgress ? t('ag.driver.driverdashboard.live_in_transit', 'Live in Transit') : t('ag.driver.driverdashboard.scheduled_ready', 'Scheduled / Ready')}</span>
                  </span>
                </div>
              </div>

              {/* Corridor Route Info Pill */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {currentActiveRoute?.routeName ??
                    currentActiveRoute?.route?.name ??
                    `${currentActiveRoute?.origin || '—'} ➔ ${currentActiveRoute?.destination || '—'}`}
                </div>
                <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    {currentActiveRoute?.busNumber ?? currentActiveRoute?.vehicle?.bus_number ?? '—'}
                  </span>
                  <span>·</span>
                  <span>{currentActiveRoute?.vehicleType ?? currentActiveRoute?.vehicle?.vehicle_type ?? '—'}</span>
                  {slot?.time_window && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{slot.time_window}</span>
                    </>
                  )}
                </div>
              </div>

              {/* 3 Telemetry Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {isTripCompleted ? t('ag.driver.driverdashboard.trip_started', 'Trip Started') : t('driver.shift_start', 'Departure')}
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    {currentActiveRoute?.started_at_formatted ||
                      currentActiveRoute?.departureTime ||
                      slot?.formatted_start_time ||
                      '—'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                    {isTripCompleted ? t('ag.driver.driverdashboard.logged_in_dispatch', 'Logged In Dispatch') : t('ag.driver.driverdashboard.scheduled_departure', 'Scheduled Departure')}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                    {t('driver.current_stop', 'Next Stop')}
                  </span>
                  <div className="text-sm font-black text-blue-700 dark:text-blue-400 mt-0.5 truncate font-mono">
                    {currentActiveRoute?.nextStop ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                    {t('ag.driver.driverdashboard.eta', 'ETA:')} {currentActiveRoute?.nextStopEta ?? slot?.formatted_end_time ?? '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {isTripCompleted ? t('ag.driver.driverdashboard.trip_ended', 'Trip Ended') : t('driver.shift_end', 'End of Route')}
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    {isTripCompleted
                      ? currentActiveRoute?.ended_at_formatted || '—'
                      : currentActiveRoute?.endTime || slot?.formatted_end_time || '—'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 truncate">
                    {isTripCompleted ? `Duration: ${currentActiveRoute?.duration || '—'}` : t('ag.driver.driverdashboard.corridor_terminus', 'Corridor Terminus')}
                  </div>
                </div>
              </div>

              {/* Direct Route Cockpit Button */}
              <Link
                to={activeRouteUrl}
                className="w-full py-3.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#1C68FD]/30 hover:shadow-[#DA29F4]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <FleetIcons.Speed className="w-4 h-4 text-white" />
                <span>
                  {isTripCompleted
                    ? t('ag.driver.driverdashboard.view_completed_shift_summary', 'View Completed Shift Summary →')
                    : isTripInProgress
                    ? t('ag.driver.driverdashboard.open_live_route_cockpit', 'Open Live Route Cockpit →')
                    : t('ag.driver.driverdashboard.launch_route_dispatch_cockpit', 'Launch Route Dispatch Cockpit →')}
                </span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD]/10 to-[#DA29F4]/10 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <FleetIcons.Bus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('driver.no_active_route', 'No Active Route Assigned')}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1 max-w-md mx-auto">
                  {t(
                    'driver.dashboard.no_trip_scheduled',
                    'You currently do not have a live or assigned dispatch shift. Check your timetable roster for upcoming shifts.'
                  )}
                </p>
              </div>
              <Link
                to="/driver/schedule"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/30 hover:shadow-[#DA29F4]/40 transition-all active:scale-[0.98]"
              >
                <FleetIcons.Clock className="w-3.5 h-3.5 text-white" />
                <span>{t('ag.driver.driverdashboard.view_timetable_schedule', 'View Timetable Schedule')}</span>
              </Link>
            </div>
          )}
        </>
      )}

      {/* 4. SHIFT SCHEDULE STRIP (Latest Shifts) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('driver.shifts', 'Shift Schedule & Timetable')}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                {t('ag.driver.driverdashboard.latest', 'Latest')} {latestFiveShifts.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('ag.driver.driverdashboard.corridor_timetables_vehicle_assignments_and_', 'Corridor timetables, vehicle assignments, and dispatch schedules')}
            </p>
          </div>

          <div>
            {isDocumentsVerified ? (
              <Link
                to="/driver/schedule"
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all inline-flex items-center gap-1.5 active:scale-[0.98]"
              >
                <span>{t('common.view_details', 'View Full Roster')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-white" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  toast.error(
                    t(
                      'driver.dashboard.locked_pending_toast',
                      'Driver approval is pending. Please complete document verification to unlock schedules.'
                    )
                  )
                }
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-not-allowed select-none border border-slate-200 dark:border-zinc-700/60"
                title={t('ag.driver.driverdashboard.locked_pending_admin_approval', 'Locked: Pending Admin Approval')}
              >
                <FleetIcons.Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                <span>{t('common.view_details', 'View Full Roster')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {latestFiveShifts.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
              {t('driver.no_trips', 'No scheduled shifts recorded')}
            </p>
          ) : (
            latestFiveShifts.map((trip, idx) => {
              const isCompleted = trip.isCompleted || trip.status === 'Completed' || trip.status === 'completed';
              const isInTransit = trip.status === 'In Transit' || trip.status === 'in_progress';
              const tripSlotId = trip.slot_id || trip.slotId || '';
              const tripUrl = tripSlotId ? `/driver/routes?slotId=${tripSlotId}` : '/driver/routes';

              return (
                <div
                  key={trip.id || idx}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 shrink-0 font-mono text-xs font-black text-slate-900 dark:text-white">
                      {trip.startTime ?? trip.shift_start ?? '—'}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {trip.route_number || trip.routeNumber || 'ROUTE'}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                          {trip.bus_number || '—'}
                        </span>
                        {trip.shift_type_label && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {trip.shift_type_label}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          · {trip.date || 'Today'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                        {trip.startDepot ?? trip.start_depot ?? '—'} → {trip.endDepot ?? trip.end_depot ?? '—'}
                        {trip.distance ? ` · ${trip.distance}` : ''}
                        {isCompleted && trip.duration && trip.duration !== '—' ? ` · Run: ${trip.duration}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : isInTransit
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {isCompleted && <FleetIcons.Check className="w-3 h-3 text-emerald-600" />}
                      {isInTransit && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      <span>{trip.status ?? 'Scheduled'}</span>
                    </span>

                    {isDocumentsVerified ? (
                      isCompleted ? (
                        <Link
                          to={tripUrl}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-lg shadow-sm transition-all inline-flex items-center gap-1 border border-slate-200/80 dark:border-zinc-700/80 active:scale-[0.98]"
                        >
                          <span>{t('ag.driver.driverdashboard.summary', 'Summary')}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          to={tripUrl}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white rounded-lg text-xs font-bold shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all inline-flex items-center gap-1 active:scale-[0.98]"
                        >
                          <span>{isInTransit ? t('ag.driver.driverdashboard.cockpit', 'Cockpit') : t('ag.driver.driverdashboard.dispatch', 'Dispatch')}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-white" />
                        </Link>
                      )
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {t('dashboard.quick_actions', 'Quick Actions & Portal Navigation')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: t('driver.my_routes', 'My Routes & Trips'),
              path: '/driver/routes',
              icon: <FleetIcons.Bus className="w-5 h-5 text-white" />,
              desc: 'Live corridor cockpit',
              requiresVerification: true,
            },
            {
              label: t('driver.shifts', 'Shift Timetables'),
              path: '/driver/schedule',
              icon: <FleetIcons.Clock className="w-5 h-5 text-white" />,
              desc: '7-day shift roster',
              requiresVerification: true,
            },
            {
              label: t('nav.documents', 'KYC & Documents'),
              path: '/driver/documents',
              icon: <FleetIcons.Document className="w-5 h-5 text-white" />,
              desc: 'License & compliance',
              requiresVerification: false,
            },
            {
              label: t('driver.report_incident', 'Report Incident'),
              path: '/driver/incident-report',
              icon: <FleetIcons.Alert className="w-5 h-5 text-white" />,
              desc: 'SOS & roadside log',
              allowed: canReportIncident,
              requiresVerification: false,
            },
          ]
            .filter((item) => item.allowed !== false)
            .map((item, idx) => {
              const isLocked = item.requiresVerification && !isDocumentsVerified;
              if (isLocked) {
                return (
                  <div
                    key={idx}
                    onClick={() =>
                      toast.error(
                        t(
                          'driver.dashboard.locked_pending_toast',
                          'Driver approval is pending. Please complete document verification to unlock routes.'
                        )
                      )
                    }
                    className="p-4 sm:p-5 bg-slate-50/70 dark:bg-zinc-900/50 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl opacity-60 cursor-not-allowed flex flex-col items-center justify-center text-center group relative select-none transition-all"
                    title={t('ag.driver.driverdashboard.locked_pending_admin_approval', 'Locked: Pending Admin Approval')}
                  >
                    <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-xs">
                      <FleetIcons.Lock className="w-3 h-3" />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-200 dark:bg-zinc-800 opacity-60">
                      <div className="text-slate-400">{item.icon}</div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-2.5">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      {t('ag.driver.driverdashboard.approval_pending', 'Approval Pending')}
                    </span>
                  </div>
                );
              }
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-[#1C68FD]/40 dark:hover:border-[#DA29F4]/40 hover:shadow-lg hover:shadow-[#1C68FD]/10 rounded-2xl shadow-sm transition-all flex flex-col items-center justify-center text-center group cursor-pointer active:scale-[0.98]"
                >
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#DA29F4]/35 transition-all">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#1C68FD] group-hover:to-[#DA29F4] transition-all mt-2.5">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                    {item.desc}
                  </span>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Pagination } from '../../components/ui/Pagination';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverRoutesPage = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlotId = searchParams.get('slotId');

  const isDriverRole = (user?.role?.code || user?.role || '').toLowerCase().includes('driver');
  const canManageDuty = hasPermission('drivers.duty.manage') || isDriverRole;

  const {
    activeRoute,
    loadActiveRoute,
    profile,
    loadProfile,
    trips = [],
    loadTrips,
    startTrip,
    endTrip,
  } = useDriverApp();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Completed trips filters, dynamic server pagination & details modal
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 300);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'active') {
        const slotParam = searchParams.get('slotId');
        await Promise.allSettled([
          loadActiveRoute(slotParam ? { slotId: slotParam } : {}),
          loadProfile(),
        ]);
      } else {
        await loadTrips({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch.trim() || undefined,
          status: 'completed',
        });
      }
    } finally {
      setRefreshing(false);
    }
  };

  // Dynamic Query 1: Active corridor & driver profile
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.allSettled([
      loadActiveRoute(requestedSlotId ? { slotId: requestedSlotId } : {}),
      loadProfile(),
    ]).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [loadActiveRoute, loadProfile, requestedSlotId]);

  // Dynamic Query 2: Completed trips only when on completed tab (sab ek saath get na ho)
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'completed') {
      loadTrips({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch.trim() || undefined,
        status: 'completed',
      });
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, currentPage, pageSize, debouncedSearch, loadTrips]);

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
    const isDocVerified = Boolean(profile.documents_verified || profile.verified);
    const isStatusValid =
      profile.status !== 'pending_approval' &&
      profile.status !== 'compliance_blocked' &&
      profile.status !== 'rejected';
    const isKycOk = !profile.kyc_rejected && !profile.kycRejected;
    return isDocVerified && isStatusValid && isKycOk;
  }, [profile, user]);

  const currentRoute =
    activeRoute?.activeTrip !== undefined && activeRoute.activeTrip !== null
      ? activeRoute.activeTrip
      : (activeRoute || null);

  const todaySlots = activeRoute?.todaySlots || [];
  const selectedSlot = activeRoute?.selectedSlot || null;

  const vehicle = currentRoute?.vehicle || activeRoute?.assignedBus || {};
  const route = currentRoute?.route || activeRoute?.assignedRoute || {};
  const depot = currentRoute?.depot || activeRoute?.depot || vehicle?.depot || {};
  const fleet = currentRoute?.fleet || activeRoute?.fleet || vehicle?.fleet || {};
  const stops = currentRoute?.stops ?? [];

  const slot = selectedSlot || currentRoute?.slot || activeRoute?.slot || null;

  const getShiftBadge = (shiftType) => {
    const type = (shiftType || '').toLowerCase();
    if (type.includes('morning')) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
        label: t('ag.driver.driverroutespage.morning_peak', 'Morning Peak'),
      };
    }
    if (type.includes('evening')) {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
        label: t('ag.driver.driverroutespage.evening_peak', 'Evening Peak'),
      };
    }
    if (type.includes('night')) {
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
        label: t('ag.driver.driverroutespage.night_shuttle', 'Night Shuttle'),
      };
    }
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      label: t('ag.driver.driverroutespage.regular_day', 'Regular Day'),
    };
  };

  const shiftBadge = getShiftBadge(slot?.shift_type);

  const rawStatus = (
    currentRoute?.rawStatus ||
    currentRoute?.status ||
    slot?.status ||
    ''
  ).toLowerCase();
  const isTripCompleted = rawStatus === 'completed' || slot?.isCompleted;
  const isTripInProgress =
    rawStatus === 'in_progress' ||
    rawStatus === 'in transit' ||
    slot?.isInProgress ||
    (!isTripCompleted && profile?.status === 'on_duty');

  // Handle slot selection switcher
  const handleSelectSlot = (slotItem) => {
    setSearchParams({ slotId: slotItem.id });
    loadActiveRoute({ slotId: slotItem.id }).catch(() => {});
  };

  // Start Trip Action
  const handleStartTrip = async (options = {}) => {
    if (!canManageDuty) return;
    if (!isDocumentsVerified) {
      toast.error(t('ag.driver.driverroutespage.driver_document_verification_is_pend', 'Driver document verification is pending. Please complete KYC before starting dispatch.'));
      return;
    }
    setActionLoading(true);
    try {
      const rawSlotId = slot?.id || currentRoute?.slotId;
      const activeSlotId = Number.isInteger(Number(rawSlotId)) ? Number(rawSlotId) : undefined;
      await toast.promise(startTrip({ slotId: activeSlotId, ...options }), {
        loading: 'Starting route trip & activating telemetry...',
        success: 'Trip started! You are now live on route.',
        error: (err) => err?.message || 'Failed to start trip',
      });
      const sId = searchParams.get('slotId') || activeSlotId;
      await Promise.allSettled([
        loadActiveRoute(sId ? { slotId: sId } : {}),
        loadProfile(),
        loadTrips(),
      ]);
    } catch {
      // handled by toast
    } finally {
      setActionLoading(false);
    }
  };

  // End Trip Action
  const handleEndTrip = async () => {
    if (!canManageDuty) return;
    if (
      !window.confirm(
        'Are you sure you want to end this trip? This will record arrival at terminus and save to your completed trips log.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const rawSlotId = slot?.id || currentRoute?.slotId;
      const activeSlotId = Number.isInteger(Number(rawSlotId)) ? Number(rawSlotId) : undefined;
      await toast.promise(
        endTrip({
          tripId: currentRoute?.id || currentRoute?.tripId,
          slotId: activeSlotId,
        }),
        {
          loading: 'Completing voyage & logging final telemetry...',
          success: 'Trip completed successfully and archived to your log!',
          error: (err) => err?.message || 'Failed to complete trip',
        }
      );
      const sId = searchParams.get('slotId') || activeSlotId;
      await Promise.allSettled([
        loadActiveRoute(sId ? { slotId: sId } : {}),
        loadProfile(),
        loadTrips(),
      ]);
    } catch {
      // handled by toast
    } finally {
      setActionLoading(false);
    }
  };

  // Completed trips list with server-side metadata
  const tripsData = trips;
  const allTripsList = useMemo(() => {
    const raw = tripsData;
    return Array.isArray(raw) ? raw : (raw?.rows || raw?.trips || raw?.items || []);
  }, [tripsData]);

  const meta = tripsData?.meta || null;
  const totalCompleted = meta?.total ?? allTripsList.length;
  const totalPages = meta?.totalPages ?? (Math.ceil(totalCompleted / pageSize) || 1);

  const hasNoAssignments =
    !currentRoute?.busNumber &&
    !vehicle?.bus_number &&
    !slot &&
    todaySlots.length === 0;

  // Skeleton loading screen
  if (loading && !activeRoute && trips.length === 0) {
    return (
      <div className="w-full space-y-6 animate-pulse p-1 pb-16">
        <div className="h-4 w-44 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-100 dark:bg-zinc-800/60 rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-12 w-60 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-72 w-full bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Standard Top Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('ag.driver.driverroutespage.driver', 'Driver'), path: '/driver/dashboard' },
          { label: t('ag.driver.driverroutespage.assigned_routes_trips', 'Assigned Routes & Trips') },
        ]}
        className="mb-2"
      />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{t('driver.routes.title', 'Assigned Routes & Trips')}</span>
            {isTripInProgress ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('driver.routes.live_in_transit', 'Live in Transit')}</span>
              </span>
            ) : isTripCompleted ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('driver.routes.shift_run_completed', 'Shift Run Completed')}</span>
              </span>
            ) : null}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.driver.driverroutespage.manage_live_corridor_runs_shift_timetable_sl', 'Manage live corridor runs, shift timetable slots, and trip completion history')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.routes.refresh_title', 'Refresh active corridor')}
          />
          <Link
            to="/driver/schedule"
            className="px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FleetIcons.Clock className="w-3.5 h-3.5 text-white" />
            <span>{t('driver.routes.shift_timetable', 'Shift Timetable')}</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 text-white inline-block ml-0.5" />
          </Link>
        </div>
      </div>

      {/* 3. Section Tabs with Signature Gradient */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Speed className="w-4 h-4" />
          <span>{t('driver.routes.active_cockpit', 'Active Corridor Cockpit')}</span>
          {isTripInProgress && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          )}
          {isTripCompleted && (
            <span className="w-2 h-2 rounded-full bg-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98] ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Check className="w-4 h-4" />
          <span>{t('driver.routes.completed_trips_log', 'Completed Trips Log')}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === 'completed'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
            }`}
          >
            {totalCompleted}
          </span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ROUTE & TRIP DISPATCH */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {/* Verification Warning Notice if driver KYC is still pending */}
          {!isDocumentsVerified && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-sm">
              <div className="flex items-center gap-2.5">
                <FleetIcons.Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>{t('ag.driver.driverroutespage.kyc_verification_required', 'KYC Verification Required:')}</strong> {t('ag.driver.driverroutespage.your_driver_documents_are_currently_under_re', 'Your driver documents are currently under review. Active route telemetry and trip dispatch will unlock once approved.')}
                </span>
              </div>
              <Link
                to="/driver/documents"
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-95 whitespace-nowrap"
              >
                {t('ag.driver.driverroutespage.upload_documents', 'Upload Documents →')}
              </Link>
            </div>
          )}

          {/* SECTION A: TODAY'S ASSIGNED SHIFT TIMETABLE / MULTI-ROUTE SWITCHER */}
          {todaySlots.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('driver.routes.today', 'Today')}{t('ag.driver.driverroutespage.s_assigned_corridor_shifts', '\'s Assigned Corridor Shifts (')}{todaySlots.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  {t('ag.driver.driverroutespage.select_a_shift_below_to_view_corridor_route_', 'Select a shift below to view corridor route or dispatch bus')}
                </span>
              </div>

              {/* Horizontal Shift Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {todaySlots.map((s, index) => {
                  const isSelected = slot?.id === s.id;
                  const sShiftBadge = getShiftBadge(s.shift_type);

                  return (
                    <button
                      key={s.id || index}
                      type="button"
                      onClick={() => handleSelectSlot(s)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative active:scale-[0.99] ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#1C68FD]/10 via-[#DA29F4]/5 to-transparent border-[#1C68FD] dark:border-[#DA29F4] shadow-sm ring-2 ring-[#1C68FD]/30'
                          : 'bg-slate-50/70 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Top Row: Shift Type + Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sShiftBadge.bg}`}>
                          {s.shift_type_label || sShiftBadge.label}
                        </span>

                        {s.isInProgress ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{t('driver.routes.live_in_transit', 'Live in Transit')}</span>
                          </span>
                        ) : s.isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <FleetIcons.Check className="w-3 h-3 text-emerald-600" />
                            <span>{t('common.completed', 'Completed')}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {t('ag.driver.driverroutespage.scheduled', 'Scheduled')}
                          </span>
                        )}
                      </div>

                      {/* Middle: Route & Bus Details */}
                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {s.route_name || `${s.start_point || 'Depot'} ➔ ${s.end_point || 'Terminus'}`}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{s.bus_number}</span>
                          <span>·</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{s.time_window}</span>
                        </div>
                      </div>

                      {/* Bottom Footer Details */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium">
                          {s.isCompleted && s.duration && s.duration !== '—'
                            ? `Duration: ${s.duration}`
                            : `${s.distance_km || '—'} km Corridor`}
                        </span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isSelected
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] font-black'
                              : 'text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          {isSelected ? t('ag.driver.driverroutespage.active_in_cockpit', '● Active in Cockpit') : t('ag.driver.driverroutespage.select_shift', 'Select Shift →')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B: MAIN HIGH-CONTRAST DRIVER COCKPIT CARD OR EMPTY STATE */}
          {hasNoAssignments ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1C68FD]/15 to-[#DA29F4]/15 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
                <FleetIcons.Bus className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {t('ag.driver.driverroutespage.no_active_route_corridor_assigned', 'No Active Route Corridor Assigned')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
                  {t('ag.driver.driverroutespage.you_currently_do_not_have_any_active_bus_or_', 'You currently do not have any active bus or timetable slots dispatched for today. Check your shift timetable to review upcoming assignments.')}
                </p>
              </div>
              <Link
                to="/driver/schedule"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all active:scale-[0.98]"
              >
                <FleetIcons.Clock className="w-4 h-4 text-white" />
                <span>{t('ag.driver.driverroutespage.view_7_day_shift_schedule', 'View 7-Day Shift Schedule')}</span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              {/* Cockpit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD] to-[#DA29F4] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1C68FD]/30">
                    <FleetIcons.Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-slate-900 dark:text-white text-base">
                        {currentRoute?.busNumber || slot?.bus_number || vehicle?.bus_number || '—'}
                      </span>
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {currentRoute?.routeNumber || slot?.route_code || route?.code || '—'}
                      </span>
                      {slot?.slot_code && (
                        <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <FleetIcons.Clock className="w-3 h-3" />
                          <span>{t('ag.driver.driverroutespage.slot', 'Slot:')} {slot.slot_code}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                      {currentRoute?.routeName ||
                        slot?.route_name ||
                        route?.name ||
                        `${currentRoute?.origin || 'Depot'} ➔ ${currentRoute?.destination || 'Terminus'}`}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${shiftBadge.bg}`}>
                    {slot?.shift_type_label || shiftBadge.label}
                  </span>

                  {isTripInProgress ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('driver.routes.in_transit_live', 'Live in Transit')}</span>
                    </span>
                  ) : isTripCompleted ? (
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-sm">
                      <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t('driver.routes.completed_shift_ended', 'Shift Run Completed')}</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{t('driver.routes.ready_scheduled', 'Scheduled / Ready')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Telemetry Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs text-center">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                    {isTripCompleted ? t('ag.driver.driverroutespage.trip_started_at', 'Trip Started At') : isTripInProgress ? t('ag.driver.driverroutespage.departure_live', 'Departure (Live)') : t('ag.driver.driverroutespage.slot_departure', 'Slot Departure')}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    {currentRoute?.started_at_formatted || slot?.formatted_start_time || '—'}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block mt-0.5">
                    {isTripCompleted ? t('ag.driver.driverroutespage.logged_in_dispatch', 'Logged In Dispatch') : isTripInProgress ? t('ag.driver.driverroutespage.live_in_transit', 'Live In Transit') : t('ag.driver.driverroutespage.window_start', 'Window Start')}
                  </span>
                </div>

                <div className="border-l border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                    {isTripCompleted ? t('ag.driver.driverroutespage.trip_ended_at', 'Trip Ended At') : t('ag.driver.driverroutespage.arrival_slot_eta', 'Arrival (Slot ETA)')}
                  </span>
                  <div
                    className={`text-xs sm:text-sm font-black mt-0.5 font-mono ${
                      isTripCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {isTripCompleted ? currentRoute?.ended_at_formatted || '—' : slot?.formatted_end_time || '—'}
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                    {isTripCompleted
                      ? `Duration: ${currentRoute?.duration || '—'}`
                      : slot?.time_window
                      ? `Window: ${slot.time_window}`
                      : t('ag.driver.driverroutespage.timetable_arrival', 'Timetable Arrival')}
                  </span>
                </div>

                <div className="border-l border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                    {t('ag.driver.driverroutespage.corridor_distance', 'Corridor Distance')}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    {currentRoute?.totalDistance ||
                      (slot?.distance_km || route?.distance_km
                        ? `${slot?.distance_km || route?.distance_km} km`
                        : '—')}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block mt-0.5">
                    {isTripCompleted ? t('ag.driver.driverroutespage.covered_100_complete', 'Covered: 100% Complete') : slot?.frequency || 'Standard Corridor'}
                  </span>
                </div>

                <div className="border-l border-slate-200 dark:border-zinc-700">
                  <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                    {t('ag.driver.driverroutespage.progress_status', 'Progress / Status')}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                    {isTripCompleted
                      ? t('ag.driver.driverroutespage.100_completed', '100% (Completed)')
                      : isTripInProgress
                      ? `${currentRoute?.progress_percent != null ? `${currentRoute.progress_percent}%` : "0%"}`
                      : t('ag.driver.driverroutespage.0_ready', '0% (Ready)')}
                  </div>
                  <span
                    className={`text-[10px] font-medium block mt-0.5 ${
                      isTripCompleted
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isTripCompleted ? t('ag.driver.driverroutespage.shift_run_finished', 'Shift Run Finished') : isTripInProgress ? t('ag.driver.driverroutespage.telemetry_active', 'Telemetry Active') : t('ag.driver.driverroutespage.ready_to_dispatch', 'Ready to Dispatch')}
                  </span>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="pt-1">
                {isTripCompleted ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                          <FleetIcons.Check className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                            <span>{t('driver.routes.shift_completed_success', 'Shift Run Completed Successfully')}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                              {currentRoute?.trip?.trip_code || (currentRoute?.id ? `TRIP-${currentRoute.id}` : "—")}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                            {t('ag.driver.driverroutespage.voyage_has_arrived_at_destination_and_is_rec', 'Voyage has arrived at destination and is recorded in your dispatch history.')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveTab('completed')}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                          <FleetIcons.Reports className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{t('driver.routes.view_completed_log', 'View Log')}</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading || !canManageDuty || !isDocumentsVerified}
                          title={!canManageDuty ? t('ag.driver.driverroutespage.duty_management_permission_is_requir', 'Duty-management permission is required') : undefined}
                          onClick={() => handleStartTrip({ forceNew: true })}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold transition-all shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                        >
                          <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
                          <span>
                            {t('driver.routes.start_additional_run', 'Start Additional Run')}{' '}
                            <FleetIcons.Plus className="w-3.5 h-3.5 text-white inline-block ml-1" />
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900/30 text-xs text-center">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
                          {t('driver.routes.started_at', 'Started At')}
                        </span>
                        <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                          {currentRoute?.started_at_formatted || '—'}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {t('driver.routes.today', 'Today')}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-zinc-700">
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
                          {t('driver.routes.ended_at', 'Ended At')}
                        </span>
                        <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                          {currentRoute?.ended_at_formatted || '—'}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {t('driver.routes.today', 'Today')}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-zinc-700">
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
                          {t('driver.routes.voyage_duration', 'Run Duration')}
                        </span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                          {currentRoute?.duration || '—'}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {t('driver.routes.total_run_time', 'Total Run Time')}
                        </span>
                      </div>
                      <div className="border-l border-slate-200 dark:border-zinc-700">
                        <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
                          {t('driver.routes.covered_distance', 'Distance')}
                        </span>
                        <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                          {currentRoute?.covered_km || (slot?.distance_km ? `${slot.distance_km} km` : '—')}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium block">
                          {t('driver.routes.corridor_complete', 'Corridor Complete')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : isTripInProgress ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div>
                        <div className="font-bold">{t('driver.routes.trip_in_progress', 'Live Voyage In Progress')}</div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          {t('driver.routes.gps_broadcasting', 'Telemetry & GPS actively broadcasting')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={actionLoading || !canManageDuty}
                      title={!canManageDuty ? t('ag.driver.driverroutespage.duty_management_permission_is_requir', 'Duty-management permission is required') : undefined}
                      onClick={handleEndTrip}
                      className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:shadow-rose-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>{t('driver.routes.completing_trip', 'Completing Trip...')}</span>
                        </>
                      ) : (
                        <>
                          <FleetIcons.Check className="w-4 h-4 text-white" />
                          <span>{t('driver.routes.end_trip_btn', 'End Trip & Save Run')}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading || !canManageDuty || !isDocumentsVerified}
                    title={
                      !isDocumentsVerified
                        ? t('ag.driver.driverroutespage.kyc_verification_required', 'KYC verification required')
                        : !canManageDuty
                        ? t('ag.driver.driverroutespage.duty_management_permission_is_requir', 'Duty-management permission is required')
                        : undefined
                    }
                    onClick={() => handleStartTrip({})}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#1C68FD]/30 hover:shadow-[#DA29F4]/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>{t('driver.routes.starting_trip', 'Starting Trip & Activating Telemetry...')}</span>
                      </>
                    ) : (
                      <>
                        <FleetIcons.Speed className="w-5 h-5 text-white" />
                        <span>{t('driver.routes.start_trip_btn', 'Start Trip & Activate Live Telemetry')}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SECTION C: 2-COLUMN ESSENTIAL OPERATIONAL VIEW */}
          {!hasNoAssignments && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* COLUMN 1: LIVE WAYPOINT TRACKER (7 Cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <FleetIcons.Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t('driver.routes.waypoints_stops', 'Route Stations & Stops')}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      {stops.length} {t('ag.driver.driverroutespage.designated_stations_along_the_active_transit', 'designated stations along the active transit line')}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1C68FD] animate-pulse" />
                    <span>{t('driver.routes.waypoint_telematics', 'Active Telematics')}</span>
                  </span>
                </div>

                {stops.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                    {t('ag.driver.driverroutespage.no_waypoints_recorded_for_this_route_corrido', 'No waypoints recorded for this route corridor.')}
                  </p>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
                    {stops.map((stop, idx) => (
                      <div key={stop.id || idx} className="relative flex items-center justify-between gap-4">
                        {/* Dot on timeline */}
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            stop.type === 'start'
                              ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] border-transparent text-white ring-2 ring-[#1C68FD]/30'
                              : stop.type === 'end'
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : isTripCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : isTripInProgress && idx === 0
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500'
                          }`}
                        >
                          {isTripCompleted || (isTripInProgress && idx === 0) ? (
                            <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {stop.name ?? 'Transit Station'}
                            </span>
                            {stop.type === 'start' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded">
                                {t('ag.driver.driverroutespage.origin_depot', 'Origin Depot')}
                              </span>
                            )}
                            {stop.type === 'end' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded">
                                {t('ag.driver.driverroutespage.terminus', 'Terminus')}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                            {t('ag.driver.driverroutespage.eta', 'ETA:')} {stop.eta || 'On Schedule'}
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 shrink-0">
                          {stop.distance ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: ESSENTIAL VEHICLE & DEPOT HUB (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1C68FD]/10 to-[#DA29F4]/10 text-blue-600 dark:text-purple-400 border border-[#1C68FD]/20 flex items-center justify-center">
                      <FleetIcons.Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t('ag.driver.driverroutespage.assigned_bus_and_base_terminal', 'Assigned Bus & Base Terminal')}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {t('ag.driver.driverroutespage.operational_vehicle_hardware_and_depot', 'Operational vehicle hardware & depot')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.bus_registration', 'Bus Number')}</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                        {currentRoute?.busNumber || slot?.bus_number || vehicle?.bus_number || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.vehicle_model', 'Model')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {vehicle?.model || slot?.vehicle_model || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.power_battery', 'Battery / Fuel')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {vehicle?.battery_level != null
                          ? `EV Battery (${vehicle.battery_level}%)`
                          : slot?.battery_level != null
                          ? `EV Battery (${slot.battery_level}%)`
                          : '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.home_depot_base', 'Base Depot')}</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {depot?.name || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.operating_fleet', 'Fleet')}</span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">
                        {fleet?.name || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.scheduled_timetable', 'Scheduled Window')}</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {slot?.time_window ||
                          (slot?.formatted_start_time && slot?.formatted_end_time
                            ? `${slot.formatted_start_time} - ${slot.formatted_end_time}`
                            : '—')}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Hardware Specs Toggle */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowTechDetails(!showTechDetails)}
                      className="w-full text-left text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between cursor-pointer"
                    >
                      <span>{showTechDetails ? t('ag.driver.driverroutespage.hide_hardware_display_specs', 'Hide Hardware & Display Specs ▲') : t('ag.driver.driverroutespage.view_hardware_display_specs', 'View Hardware & Display Specs ▼')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t('driver.routes.technical_details', 'Specs')}</span>
                    </button>

                    {showTechDetails && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-[11px] border border-slate-100 dark:border-zinc-700/50 animate-in fade-in duration-150">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('driver.routes.vehicle_type', 'Vehicle Type')}</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{vehicle?.vehicle_type || vehicle?.type || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('driver.routes.seating_capacity', 'Capacity')}</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{vehicle?.capacity ? `${vehicle.capacity} Seats` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('driver.routes.hardware_code', 'Unit Code')}</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">{vehicle?.code || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{t('driver.routes.headway_frequency', 'Headway')}</span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{slot?.frequency || '—'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED TRIPS LOG (Permanent Dispatch History with Dynamic Server Pagination) */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {/* Filter Bar with Dedicated Section CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-md">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('driver.trips.search_ph', 'Search by trip code, bus number, or route corridor...')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1C68FD] transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {t('ag.driver.driverroutespage.total_completed', 'Total Completed:')} <strong className="text-slate-900 dark:text-white font-bold">{totalCompleted}</strong>
              </div>
              <Link
                to="/driver/trips"
                className="px-3.5 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
              >
                <span>{t('driver.routes.full_trips_section', 'View All Completed Trips')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block text-white" />
              </Link>
            </div>
          </div>

          {/* Trips Table */}
          {allTripsList.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
              <FleetIcons.Clock className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.routes.no_completed_trips', 'No Completed Trips Yet')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No completed trips matched your search "${searchQuery}".`
                  : t('ag.driver.driverroutespage.trips_you_finish_by_tapping_end_trip', 'Trips you finish by tapping "End Trip" on your active route will appear here in your permanent dispatch history.')}
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearch('');
                  }}
                  className="text-xs font-bold text-[#1C68FD] hover:underline cursor-pointer"
                >
                  {t('ag.driver.driverroutespage.clear_search', 'Clear Search')}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('driver.trips.trip_code', 'Trip Code')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('driver.trips.bus_vehicle', 'Bus Unit')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('driver.trips.corridor', 'Corridor Route')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('driver.trips.timings', 'Timings & Duration')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('driver.trips.distance', 'Distance')}</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">{t('common.status', 'Status')}</th>
                      <th className="py-3.5 px-4 text-right whitespace-nowrap">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {allTripsList.map((trip) => {
                      const tripCode = trip.code || `TRIP-${String(trip.id).padStart(4, '0')}`;
                      const busNum = trip.vehicle?.bus_number || `Bus #${trip.vehicle_id || '—'}`;
                      const rName = trip.route?.name || `${trip.origin || 'Depot'} ➔ ${trip.destination || 'Terminus'}`;
                      const dateStr = trip.started_at
                        ? new Date(trip.started_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : (trip.createdAt ? new Date(trip.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
                      const sTime = trip.started_at
                        ? new Date(trip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—';
                      const eTime = trip.ended_at
                        ? new Date(trip.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                        : '—';
                      
                      const durationStr = (() => {
                        if (!trip.started_at || !trip.ended_at) return 'Quick Run';
                        const s = new Date(trip.started_at).getTime();
                        const e = new Date(trip.ended_at).getTime();
                        if (isNaN(s) || isNaN(e) || e <= s) return '< 1 min';
                        const diffMins = Math.round((e - s) / (1000 * 60));
                        const h = Math.floor(diffMins / 60);
                        const m = diffMins % 60;
                        return h > 0 ? `${h}h ${m}m` : `${m} mins`;
                      })();

                      return (
                        <tr key={trip.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-slate-900 dark:text-white block text-xs font-mono">
                              {tripCode}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {dateStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs font-mono">
                              <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{busNum}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {trip.vehicle?.model || trip.vehicle?.plate_number || '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white block truncate text-xs" title={rName}>
                              {rName}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate mt-0.5" title={`${trip.origin || 'Depot'} ➔ ${trip.destination || 'Terminus'}`}>
                              {trip.origin || 'Depot'} ➔ {trip.destination || 'Terminus'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="text-slate-800 dark:text-zinc-200 block font-bold text-xs font-mono">
                              {sTime} – {eTime}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                              {t('ag.driver.driverroutespage.duration', 'Duration:')} {durationStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200 text-xs font-mono whitespace-nowrap">
                            {trip.distance_km || trip.covered_km || '—'}{(trip.distance_km || trip.covered_km) ? t('ag.driver.driverroutespage.km', 'KM') : ''}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                              <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                              <span>{t('common.completed', 'Completed')}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedTripDetails(trip)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-200 dark:border-zinc-700 active:scale-[0.98]"
                            >
                              <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span>{t('ag.driver.driverroutespage.summary', 'Summary')}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Standard Pagination Footer */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-200 dark:border-zinc-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalCompleted}
                    pageSize={pageSize}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    pageSizeOptions={[6, 10, 20]}
                  />
                </div>
              )}
            </div>
          )}

          {/* Details Modal for Completed Trip */}
          {selectedTripDetails && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setSelectedTripDetails(null)}
            >
              <div
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-hidden min-w-0"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C68FD] to-[#DA29F4] text-white flex items-center justify-center shadow-md shadow-[#1C68FD]/25">
                      <FleetIcons.Route className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        {selectedTripDetails.code || `TRIP-${String(selectedTripDetails.id).padStart(4, '0')}`}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {t('ag.driver.driverroutespage.completed_transit_voyage_summary', 'Completed Transit Voyage Summary')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTripDetails(null)}
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FleetIcons.Close className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {t('ag.driver.driverroutespage.corridor_route', 'Corridor Route')}
                    </span>
                    <p className="font-black text-slate-900 dark:text-white text-sm">
                      {selectedTripDetails.route?.name || `${selectedTripDetails.origin || 'Depot'} ➔ ${selectedTripDetails.destination || 'Terminus'}`}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      {selectedTripDetails.origin || 'Depot'} ➔ {selectedTripDetails.destination || 'Terminus'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('ag.driver.driverroutespage.assigned_bus', 'Assigned Bus')}
                      </span>
                      <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{selectedTripDetails.vehicle?.bus_number || `Bus #${selectedTripDetails.vehicle_id || '—'}`}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{selectedTripDetails.vehicle?.model || 'Commercial Transit'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {t('ag.driver.driverroutespage.distance_covered', 'Distance Covered')}
                      </span>
                      <div className="font-black text-slate-900 dark:text-white font-mono">
                        {selectedTripDetails.distance_km || selectedTripDetails.covered_km || '—'}{(selectedTripDetails.distance_km || selectedTripDetails.covered_km) ? t('ag.driver.driverroutespage.km', 'KM') : ''}
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('ag.driver.driverroutespage.logged_in_telematics', 'Logged in Telematics')}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ag.driver.driverroutespage.departure', 'Departure')}</span>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
                        {selectedTripDetails.started_at ? new Date(selectedTripDetails.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </div>
                    <div className="border-x border-slate-200 dark:border-zinc-700">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ag.driver.driverroutespage.arrival', 'Arrival')}</span>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 font-mono">
                        {selectedTripDetails.ended_at ? new Date(selectedTripDetails.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ag.driver.driverroutespage.run_time', 'Run Time')}</span>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                        {(() => {
                          if (!selectedTripDetails.started_at || !selectedTripDetails.ended_at) return 'Quick Run';
                          const s = new Date(selectedTripDetails.started_at).getTime();
                          const e = new Date(selectedTripDetails.ended_at).getTime();
                          if (isNaN(s) || isNaN(e) || e <= s) return '< 1 min';
                          const diffMins = Math.round((e - s) / (1000 * 60));
                          const h = Math.floor(diffMins / 60);
                          const m = diffMins % 60;
                          return h > 0 ? `${h}h ${m}m` : `${m} mins`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTripDetails(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {t('ag.driver.driverroutespage.close', 'Close')}
                  </button>
                  <Link
                    to="/driver/trips"
                    className="px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:opacity-95"
                  >
                    {t('ag.driver.driverroutespage.view_all_in_trips_log', 'View All in Trips Log →')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverRoutesPage;

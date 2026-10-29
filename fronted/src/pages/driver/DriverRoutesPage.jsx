import { useState, useEffect, useMemo } from 'react';
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
  const { hasPermission } = useAuth();
  const canManageDuty = hasPermission('drivers.duty.manage');
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSlotId = searchParams.get('slotId');

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

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);

  // Completed trips filters & pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const slotParam = searchParams.get('slotId');
      await Promise.allSettled([
        loadActiveRoute(slotParam ? { slotId: slotParam } : {}),
        loadProfile(),
        loadTrips(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveRoute(requestedSlotId ? { slotId: requestedSlotId } : {}).catch(() => {});
    loadProfile().catch(() => {});
    loadTrips().catch(() => {});
  }, [loadActiveRoute, loadProfile, loadTrips, requestedSlotId]);

  const currentRoute = activeRoute?.activeTrip !== undefined && activeRoute.activeTrip !== null
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
        label: 'Morning Peak',
      };
    }
    if (type.includes('evening')) {
      return {
        bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
        label: 'Evening Peak',
      };
    }
    if (type.includes('night')) {
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
        label: 'Night Shuttle',
      };
    }
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      label: 'Regular Day',
    };
  };

  const shiftBadge = getShiftBadge(slot?.shift_type);

  const rawStatus = (currentRoute?.rawStatus || currentRoute?.status || slot?.status || '').toLowerCase();
  const isTripCompleted = rawStatus === 'completed' || slot?.isCompleted;
  const isTripInProgress = rawStatus === 'in_progress' || rawStatus === 'in transit' || slot?.isInProgress || (!isTripCompleted && profile?.status === 'on_duty');

  // Handle slot selection switcher
  const handleSelectSlot = (slotItem) => {
    setSearchParams({ slotId: slotItem.id });
    loadActiveRoute({ slotId: slotItem.id }).catch(() => {});
  };

  // Start Trip Action
  const handleStartTrip = async (options = {}) => {
    if (!canManageDuty) return;
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
    if (!window.confirm('Are you sure you want to end this trip? This will record arrival at terminus and save to your completed trips log.')) {
      return;
    }

    setActionLoading(true);
    try {
      const rawSlotId = slot?.id || currentRoute?.slotId;
      const activeSlotId = Number.isInteger(Number(rawSlotId)) ? Number(rawSlotId) : undefined;
      await toast.promise(endTrip({ tripId: currentRoute?.id || currentRoute?.tripId, slotId: activeSlotId }), {
        loading: 'Completing voyage & logging final telemetry...',
        success: 'Trip completed successfully and archived to your log!',
        error: (err) => err?.message || 'Failed to complete trip',
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

  // Completed trips list
  const allTripsList = useMemo(() => {
    const raw = trips;
    return Array.isArray(raw) ? raw : (raw?.trips || raw?.rows || raw?.items || []);
  }, [trips]);

  const completedTrips = useMemo(() => {
    return allTripsList.filter((t) => (t.status || '').toLowerCase() === 'completed');
  }, [allTripsList]);

  const filteredCompletedTrips = useMemo(() => {
    if (!searchQuery.trim()) return completedTrips;
    const q = searchQuery.toLowerCase().trim();
    return completedTrips.filter((t) => {
      const bus = t.vehicle?.bus_number || '';
      const rName = t.route?.name || '';
      const code = t.code || `TRIP-${t.id}`;
      const origin = t.origin || '';
      const dest = t.destination || '';
      return (
        code.toLowerCase().includes(q) ||
        bus.toLowerCase().includes(q) ||
        rName.toLowerCase().includes(q) ||
        origin.toLowerCase().includes(q) ||
        dest.toLowerCase().includes(q)
      );
    });
  }, [completedTrips, searchQuery]);

  // Pagination for Completed Trips
  const totalItems = filteredCompletedTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompletedTrips.slice(start, start + pageSize);
  }, [filteredCompletedTrips, currentPage, pageSize]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Standard Top Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Driver', path: '/driver/dashboard' },
          { label: 'Assigned Routes & Trips' },
        ]}
        className="mb-2"
      />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{t('driver.routes.title')}</span>
            {isTripInProgress ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('driver.routes.live_in_transit')}</span>
              </span>
            ) : isTripCompleted ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
                <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t('driver.routes.shift_run_completed')}</span>
              </span>
            ) : null}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Manage live corridor runs, shift timetable slots, and trip completion history
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.routes.refresh_title')}
          />
          <Link
            to="/driver/schedule"
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <FleetIcons.Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('driver.routes.shift_timetable')} <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block ml-1" /></span>
          </Link>
        </div>
      </div>

      {/* 3. Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Speed className="w-4 h-4" />
          <span>{t('driver.routes.active_cockpit')}</span>
          {isTripInProgress && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
          {isTripCompleted && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FleetIcons.Check className="w-4 h-4" />
          <span>{t('driver.routes.completed_trips_log')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeTab === 'completed'
              ? 'bg-white/20 dark:bg-black/20 text-white dark:text-zinc-900'
              : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}>
            {completedTrips.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ACTIVE ROUTE & TRIP DISPATCH */}
      {activeTab === 'active' && (
        <div className="space-y-6">

          {/* SECTION A: TODAY'S ASSIGNED SHIFT TIMETABLE / MULTI-ROUTE SWITCHER */}
          {todaySlots.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('driver.routes.today')}'s Assigned Corridor Shifts ({todaySlots.length})
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Select a shift below to view corridor route or dispatch bus
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
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm ring-1 ring-blue-500/30'
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
                            <span>{t('driver.routes.live_in_transit')}</span>
                          </span>
                        ) : s.isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <FleetIcons.Check className="w-3 h-3 text-emerald-600" />
                            <span>{t('common.completed')}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Scheduled
                          </span>
                        )}
                      </div>

                      {/* Middle: Route & Bus Details */}
                      <div className="space-y-1">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {s.route_name || `${s.start_point} ➔ ${s.end_point}`}
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
                            : `${s.distance_km} km Corridor`}
                        </span>
                        <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                          {isSelected ? '● Active in Cockpit' : 'Select Shift →'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION B: MAIN HIGH-CONTRAST DRIVER COCKPIT CARD */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Cockpit Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <FleetIcons.Bus className="w-6 h-6" />
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
                        <span>Slot: {slot.slot_code}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">
                    {currentRoute?.routeName || slot?.route_name || route?.name || `${currentRoute?.origin || 'Depot'} ➔ ${currentRoute?.destination || 'Terminus'}`}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${shiftBadge.bg}`}>
                  {slot?.shift_type_label || shiftBadge.label}
                </span>

                {isTripInProgress ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t('driver.routes.in_transit_live')}</span>
                  </span>
                ) : isTripCompleted ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('driver.routes.completed_shift_ended')}</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{t('driver.routes.ready_scheduled')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Telemetry Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs text-center">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                  {isTripCompleted ? 'Trip Started At' : isTripInProgress ? 'Departure (Live)' : 'Slot Departure'}
                </span>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  {currentRoute?.started_at_formatted || slot?.formatted_start_time || '—'}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block mt-0.5">
                  {isTripCompleted ? 'Logged In Dispatch' : isTripInProgress ? 'Live In Transit' : `Window Start`}
                </span>
              </div>

              <div className="border-l border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                  {isTripCompleted ? 'Trip Ended At' : 'Arrival (Slot ETA)'}
                </span>
                <div className={`text-xs sm:text-sm font-black mt-0.5 font-mono ${isTripCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {isTripCompleted ? (currentRoute?.ended_at_formatted || '—') : (slot?.formatted_end_time || '—')}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                  {isTripCompleted ? `Duration: ${currentRoute?.duration || '—'}` : slot?.time_window ? `Window: ${slot.time_window}` : 'Timetable Arrival'}
                </span>
              </div>

              <div className="border-l border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                  Corridor Distance
                </span>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  {currentRoute?.totalDistance || (slot?.distance_km || route?.distance_km ? `${slot?.distance_km || route?.distance_km} km` : '—')}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium block mt-0.5">
                  {isTripCompleted ? 'Covered: 100% Complete' : (slot?.frequency || '—')}
                </span>
              </div>

              <div className="border-l border-slate-200 dark:border-zinc-700">
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                  Progress / Status
                </span>
                <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                  {isTripCompleted ? '100% (Completed)' : isTripInProgress ? `${currentRoute?.progress_percent || 25}%` : '0% (Ready)'}
                </div>
                <span className={`text-[10px] font-medium block mt-0.5 ${isTripCompleted ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isTripCompleted ? 'Shift Run Finished' : isTripInProgress ? 'Telemetry Active' : 'Ready to Dispatch'}
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
                          <span>{t('driver.routes.shift_completed_success')}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                            {currentRoute?.trip?.trip_code || `TRIP-${currentRoute?.id || 1}`}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                          Voyage has arrived at destination and is recorded in your dispatch history.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveTab('completed')}
                        className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <FleetIcons.Reports className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{t('driver.routes.view_completed_log')}</span>
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading || !canManageDuty}
                        title={!canManageDuty ? 'Duty-management permission is required' : undefined}
                        onClick={() => handleStartTrip({ forceNew: true })}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <FleetIcons.Speed className="w-3.5 h-3.5" />
                        <span>{t('driver.routes.start_additional_run')} <FleetIcons.Plus className="w-3.5 h-3.5 inline-block ml-1" /></span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900/30 text-xs text-center">
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">{t('driver.routes.started_at')}</span>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                        {currentRoute?.started_at_formatted || '—'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">{t('driver.routes.today')}</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-700">
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">{t('driver.routes.ended_at')}</span>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                        {currentRoute?.ended_at_formatted || '—'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">{t('driver.routes.today')}</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-700">
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">{t('driver.routes.voyage_duration')}</span>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {currentRoute?.duration || '—'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block">{t('driver.routes.total_run_time')}</span>
                    </div>
                    <div className="border-l border-slate-200 dark:border-zinc-700">
                      <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">{t('driver.routes.covered_distance')}</span>
                      <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
                        {currentRoute?.covered_km || (slot?.distance_km ? `${slot.distance_km} km` : '—')}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium block">{t('driver.routes.corridor_complete')}</span>
                    </div>
                  </div>
                </div>
              ) : isTripInProgress ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <div className="font-bold">{t('driver.routes.trip_in_progress')}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400">{t('driver.routes.gps_broadcasting')}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={actionLoading || !canManageDuty}
                    title={!canManageDuty ? 'Duty-management permission is required' : undefined}
                    onClick={handleEndTrip}
                    className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 hover:from-rose-700 hover:via-red-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>{t('driver.routes.completing_trip')}</span>
                      </>
                    ) : (
                      <>
                        <FleetIcons.Check className="w-4 h-4 text-white" />
                        <span>{t('driver.routes.end_trip_btn')}</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={actionLoading || !canManageDuty}
                  title={!canManageDuty ? 'Duty-management permission is required' : undefined}
                  onClick={() => handleStartTrip({})}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{t('driver.routes.starting_trip')}</span>
                    </>
                  ) : (
                    <>
                      <FleetIcons.Speed className="w-5 h-5 text-white" />
                      <span>{t('driver.routes.start_trip_btn')}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* SECTION C: 2-COLUMN ESSENTIAL OPERATIONAL VIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* COLUMN 1: LIVE WAYPOINT TRACKER (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <FleetIcons.Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{t('driver.routes.waypoints_stops')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    {stops.length} designated stations along the active transit line
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>{t('driver.routes.waypoint_telematics')}</span>
                </span>
              </div>

              {stops.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  No waypoints recorded for this route corridor.
                </p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
                  {stops.map((stop, idx) => (
                    <div key={stop.id || idx} className="relative flex items-center justify-between gap-4">
                      {/* Dot on timeline */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          stop.type === 'start'
                            ? 'bg-blue-600 border-blue-600 text-white'
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
                              Origin Depot
                            </span>
                          )}
                          {stop.type === 'end' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded">
                              Terminus
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                          ETA: {stop.eta || 'On Schedule'}
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
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
                    <FleetIcons.Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assigned Bus & Base Terminal
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Operational vehicle hardware & depot
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.bus_registration')}</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {currentRoute?.busNumber || slot?.bus_number || vehicle?.bus_number || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.vehicle_model')}</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {vehicle?.model || slot?.vehicle_model || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.power_battery')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {vehicle?.battery_level != null ? `EV Battery (${vehicle.battery_level}%)` : (slot?.battery_level != null ? `EV Battery (${slot.battery_level}%)` : '—')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.home_depot_base')}</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {depot?.name || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.operating_fleet')}</span>
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {fleet?.name || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 dark:text-zinc-500">{t('driver.routes.scheduled_timetable')}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {slot?.time_window || (slot?.formatted_start_time && slot?.formatted_end_time ? `${slot.formatted_start_time} - ${slot.formatted_end_time}` : '—')}
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
                    <span>{showTechDetails ? 'Hide Hardware & Display Specs ▲' : 'View Hardware & Display Specs ▼'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{t('driver.routes.technical_details')}</span>
                  </button>

                  {showTechDetails && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-[11px] border border-slate-100 dark:border-zinc-700/50 animate-in fade-in duration-150">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('driver.routes.vehicle_type')}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{vehicle?.vehicle_type || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('driver.routes.seating_capacity')}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{vehicle?.capacity ? `${vehicle.capacity} Seats` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('driver.routes.hardware_code')}</span>
                        <span className="font-mono text-slate-700 dark:text-zinc-300">{vehicle?.code || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('driver.routes.headway_frequency')}</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{slot?.frequency || '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: COMPLETED TRIPS LOG (Permanent Dispatch History) */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {/* Filter Bar with New Dedicated Section CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <div className="relative flex-1 max-w-md">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('driver.trips.search_ph')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Total Completed: <strong className="text-slate-900 dark:text-white font-bold">{completedTrips.length}</strong>
              </div>
              <Link
                to="/driver/trips"
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('driver.routes.full_trips_section')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block" />
              </Link>
            </div>
          </div>

          {/* Trips Table */}
          {completedTrips.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
              <FleetIcons.Clock className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.routes.no_completed_trips')}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                Trips you finish by tapping "End Trip" on your active route will appear here in your permanent dispatch history.
              </p>
            </div>
          ) : filteredCompletedTrips.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center shadow-sm text-xs text-slate-500">
              No completed trips matched your search.
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">{t('driver.trips.trip_code')}</th>
                      <th className="py-3.5 px-4">{t('driver.trips.bus_vehicle')}</th>
                      <th className="py-3.5 px-4">{t('driver.trips.corridor')}</th>
                      <th className="py-3.5 px-4">{t('driver.trips.timings')}</th>
                      <th className="py-3.5 px-4">{t('driver.trips.distance')}</th>
                      <th className="py-3.5 px-4 text-right">{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {paginatedTrips.map((trip) => {
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
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {tripCode}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {dateStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                              <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{busNum}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {trip.vehicle?.model || trip.vehicle?.plate_number || 'Transit Unit'}
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
                          <td className="py-3.5 px-4">
                            <span className="text-slate-800 dark:text-zinc-200 block font-bold text-xs">
                              {sTime} – {eTime}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                              Duration: {durationStr}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200 text-xs">
                            {trip.distance_km || trip.covered_km || '—'}{(trip.distance_km || trip.covered_km) ? ' KM' : ''}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                              <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                              <span>{t('common.completed')}</span>
                            </span>
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
                    totalItems={totalItems}
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
        </div>
      )}
    </div>
  );
};

export default DriverRoutesPage;

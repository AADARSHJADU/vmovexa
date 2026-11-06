import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { Pagination } from '../../components/ui/Pagination';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverSchedulePage = () => {
  const { t } = useTranslation();
  const { schedule, loadSchedule } = useDriverApp();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'morning' | 'evening' | 'night'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'scheduled' | 'in_progress' | 'completed'

  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Selected Shift for Details Modal
  const [selectedShift, setSelectedShift] = useState(null);

  // Debounce search input
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 300);
  };

  const fetchScheduleData = async () => {
    try {
      await loadSchedule({
        page: currentPage,
        limit: pageSize,
        tab: activeTab === 'all' ? undefined : activeTab,
        search: debouncedSearch.trim() || undefined,
        shift_type: shiftFilter !== 'ALL' ? shiftFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
    } catch {
      // handled
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchScheduleData().finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize, activeTab, debouncedSearch, shiftFilter, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchScheduleData();
    } finally {
      setRefreshing(false);
    }
  };

  // Extract raw schedules & metadata from Redux store
  const scheduleData = schedule;
  const scheduleList = useMemo(() => {
    const raw = scheduleData;
    return Array.isArray(raw)
      ? raw
      : (raw?.schedules || raw?.items || raw?.rows || []);
  }, [scheduleData]);

  const meta = scheduleData?.meta || null;
  const totalCount = scheduleData?.total ?? meta?.total ?? scheduleList.length;
  const totalPages = meta?.totalPages ?? Math.ceil(totalCount / pageSize) ?? 1;
  const todayCount = scheduleData?.todayCount ?? scheduleList.filter((s) => s.isToday).length;
  const upcomingCount = scheduleData?.upcomingCount ?? scheduleList.filter((s) => !s.isToday).length;

  const renderTrip = (trip) => {
    const isCompleted = trip.isCompleted || (trip.status || '').toLowerCase() === 'completed';
    const isInTransit = (trip.status || '').toLowerCase() === 'in transit' || (trip.status || '').toLowerCase() === 'in_progress';

    return (
      <div
        key={trip.id}
        className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
          isCompleted
            ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/15 dark:bg-emerald-950/10'
            : isInTransit
            ? 'border-[#1C68FD]/60 dark:border-[#DA29F4]/60 shadow-md ring-2 ring-[#1C68FD]/20'
            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        {/* Top Shift Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              {trip.route_number || trip.routeNumber || '—'}
            </span>
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
              {trip.bus_number || '—'}
            </span>
            {trip.slot_code && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <FleetIcons.Clock className="w-3 h-3" />
                <span>{t('ag.driver.driverschedulepage.slot', 'Slot:')} {trip.slot_code}</span>
              </span>
            )}
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              · {trip.date || 'Today'}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {trip.shift_type_label && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {trip.shift_type_label}
              </span>
            )}
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 shadow-sm ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : isInTransit
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}
            >
              {isCompleted ? (
                <>
                  <FleetIcons.Check className="w-3 h-3 text-emerald-600" />
                  <span>{t('common.completed', 'Completed')}</span>
                </>
              ) : isInTransit ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('driver.routes.live_in_transit', 'Live in Transit')}</span>
                </>
              ) : (
                <span>{t('driver.routes.ready_scheduled', 'Scheduled / Ready')}</span>
              )}
            </span>
          </div>
        </div>

        {/* Route Details & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {trip.trip_label || trip.tripLabel || `${trip.start_depot || 'Depot'} ➔ ${trip.end_depot || 'Terminus'}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {trip.start_depot ?? '—'} → {trip.end_depot ?? '—'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {/* View Details Button */}
            <button
              type="button"
              onClick={() => setSelectedShift(trip)}
              className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 cursor-pointer active:scale-[0.98]"
            >
              <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('ag.driver.driverschedulepage.view_details', 'View Details')}</span>
            </button>

            {/* Direct Dispatch / Cockpit Button */}
            <Link
              to={`/driver/routes?slotId=${trip.slot_id || trip.slotId || ''}`}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-[0.98] ${
                isCompleted
                  ? 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-sm'
                  : isInTransit
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                  : 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35'
              }`}
            >
              <FleetIcons.Speed className="w-3.5 h-3.5" />
              <span>
                {isCompleted
                  ? t('ag.driver.driverschedulepage.view_shift_summary', 'View Shift Summary →')
                  : isInTransit
                  ? t('ag.driver.driverschedulepage.open_live_cockpit', 'Open Live Cockpit →')
                  : t('ag.driver.driverschedulepage.dispatch_this_route', 'Dispatch This Route →')}
              </span>
            </Link>
          </div>
        </div>

        {/* 4-Item Telemetry Matrix */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              {isCompleted ? t('ag.driver.driverschedulepage.shift_run_times', 'Shift Run Times') : t('ag.driver.driverschedulepage.timetable_shift', 'Timetable Shift')}
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
              {(trip.startTime ?? trip.shift_start ?? '—')} – {(trip.endTime ?? trip.shift_end ?? '—')}
            </div>
            {isCompleted && trip.duration && trip.duration !== '—' && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                {t('ag.driver.driverschedulepage.duration', 'Duration:')} {trip.duration}
              </span>
            )}
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              {t('ag.driver.driverschedulepage.corridor_distance', 'Corridor Distance')}
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
              {trip.distance ?? (trip.distance_km ? `${trip.distance_km} km` : '—')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {isCompleted ? t('ag.driver.driverschedulepage.100_complete', '100% Complete') : t('ag.driver.driverschedulepage.standard_corridor', 'Standard Corridor')}
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              {t('ag.driver.driverschedulepage.headway_frequency', 'Headway Frequency')}
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{trip.frequency || '—'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {t('ag.driver.driverschedulepage.scheduled_frequency', 'Scheduled Frequency')}
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              {t('ag.driver.driverschedulepage.vehicle_assigned', 'Vehicle Assigned')}
            </span>
            <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
              {trip.bus_number || '—'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {t('ag.driver.driverschedulepage.commercial_transit', 'Commercial Transit')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const emptyState = (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD]/10 to-[#DA29F4]/10 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
        <FleetIcons.Clock className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {t('driver.schedule.no_scheduled_shifts', 'No Scheduled Shifts')}
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">
          {searchQuery
            ? `No shifts matched your search query "${searchQuery}".`
            : t('driver.dashboard.no_trip_scheduled', 'You currently do not have any timetable slots assigned for this filter.')}
        </p>
      </div>
      {searchQuery ? (
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setDebouncedSearch('');
            setShiftFilter('ALL');
            setStatusFilter('ALL');
          }}
          className="text-xs font-bold text-[#1C68FD] hover:underline cursor-pointer"
        >
          {t('ag.driver.driverschedulepage.clear_all_filters', 'Clear All Filters')}
        </button>
      ) : (
        <Link
          to="/driver/routes"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all active:scale-[0.98]"
        >
          <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
          <span>{t('ag.driver.driverschedulepage.check_active_corridor', 'Check Active Corridor')}</span>
        </Link>
      )}
    </div>
  );

  // Loading skeleton screen
  if (loading && scheduleList.length === 0) {
    return (
      <div className="w-full space-y-6 animate-pulse p-1 pb-16">
        <div className="h-4 w-44 bg-slate-200 dark:bg-zinc-800 rounded-lg" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-100 dark:bg-zinc-800/60 rounded-lg" />
          </div>
          <div className="h-10 w-44 bg-slate-200 dark:bg-zinc-800 rounded-xl" />
        </div>
        <div className="h-12 w-full bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Header with Breadcrumb & Refresh Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: t('ag.driver.driverschedulepage.driver', 'Driver'), path: '/driver/dashboard' },
              { label: t('ag.driver.driverschedulepage.shift_schedule', 'Shift Schedule') },
            ]}
            className="mb-2"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('driver.schedule.title', 'Shift Schedule & Timetable')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {t('ag.driver.driverschedulepage.view_your_daily_assigned_shifts_vehicle_slot', 'View your daily assigned shifts, vehicle slot timetables, and weekly duty itineraries')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.schedule.refresh_title', 'Refresh schedule timetable')}
          />
          <Link
            to="/driver/routes"
            className="px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
            <span>{t('driver.schedule.view_active_cockpit', 'Active Corridor Cockpit')}</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block ml-0.5 text-white" />
          </Link>
        </div>
      </div>

      {/* 2. Tab Switcher, Filter Dropdowns & Real-Time Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tab Switcher with Signature Brand Gradient */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl self-start flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('today');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.driverschedulepage.today_s_shifts', 'Today\'s Shifts (')}{todayCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('upcoming');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.driverschedulepage.upcoming_week_duty', 'Upcoming Week Duty (')}{upcomingCount})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-md shadow-[#1C68FD]/25'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.driverschedulepage.all_shifts', 'All Shifts')}
            </button>
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            {/* Shift Type Filter */}
            <select
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#1C68FD]"
            >
              <option value="ALL">{t('ag.driver.driverschedulepage.all_shift_types', 'All Shift Types')}</option>
              <option value="morning">{t('ag.driver.driverschedulepage.morning_peak', 'Morning Peak')}</option>
              <option value="evening">{t('ag.driver.driverschedulepage.evening_peak', 'Evening Peak')}</option>
              <option value="night">{t('ag.driver.driverschedulepage.night_shuttle', 'Night Shuttle')}</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#1C68FD]"
            >
              <option value="ALL">{t('ag.driver.driverschedulepage.all_statuses', 'All Statuses')}</option>
              <option value="scheduled">{t('ag.driver.driverschedulepage.scheduled_ready', 'Scheduled / Ready')}</option>
              <option value="in_progress">{t('ag.driver.driverschedulepage.in_transit', 'In Transit')}</option>
              <option value="completed">{t('ag.driver.driverschedulepage.completed', 'Completed')}</option>
            </select>

            <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full font-mono">
              {totalCount} {t('ag.driver.driverschedulepage.shifts', 'Shifts')}
            </span>
          </div>
        </div>

        {/* Dynamic Search Input for Roster */}
        <div className="relative w-full">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('ag.driver.driverschedulepage.search_by_route_code_slot_id_destination_dep', 'Search by route code, slot ID, destination depot, or bus registration...')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1C68FD] transition-all font-medium"
          />
        </div>
      </div>

      {/* 3. Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {activeTab === 'today' ? t('ag.driver.driverschedulepage.today_s_active_roster', 'Today\'s Active Roster') : activeTab === 'upcoming' ? t('ag.driver.driverschedulepage.upcoming_week_duty_roster', 'Upcoming Week Duty Roster') : t('ag.driver.driverschedulepage.complete_shift_roster', 'Complete Shift Roster')}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {activeTab === 'today' ? t('ag.driver.driverschedulepage.assigned_shifts_timetable_runs', 'Assigned Shifts & Timetable Runs') : activeTab === 'upcoming' ? t('ag.driver.driverschedulepage.7_day_dispatch_itinerary', '7-Day Dispatch Itinerary') : t('ag.driver.driverschedulepage.all_timetable_shifts', 'All Timetable Shifts')}
          </h2>
        </div>
      </div>

      {/* 4. Schedule List */}
      {scheduleList.length === 0 ? (
        emptyState
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {scheduleList.map(renderTrip)}

          {/* Dynamic Pagination Component */}
          {totalPages > 1 && (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalCount}
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

      {/* 5. View Details Modal */}
      {selectedShift && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedShift(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-hidden min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C68FD] to-[#DA29F4] text-white flex items-center justify-center shadow-md shadow-[#1C68FD]/25">
                  <FleetIcons.Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    {selectedShift.slot_code || selectedShift.route_number || 'SHIFT'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {t('ag.driver.driverschedulepage.timetable_slot_and_corridor_specifications', 'Timetable Slot & Corridor Specifications')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('ag.driver.driverschedulepage.corridor_route', 'Corridor Route')}
                </span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {selectedShift.trip_label || selectedShift.tripLabel || selectedShift.route_number || '—'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {selectedShift.start_depot || 'Depot'} ➔ {selectedShift.end_depot || 'Terminus'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('ag.driver.driverschedulepage.shift_timing_window', 'Shift Timing Window')}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {(selectedShift.startTime ?? selectedShift.shift_start ?? '—')} – {(selectedShift.endTime ?? selectedShift.shift_end ?? '—')}
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    {selectedShift.shift_type_label || 'Regular Shift'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('ag.driver.driverschedulepage.assigned_bus', 'Assigned Bus')}
                  </span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{selectedShift.bus_number || '—'}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{t('ag.driver.driverschedulepage.commercial_transit', 'Commercial Transit')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('ag.driver.driverschedulepage.corridor_distance', 'Corridor Distance')}
                  </span>
                  <div className="font-black text-slate-900 dark:text-white font-mono">
                    {selectedShift.distance ?? (selectedShift.distance_km ? `${selectedShift.distance_km} km` : '—')}
                  </div>
                  <p className="text-[10px] text-slate-400">{t('ag.driver.driverschedulepage.standard_transit_line', 'Standard Transit Line')}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {t('ag.driver.driverschedulepage.headway_frequency', 'Headway Frequency')}
                  </span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedShift.frequency || 'Regular'}
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('ag.driver.driverschedulepage.scheduled_punctuality', 'Scheduled Punctuality')}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('ag.driver.driverschedulepage.duty_date', 'Duty Date')}</span>
                  <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{selectedShift.date || 'Today'}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold text-right">{t('ag.driver.driverschedulepage.status', 'Status')}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    {selectedShift.status || 'Scheduled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedShift(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t('ag.driver.driverschedulepage.close', 'Close')}
              </button>
              <Link
                to={`/driver/routes?slotId=${selectedShift.slot_id || selectedShift.slotId || ''}`}
                className="px-5 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all flex items-center gap-1.5 active:scale-[0.98]"
              >
                <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
                <span>{t('ag.driver.driverschedulepage.open_in_cockpit', 'Open in Cockpit →')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 6. Advisory Box */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
        <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>{t('driver.schedule.timings_governed_desc', 'Timings are governed by transit operating licenses. Report on duty 15 minutes before slot start.')}</span>
      </div>
    </div>
  );
};

export default DriverSchedulePage;

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { Pagination } from '../../components/ui/Pagination';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import { useAuth } from '../../hooks/useAuth';

export const DriverTripsPage = () => {
  const { t } = useTranslation();
  const { user, hasPermission } = useAuth();

  // Role fallback: authenticated drivers should not be blocked by delayed permission hydration
  const isDriverRole = (user?.role?.code || user?.role || '').toLowerCase().includes('driver') || (user?.role?.code || '').includes('ROLE-DRIVER');
  const canView = hasPermission('drivers.portal.view') || isDriverRole;

  const {
    trips = [],
    loadTrips,
    profile,
    loadProfile,
  } = useDriverApp();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all' | 'today' | 'week'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Debounce search
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setCurrentPage(1);
    }, 300);
  };

  const fetchTripsData = async () => {
    try {
      await Promise.allSettled([
        loadTrips({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch.trim() || undefined,
          period: timeFilter !== 'all' ? timeFilter : undefined,
          status: 'completed',
        }),
        loadProfile(),
      ]);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (canView) {
      setLoading(true);
      fetchTripsData().finally(() => {
        if (isMounted) setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [canView, currentPage, pageSize, debouncedSearch, timeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTripsData();
    } finally {
      setRefreshing(false);
    }
  };

  // Extract completed trips & pagination metadata
  const tripsData = trips;
  const allTripsList = useMemo(() => {
    const raw = tripsData;
    return Array.isArray(raw) ? raw : (raw?.rows || raw?.trips || raw?.items || []);
  }, [tripsData]);

  const meta = tripsData?.meta || null;
  const totalCompleted = meta?.total ?? allTripsList.length;
  const totalPages = meta?.totalPages ?? (Math.ceil(totalCompleted / pageSize) || 1);

  // Metrics (computed on current dataset)
  const totalDistance = useMemo(() => {
    const sum = allTripsList.reduce((acc, t) => {
      const dist = parseFloat(t.distance_km || t.covered_km) || 0;
      return acc + dist;
    }, 0);
    return sum.toFixed(2);
  }, [allTripsList]);

  const totalMinutes = useMemo(() => {
    return allTripsList.reduce((acc, t) => {
      if (!t.started_at || !t.ended_at) return acc;
      const s = new Date(t.started_at).getTime();
      const e = new Date(t.ended_at).getTime();
      if (isNaN(s) || isNaN(e) || e <= s) return acc;
      return acc + Math.round((e - s) / (1000 * 60));
    }, 0);
  }, [allTripsList]);

  const totalHoursStr = useMemo(() => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [totalMinutes]);

  const formatTripDuration = (startedAt, endedAt) => {
    if (!startedAt || !endedAt) return 'Quick Run';
    const s = new Date(startedAt).getTime();
    const e = new Date(endedAt).getTime();
    if (isNaN(s) || isNaN(e) || e <= s) return '< 1 min';
    const diffMins = Math.round((e - s) / (1000 * 60));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} mins`;
  };

  // 1. Permission Locked State
  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_restricted')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          {t('ag.driver.drivertripspage.you_do_not_have_permission_to_view_completed', 'You do not have permission to view completed trip logs. Please contact your fleet operator.')}
        </p>
        <Link
          to="/driver/dashboard"
          className="inline-block px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25"
        >
          {t('ag.driver.drivertripspage.back_to_dashboard', 'Back to Dashboard')}
        </Link>
      </div>
    );
  }

  // 2. Loading Skeleton Screen
  if (loading && allTripsList.length === 0) {
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
          ))}
        </div>
        <div className="h-12 w-full bg-slate-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-64 w-full bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 min-w-0 max-w-full">
      {/* 1. Standard Top Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('ag.driver.drivertripspage.driver', 'Driver'), path: '/driver/dashboard' },
          { label: t('ag.driver.drivertripspage.completed_trips_log', 'Completed Trips Log') },
        ]}
        className="mb-2"
      />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{t('driver.trips.title', 'Completed Trips Log')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5 shadow-sm">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalCompleted} {t('ag.driver.drivertripspage.completed', 'Completed')}</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('ag.driver.drivertripspage.historical_corridor_voyages_distance_telemat', 'Historical corridor voyages, distance telematics, route completion records, and on-time performance')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.trips.refresh', 'Refresh trip logs')}
          />
          <Link
            to="/driver/routes"
            className="px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
            <span>{t('driver.trips.active_cockpit', 'Active Corridor Cockpit')}</span>
            <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block ml-0.5 text-white" />
          </Link>
        </div>
      </div>

      {/* 3. 4-KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {t('ag.driver.drivertripspage.completed_trips', 'Completed Trips')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalCompleted}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500 inline-block shrink-0" />
            <span>{t('driver.trips.verified_telemetry', 'Verified Telemetry Log')}</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t('ag.driver.drivertripspage.total_distance', 'Total Distance')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Route className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalDistance} <span className="text-xs font-bold text-slate-400">{t('driver.trips.km', 'km')}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {t('ag.driver.drivertripspage.accumulated_transit_corridor_km', 'Accumulated transit corridor km')}
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {t('ag.driver.drivertripspage.road_duration', 'Road Duration')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FleetIcons.Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalHoursStr}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            {t('ag.driver.drivertripspage.total_voyage_run_time', 'Total voyage run time')}
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {t('ag.driver.drivertripspage.driver_status', 'Driver Status')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FleetIcons.Profile className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white capitalize truncate">
            {profile?.status ? String(profile.status).replace('_', ' ') : t('ag.driver.drivertripspage.active_duty', 'Active Duty')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
            {profile?.name || user?.name || '—'}
          </p>
        </div>
      </div>

      {/* 4. Filter Tabs & Search Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quick Period Filter Tabs (passed dynamically to API) */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 rounded-xl self-start">
            <button
              type="button"
              onClick={() => {
                setTimeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.drivertripspage.all_time', 'All Time')}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeFilter('today');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'today'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.drivertripspage.today', 'Today')}
            </button>
            <button
              type="button"
              onClick={() => {
                setTimeFilter('week');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeFilter === 'week'
                  ? 'bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('ag.driver.drivertripspage.past_7_days', 'Past 7 Days')}
            </button>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {t('ag.driver.drivertripspage.showing_page', 'Showing Page')} <strong className="text-slate-900 dark:text-white font-bold">{currentPage}</strong> {t('ag.driver.drivertripspage.of', 'of')} {totalPages} ({totalCompleted} {t('ag.driver.drivertripspage.total', 'Total)')}
            </span>
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableTitle={t('ag.driver.drivertripspage.table_view', 'Table View')}
              cardTitle={t('ag.driver.drivertripspage.grid_view', 'Grid View')}
            />
          </div>
        </div>

        {/* Dynamic Search Input */}
        <div className="relative w-full">
          <FleetIcons.Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('driver.trips.search_ph', 'Search by trip code, bus number, or route corridor...')}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1C68FD] transition-all font-medium"
          />
        </div>
      </div>

      {/* 5. Trips Content Area */}
      {allTripsList.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1C68FD]/10 to-[#DA29F4]/10 text-blue-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-sm">
            <FleetIcons.Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.trips.no_trips_found', 'No Completed Trips Yet')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? `No completed trips matched your search "${searchQuery}".`
              : t('ag.driver.drivertripspage.trips_you_finish_by_tapping_end_trip', 'Trips you finish by tapping "End Trip" on your active corridor route will automatically be archived here in your permanent dispatch history.')}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
                setTimeFilter('all');
              }}
              className="text-xs font-bold text-[#1C68FD] hover:underline cursor-pointer"
            >
              {t('ag.driver.drivertripspage.clear_search', 'Clear Search')}
            </button>
          ) : (
            <Link
              to="/driver/routes"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 hover:shadow-[#DA29F4]/35 transition-all mt-2 active:scale-[0.98]"
            >
              <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
              <span>{t('driver.trips.goto_routes', 'Go to Active Corridor')}</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">{t('driver.trips.trip_code', 'Trip Code')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('driver.trips.bus_vehicle', 'Bus Unit')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('driver.trips.corridor', 'Corridor Route')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('driver.trips.timings', 'Timings & Duration')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('driver.trips.distance', 'Distance')}</th>
                  <th className="py-3 px-4 whitespace-nowrap">{t('common.status', 'Status')}</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">{t('common.actions', 'Actions')}</th>
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
                  const durationStr = formatTripDuration(trip.started_at, trip.ended_at);

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
                          {t('ag.driver.drivertripspage.duration', 'Duration:')} {durationStr}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-zinc-200 text-xs font-mono whitespace-nowrap">
                        {trip.distance_km || trip.covered_km || '—'}{(trip.distance_km || trip.covered_km) ? t('ag.driver.drivertripspage.km', 'KM') : ''}
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
                          onClick={() => setSelectedTrip(trip)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-slate-200 dark:border-zinc-700 active:scale-[0.98]"
                        >
                          <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{t('common.details', 'Summary')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Dynamic Pagination Footer */}
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
      ) : (
        /* GRID / CARD VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              const durationStr = formatTripDuration(trip.started_at, trip.ended_at);

              return (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block font-mono">
                          {tripCode}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {dateStr}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
                        <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                        <span>{t('common.completed', 'Completed')}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-mono">{busNum}</span>
                        <span className="text-[11px] font-normal text-slate-400">({trip.vehicle?.model || '—'})</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate" title={rName}>
                          {rName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <span className="truncate">{trip.origin || 'Depot'}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400 inline-block shrink-0" />
                          <span className="truncate">{trip.destination || 'Terminus'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('driver.trips.timing', 'Timing')}</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] block mt-0.5 font-mono">
                          {sTime} – {eTime}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                          {durationStr}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('driver.trips.distance', 'Distance')}</span>
                        <span className="font-black text-slate-900 dark:text-white text-xs block mt-0.5 font-mono">
                          {trip.distance_km || trip.covered_km || '—'}{(trip.distance_km || trip.covered_km) ? t('ag.driver.drivertripspage.km', 'KM') : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {t('ag.driver.drivertripspage.telematics_logged', 'Telematics Logged')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTrip(trip)}
                    className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 active:scale-[0.98]"
                  >
                    <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t('driver.trips.view_summary', 'View Voyage Summary')}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dynamic Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
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

      {/* 6. Trip Details Modal */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedTrip(null)}
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
                    {selectedTrip.code || `TRIP-${String(selectedTrip.id).padStart(4, '0')}`}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {t('ag.driver.drivertripspage.completed_transit_voyage_summary', 'Completed Transit Voyage Summary')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                title={t('common.close', 'Close')}
              >
                <FleetIcons.Close className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.corridor', 'Corridor Route')}</span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {selectedTrip.route?.name || '—'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {selectedTrip.origin || 'Depot'} ➔ {selectedTrip.destination || 'Terminus'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.vehicle_bus', 'Bus Vehicle')}</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                    <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{selectedTrip.vehicle?.bus_number || `Bus #${selectedTrip.vehicle_id || '—'}`}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{selectedTrip.vehicle?.model || '—'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.distance_covered', 'Distance Covered')}</span>
                  <div className="font-black text-slate-900 dark:text-white font-mono">
                    {selectedTrip.distance_km || selectedTrip.covered_km || '—'}{(selectedTrip.distance_km || selectedTrip.covered_km) ? t('ag.driver.drivertripspage.km', 'KM') : ''}
                  </div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t('driver.trips.recorded_gps', 'Recorded via Telematics')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.departure_time', 'Departure')}</span>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {selectedTrip.started_at ? new Date(selectedTrip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {selectedTrip.started_at ? new Date(selectedTrip.started_at).toLocaleDateString() : '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.arrival_time', 'Arrival')}</span>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {selectedTrip.ended_at ? new Date(selectedTrip.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {selectedTrip.ended_at ? new Date(selectedTrip.ended_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FleetIcons.Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    {t('ag.driver.drivertripspage.total_elapsed_run_time', 'Total Elapsed Run Time:')}
                  </span>
                </div>
                <span className="font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatTripDuration(selectedTrip.started_at, selectedTrip.ended_at)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1C68FD] to-[#DA29F4] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-[#1C68FD]/25 transition-all cursor-pointer active:scale-[0.98]"
              >
                {t('ag.driver.drivertripspage.close_summary', 'Close Summary')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTripsPage;

import { useState, useEffect, useMemo } from 'react';
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
  const { hasPermission } = useAuth();
  const canView = hasPermission('drivers.portal.view');

  const {
    trips = [],
    loadTrips,
    profile,
    loadProfile,
  } = useDriverApp();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'card'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([loadTrips(), loadProfile()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (canView) {
      loadTrips().catch(() => {});
      loadProfile().catch(() => {});
    }
  }, [canView, loadTrips, loadProfile]);

  // Extract completed trips
  const allTripsList = useMemo(() => {
    const raw = trips;
    return Array.isArray(raw) ? raw : (raw?.trips || raw?.rows || raw?.items || []);
  }, [trips]);

  const completedTrips = useMemo(() => {
    return allTripsList.filter((t) => (t.status || '').toLowerCase() === 'completed');
  }, [allTripsList]);

  // Metrics
  const totalCompleted = completedTrips.length;
  const totalDistance = useMemo(() => {
    const sum = completedTrips.reduce((acc, t) => {
      const dist = parseFloat(t.distance_km || t.covered_km) || 0;
      return acc + dist;
    }, 0);
    return sum.toFixed(2);
  }, [completedTrips]);

  const totalMinutes = useMemo(() => {
    return completedTrips.reduce((acc, t) => {
      if (!t.started_at || !t.ended_at) return acc;
      const s = new Date(t.started_at).getTime();
      const e = new Date(t.ended_at).getTime();
      if (isNaN(s) || isNaN(e) || e <= s) return acc;
      return acc + Math.round((e - s) / (1000 * 60));
    }, 0);
  }, [completedTrips]);

  const totalHoursStr = useMemo(() => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [totalMinutes]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
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

  // Pagination
  const totalItems = filteredTrips.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrips.slice(start, start + pageSize);
  }, [filteredTrips, currentPage, pageSize]);

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

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
          <FleetIcons.Key className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_restricted')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          You do not have permission to view completed trip logs. Please contact your fleet operator.
        </p>
        <Link
          to="/driver/dashboard"
          className="inline-block px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 min-w-0 max-w-full">
      {/* 1. Standard Top Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Driver', path: '/driver/dashboard' },
          { label: 'Completed Trips Log' },
        ]}
        className="mb-2"
      />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>{t('driver.trips.title')}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5">
              <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{totalCompleted} Completed</span>
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Historical corridor voyages, distance telematics, route completion records, and on-time performance
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title={t('driver.trips.refresh')}
          />
          <Link
            to="/driver/routes"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <FleetIcons.Speed className="w-3.5 h-3.5 text-white" />
            <span>{t('driver.trips.active_cockpit')} <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block ml-1" /></span>
          </Link>
        </div>
      </div>

      {/* 3. 4-KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Completed Trips
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FleetIcons.Check className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalCompleted}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span><FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500 inline-block mr-1" />{t('driver.trips.verified_telemetry')}</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Total Distance
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FleetIcons.Route className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalDistance} <span className="text-xs font-bold text-slate-400">{t('driver.trips.km')}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Accumulated transit miles
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Road Duration
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FleetIcons.Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalHoursStr}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Active steering duration
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Driver Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FleetIcons.Profile className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white capitalize truncate">
            {profile?.status ? profile.status.replace('_', ' ') : 'Active Duty'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium truncate">
            {profile?.name || '—'}
          </p>
        </div>
      </div>

      {/* 4. Search & Controls Bar */}
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
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredTrips.length}</strong> of {totalCompleted}
          </span>
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            tableTitle="Table View"
            cardTitle="Grid View"
          />
        </div>
      </div>

      {/* 5. Trips Content Area */}
      {completedTrips.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
            <FleetIcons.Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.trips.no_trips_found')}</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Trips you finish by tapping "End Trip" on your active corridor route will automatically be archived here.
          </p>
          <Link
            to="/driver/routes"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all mt-2"
          >
            <FleetIcons.Speed className="w-3.5 h-3.5" />
            <span>{t('driver.trips.goto_routes')}</span>
          </Link>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center shadow-sm text-xs text-slate-500">
          No completed trips matched your search query "{searchQuery}".
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('driver.trips.trip_code')}</th>
                  <th className="py-3 px-4">{t('driver.trips.bus_vehicle')}</th>
                  <th className="py-3 px-4">{t('driver.trips.corridor')}</th>
                  <th className="py-3 px-4">{t('driver.trips.timings')}</th>
                  <th className="py-3 px-4">{t('driver.trips.distance')}</th>
                  <th className="py-3 px-4">{t('common.status')}</th>
                  <th className="py-3 px-4 text-right">{t('common.actions')}</th>
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
                  const durationStr = formatTripDuration(trip.started_at, trip.ended_at);

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
                          {trip.origin || 'Origin Depot'} ➔ {trip.destination || 'Terminus'}
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
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                          <span>{t('common.completed')}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTrip(trip)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <FleetIcons.Eye className="w-3 h-3 text-slate-500" />
                          <span>{t('common.details')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
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
      ) : (
        /* GRID / CARD VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              const durationStr = formatTripDuration(trip.started_at, trip.ended_at);

              return (
                <div
                  key={trip.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {tripCode}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {dateStr}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <FleetIcons.Check className="w-3 h-3 text-emerald-500" />
                        <span>{t('common.completed')}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <FleetIcons.Bus className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{busNum}</span>
                        <span className="text-[11px] font-normal text-slate-400">({trip.vehicle?.model || 'Transit Bus'})</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate" title={rName}>
                          {rName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <span className="truncate">{trip.origin || 'Depot'}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400 inline-block" />
                          <span className="truncate">{trip.destination || 'Terminus'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('driver.trips.timing')}</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] block mt-0.5">
                          {sTime} – {eTime}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                          {durationStr}
                        </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('driver.trips.distance')}</span>
                        <span className="font-black text-slate-900 dark:text-white text-xs block mt-0.5">
                          {trip.distance_km || trip.covered_km || '—'}{(trip.distance_km || trip.covered_km) ? ' KM' : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Telematics GPS
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTrip(trip)}
                    className="w-full py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FleetIcons.Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('driver.trips.view_summary')}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
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

      {/* 6. Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-hidden min-w-0">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FleetIcons.Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {selectedTrip.code || `TRIP-${String(selectedTrip.id).padStart(4, '0')}`}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Completed Transit Voyage Summary
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedTrip(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer" title={t('common.close')}><FleetIcons.Cross className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.corridor')}</span>
                <p className="font-black text-slate-900 dark:text-white text-sm">
                  {selectedTrip.route?.name || '—'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {selectedTrip.origin || 'Depot'} ➔ {selectedTrip.destination || 'Terminus'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.vehicle_bus')}</span>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FleetIcons.Bus className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedTrip.vehicle?.bus_number || `Bus #${selectedTrip.vehicle_id || '—'}`}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{selectedTrip.vehicle?.model || 'Transit Bus'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.distance_covered')}</span>
                  <div className="font-black text-slate-900 dark:text-white">
                    {selectedTrip.distance_km || selectedTrip.covered_km || '—'}{(selectedTrip.distance_km || selectedTrip.covered_km) ? ' KM' : ''}
                  </div>
                  <p className="text-[10px] text-emerald-600 font-medium">{t('driver.trips.recorded_gps')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.departure_time')}</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedTrip.started_at ? new Date(selectedTrip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {selectedTrip.started_at ? new Date(selectedTrip.started_at).toLocaleDateString() : '—'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t('driver.trips.arrival_time')}</span>
                  <div className="font-bold text-slate-900 dark:text-white">
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
                    Total Elapsed Time:
                  </span>
                </div>
                <span className="font-black text-emerald-700 dark:text-emerald-400">
                  {formatTripDuration(selectedTrip.started_at, selectedTrip.ended_at)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTripsPage;

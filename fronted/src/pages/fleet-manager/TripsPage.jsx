/* eslint-disable react-hooks/exhaustive-deps -- filters/page are the intended list reload triggers */
import { useState, useEffect, useTransition } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { useFleetTrip } from '../../hooks/fleet/useFleetTrip';
import { useAuth } from '../../hooks/useAuth';

export const TripsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canView = hasPermission('fleet.trips.view');
  const { trips = [], pagination = {}, status, loadTrips } = useFleetTrip();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, in_progress, completed, scheduled
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [, startTransition] = useTransition();

  const fetchCurrentTrips = () => {
    if (!canView) return;
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (search.trim()) params.search = search.trim();
    if (activeTab !== 'All') params.status = activeTab;

    startTransition(() => {
      loadTrips(params).catch(() => {});
    });
  };

  useEffect(() => {
    fetchCurrentTrips();
  }, [currentPage, pageSize, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCurrentTrips();
  };

  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || trips.length;

  const inProgressCount = trips.filter(t => t.status === 'in_progress').length;
  const completedCount = trips.filter(t => t.status === 'completed').length;
  const scheduledCount = trips.filter(t => t.status === 'scheduled').length;

  if (!canView) {
    return (
      <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
        <div className="flex justify-center">
          <FleetIcons.Lock className="w-12 h-12 text-slate-400 dark:text-zinc-600" />
        </div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('common.access_revoked')}</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">
          Your administrator has revoked your permission to view trips and dispatch.
        </p>
        <Link
          to="/fleet-operator/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-xl"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back_to_dashboard')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Global Standard Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
          { label: 'Trips & Route Logs' },
        ]}
        className="mb-2"
      />

      {/* Header Banner */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{t('fleet.trips.trips_dispatch_title')}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              {totalItems} Recorded
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Live voyage telematics, origin-to-destination corridors, stops completed, and speed logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <RefreshButton onClick={fetchCurrentTrips} loading={status === 'loading'} />
          <button
            type="button"
            onClick={() => navigate('/fleet-operator/tracking')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>{t('fleet.trips.live_radar')}</span>
          </button>
        </div>
      </div>

      {/* 2. Top KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <FleetIcons.Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('fleet.trips.total_active')}</div>
            <div className="font-black text-xl text-slate-900 dark:text-white mt-0.5">{totalItems} Trips</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.trips.assigned_tracked')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <FleetIcons.Speed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('fleet.trips.in_progress')}</div>
            <div className="font-black text-xl text-emerald-600 dark:text-emerald-400 mt-0.5">{inProgressCount} Moving</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.trips.live_gnss')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <FleetIcons.Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('fleet.trips.completed')}</div>
            <div className="font-black text-xl text-blue-600 dark:text-blue-400 mt-0.5">{completedCount} Logged</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.trips.verified_log')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <FleetIcons.Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{t('fleet.trips.scheduled')}</div>
            <div className="font-black text-xl text-amber-600 dark:text-amber-400 mt-0.5">{scheduledCount} Upcoming</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.trips.queued_dispatch')}</div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar with Tabs & View Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
            <FleetIcons.Search className="w-4 h-4" />
          </span>
          <input 
            placeholder={t('fleet.trips.search_ph')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800 transition-all font-medium"
          />
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'All', label: 'All Trips' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'scheduled', label: 'Scheduled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}

          {/* View Mode Toggle */}
          <div className="hidden sm:block ml-2">
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              tableValue="table"
              cardValue="grid"
            />
          </div>
        </div>
      </div>

      {/* 4. Trips Content */}
      {status === 'loading' ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.trips.fetching')}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-colors">
          <FleetIcons.Bus className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('fleet.trips.no_trips')}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 max-w-sm mx-auto">
            No trip records found matching your active filter.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trips.map((t) => {
            const tripCode = t.code || `TRIP-${String(t.id).padStart(4, '0')}`;
            const vehicleNumber = t.vehicle?.bus_number || t.vehicle?.busNumber || 'Unassigned Bus';
            const driverName = t.driver?.name || 'Unassigned Driver';
            const progress = t.progress_percent || (t.status === 'completed' ? 100 : 0);

            return (
              <div 
                key={t.id} 
                onClick={() => navigate(`/fleet-operator/trips/${t.id}`)}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all cursor-pointer shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tripCode}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{vehicleNumber}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {t.vehicle?.vehicle_type || 'Transit Vehicle'} {t.vehicle?.model ? `— ${t.vehicle.model}` : ''}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                      t.status === 'in_progress' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                      t.status === 'completed' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
                      }`}></span>
                      <span className="capitalize">{t.status?.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Route Waypoints */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        <FleetIcons.Target className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{t.origin || 'Origin Terminal'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          Started: {t.started_at ? new Date(t.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled'}
                        </div>
                      </div>
                    </div>

                    <div className="ml-1 border-l-2 border-dashed border-slate-300 dark:border-zinc-700 h-3"></div>

                    <div className="flex items-start gap-2.5">
                      <span className="text-slate-600 dark:text-zinc-400 font-bold mt-0.5">
                        <FleetIcons.Pin className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{t.destination || 'Destination Terminal'}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          {t.ended_at ? `Ended: ${new Date(t.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `ETA: ${t.eta || 'On Schedule'}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
                      <span>Progress: {progress}% ({t.covered_km || 0} / {t.distance_km || 0} km)</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">ETA: {t.eta || (t.status === 'completed' ? 'Finished' : 'Normal')}</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          t.status === 'in_progress' ? 'bg-emerald-500' :
                          t.status === 'completed' ? 'bg-blue-600' : 'bg-amber-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('common.driver')}</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{driverName}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('fleet.trips.avg_speed')}</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{t.avg_speed ? `${t.avg_speed} km/h` : '—'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase">{t('fleet.trips.live_speed')}</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{t.current_speed ? `${t.current_speed} km/h` : (t.status === 'completed' ? '0 km/h' : '—')}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-1">
                    <FleetIcons.Gps className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.punctuality_status || 'On Time'}</span>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{t('fleet.trips.view_voyage_specs')}</span>
                    <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-x-auto transition-colors">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">
                <th className="pb-3 px-3">{t('fleet.trips.col_trip_id')}</th>
                <th className="pb-3 px-3">{t('common.vehicle')}</th>
                <th className="pb-3 px-3">{t('common.driver')}</th>
                <th className="pb-3 px-3">{t('fleet.trips.col_route_endpoints')}</th>
                <th className="pb-3 px-3">{t('fleet.trips.col_distance_prog')}</th>
                <th className="pb-3 px-3">{t('fleet.trips.col_speed')}</th>
                <th className="pb-3 px-3">{t('common.status')}</th>
                <th className="pb-3 px-3 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {trips.map((t) => {
                const tripCode = t.code || `TRIP-${String(t.id).padStart(4, '0')}`;
                const vehicleNumber = t.vehicle?.bus_number || t.vehicle?.busNumber || '—';
                const driverName = t.driver?.name || 'Unassigned';
                const progress = t.progress_percent || (t.status === 'completed' ? 100 : 0);

                return (
                  <tr 
                    key={t.id} 
                    onClick={() => navigate(`/fleet-operator/trips/${t.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{tripCode}</td>
                    <td className="py-4 px-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{vehicleNumber}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">{t.vehicle?.vehicle_type || 'Bus'}</div>
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800 dark:text-zinc-200">{driverName}</td>
                    <td className="py-4 px-3 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-zinc-200 truncate">{t.origin} <FleetIcons.ArrowRight className="w-3 h-3 inline mx-1 text-slate-400" /> {t.destination}</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {t.started_at ? new Date(t.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{t.covered_km || 0} / {t.distance_km || 0} km ({progress}%)</div>
                      <div className="text-[11px] text-slate-400 dark:text-zinc-500">ETA: {t.eta || '—'}</div>
                    </td>
                    <td className="py-4 px-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {t.current_speed ? `${t.current_speed} km/h` : '—'}
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'in_progress' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                        t.status === 'completed' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' :
                        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center justify-end gap-1">
                        <span>{t('fleet.details.view_specs')}</span>
                        <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[6, 10, 20, 50]}
      />
    </div>
  );
};

export default TripsPage;

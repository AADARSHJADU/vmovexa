import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverRoutesPage = () => {
  const { activeRoute, loadActiveRoute, setDutyStatus, profile, loadProfile } = useDriverApp();
  const [tripStarted, setTripStarted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.allSettled([loadActiveRoute(), loadProfile()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActiveRoute().catch(() => {});
    loadProfile().catch(() => {});
  }, [loadActiveRoute, loadProfile]);

  const currentRoute = activeRoute?.activeTrip !== undefined && activeRoute.activeTrip !== null
    ? activeRoute.activeTrip
    : (activeRoute || null);
  const stops = currentRoute?.stops ?? [];

  useEffect(() => {
    if (
      currentRoute?.rawStatus === 'in_progress' ||
      currentRoute?.status === 'in_progress' ||
      currentRoute?.status === 'In Transit' ||
      profile?.status === 'on_duty'
    ) {
      setTripStarted(true);
    } else {
      setTripStarted(false);
    }
  }, [currentRoute, profile]);

  const handleDutyToggle = async () => {
    const nextStarted = !tripStarted;
    const status = nextStarted ? 'on_duty' : 'off_duty';
    try {
      await toast.promise(setDutyStatus(status), {
        loading: 'Updating duty status...',
        success: nextStarted ? 'Trip started successfully!' : 'Trip paused',
        error: (e) => e?.message || 'Failed to update status',
      });
      setTripStarted(nextStarted);
      await loadActiveRoute().catch(() => {});
      await loadProfile().catch(() => {});
    } catch {
      /* toast already surfaced the error */
    }
  };

  if (!currentRoute) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
          <Breadcrumb
            items={[
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Assigned Routes' },
            ]}
            className="mb-3"
          />
          <div className="flex items-center gap-3">
            <Link
              to="/driver/dashboard"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Back to Dashboard"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Assigned Routes</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
                View transit route itinerary, stops, distance telemetry, and active passenger waypoints
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm text-center">
          <FleetIcons.Bus className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No active route</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">You have no route assigned right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Assigned Routes' },
            ]}
            className="mb-2"
          />
          <div className="flex items-center gap-3 mt-1">
            <Link
              to="/driver/dashboard"
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Back to Dashboard"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Assigned Routes</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                View transit route itinerary, stops, distance telemetry, and active passenger waypoints
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <RefreshButton
            onClick={handleRefresh}
            loading={refreshing}
            title="Refresh active route"
          />
          <Link
            to="/driver/schedule"
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            View Shift Schedule →
          </Link>
        </div>
      </div>

      {/* Prominent Active Route Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
              <FleetIcons.Bus className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{currentRoute?.routeNumber ?? currentRoute?.route?.code ?? '—'}</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md">
                  {currentRoute?.busNumber ?? currentRoute?.vehicle?.bus_number ?? '—'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{currentRoute?.routeName ?? currentRoute?.route?.name ?? '—'}</p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{currentRoute?.status ?? '—'}</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 text-xs text-center">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase tracking-wider font-bold">Start Time</span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentRoute?.departureTime ?? currentRoute?.start_time ?? '—'}</div>
          </div>
          <div className="border-x border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase tracking-wider font-bold">End Time</span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentRoute?.endTime ?? currentRoute?.end_time ?? '—'}</div>
          </div>
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] uppercase tracking-wider font-bold">Total Distance</span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{currentRoute?.totalDistance ?? currentRoute?.distance ?? '—'}</div>
          </div>
        </div>

        <button
          onClick={handleDutyToggle}
          className={`w-full py-3 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
            tripStarted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white'
          }`}
        >
          <FleetIcons.Speed className="w-4 h-4" />
          <span>{tripStarted ? 'Trip Active in Progress (Tap to Pause)' : 'Start Route Trip'}</span>
        </button>
      </div>

      {/* Route Waypoint Map & Stop-by-Stop List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Route Waypoint Progress</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{stops.length} designated passenger stations along the corridor</p>
          </div>
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Live GPS Connected</span>
        </div>

        {stops.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400 dark:text-zinc-500 font-medium">No waypoints available</p>
        ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="relative flex items-center justify-between gap-4">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                  stop.type === 'start'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : stop.type === 'end'
                    ? 'bg-red-600 border-red-600 text-white'
                    : stop.passed
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500'
                }`}
              >
                {stop.passed ? '✓' : idx + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${stop.passed ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                    {stop.name ?? '—'}
                  </span>
                  {stop.type === 'start' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded">
                      Start Depot
                    </span>
                  )}
                  {stop.type === 'end' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded">
                      Terminus
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">Scheduled: {stop.eta ?? '—'}</div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 shrink-0">{stop.distance ?? '—'}</span>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Route & Bus Telemetry Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Route Information</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Service Type:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentRoute?.routeType ?? activeRoute?.routeType ?? '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Operating Frequency:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentRoute?.frequency ?? activeRoute?.frequency ?? '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Passenger Load (Est):</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentRoute?.passengersEstimate ?? activeRoute?.passengersEstimate ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Vehicle Telemetry</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Bus Registration:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{currentRoute?.busNumber ?? activeRoute?.busNumber ?? '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Electrical Battery:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentRoute?.batteryState ?? activeRoute?.batteryState ?? '—'}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
              <span className="text-slate-500 dark:text-zinc-400">Fuel Level:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{currentRoute?.fuelLevel ?? activeRoute?.fuelLevel ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

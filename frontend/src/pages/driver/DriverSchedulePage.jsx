import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverSchedulePage = () => {
  const { schedule, loadSchedule } = useDriverApp();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming'

  useEffect(() => {
    loadSchedule().catch(() => {});
  }, [loadSchedule]);

  const scheduleList = Array.isArray(schedule)
    ? schedule
    : (schedule?.schedules || schedule?.items || schedule?.rows || []);

  const renderTrip = (trip) => (
    <div key={trip.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{trip.date ?? trip.startTime ?? trip.shift_start ?? '—'}</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            {(trip.routeNumber ?? trip.route_id ?? (trip.date ? `Shift on ${trip.date}` : 'Scheduled Shift'))}{trip.tripLabel ? ` · ${trip.tripLabel}` : ''}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {trip.status ?? 'Scheduled'}
        </span>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Depot Run:</span>
          <div className="font-bold text-slate-800 dark:text-zinc-200">{(trip.startDepot ?? trip.start_depot ?? 'Depot')} ➔ {(trip.endDepot ?? trip.end_depot ?? 'Terminus')}</div>
        </div>
        <div>
          <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Timetable:</span>
          <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono">{(trip.startTime ?? trip.shift_start ?? '—')} – {(trip.endTime ?? trip.shift_end ?? '—')}</div>
        </div>
        <div>
          <span className="text-slate-400 dark:text-zinc-500 text-[11px]">Distance:</span>
          <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono">{trip.distance ?? '—'}</div>
        </div>
      </div>
    </div>
  );

  const emptyState = (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm text-center">
      <FleetIcons.Clock className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
      <p className="text-sm font-bold text-slate-900 dark:text-white">No scheduled shifts</p>
      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">You have no trips scheduled right now.</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Driver', path: '/driver/dashboard' },
              { label: 'Shift Schedule' },
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Driver Schedule</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                View your daily assigned shifts, return trip timetables, and upcoming week itineraries
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/driver/routes"
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-sm"
        >
          View Route Details →
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'today' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Shifts
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'upcoming' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming Schedules ({scheduleList.length})
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Shift Schedule</span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">Assigned Trips</h2>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
          {scheduleList.length} Trips Assigned
        </span>
      </div>

      {/* Schedule List */}
      {scheduleList.length === 0 ? (
        emptyState
      ) : (
        <div className="space-y-3 animate-in fade-in duration-200">
          {scheduleList.map(renderTrip)}
        </div>
      )}

      {/* Advisory Box */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
        <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Timings may change due to traffic or operational updates. Please check notifications for the latest updates.</span>
      </div>
    </div>
  );
};

export default DriverSchedulePage;

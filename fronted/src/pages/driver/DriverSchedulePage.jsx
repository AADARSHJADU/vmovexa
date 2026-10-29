import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { useDriverApp } from '../../hooks/driver/useDriverApp';
import Breadcrumb from '../../components/ui/Breadcrumb';

export const DriverSchedulePage = () => {
  const { t } = useTranslation();
  const { schedule, loadSchedule } = useDriverApp();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming'

  useEffect(() => {
    loadSchedule().catch(() => {});
  }, [loadSchedule]);

  const scheduleList = Array.isArray(schedule)
    ? schedule
    : (schedule?.schedules || schedule?.items || schedule?.rows || []);

  const todayShifts = scheduleList.filter((s) => s.isToday || (s.date && s.date.toLowerCase().includes('today')));
  const upcomingShifts = scheduleList.filter((s) => !s.isToday && !(s.date && s.date.toLowerCase().includes('today')));

  const displayedList = activeTab === 'today' ? (todayShifts.length > 0 ? todayShifts : scheduleList) : upcomingShifts;

  const renderTrip = (trip) => {
    const isCompleted = trip.isCompleted || trip.status === 'Completed';
    const isInTransit = trip.status === 'In Transit';

    return (
      <div
        key={trip.id}
        className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
          isCompleted
            ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
            : isInTransit
            ? 'border-blue-400 dark:border-blue-700 shadow-md ring-1 ring-blue-500/20'
            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        {/* Top Shift Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              {trip.route_number || trip.routeNumber || 'ROUTE'}
            </span>
            <span className="text-xs font-mono font-black text-slate-900 dark:text-white">
              {trip.bus_number || '—'}
            </span>
            {trip.slot_code && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <FleetIcons.Clock className="w-3 h-3" />
                <span>Slot: {trip.slot_code}</span>
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
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1.5 ${
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
                  <span>{t('common.completed')}</span>
                </>
              ) : isInTransit ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t('driver.routes.live_in_transit')}</span>
                </>
              ) : (
                <span>{t('driver.routes.ready_scheduled')}</span>
              )}
            </span>
          </div>
        </div>

        {/* Route Details & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {trip.trip_label || trip.tripLabel || `${trip.start_depot || 'Depot'} ➔ ${trip.end_depot || 'Terminus'}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              {trip.start_depot ?? '—'} → {trip.end_depot ?? '—'}
            </p>
          </div>

          <Link
            to={`/driver/routes?slotId=${trip.slot_id || trip.slotId || ''}`}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0 ${
              isCompleted
                ? 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-700'
                : isInTransit
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
            }`}
          >
            <FleetIcons.Speed className="w-3.5 h-3.5" />
            <span>
              {isCompleted
                ? 'View Shift Summary →'
                : isInTransit
                ? 'Open Live Cockpit →'
                : 'Dispatch This Route →'}
            </span>
          </Link>
        </div>

        {/* 4-Item Telemetry Matrix */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              {isCompleted ? 'Shift Run Times' : 'Timetable Shift'}
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
              {(trip.startTime ?? trip.shift_start ?? '—')} – {(trip.endTime ?? trip.shift_end ?? '—')}
            </div>
            {isCompleted && trip.duration && trip.duration !== '—' && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                Duration: {trip.duration}
              </span>
            )}
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              Corridor Distance
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 font-mono mt-0.5">
              {trip.distance ?? (trip.distance_km ? `${trip.distance_km} km` : '—')}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {isCompleted ? '100% Complete' : 'Standard Corridor'}
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              Headway Frequency
            </span>
            <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{trip.frequency || '—'}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Scheduled Frequency
            </span>
          </div>

          <div className="border-l border-slate-200 dark:border-zinc-700">
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] uppercase font-bold block">
              Vehicle Assigned
            </span>
            <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
              {trip.bus_number || '—'}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Commercial Transit
            </span>
          </div>
        </div>
      </div>
    );
  };

  const emptyState = (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 shadow-sm text-center">
      <FleetIcons.Clock className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
      <p className="text-sm font-bold text-slate-900 dark:text-white">{t('driver.schedule.no_scheduled_shifts')}</p>
      <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-1">{t('driver.dashboard.no_trip_scheduled')}</p>
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
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('driver.schedule.title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              View your daily assigned shifts, vehicle slot timetables, and weekly duty itineraries
            </p>
          </div>
        </div>

        <Link
          to="/driver/routes"
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-sm flex items-center gap-1.5"
        >
          <FleetIcons.Speed className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{t('driver.schedule.view_active_cockpit')} <FleetIcons.ArrowRight className="w-3.5 h-3.5 inline-block ml-1" /></span>
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex p-1 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'today' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Today's Shifts {todayShifts.length > 0 ? `(${todayShifts.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upcoming' ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Upcoming Week Duty ({upcomingShifts.length})
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {activeTab === 'today' ? "Today's Active Roster" : 'Upcoming Week Duty Roster'}
          </span>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {activeTab === 'today' ? 'Assigned Shifts & Timetable Runs' : '7-Day Dispatch Itinerary'}
          </h2>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full font-mono">
          {displayedList.length} Shifts Listed
        </span>
      </div>

      {/* Schedule List */}
      {displayedList.length === 0 ? (
        emptyState
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {displayedList.map(renderTrip)}
        </div>
      )}

      {/* Advisory Box */}
      <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
        <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>{t('driver.schedule.timings_governed_desc')}</span>
      </div>
    </div>
  );
};

export default DriverSchedulePage;

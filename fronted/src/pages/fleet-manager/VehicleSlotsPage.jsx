import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Pagination } from '../../components/ui/Pagination';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { ViewModeToggle } from '../../components/ui/ViewModeToggle';
import { ActionDropdown } from '../../components/ui/ActionDropdown';
import { useVehicleSlot } from '../../hooks/fleet/useVehicleSlot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

/** Operational Status Badge */
const SlotStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const s = (status || '').toLowerCase();
  let cls = 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
  let label = status || '—';
  let dot = 'bg-slate-400';

  if (s === 'active') {
    cls = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    label = t('common.active');
    dot = 'bg-emerald-500';
  } else if (s === 'in_transit' || s === 'running') {
    cls = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60';
    label = t('admin.slots.in_transit');
    dot = 'bg-blue-500 animate-pulse';
  } else if (s === 'paused') {
    cls = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    label = t('admin.slots.pause_slot');
    dot = 'bg-amber-500';
  } else if (s === 'completed') {
    cls = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/60';
    label = t('admin.slots.completed');
    dot = 'bg-purple-500';
  } else if (s === 'inactive') {
    cls = 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700';
    label = t('common.inactive');
    dot = 'bg-slate-400';
  }

  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border shrink-0 inline-flex items-center gap-1.5 shadow-2xs ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
};

/** Shift Type Badge */
const ShiftBadge = ({ shift }) => {
  const { t } = useTranslation();
  const s = (shift || '').toLowerCase();
  if (s === 'morning_peak') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1">
        <FleetIcons.Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span>{t('admin.slots.morning_peak')}</span>
      </span>
    );
  }
  if (s === 'regular_day') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 inline-flex items-center gap-1">
        <FleetIcons.Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        <span>{t('admin.slots.regular_day')}</span>
      </span>
    );
  }
  if (s === 'evening_peak') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 inline-flex items-center gap-1">
        <FleetIcons.Clock className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        <span>{t('admin.slots.evening_peak')}</span>
      </span>
    );
  }
  if (s === 'night_shuttle') {
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 inline-flex items-center gap-1">
        <FleetIcons.Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        <span>{t('admin.slots.night_shuttle')}</span>
      </span>
    );
  }

  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
      {shift || 'Custom'}
    </span>
  );
};

export const VehicleSlotsPage = ({ forcedPortal = null }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const isFleetPortal = forcedPortal ? forcedPortal === 'fleet' : location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/slots' : '/admin/slots';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';
  const portalLabel = isFleetPortal ? 'Fleet Operator' : 'Admin';

  const canCreate = !isFleetPortal || hasPermission(['fleet.slots.create', 'fleet.vehicles.create']);
  const canUpdate = !isFleetPortal || hasPermission(['fleet.slots.update', 'fleet.vehicles.update']);
  const canDelete = !isFleetPortal || hasPermission(['fleet.slots.delete', 'fleet.vehicles.delete']);

  const {
    slots = [],
    pagination = {},
    loading,
    loadSlots,
    loadTimetable,
    deleteSlot,
    updateSlot,
  } = useVehicleSlot();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('slot_view_mode') || 'table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [togglingStatusId, setTogglingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('slot_view_mode', mode);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshSlots = useCallback(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeTab === 'Active') params.status = 'active';
    else if (activeTab === 'Paused') params.status = 'paused';
    else if (activeTab === 'Morning Peak') params.shift_type = 'morning_peak';
    else if (activeTab === 'Regular Day') params.shift_type = 'regular_day';
    else if (activeTab === 'Evening Peak') params.shift_type = 'evening_peak';
    else if (activeTab === 'Night Shuttle') params.shift_type = 'night_shuttle';

    loadSlots(params).catch(() => {});
    if (viewMode === 'timetable') {
      loadTimetable(params).catch(() => {});
    }
  }, [currentPage, pageSize, debouncedSearch, activeTab, viewMode, loadSlots, loadTimetable]);

  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  const slotsList = useMemo(() => Array.isArray(slots) ? slots : (slots?.items || slots?.rows || []), [slots]);

  // Filter tabs definition
  const filterTabs = [
    { key: 'All', label: 'All' },
    { key: 'Active', label: 'Active' },
    { key: 'Morning Peak', label: 'Morning Peak' },
    { key: 'Regular Day', label: 'Regular Day' },
    { key: 'Evening Peak', label: 'Evening Peak' },
    { key: 'Night Shuttle', label: 'Night Shuttle' },
    { key: 'Paused', label: 'Paused' },
  ];

  const filteredSlots = slotsList;

  const handleToggleStatus = (slot, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    const newStatus = slot.status === 'active' ? 'paused' : 'active';
    setTogglingStatusId(slot.id);
    toast.promise(
      updateSlot(slot.id, { status: newStatus }),
      {
        loading: `Updating status for ${slot.slot_name || slot.slot_code}...`,
        success: () => {
          refreshSlots();
          return `Slot marked as ${newStatus}!`;
        },
        error: (err) => err?.message || 'Failed to update status',
      }
    ).finally(() => setTogglingStatusId(null));
  };

  const handleDeleteSlot = (slot, closeDropdown) => {
    if (closeDropdown) closeDropdown();
    if (!window.confirm(`Are you sure you want to delete slot "${slot.slot_name || slot.slot_code}"?`)) {
      return;
    }
    setDeletingId(slot.id);
    toast.promise(
      deleteSlot(slot.id),
      {
        loading: `Deleting slot schedule...`,
        success: () => {
          refreshSlots();
          return `Vehicle slot deleted successfully!`;
        },
        error: (err) => err?.message || 'Failed to delete slot',
      }
    ).finally(() => setDeletingId(null));
  };

  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || filteredSlots.length) / pageSize) || 1;
  const totalItems = pagination?.total || filteredSlots.length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: portalLabel, path: dashboardLink },
              { label: t('admin.slots.slots_title') },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Vehicle Slots & Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {t('admin.slots.slots_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <RefreshButton
            onClick={refreshSlots}
            loading={loading}
            title={t('admin.slots.refresh_slots')}
          />
          {canCreate && (
            <Link
              to={`${basePath}/schedule`}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <FleetIcons.Plus className="w-4 h-4" />
              <span>{t('admin.slots.schedule_slot')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            {t('admin.slots.total_slots')}
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{pagination?.total ?? slotsList.length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('admin.slots.active_runs')}
          </span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {slotsList.filter((s) => (s.status || '').toLowerCase() === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Morning Peak
          </span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">
            {slotsList.filter((s) => s.shift_type === 'morning_peak').length}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Evening Peak
          </span>
          <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {slotsList.filter((s) => s.shift_type === 'evening_peak').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:w-80">
            <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('admin.slots.search_ph')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-slate-300 dark:focus:ring-zinc-700 focus:outline-none"
            />
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <ViewModeToggle
              viewMode={viewMode === 'timetable' ? 'card' : viewMode}
              onViewModeChange={(m) => toggleViewMode(m)}
              tableValue="table"
              cardValue="grid"
            />
            <button
              type="button"
              onClick={() => toggleViewMode('timetable')}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'timetable'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
              title={t('admin.slots.hourly_timetable_view')}
            >
              <FleetIcons.Clock className={`w-3.5 h-3.5 ${viewMode === 'timetable' ? 'text-white' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{t('admin.slots.timetable_view')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full" />
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-slate-400 dark:text-zinc-500 font-medium">
          <FleetIcons.Clock className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
          <p>{t('admin.slots.no_slots_found')}</p>
          {canCreate && (
            <Link
              to={`${basePath}/schedule`}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5" /> Schedule First Slot
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW — Matches http://localhost:5173/fleet-operator/drivers exactly */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs text-slate-700 dark:text-zinc-300">
              <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">{t('admin.slots.th_vehicle_slot')}</th>
                  <th className="py-3 px-4">{t('admin.slots.th_transit_route')}</th>
                  <th className="py-3 px-4">{t('admin.slots.th_shift_timings')}</th>
                  <th className="py-3 px-4">{t('admin.slots.th_operating_days')}</th>
                  <th className="py-3 px-4">{t('admin.slots.th_driver')}</th>
                  <th className="py-3 px-4">{t('admin.slots.th_status')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.slots.th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredSlots.map((slot) => {
                  const busNumber = slot.vehicle?.bus_number || slot.vehicle?.plate || `Bus #${slot.vehicle_id}`;
                  const routeName = slot.route?.name || `Route #${slot.route_id}`;
                  const routeCode = slot.route?.code || '';
                  const driverName = slot.driver?.name || 'Unassigned';
                  const sTime = String(slot.start_time || '').substring(0, 5);
                  const eTime = String(slot.end_time || '').substring(0, 5);
                  const isPaused = (slot.status || '').toLowerCase() === 'paused';

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* Vehicle & Slot */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FleetIcons.Bus className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Link
                                to={`${basePath}/${slot.id}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {busNumber}
                              </Link>
                              {slot.vehicle?.model && (
                                <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500">
                                  ({slot.vehicle.model})
                                </span>
                              )}
                            </div>
                            <Link
                              to={`${basePath}/${slot.id}`}
                              className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono hover:underline hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {slot.slot_code || `SLOT-${slot.id}`}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Transit Route */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{routeName}</span>
                          {routeCode && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {routeCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <span>{slot.route?.start_point || 'Start'}</span>
                          <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400 shrink-0 inline mx-0.5" />
                          <span>{slot.route?.end_point || 'Terminal'}</span>
                        </div>
                      </td>

                      {/* Shift & Timings */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ShiftBadge shift={slot.shift_type} />
                          <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {sTime} - {eTime}
                          </span>
                        </div>
                        {slot.headway_minutes && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            {slot.headway_minutes} min headway frequency
                          </div>
                        )}
                      </td>

                      {/* Operating Days */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {slot.operating_days === 'ALL' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            All 7 Days
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
                            {slot.operating_days?.split(',').map((d) => (
                              <span
                                key={d}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                              >
                                {d.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Assigned Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FleetIcons.Profile className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{driverName}</span>
                        </div>
                        {slot.driver?.phone && (
                          <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono pl-5">
                            {slot.driver.phone}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <SlotStatusBadge status={slot.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end">
                          <ActionDropdown buttonTitle={`Options for ${slot.slot_name || slot.slot_code}`}>
                            {({ close }) => (
                              <>
                                <Link
                                  to={`${basePath}/${slot.id}`}
                                  onClick={close}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                >
                                  <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>{t('admin.slots.view_details')}</span>
                                </Link>

                                {canUpdate && (
                                  <Link
                                    to={`${basePath}/edit/${slot.id}`}
                                    onClick={close}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                                  >
                                    <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                                    <span>{t('admin.slots.edit_schedule')}</span>
                                  </Link>
                                )}

                                {canUpdate && (
                                  <button
                                    type="button"
                                    disabled={togglingStatusId === slot.id}
                                    onClick={() => handleToggleStatus(slot, close)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                  >
                                    {isPaused ? (
                                      <>
                                        <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>{t('admin.slots.mark_active')}</span>
                                      </>
                                    ) : (
                                      <>
                                        <FleetIcons.Clock className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{t('admin.slots.pause_slot')}</span>
                                      </>
                                    )}
                                  </button>
                                )}

                                {canDelete && (
                                  <button
                                    type="button"
                                    disabled={deletingId === slot.id}
                                    onClick={() => handleDeleteSlot(slot, close)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-zinc-800 disabled:opacity-50"
                                  >
                                    <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                                    <span>{t('admin.slots.delete_slot')}</span>
                                  </button>
                                )}
                              </>
                            )}
                          </ActionDropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID / CARD VIEW — Matches Drivers page card layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot) => {
            const busNumber = slot.vehicle?.bus_number || slot.vehicle?.plate || `Bus #${slot.vehicle_id}`;
            const routeName = slot.route?.name || `Route #${slot.route_id}`;
            const sTime = String(slot.start_time || '').substring(0, 5);
            const eTime = String(slot.end_time || '').substring(0, 5);
            const isPaused = (slot.status || '').toLowerCase() === 'paused';

            return (
              <div
                key={slot.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FleetIcons.Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        <Link
                          to={`${basePath}/${slot.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {busNumber}
                        </Link>
                      </div>
                      <Link
                        to={`${basePath}/${slot.id}`}
                        className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono hover:underline hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {slot.slot_code || `SLOT-${slot.id}`}
                      </Link>
                    </div>
                  </div>

                  <ActionDropdown buttonTitle={`Options for ${slot.slot_name || slot.slot_code}`}>
                    {({ close }) => (
                      <>
                        <Link
                          to={`${basePath}/${slot.id}`}
                          onClick={close}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                        >
                          <FleetIcons.Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{t('admin.slots.view_details')}</span>
                        </Link>

                        {canUpdate && (
                          <Link
                            to={`${basePath}/edit/${slot.id}`}
                            onClick={close}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            <FleetIcons.Edit className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                            <span>{t('admin.slots.edit_schedule')}</span>
                          </Link>
                        )}
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(slot, close)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
                          >
                            {isPaused ? 'Mark Active' : 'Pause Slot'}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot, close)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-zinc-800"
                          >
                            <FleetIcons.Trash className="w-3.5 h-3.5 text-rose-500" />
                            <span>{t('admin.slots.delete_slot')}</span>
                          </button>
                        )}
                      </>
                    )}
                  </ActionDropdown>
                </div>

                {/* Route strip */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 dark:text-zinc-200 truncate pr-2">
                    {routeName}
                  </div>
                  {slot.route?.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 shrink-0">
                      {slot.route.code}
                    </span>
                  )}
                </div>

                {/* Shift & Time */}
                <div className="flex items-center justify-between text-xs">
                  <ShiftBadge shift={slot.shift_type} />
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 text-xs">
                    {sTime} - {eTime}
                  </span>
                </div>

                {/* Days & Status Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <FleetIcons.Profile className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{slot.driver?.name || 'Unassigned'}</span>
                  </div>
                  <SlotStatusBadge status={slot.status} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TIMETABLE HOURLY MATRIX VIEW */
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Hourly Transit Timeline (06:00 — 23:00)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Visual operating status of scheduled corridor runs across daytime shifts
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              {filteredSlots.length} {t('admin.slots.active_timetable_slots')}
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[800px] space-y-2">
              {/* Timeline Header Hours */}
              <div className="grid grid-cols-18 text-[10px] font-mono font-bold text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                <div className="col-span-3 text-left">{t('admin.slots.vehicle_corridor')}</div>
                {['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].map((h) => (
                  <div key={h} className="text-center">{h}:00</div>
                ))}
              </div>

              {/* Rows */}
              {filteredSlots.map((slot) => {
                const sHour = parseInt(String(slot.start_time || '08').split(':')[0], 10);
                const eHour = parseInt(String(slot.end_time || '12').split(':')[0], 10);

                return (
                  <div key={slot.id} className="grid grid-cols-18 items-center py-2 hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 rounded-xl px-1 text-xs">
                    <div className="col-span-3 pr-2">
                      <Link
                        to={`${basePath}/${slot.id}`}
                        className="font-mono font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 block"
                      >
                        {slot.vehicle?.bus_number || `Bus #${slot.vehicle_id}`}
                      </Link>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                        {slot.route?.name || 'Corridor'}
                      </div>
                    </div>

                    {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => {
                      const isAfterStart = hour >= sHour;
                      const isBeforeEnd = hour <= eHour;
                      const isActiveHour = isAfterStart && isBeforeEnd;
                      return (
                        <div key={hour} className="px-0.5">
                          {isActiveHour ? (
                            <Link
                              to={`${basePath}/${slot.id}`}
                              className="h-6 rounded-md bg-blue-600/90 hover:bg-blue-600 transition-colors flex items-center justify-center text-[9px] text-white font-bold shadow-2xs cursor-pointer block"
                              title={`${slot.slot_name || slot.slot_code}: ${slot.start_time} - ${slot.end_time} (Click to view details)`}
                            >
                              •
                            </Link>
                          ) : (
                            <div className="h-6 rounded-md bg-slate-100 dark:bg-zinc-800/60" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {viewMode !== 'timetable' && filteredSlots.length > 0 && (
        <div className="pt-2">
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
            pageSizeOptions={[6, 10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
};

export default VehicleSlotsPage;

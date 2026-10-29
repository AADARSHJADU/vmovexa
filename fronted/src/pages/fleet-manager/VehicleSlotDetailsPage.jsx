/* eslint-disable react-hooks/set-state-in-effect -- route id changes trigger asynchronous slot loading */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useVehicleSlot } from '../../hooks/fleet/useVehicleSlot';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

const WEEK_DAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

export const VehicleSlotDetailsPage = ({ forcedPortal = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const { t } = useTranslation();

  const isFleetPortal = forcedPortal ? forcedPortal === 'fleet' : location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/slots' : '/admin/slots';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';
  const portalLabel = isFleetPortal ? 'Fleet Operator' : 'Admin';

  const vehicleBasePath = isFleetPortal ? '/fleet-operator/vehicles' : '/admin/vehicles';
  const driverBasePath = isFleetPortal ? '/fleet-operator/drivers' : '/admin/drivers';
  const routeBasePath = isFleetPortal ? '/fleet-operator/routes' : '/admin/routes';
  const depotBasePath = isFleetPortal ? '/fleet-operator/depots' : '/admin/depots';

  const canUpdate = !isFleetPortal || hasPermission(['fleet.slots.update', 'fleet.vehicles.update']);
  const canDelete = !isFleetPortal || hasPermission(['fleet.slots.delete', 'fleet.vehicles.delete']);

  const { getSlotById, updateSlot, deleteSlot } = useVehicleSlot();

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSlotDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getSlotById(id);
      setSlot(data);
    } catch (err) {
      console.error('Failed to load slot details:', err);
      toast.error(err?.message || 'Failed to load vehicle slot details');
      navigate(basePath);
    } finally {
      setLoading(false);
    }
  }, [id, getSlotById, navigate, basePath]);

  useEffect(() => {
    fetchSlotDetails();
  }, [fetchSlotDetails]);

  const copySlotCode = () => {
    const code = slot?.slot_code || `SLOT-${id}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Slot code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!slot) return;
    const isPaused = (slot.status || '').toLowerCase() === 'paused';
    const newStatus = isPaused ? 'active' : 'paused';

    setTogglingStatus(true);
    try {
      await toast.promise(updateSlot(slot.id, { status: newStatus }), {
        loading: isPaused ? 'Activating slot timetable...' : 'Pausing slot timetable...',
        success: isPaused ? 'Slot marked as Active!' : 'Slot paused successfully!',
        error: (err) => err?.message || 'Failed to update slot status',
      });
      await fetchSlotDetails();
    } catch {
      // toast handles error
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!slot) return;
    if (!window.confirm(`Are you sure you want to permanently delete vehicle slot "${slot.slot_name || slot.slot_code}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      await toast.promise(deleteSlot(slot.id), {
        loading: 'Deleting vehicle slot timetable...',
        success: 'Vehicle slot schedule deleted successfully!',
        error: (err) => err?.message || 'Failed to delete slot',
      });
      navigate(basePath);
    } catch {
      // toast handles error
    } finally {
      setDeleting(false);
    }
  };

  const calculateDuration = () => {
    if (!slot?.start_time || !slot?.end_time) return null;
    const [sh, sm] = String(slot.start_time).substring(0, 5).split(':').map(Number);
    const [eh, em] = String(slot.end_time).substring(0, 5).split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : '00m'}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const clean = String(timeStr).substring(0, 5);
    const [h, m] = clean.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return clean;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  };

  const getShiftBadge = (shift) => {
    const s = String(shift || '').toLowerCase();
    if (s.includes('morning')) {
      return {
        label: 'Morning Peak Shift',
        cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dot: 'bg-amber-500',
      };
    }
    if (s.includes('evening')) {
      return {
        label: 'Evening Peak Shift',
        cls: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
        dot: 'bg-purple-500',
      };
    }
    if (s.includes('night') || s.includes('shuttle')) {
      return {
        label: 'Night Shuttle Shift',
        cls: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
        dot: 'bg-indigo-500',
      };
    }
    return {
      label: 'Regular Day Shift',
      cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      dot: 'bg-blue-500',
    };
  };

  const getStatusBadge = (status) => {
    const st = String(status || 'active').toLowerCase();
    switch (st) {
      case 'active':
        return {
          label: 'Active Service',
          cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'paused':
        return {
          label: 'Temporarily Paused',
          cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'in_transit':
        return {
          label: 'In Transit (Live)',
          cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'completed':
        return {
          label: 'Shift Completed',
          cls: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: 'Inactive / Draft',
          cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
    }
  };

  const isDayActive = (dayKey) => {
    if (!slot?.operating_days || slot.operating_days === 'ALL') return true;
    const daysArr = slot.operating_days.split(',').map((d) => d.trim().toLowerCase());
    return daysArr.includes(dayKey.toLowerCase());
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: portalLabel, path: dashboardLink },
            { label: t('admin.slots.slots_title'), path: basePath },
            { label: t('common.loading') },
          ]}
          className="mb-2"
        />
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-800 dark:text-white">{t('admin.slots.loading_details')}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('admin.slots.loading_desc')}</p>
        </div>
      </div>
    );
  }

  if (!slot) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: portalLabel, path: dashboardLink },
            { label: t('admin.slots.slots_title'), path: basePath },
            { label: t('admin.slots.not_found') },
          ]}
          className="mb-2"
        />
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
          <FleetIcons.Clock className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.slots.not_found')}</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            The requested vehicle slot schedule does not exist or may have been unassigned.
          </p>
          <Link
            to={basePath}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>{t('admin.slots.return_to_slots')}</span>
          </Link>
        </div>
      </div>
    );
  }

  const shiftBadge = getShiftBadge(slot.shift_type);
  const statusBadge = getStatusBadge(slot.status);
  const isPaused = (slot.status || '').toLowerCase() === 'paused';
  const duration = calculateDuration();

  const vehicle = slot.vehicle || {};
  const route = slot.route || {};
  const driver = slot.driver || vehicle.driver || {};
  const depot = slot.depot || vehicle.depot || {};
  const fleet = vehicle.fleet || {};
  const organization = slot.organization || {};

  const busNumber = vehicle.bus_number || vehicle.plate || `Bus #${slot.vehicle_id}`;
  const routeName = route.name || `Route #${slot.route_id}`;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16">
      {/* 1. Standard Top Navigation Breadcrumb */}
      <Breadcrumb
        items={[
          { label: portalLabel, path: dashboardLink },
          { label: t('admin.slots.slots_title'), path: basePath },
          { label: slot.slot_code || `Slot #${slot.id}` },
        ]}
        className="mb-2"
      />

      {/* 2. Top Header & Primary Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
              <span>{slot.slot_code || `SLOT-${slot.id}`}</span>
              <button
                type="button"
                onClick={copySlotCode}
                title={t('admin.slots.copy_slot_code')}
                className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                {copied ? (
                  <FleetIcons.Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <FleetIcons.Terms className="w-3.5 h-3.5" />
                )}
              </button>
            </span>

            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge.cls}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>

            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${shiftBadge.cls}`}>
              <span className={`w-2 h-2 rounded-full ${shiftBadge.dot}`} />
              <span>{shiftBadge.label}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {slot.slot_name || `${routeName} (${String(slot.start_time).substring(0, 5)} - ${String(slot.end_time).substring(0, 5)})`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
            Scheduled transit shift for <span className="font-bold text-slate-700 dark:text-zinc-200">{busNumber}</span> {t('admin.slots.along')} <span className="font-bold text-slate-700 dark:text-zinc-200">{routeName}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <Link
            to={basePath}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>{t('admin.slots.slots_list')}</span>
          </Link>

          {canUpdate && (
            <button
              type="button"
              disabled={togglingStatus}
              onClick={handleToggleStatus}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isPaused
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              {isPaused ? (
                <>
                  <FleetIcons.Check className="w-4 h-4 text-emerald-600" />
                  <span>{t('admin.slots.resume_slot')}</span>
                </>
              ) : (
                <>
                  <FleetIcons.Clock className="w-4 h-4 text-amber-600" />
                  <span>{t('admin.slots.pause_slot')}</span>
                </>
              )}
            </button>
          )}

          {canUpdate && (
            <Link
              to={`${basePath}/edit/${slot.id}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <FleetIcons.Edit className="w-4 h-4 text-white" />
              <span>{t('admin.slots.edit_schedule')}</span>
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteSlot}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={t('admin.slots.delete_slot_schedule')}
            >
              <FleetIcons.Trash className="w-4 h-4 text-rose-600" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Hero Quick Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <FleetIcons.Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('admin.slots.shift_window')}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            {duration ? `Duration: ${duration}` : 'Flexible timetable'}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <FleetIcons.Speed className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('admin.slots.frequency_headway')}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
            Every {slot.headway_minutes || 15} Mins
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            Bus corridor repeat interval
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <FleetIcons.Trips className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('admin.slots.route_distance')}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
            {route.distance_km ? `${route.distance_km} KM` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {route.code ? `Code: ${route.code}` : routeName}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <FleetIcons.Profile className="w-3.5 h-3.5 text-purple-500" />
            <span>{t('admin.slots.assigned_driver')}</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {driver.name || 'Unassigned'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            {driver.phone || (driver.emp_id ? `EMP #${driver.emp_id}` : 'Crew pending')}
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD A: Vehicle & Displays Telemetry */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center">
                <FleetIcons.Bus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Vehicle / Bus Details
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Assigned transit bus unit and edge hardware
                </p>
              </div>
            </div>

            {vehicle.id && (
              <Link
                to={`${vehicleBasePath}/${vehicle.id}`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{t('admin.slots.view_bus')}</span>
                <FleetIcons.Eye className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.bus_number_plate')}</span>
              <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                {busNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.bus_model_make')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {vehicle.model || 'Standard City Transit'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.vehicle_type')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {vehicle.vehicle_type || 'Commercial Passenger Bus'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.passenger_capacity')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {vehicle.capacity ? `${vehicle.capacity} Seats` : 'Standard 54 Seats'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.vehicle_live_status')}</span>
              <span className="font-bold px-2 py-0.5 rounded-md text-[10px] uppercase border bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700">
                {vehicle.status || 'in_depot'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.display_screens')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {vehicle.displays_count ? `${vehicle.displays_count} Active Screens` : 'Dual Advertising Screens'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.fuel_powertrain')}</span>
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                {vehicle.fuel_type || 'Electric / Clean EV'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.telematics_tracking')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('admin.slots.gps_live_signal')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* CARD B: Transit Route Corridor */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900 flex items-center justify-center">
                <FleetIcons.Trips className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transit Route Corridor
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Assigned transit corridor and passenger itinerary
                </p>
              </div>
            </div>

            {route.id && (
              <Link
                to={`${routeBasePath}/${route.id}`}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>{t('admin.slots.view_route')}</span>
                <FleetIcons.Eye className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.corridor_name')}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {routeName} {route.code ? `(${route.code})` : ''}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {route.start_point || 'Primary Origin Depot'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{t('admin.slots.departure')}</span>
              </div>

              <div className="pl-1 border-l-2 border-dashed border-slate-300 dark:border-zinc-600 ml-1 py-1 text-[11px] text-slate-400 font-mono">
                ↓ {route.distance_km ? `${route.distance_km} KM Corridor` : 'Direct Transit Run'}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-bold text-slate-800 dark:text-zinc-200">
                    {route.end_point || 'Terminal Station'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{t('admin.slots.arrival')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.total_corridor_distance')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {route.distance_km ? `${route.distance_km} Kilometers` : 'Standard City Loop'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.est_travel_time')}</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {duration || '45 - 60 Minutes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD C: Assigned Driver & Staff */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 flex items-center justify-center">
                <FleetIcons.Profile className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Assigned Driver & Staff
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Driver roster and commercial license details
                </p>
              </div>
            </div>

            {driver.id && (
              <Link
                to={`${driverBasePath}/${driver.id}`}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>{t('admin.slots.view_driver')}</span>
                <FleetIcons.Eye className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.full_name')}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {driver.name || 'Unassigned Crew'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.employee_id')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                {driver.emp_id ? `EMP-${driver.emp_id}` : (driver.id ? `DRV-${driver.id}` : '—')}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.phone_contact')}</span>
              {driver.phone ? (
                <a
                  href={`tel:${driver.phone}`}
                  className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {driver.phone}
                </a>
              ) : (
                <span className="text-slate-400">{t('common.not_recorded')}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.duty_status')}</span>
              <span className="font-bold px-2 py-0.5 rounded-md text-[10px] uppercase border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                {driver.status || 'Active On Duty'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD D: Fleet Operator & Depot Base */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                <FleetIcons.Depots className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Fleet & Bus Depot Base
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Operating carrier fleet and home garage
                </p>
              </div>
            </div>

            {depot.id && (
              <Link
                to={`${depotBasePath}/${depot.id}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>{t('admin.slots.view_depot')}</span>
                <FleetIcons.Eye className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.fleet_operator')}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {fleet.name || organization.name || '—'}
              </span>
              {fleet.code && (
                <span className="block text-[10px] font-mono text-slate-400">
                  Code: {fleet.code}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.depot_base')}</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {depot.name || 'Central Terminal Depot'}
              </span>
              {depot.code && (
                <span className="block text-[10px] font-mono text-slate-400">
                  Depot Code: {depot.code}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.depot_location')}</span>
              <span className="text-slate-700 dark:text-zinc-300">
                {depot.city ? `${depot.city}, ` : ''}{depot.address || 'Main Transit Terminal Yard'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 block text-[11px]">{t('admin.slots.depot_departure_gate')}</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                Gate 3B · Bay 12
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Operating Days & Recurrence Schedule */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              Weekly Operating Days & Recurrence Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Active operating days when this slot timetable automatically runs
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {slot.operating_days === 'ALL' ? 'Active All 7 Days' : slot.operating_days}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map((day) => {
            const active = isDayActive(day.key);
            return (
              <div
                key={day.key}
                className={`py-3 px-2 rounded-xl text-center border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-800'
                }`}
              >
                <span>{day.label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-300 dark:bg-zinc-700'}`} />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-600 dark:text-zinc-400">
          <div>
            <span className="text-slate-400 block text-[11px]">{t('admin.slots.effective_from')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {slot.effective_from || 'Always in active rotation'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">{t('admin.slots.effective_until')}</span>
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              {slot.effective_until || 'Permanent timetable schedule'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Dispatch Notes & Audit Footprint */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          Dispatch Notes & Record Audit
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300">
          {slot.notes ? (
            <p className="whitespace-pre-wrap leading-relaxed">{slot.notes}</p>
          ) : (
            <p className="text-slate-400 italic">{t('admin.slots.no_special_instructions')}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div>
            Created: <span className="font-mono text-slate-600 dark:text-zinc-400">{slot.createdAt ? new Date(slot.createdAt).toLocaleString() : '—'}</span>
            {slot.creator?.name && ` by ${slot.creator.name}`}
          </div>
          <div>
            Last Modified: <span className="font-mono text-slate-600 dark:text-zinc-400">{slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : '—'}</span>
            {slot.updater?.name && ` by ${slot.updater.name}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSlotDetailsPage;

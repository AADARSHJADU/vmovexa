/* eslint-disable react-hooks/set-state-in-effect -- schedule inputs drive asynchronous conflict state */
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';
import { useVehicleSlot } from '../../hooks/fleet/useVehicleSlot';
import { fleetVehicleService } from '../../api/services/fleet/vehicle.service';
import { fleetRouteService } from '../../api/services/fleet/route.service';
import { fleetDriverService } from '../../api/services/fleet/driver.service';


const WEEK_DAYS = [
  { key: 'Mon', label: 'Mon' },
  { key: 'Tue', label: 'Tue' },
  { key: 'Wed', label: 'Wed' },
  { key: 'Thu', label: 'Thu' },
  { key: 'Fri', label: 'Fri' },
  { key: 'Sat', label: 'Sat' },
  { key: 'Sun', label: 'Sun' },
];

export const ScheduleSlotPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);

  const isFleetPortal = location.pathname.startsWith('/fleet-operator');
  const basePath = isFleetPortal ? '/fleet-operator/slots' : '/admin/slots';
  const dashboardLink = isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard';
  const portalName = isFleetPortal ? 'Fleet Operator' : 'Admin';

  const { createSlot, updateSlot, getSlotById, checkConflict, saving } = useVehicleSlot();

  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routeVehicles, setRouteVehicles] = useState([]);
  const [loadingRouteVehicles, setLoadingRouteVehicles] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingSlot, setLoadingSlot] = useState(isEditMode);

  const [formData, setFormData] = useState({
    slot_name: '',
    vehicle_id: '',
    route_id: '',
    driver_id: '',
    shift_type: 'morning_peak',
    start_time: '07:00',
    end_time: '11:30',
    operating_days: 'ALL',
    headway_minutes: '15',
    status: 'active',
    notes: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [conflictWarning, setConflictWarning] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const conflictTimerRef = useRef(null);

  // Load resource options: Vehicles, Routes, Drivers
  useEffect(() => {
    let mounted = true;
    const fetchResources = async () => {
      setLoadingResources(true);
      try {
        const [vRes, rRes, dRes] = await Promise.all([
          fleetVehicleService.getVehicles({ limit: 100, exclude_status: 'pending_approval,pending,rejected' }),
          fleetRouteService.getRoutes({ limit: 100, exclude_status: 'pending_approval,pending,rejected' }),
          fleetDriverService.getDrivers({ limit: 100, exclude_status: 'pending_approval,pending,rejected' }),
        ]);
        if (mounted) {
          const rawVehicles = Array.isArray(vRes) ? vRes : vRes?.items || vRes?.rows || [];
          const activeVehicles = rawVehicles.filter((v) => {
            const st = String(v?.status || '').toLowerCase().trim();
            return st !== 'pending_approval' && st !== 'pending' && st !== 'rejected';
          });
          setVehicles(activeVehicles);

          const rawRoutes = Array.isArray(rRes) ? rRes : rRes?.items || rRes?.rows || [];
          const activeRoutes = rawRoutes.filter((r) => {
            const st = String(r?.status || '').toLowerCase().trim();
            return st !== 'pending_approval' && st !== 'pending' && st !== 'rejected';
          });
          setRoutes(activeRoutes);

          const rawDrivers = Array.isArray(dRes) ? dRes : dRes?.items || dRes?.rows || [];
          const activeDrivers = rawDrivers.filter((d) => {
            const st = String(d?.status || '').toLowerCase().trim();
            return st !== 'pending_approval' && st !== 'pending' && st !== 'rejected';
          });
          setDrivers(activeDrivers);
        }
      } catch (err) {
        console.error('Failed to load scheduling resources:', err);
        toast.error('Could not load vehicles or routes list.');
      } finally {
        if (mounted) setLoadingResources(false);
      }
    };

    fetchResources();
    return () => { mounted = false; };
  }, []);

  // If in edit mode, fetch existing slot details
  useEffect(() => {
    if (!isEditMode) return;
    let mounted = true;
    const fetchSlot = async () => {
      setLoadingSlot(true);
      try {
        const data = await getSlotById(id);
        if (mounted && data) {
          setFormData({
            slot_name: data.slot_name || '',
            vehicle_id: String(data.vehicle_id || ''),
            route_id: String(data.route_id || ''),
            driver_id: data.driver_id ? String(data.driver_id) : '',
            shift_type: data.shift_type || 'morning_peak',
            start_time: String(data.start_time || '07:00').substring(0, 5),
            end_time: String(data.end_time || '11:30').substring(0, 5),
            operating_days: data.operating_days || 'ALL',
            headway_minutes: String(data.headway_minutes || 15),
            status: data.status || 'active',
            notes: data.notes || '',
          });
        }
      } catch (err) {
        console.error('Failed to load slot for editing:', err);
        toast.error('Failed to load vehicle slot details');
        navigate(basePath);
      } finally {
        if (mounted) setLoadingSlot(false);
      }
    };

    fetchSlot();
    return () => { mounted = false; };
  }, [id, isEditMode, getSlotById, navigate, basePath]);

  // Dynamically load vehicles assigned to the selected transit route corridor
  useEffect(() => {
    if (!formData.route_id) {
      setRouteVehicles([]);
      return;
    }

    let mounted = true;
    const loadRouteVehicles = async () => {
      setLoadingRouteVehicles(true);
      try {
        const [assignmentRes, directVehiclesRes] = await Promise.all([
          fleetRouteService.getRouteVehicles(formData.route_id).catch(() => []),
          fleetVehicleService.getVehicles({ route_id: formData.route_id, limit: 100, exclude_status: 'pending_approval,pending,rejected' }).catch(() => []),
        ]);

        if (!mounted) return;

        const assignmentBuses = (Array.isArray(assignmentRes) ? assignmentRes : assignmentRes?.items || assignmentRes?.rows || [])
          .map((a) => a.vehicle || a)
          .filter((v) => v && v.id);

        const directBuses = Array.isArray(directVehiclesRes) ? directVehiclesRes : directVehiclesRes?.items || directVehiclesRes?.rows || [];

        const mergedMap = new Map();
        for (const b of [...assignmentBuses, ...directBuses]) {
          if (b && b.id) {
            const st = String(b.status || '').toLowerCase().trim();
            if (st !== 'pending_approval' && st !== 'pending' && st !== 'rejected') {
              mergedMap.set(String(b.id), b);
            }
          }
        }

        // If in edit mode and a vehicle was already saved, preserve it in the list
        if (isEditMode && formData.vehicle_id && !mergedMap.has(String(formData.vehicle_id))) {
          const currentVeh = vehicles.find((v) => String(v.id) === String(formData.vehicle_id));
          if (currentVeh) mergedMap.set(String(currentVeh.id), currentVeh);
        }

        const validVehicles = Array.from(mergedMap.values());
        setRouteVehicles(validVehicles);

        // If current vehicle_id is not in the assigned vehicles for this route, reset it
        setFormData((prev) => {
          if (prev.vehicle_id && !validVehicles.some((v) => String(v.id) === String(prev.vehicle_id))) {
            return { ...prev, vehicle_id: '' };
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to load vehicles for route:', err);
      } finally {
        if (mounted) setLoadingRouteVehicles(false);
      }
    };

    loadRouteVehicles();
    return () => { mounted = false; };
  }, [formData.route_id, isEditMode, vehicles]);

  // Real-time conflict validation
  useEffect(() => {
    if (!formData.vehicle_id || !formData.start_time || !formData.end_time) {
      setConflictWarning(null);
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setConflictWarning({ message: 'End time must be later than start time.' });
      return;
    }

    if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);

    conflictTimerRef.current = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const result = await checkConflict({
          vehicle_id: formData.vehicle_id,
          start_time: formData.start_time,
          end_time: formData.end_time,
          operating_days: formData.operating_days,
          exclude_id: isEditMode ? id : null,
        });

        if (result?.hasConflict) {
          setConflictWarning(result);
        } else {
          setConflictWarning(null);
        }
      } catch (err) {
        console.error('Conflict check error:', err);
      } finally {
        setCheckingConflict(false);
      }
    }, 350);

    return () => {
      if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    };
  }, [formData.vehicle_id, formData.start_time, formData.end_time, formData.operating_days, id, isEditMode, checkConflict]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };


  const toggleDay = (day) => {
    let currentDays = formData.operating_days === 'ALL'
      ? WEEK_DAYS.map((w) => w.key)
      : formData.operating_days.split(',').map((d) => d.trim()).filter(Boolean);

    if (currentDays.includes(day)) {
      currentDays = currentDays.filter((d) => d !== day);
    } else {
      currentDays.push(day);
    }

    setFormData((prev) => ({
      ...prev,
      operating_days: currentDays.length === 7 ? 'ALL' : currentDays.join(','),
    }));
  };

  const setDaysPreset = (preset) => {
    if (preset === 'ALL') {
      setFormData((prev) => ({ ...prev, operating_days: 'ALL' }));
    } else if (preset === 'WEEKDAYS') {
      setFormData((prev) => ({ ...prev, operating_days: 'Mon,Tue,Wed,Thu,Fri' }));
    } else if (preset === 'WEEKENDS') {
      setFormData((prev) => ({ ...prev, operating_days: 'Sat,Sun' }));
    }
  };

  const selectedVehicleObj = routeVehicles.find((v) => String(v.id) === String(formData.vehicle_id)) || vehicles.find((v) => String(v.id) === String(formData.vehicle_id));
  const selectedRouteObj = routes.find((r) => String(r.id) === String(formData.route_id));

  // Auto fill driver from vehicle if available
  const handleVehicleChange = (val) => {
    handleFieldChange('vehicle_id', val);
    const v = routeVehicles.find((item) => String(item.id) === String(val)) || vehicles.find((item) => String(item.id) === String(val));
    if (v && v.assigned_driver_id && !formData.driver_id) {
      handleFieldChange('driver_id', String(v.assigned_driver_id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.vehicle_id) errors.vehicle_id = 'Please select a vehicle.';
    if (!formData.route_id) errors.route_id = 'Please select a transit route corridor.';
    if (!formData.start_time) errors.start_time = 'Start time is required.';
    if (!formData.end_time) errors.end_time = 'End time is required.';
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.end_time = 'End time must be later than start time.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix the errors indicated in the form.');
      return;
    }

    if (conflictWarning?.hasConflict) {
      toast.error('Please resolve the scheduling conflict before proceeding.');
      return;
    }

    const payload = {
      slot_name: formData.slot_name.trim() || undefined,
      vehicle_id: Number(formData.vehicle_id),
      route_id: Number(formData.route_id),
      driver_id: formData.driver_id ? Number(formData.driver_id) : null,
      shift_type: formData.shift_type,
      start_time: formData.start_time,
      end_time: formData.end_time,
      operating_days: formData.operating_days,
      headway_minutes: Number(formData.headway_minutes) || 15,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    const action = isEditMode
      ? updateSlot(id, payload)
      : createSlot(payload);

    toast.promise(action, {
      loading: isEditMode ? 'Updating slot schedule...' : 'Scheduling vehicle slot...',
      success: () => {
        navigate(basePath);
        return isEditMode ? 'Slot timetable updated successfully!' : 'Vehicle slot scheduled successfully!';
      },
      error: (err) => err?.message || 'Failed to save vehicle slot.',
    });
  };

  if (loadingSlot || loadingResources) {
    return (
      <div className="w-full space-y-6 animate-in fade-in duration-200">
        <Breadcrumb
          items={[
            { label: portalName, path: dashboardLink },
            { label: 'Vehicle Slots & Timetable', path: basePath },
            { label: isEditMode ? 'Edit Vehicle Slot' : 'Schedule Vehicle Slot' },
          ]}
          className="mb-2"
        />
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.slots.loading')}</p>
        </div>
      </div>
    );
  }

  const durationStr = calculateDuration();

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: portalName, path: dashboardLink },
              { label: 'Vehicle Slots & Timetable', path: basePath },
              { label: isEditMode ? 'Edit Vehicle Slot' : 'Schedule Vehicle Slot' },
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Vehicle Slot' : 'Schedule Vehicle Slot'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Assign transit corridors, shift operating hours, and crew to active fleet buses
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to={basePath}
            className="px-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
          >
            <FleetIcons.ArrowLeft className="w-4 h-4" />
            <span>{t('common.cancel')}</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Transit Route Corridor, Vehicle & Driver Assignment */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                1. Transit Corridor & Vehicle Assignment
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                First select the transit corridor, then choose an assigned vehicle to schedule
              </p>
            </div>
            {selectedVehicleObj && (
              <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                {selectedVehicleObj.bus_number || selectedVehicleObj.plate}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Route Selector (FIRST) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                Transit Route Corridor <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.route_id}
                onChange={(e) => handleFieldChange('route_id', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all font-medium ${
                  fieldErrors.route_id
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500'
                }`}
              >
                <option value="">{t('fleet.slots.select_route')}</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.code ? `(${r.code})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.route_id && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.route_id}
                </p>
              )}
            </div>

            {/* 2. Vehicle Selector (SECOND) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                Vehicle / Bus <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => handleVehicleChange(e.target.value)}
                disabled={!formData.route_id || loadingRouteVehicles || routeVehicles.length === 0}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed ${
                  fieldErrors.vehicle_id
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500'
                }`}
              >
                {!formData.route_id ? (
                  <option value="">-- Select a transit route corridor first --</option>
                ) : loadingRouteVehicles ? (
                  <option value="">Loading assigned buses for this route...</option>
                ) : routeVehicles.length === 0 ? (
                  <option value="">-- No buses assigned to this route --</option>
                ) : (
                  <>
                    <option value="">{t('fleet.slots.select_vehicle')} ({routeVehicles.length} available)</option>
                    {routeVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.bus_number || v.plate || `Vehicle #${v.id}`} {v.model ? `(${v.model})` : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {fieldErrors.vehicle_id && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.vehicle_id}
                </p>
              )}
              {formData.route_id && !loadingRouteVehicles && routeVehicles.length === 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] flex items-center justify-between gap-2 mt-1.5">
                  <span className="flex items-center gap-1.5">
                    <FleetIcons.Alert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>No buses on this route.</span>
                  </span>
                  <Link
                    to={isFleetPortal ? '/fleet-operator/routes' : '/admin/routes'}
                    className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shrink-0 transition-colors"
                  >
                    Assign Bus
                  </Link>
                </div>
              )}
            </div>

            {/* 3. Driver Selector (THIRD) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Assigned Driver <span className="text-slate-400 font-normal">({t('common.optional')})</span>
              </label>
              <select
                value={formData.driver_id}
                onChange={(e) => handleFieldChange('driver_id', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              >
                <option value="">{t('fleet.slots.auto_driver')}</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.phone ? `(${d.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Info Pill */}
          {selectedRouteObj && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FleetIcons.Trips className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedRouteObj.name}</span>
                <span className="text-slate-400 dark:text-zinc-500">
                  ({selectedRouteObj.start_point || 'Start'} <FleetIcons.ArrowRight className="w-3 h-3 inline mx-1" /> {selectedRouteObj.end_point || 'Terminal'})
                </span>
              </div>
              {selectedRouteObj.distance_km && (
                <span className="font-mono font-bold text-slate-600 dark:text-zinc-400 text-[11px]">
                  {selectedRouteObj.distance_km} KM Route
                </span>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Shift Pattern & Operating Hours */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                2. Shift Pattern & Operating Hours
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Set operating shift and active start/end corridor hours
              </p>
            </div>
          </div>

          {/* Time pickers row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Shift Type
              </label>
              <select
                value={formData.shift_type}
                onChange={(e) => handleFieldChange('shift_type', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              >
                <option value="morning_peak">{t('fleet.slots.morning_peak')}</option>
                <option value="regular_day">{t('fleet.slots.regular_day')}</option>
                <option value="evening_peak">{t('fleet.slots.evening_peak')}</option>
                <option value="night_shuttle">{t('fleet.slots.opt_night_shuttle')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleFieldChange('start_time', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all font-mono font-bold ${
                  fieldErrors.start_time
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500'
                }`}
              />
              {fieldErrors.start_time && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.start_time}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                End Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleFieldChange('end_time', e.target.value)}
                className={`w-full h-11 px-3.5 rounded-xl border text-xs text-slate-900 dark:text-white dark:bg-zinc-800 focus:outline-none transition-all font-mono font-bold ${
                  fieldErrors.end_time
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 focus:border-blue-500'
                }`}
              />
              {fieldErrors.end_time && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 text-rose-500 shrink-0" /> {fieldErrors.end_time}
                </p>
              )}
            </div>
          </div>

          {/* Real-time Conflict Alert Box */}
          {checkingConflict && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
              <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
              <span>{t('fleet.slots.collision_check_msg')}</span>
            </div>
          )}

          {conflictWarning?.hasConflict && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 space-y-1 animate-fadeIn">
              <div className="font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <FleetIcons.Alert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                Scheduling Conflict Detected!
              </div>
              <p>{conflictWarning.message}</p>
              {conflictWarning.conflictingSlot && (
                <div className="mt-2 text-[11px] text-rose-700 dark:text-rose-400 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                  Existing Slot: <strong>{conflictWarning.conflictingSlot.slot_name}</strong> ({conflictWarning.conflictingSlot.start_time} - {conflictWarning.conflictingSlot.end_time}) on <strong>{conflictWarning.conflictingSlot.operating_days}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Operating Days & Recurrence */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                3. Operating Days & Recurrence
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Select which days of the week this slot schedule executes
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setDaysPreset('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  formData.operating_days === 'ALL'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                All 7 Days
              </button>
              <button
                type="button"
                onClick={() => setDaysPreset('WEEKDAYS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  formData.operating_days === 'Mon,Tue,Wed,Thu,Fri'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Mon - Fri
              </button>
              <button
                type="button"
                onClick={() => setDaysPreset('WEEKENDS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  formData.operating_days === 'Sat,Sun'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                Weekends
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {WEEK_DAYS.map((day) => {
              const isActive = formData.operating_days === 'ALL' || formData.operating_days.split(',').map((d) => d.trim()).includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`w-12 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                  }`}
                >
                  <span>{day.label}</span>
                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Operational Status & Dispatch Notes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              4. Operational Status & Dispatch Notes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Slot Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
              >
                <option value="active">{t('fleet.slots.status_active_scheduled')}</option>
                <option value="paused">{t('fleet.slots.status_paused_suspended')}</option>
                <option value="in_transit">{t('fleet.slots.status_in_transit')}</option>
                <option value="inactive">{t('fleet.slots.status_inactive_draft')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Custom Slot Label <span className="text-slate-400 font-normal">{t('fleet.slots.opt_auto_gen')}</span>
              </label>
              <input
                type="text"
                placeholder={t('fleet.slots.name_ph')}
                value={formData.slot_name}
                onChange={(e) => handleFieldChange('slot_name', e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div className="col-span-full space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Dispatch & Crew Notes
              </label>
              <textarea
                rows={3}
                placeholder={t('fleet.slots.notes_ph')}
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 pb-6">
          <Link
            to={basePath}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || checkingConflict || conflictWarning?.hasConflict}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 border-t-transparent animate-spin" />
                <span>{t('fleet.slots.saving_schedule')}</span>
              </>
            ) : (
              <>
                <FleetIcons.Check className="w-4 h-4" />
                <span>{isEditMode ? 'Update Slot Schedule' : 'Confirm & Schedule Slot'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleSlotPage;

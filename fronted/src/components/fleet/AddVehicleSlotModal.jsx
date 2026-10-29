import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { useVehicleSlot } from '../../hooks/fleet/useVehicleSlot';
import { fleetVehicleService } from '../../api/services/fleet/vehicle.service';
import { fleetRouteService } from '../../api/services/fleet/route.service';
import { fleetDriverService } from '../../api/services/fleet/driver.service';

const SHIFT_OPTIONS = [
  { id: 'morning_peak', label: 'Morning Peak', desc: '07:00 - 11:30 Rush Hours' },
  { id: 'regular_day', label: 'Regular Day', desc: '11:30 - 16:30 Normal Transit' },
  { id: 'evening_peak', label: 'Evening Peak', desc: '16:30 - 20:30 Commuter Rush' },
  { id: 'night_shuttle', label: 'Night Shuttle', desc: '20:30 - 00:00 Late Night' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const AddVehicleSlotModal = ({ isOpen, onClose, slotData = null, onSaved }) => {
  const { createSlot, updateSlot, checkConflict, saving } = useVehicleSlot();

  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routeVehicles, setRouteVehicles] = useState([]);
  const [loadingRouteVehicles, setLoadingRouteVehicles] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  const [formData, setFormData] = useState({
    slot_name: '',
    vehicle_id: '',
    route_id: '',
    driver_id: '',
    shift_type: 'morning_peak',
    start_time: '08:00',
    end_time: '11:30',
    operating_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    headway_minutes: 15,
    status: 'active',
    notes: '',
  });

  const [conflictWarning, setConflictWarning] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const conflictTimerRef = useRef(null);

  // Load resource dropdowns
  useEffect(() => {
    if (!isOpen) return;

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
        console.error('Failed to load slot form resources:', err);
      } finally {
        if (mounted) setLoadingResources(false);
      }
    };

    fetchResources();
    return () => { mounted = false; };
  }, [isOpen]);

  // Populate formData if editing existing slot
  useEffect(() => {
    if (slotData) {
      setFormData({
        slot_name: slotData.slot_name || '',
        vehicle_id: String(slotData.vehicle_id || ''),
        route_id: String(slotData.route_id || ''),
        driver_id: slotData.driver_id ? String(slotData.driver_id) : '',
        shift_type: slotData.shift_type || 'morning_peak',
        start_time: String(slotData.start_time || '08:00').substring(0, 5),
        end_time: String(slotData.end_time || '11:30').substring(0, 5),
        operating_days: slotData.operating_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
        headway_minutes: slotData.headway_minutes || 15,
        status: slotData.status || 'active',
        notes: slotData.notes || '',
      });
      setConflictWarning(null);
    } else {
      setFormData({
        slot_name: '',
        vehicle_id: '',
        route_id: '',
        driver_id: '',
        shift_type: 'morning_peak',
        start_time: '08:00',
        end_time: '11:30',
        operating_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
        headway_minutes: 15,
        status: 'active',
        notes: '',
      });
      setConflictWarning(null);
    }
  }, [slotData, isOpen]);

  // Dynamically load vehicles assigned to selected route
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

        if (slotData && formData.vehicle_id && !mergedMap.has(String(formData.vehicle_id))) {
          const cur = vehicles.find((v) => String(v.id) === String(formData.vehicle_id));
          if (cur) mergedMap.set(String(cur.id), cur);
        }

        const validVehicles = Array.from(mergedMap.values());
        setRouteVehicles(validVehicles);

        setFormData((prev) => {
          if (prev.vehicle_id && !validVehicles.some((v) => String(v.id) === String(prev.vehicle_id))) {
            return { ...prev, vehicle_id: '' };
          }
          return prev;
        });
      } catch (err) {
        console.error('Failed to load route vehicles:', err);
      } finally {
        if (mounted) setLoadingRouteVehicles(false);
      }
    };

    loadRouteVehicles();
    return () => { mounted = false; };
  }, [formData.route_id, slotData, vehicles]);

  // Real-time conflict validation
  useEffect(() => {
    if (!formData.vehicle_id || !formData.start_time || !formData.end_time) {
      setConflictWarning(null);
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setConflictWarning({ message: 'End time must be after start time' });
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
          exclude_id: slotData?.id || null,
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
    }, 400);

    return () => {
      if (conflictTimerRef.current) clearTimeout(conflictTimerRef.current);
    };
  }, [formData.vehicle_id, formData.start_time, formData.end_time, formData.operating_days, slotData, checkConflict]);

  if (!isOpen) return null;

  const toggleDay = (day) => {
    let currentDays = formData.operating_days === 'ALL'
      ? [...WEEK_DAYS]
      : formData.operating_days.split(',').map((d) => d.trim()).filter(Boolean);

    if (currentDays.includes(day)) {
      currentDays = currentDays.filter((d) => d !== day);
    } else {
      currentDays.push(day);
    }

    setFormData({
      ...formData,
      operating_days: currentDays.length === 7 ? 'ALL' : currentDays.join(','),
    });
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return null;
    const [sh, sm] = formData.start_time.split(':').map(Number);
    const [eh, em] = formData.end_time.split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) return 'Invalid timing';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m` : ''}`.trim() || '0m';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_id) {
      toast.error('Please select a vehicle');
      return;
    }
    if (!formData.route_id) {
      toast.error('Please select a transit route');
      return;
    }
    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return;
    }
    if (conflictWarning?.hasConflict) {
      toast.error('Cannot save: Time slot conflicts with an existing schedule');
      return;
    }

    try {
      const payload = {
        ...formData,
        vehicle_id: Number(formData.vehicle_id),
        route_id: Number(formData.route_id),
        driver_id: formData.driver_id ? Number(formData.driver_id) : null,
      };

      if (slotData?.id) {
        await updateSlot(slotData.id, payload);
        toast.success('Vehicle slot updated successfully!');
      } else {
        await createSlot(payload);
        toast.success('Vehicle slot scheduled successfully!');
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to save vehicle slot');
    }
  };

  const isDaysAll = formData.operating_days === 'ALL';
  const activeDaysList = isDaysAll ? WEEK_DAYS : formData.operating_days.split(',').map((d) => d.trim());

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/80">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FleetIcons.Speed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{slotData ? 'Edit Vehicle Route Slot' : 'Schedule Vehicle Route Slot'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Assign daily operating time window, route corridor, and shift driver for transit screens.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
          >
            <FleetIcons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Slot Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Slot Title / Description (Optional)
            </label>
            <input
              type="text"
              value={formData.slot_name}
              onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
              placeholder="e.g. Morning Peak Corridor Run #1"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Route & Vehicle Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Route Selector (FIRST) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Transit Route Corridor *
              </label>
              <select
                required
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                disabled={loadingResources}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose Route --</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.start_point} ➔ {r.end_point})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Vehicle Selector (SECOND) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Assign Vehicle (Bus) *
              </label>
              <select
                required
                value={formData.vehicle_id}
                onChange={(e) => {
                  const vId = e.target.value;
                  const selectedVeh = routeVehicles.find((v) => String(v.id) === String(vId)) || vehicles.find((v) => String(v.id) === String(vId));
                  setFormData({
                    ...formData,
                    vehicle_id: vId,
                    driver_id: selectedVeh?.assigned_driver_id && !formData.driver_id ? String(selectedVeh.assigned_driver_id) : formData.driver_id,
                  });
                }}
                disabled={!formData.route_id || loadingRouteVehicles || routeVehicles.length === 0}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {!formData.route_id ? (
                  <option value="">-- Select Route First --</option>
                ) : loadingRouteVehicles ? (
                  <option value="">Loading assigned buses...</option>
                ) : routeVehicles.length === 0 ? (
                  <option value="">-- No Buses Assigned to Route --</option>
                ) : (
                  <>
                    <option value="">-- Choose Bus ({routeVehicles.length} available) --</option>
                    {routeVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.bus_number} ({v.model || v.vehicle_type || 'Bus'} · {v.capacity || '42S'})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {formData.route_id && !loadingRouteVehicles && routeVehicles.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <FleetIcons.Alert className="w-3.5 h-3.5 shrink-0" />
                  <span>No approved buses assigned to this route. Please assign a vehicle under Transit Routes first.</span>
                </p>
              )}
            </div>
          </div>

          {/* Assigned Driver & Shift Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                On-Duty Driver (Optional)
              </label>
              <select
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                disabled={loadingResources}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Unassigned / Any Relief Driver --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.emp_id ? `(#${d.emp_id})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Shift Type
              </label>
              <select
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SHIFT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} ({opt.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operating Time Window */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FleetIcons.Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Slot Time Window</span>
              </span>
              {calculateDuration() && (
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Total Duration: {calculateDuration()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  Start Departure Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                  End / Arrival Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Conflict Warning Box */}
          {conflictWarning?.hasConflict && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl space-y-1 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-red-800 dark:text-red-400 text-xs font-bold">
                <FleetIcons.Alert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Time Slot Conflict Detected!</span>
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-300">
                {conflictWarning.message}
              </p>
              <div className="text-[10px] text-red-600 dark:text-red-400 font-medium pt-0.5">
                Please pick a different time window or select another available bus.
              </div>
            </div>
          )}

          {checkingConflict && (
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Checking schedule conflicts across fleet roster...</span>
            </div>
          )}

          {/* Operating Days of Week */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Operating Days
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, operating_days: isDaysAll ? 'Mon,Tue,Wed,Thu,Fri' : 'ALL' })}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isDaysAll ? 'Weekdays Only' : 'Select All Days'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const isSelected = activeDaysList.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || conflictWarning?.hasConflict}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <FleetIcons.Check className="w-4 h-4 text-white" />
            <span>{saving ? 'Scheduling...' : slotData ? 'Save Changes' : 'Schedule Slot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleSlotModal;

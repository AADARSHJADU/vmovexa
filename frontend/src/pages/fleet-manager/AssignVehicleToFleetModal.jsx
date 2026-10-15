import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';

export const AssignVehicleToFleetModal = ({ isOpen, onClose, fleet }) => {
  const navigate = useNavigate();
  const { vehicles, loadVehicles, createVehicle, updateVehicle, assignDriver, assignGps } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();
  const { devices, loadDevices } = useFleetGps();

  // Mode: 'select' (existing vehicle) or 'create' (new vehicle)
  const [vehicleMode, setVehicleMode] = useState('create');

  useEffect(() => {
    if (!isOpen) return;
    loadVehicles().catch(() => {});
    loadDrivers().catch(() => {});
    loadDevices().catch(() => {});
  }, [isOpen, loadVehicles, loadDrivers, loadDevices]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [newVehicleData, setNewVehicleData] = useState({
    plate: '',
    model: 'Volvo B400 Electric',
    type: 'Electric Bus',
    capacity: '42 Seater',
    fuelType: 'Electric (EV)',
    year: '2024',
  });

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedGpsId, setSelectedGpsId] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('Indiranagar - Kempegowda Majestic Corridor');
  const [shiftTime, setShiftTime] = useState('Morning Shift (06:00 AM - 02:00 PM)');

  const [submittedToast, setSubmittedToast] = useState(false);

  useEffect(() => {
    if (!selectedVehicleId && vehicleList.length > 0) setSelectedVehicleId(String(vehicleList[0].id));
  }, [vehicleList, selectedVehicleId]);
  useEffect(() => {
    if (!selectedDriverId && driverList.length > 0) setSelectedDriverId(String(driverList[0].id));
  }, [driverList, selectedDriverId]);
  useEffect(() => {
    if (!selectedGpsId && gpsList.length > 0) setSelectedGpsId(String(gpsList[0].id));
  }, [gpsList, selectedGpsId]);

  if (!isOpen) return null;

  const currentFleetName = fleet?.name || '—';
  const currentFleetId = fleet?.id || '';

  const selectedDriver = driverList.find(d => String(d.id) === String(selectedDriverId));
  const selectedGps = gpsList.find(g => String(g.id) === String(selectedGpsId));
  const selectedExistingVehicle = vehicleList.find(v => String(v.id) === String(selectedVehicleId));

  const activePlate = vehicleMode === 'create'
    ? newVehicleData.plate
    : (selectedExistingVehicle?.bus_number ?? selectedExistingVehicle?.code ?? '');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (vehicleMode === 'create') {
      if (!newVehicleData.plate) return;
      try {
        const created = await toast.promise(
          createVehicle({
            bus_number: newVehicleData.plate,
            model: newVehicleData.model,
            vehicle_type: newVehicleData.type,
            capacity: newVehicleData.capacity,
            fuel_type: newVehicleData.fuelType,
            year: newVehicleData.year,
            fleet_id: currentFleetId || null,
            assigned_route: assignedRoute,
          }),
          { loading: 'Saving...', success: 'Vehicle bound to fleet', error: (err) => err?.message || 'Failed to create vehicle' }
        );
        if (created?.id && selectedDriverId) await assignDriver(created.id, selectedDriverId).catch(() => {});
        if (created?.id && selectedGpsId) await assignGps(created.id, selectedGpsId).catch(() => {});
        await loadVehicles().catch(() => {});
      } catch {
        return;
      }
    } else {
      if (!selectedExistingVehicle?.id) return;
      try {
        await toast.promise(
          updateVehicle(selectedExistingVehicle.id, { fleet_id: currentFleetId }),
          { loading: 'Allocating vehicle to fleet...', success: 'Vehicle allocated to fleet successfully!', error: (err) => err?.message || 'Failed to allocate vehicle' }
        );
        if (selectedDriverId) await assignDriver(selectedExistingVehicle.id, selectedDriverId).catch(() => {});
        if (selectedGpsId) await assignGps(selectedExistingVehicle.id, selectedGpsId).catch(() => {});
        await loadVehicles().catch(() => {});
      } catch {
        return;
      }
    }

    setSubmittedToast(true);
    setTimeout(() => {
      setSubmittedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase font-mono">
                {currentFleetId}
              </span>
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs font-bold text-slate-600">{currentFleetName}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Assign & Bind Vehicle to Fleet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Bind a vehicle, assign an authorized driver, and link IoT GPS hardware to complete this fleet operational unit.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors shrink-0"
          >
            <FleetIcons.Close className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast Overlay if submitted */}
        {submittedToast ? (
          <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <FleetIcons.Check className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-black text-emerald-900">Vehicle Unit Successfully Bound!</h3>
            <p className="text-xs text-emerald-700">
              Vehicle <strong>{activePlate}</strong>, Driver <strong>{selectedDriver?.name}</strong>, and GPS <strong>{selectedGps?.id}</strong> have been allocated to <strong>{currentFleetName}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Vehicle Unit Selection / Registration */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Step 1: Vehicle Unit
                  </h3>
                </div>

                {/* Mode Switcher Pills */}
                <div className="flex items-center p-1 rounded-xl bg-slate-200/80 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setVehicleMode('create')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      vehicleMode === 'create' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    + Register New
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleMode('select')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      vehicleMode === 'select' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Select Existing
                  </button>
                </div>
              </div>

              {vehicleMode === 'create' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Vehicle License Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA04MN9876"
                      value={newVehicleData.plate}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, plate: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Vehicle Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Volvo B400 Electric"
                      value={newVehicleData.model}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Vehicle Type</label>
                    <select
                      value={newVehicleData.type}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, type: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Electric Bus">Electric Bus (Intracity)</option>
                      <option value="Luxury Coach">Luxury Coach (Intercity)</option>
                      <option value="Mini Shuttle">Mini Shuttle</option>
                      <option value="School Bus">School Bus</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Fuel & Power</label>
                    <select
                      value={newVehicleData.fuelType}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, fuelType: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Electric (EV)">Electric (EV Battery)</option>
                      <option value="CNG Clean Fuel">CNG Clean Fuel</option>
                      <option value="Diesel BS-VI">Diesel BS-VI</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-700">Choose Registered Vehicle</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {vehicleList.length === 0 && <option value="">No vehicles</option>}
                    {vehicleList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {(v.bus_number ?? v.code ?? v.id)} — {v.vehicle_type ?? '—'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Step 2: Driver & GPS Binding Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Driver Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Step 2: Assign Driver
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Authorized Driver Profile</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {driverList.length === 0 && <option value="">No drivers</option>}
                    {driverList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name ?? '—'} ({d.emp_id ?? d.code ?? 'Licensed'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDriver && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2.5">
                    <FleetIcons.Driver className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{selectedDriver.name ?? '—'}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FleetIcons.Phone className="w-3 h-3 text-slate-400" />
                        <span>{selectedDriver.phone ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GPS Hardware Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step 3: Link GPS Device
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-300">Hardware Telematics Unit</label>
                  <select
                    value={selectedGpsId}
                    onChange={(e) => setSelectedGpsId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {gpsList.length === 0 && <option value="">No devices</option>}
                    {gpsList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {(g.code ?? g.id)} ({g.model || '4G LTE'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGps && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 flex items-center gap-2.5">
                    <FleetIcons.Gps className="w-4 h-4 text-slate-500 dark:text-zinc-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{selectedGps.code ?? selectedGps.id}</div>
                      <div>Signal: {selectedGps.signal ?? '—'} • Battery: {selectedGps.battery ?? '—'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Route Corridor (Optional) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Assigned Transit Corridor & Shift</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="e.g. Indiranagar - Kempegowda Majestic Corridor"
                  value={assignedRoute}
                  onChange={(e) => setAssignedRoute(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="e.g. Morning Shift (06:00 AM - 02:00 PM)"
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Live Operational Unit Deployment Summary Pill */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <FleetIcons.CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Ready to Deploy Fleet Unit</span>
                </div>
                <div className="text-blue-700 dark:text-blue-400 font-medium flex items-center flex-wrap gap-1">
                  <span>{currentFleetName}</span>
                  <FleetIcons.ArrowRight className="w-3 h-3 text-blue-500" />
                  <strong>{activePlate}</strong> + <strong>{selectedDriver?.name}</strong> + <strong>{selectedGps?.id}</strong>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] shrink-0 self-start sm:self-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Status: Ready</span>
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/fleet-manager/vehicles/add?fleetId=${currentFleetId}`);
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Open Full 5-Step Visual Screen</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <FleetIcons.Check className="w-4 h-4 text-white" />
                  <span>Submit & Complete Fleet Unit</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';

export const AssignFleetVehiclePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { fleets, loadFleets } = useFleetManager();
  const { vehicles, loadVehicles, createVehicle, assignDriver, assignGps } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();
  const { devices, loadDevices } = useFleetGps();

  useEffect(() => { loadFleets().catch(() => {}); }, [loadFleets]);
  useEffect(() => { loadVehicles().catch(() => {}); }, [loadVehicles]);
  useEffect(() => { loadDrivers().catch(() => {}); }, [loadDrivers]);
  useEffect(() => { loadDevices().catch(() => {}); }, [loadDevices]);

  const fleetList = Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []);
  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const fleet = fleetList.find(f => String(f.id) === String(id)) || { id };

  // Mode: 'create' (register new vehicle) or 'select' (existing vehicle)
  const [vehicleMode, setVehicleMode] = useState('create');

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [newVehicleData, setNewVehicleData] = useState({
    plate: '',
    model: 'Volvo B400 Electric',
    type: 'Electric Bus',
    capacity: '42 Seater',
    fuelType: 'Electric (EV)',
    year: '',
  });

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedGpsId, setSelectedGpsId] = useState('');
  const [assignedRoute, setAssignedRoute] = useState('Indiranagar - Kempegowda Majestic Corridor');
  const [operatingDepot, setOperatingDepot] = useState('Indiranagar Central Depot');
  const [shiftTime, setShiftTime] = useState('Morning Shift (06:00 AM - 02:00 PM)');

  const [driverSearch, setDriverSearch] = useState('');
  const [gpsSearch, setGpsSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const selectedDriver = driverList.find(d => String(d.id) === String(selectedDriverId));
  const selectedGps = gpsList.find(g => String(g.id) === String(selectedGpsId));
  const selectedExistingVehicle = vehicleList.find(v => String(v.id) === String(selectedVehicleId));

  const activePlate = vehicleMode === 'create'
    ? newVehicleData.plate
    : (selectedExistingVehicle?.bus_number ?? selectedExistingVehicle?.code ?? '');

  // Filtered lists for quick selection
  const filteredDrivers = driverList.filter(d =>
    String(d.name || '').toLowerCase().includes(driverSearch.toLowerCase()) ||
    (d.emp_id && String(d.emp_id).toLowerCase().includes(driverSearch.toLowerCase()))
  );

  const filteredGps = gpsList.filter(g =>
    String(g.code || g.id || '').toLowerCase().includes(gpsSearch.toLowerCase()) ||
    (g.model && String(g.model).toLowerCase().includes(gpsSearch.toLowerCase()))
  );

  const filteredVehicles = vehicleList.filter(v =>
    String(v.bus_number || v.code || '').toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    String(v.vehicle_type || '').toLowerCase().includes(vehicleSearch.toLowerCase())
  );

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
            fleet_id: fleet.id || null,
            assigned_route: assignedRoute,
            location: operatingDepot,
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
        if (selectedDriverId) await assignDriver(selectedExistingVehicle.id, selectedDriverId).catch(() => {});
        if (selectedGpsId) await assignGps(selectedExistingVehicle.id, selectedGpsId).catch(() => {});
        toast('Fleet re-assignment coming soon');
        await loadVehicles().catch(() => {});
      } catch {
        return;
      }
    }

    setSubmitted(true);
    setTimeout(() => {
      navigate(`/fleet-operator/fleets/${fleet.id}`);
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Header Banner & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Fleet Operators', path: '/fleet-operator/fleets' },
            { label: fleet.name || `Fleet #${fleet.id}`, path: `/fleet-operator/fleets/${fleet.id}` },
            { label: 'Assign & Bind Vehicle' },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(`/fleet-operator/fleets/${fleet.id}`)} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={t('fleet.assign.back_details')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Assign & Bind Vehicle to {fleet.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Allocate a vehicle along with an authorized driver and IoT GPS telematics hardware to complete this fleet unit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => navigate(`/fleet-operator/fleets/${fleet.id}`)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{submitted ? 'Vehicle Bound!' : 'Submit & Complete Fleet Unit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Full-Width 2-Column Responsive Web Form Grid */}
      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Allocation Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Vehicle Unit Selection / Registration */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step 1: Vehicle Unit Allocation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.assign.choose_asset_desc')}</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setVehicleMode('create')}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vehicleMode === 'create' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  + Register New Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleMode('select')}
                  className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vehicleMode === 'select' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Select Registered Vehicle
                </button>
              </div>
            </div>

            {vehicleMode === 'create' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {t('fleet.assign.plate_number')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('fleet.assign.plate_placeholder')}
                    value={newVehicleData.plate}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, plate: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                    {t('fleet.assign.vehicle_model')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('fleet.assign.model_placeholder')}
                    value={newVehicleData.model}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, model: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.vehicle_type')}</label>
                  <select
                    value={newVehicleData.type}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, type: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Electric Bus">{t('fleet.assign.type_electric_bus')}</option>
                    <option value="Luxury Coach">{t('fleet.assign.type_luxury_coach')}</option>
                    <option value="Mini Shuttle">{t('fleet.assign.type_mini_shuttle')}</option>
                    <option value="School Bus">{t('fleet.assign.type_school_bus')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.passenger_cap')}</label>
                  <select
                    value={newVehicleData.capacity}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, capacity: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="42 Seater">{t('fleet.assign.cap_42')}</option>
                    <option value="52 Seater">{t('fleet.assign.cap_52')}</option>
                    <option value="32 Seater">{t('fleet.assign.cap_32')}</option>
                    <option value="24 Seater">{t('fleet.assign.cap_24')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.fuel_system')}</label>
                  <select
                    value={newVehicleData.fuelType}
                    onChange={(e) => setNewVehicleData({ ...newVehicleData, fuelType: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Electric (EV)">{t('fleet.assign.fuel_ev')}</option>
                    <option value="CNG Clean Fuel">{t('fleet.assign.fuel_cng')}</option>
                    <option value="Diesel BS-VI">{t('fleet.assign.fuel_diesel')}</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('fleet.assign.filter_vehicles_ph')}
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {filteredVehicles.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedVehicleId === v.id
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 flex items-center justify-center shrink-0">
                          <FleetIcons.Bus className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">{v.bus_number ?? v.code ?? v.id}</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">{v.vehicle_type ?? '—'} • {v.fuel_type ?? '—'}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedVehicleId === v.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-zinc-600'
                      }`}>
                        {selectedVehicleId === v.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Driver & GPS Hardware Binding Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Driver Allocation Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step 2: Assign Driver
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                  {driverList.length} Available
                </span>
              </div>

              <input
                type="text"
                placeholder={t('fleet.assign.search_driver_ph')}
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {filteredDrivers.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriverId(d.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDriverId === d.id
                        ? 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-700 border border-white dark:border-zinc-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-zinc-300">
                        {(d.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{d.name ?? '—'}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">ID: {d.emp_id ?? d.code ?? '—'} • {d.phone ?? '—'}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedDriverId === d.id ? 'border-purple-600 bg-purple-600' : 'border-slate-300 dark:border-zinc-600'
                    }`}>
                      {selectedDriverId === d.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GPS Hardware Binding Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Step 3: Link GPS Device
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                  {gpsList.length} Hardware Units
                </span>
              </div>

              <input
                type="text"
                placeholder={t('fleet.assign.search_gps_ph')}
                value={gpsSearch}
                onChange={(e) => setGpsSearch(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
              />

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {filteredGps.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGpsId(g.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedGpsId === g.id
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-xs shrink-0">
                        <FleetIcons.Gps className="w-4 h-4 text-slate-600 dark:text-zinc-300" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">{g.code ?? g.id}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">{g.model || 'Teltonika FMB920'} • 4G LTE</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedGpsId === g.id ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 dark:border-zinc-600'
                    }`}>
                      {selectedGpsId === g.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Route Corridor & {t('fleet.assign.operating_depot')} */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Step 4: Operational Route & Transit Schedule
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.assign.route_shift_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.assigned_route')}</label>
                <input
                  type="text"
                  value={assignedRoute}
                  onChange={(e) => setAssignedRoute(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.operating_depot')}</label>
                <input
                  type="text"
                  value={operatingDepot}
                  onChange={(e) => setOperatingDepot(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.assign.shift_schedule')}</label>
                <select
                  value={shiftTime}
                  onChange={(e) => setShiftTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Morning Shift (06:00 AM - 02:00 PM)">{t('fleet.assign.shift_morning')}</option>
                  <option value="Evening Shift (02:00 PM - 10:00 PM)">{t('fleet.assign.shift_evening')}</option>
                  <option value="Night Express Shift (10:00 PM - 06:00 AM)">{t('fleet.assign.shift_night')}</option>
                  <option value="Full Day 24/7 Rotational">{t('fleet.assign.shift_fullday')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Fleet Context, Deployment Preview & Action Card */}
        <div className="space-y-6">
          
          {/* Target Fleet Hero Card */}
          <div className="p-6 rounded-2xl bg-slate-900 dark:bg-zinc-950 text-white border border-slate-800 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                {t('fleet.assign.target_fleet_group')}
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 text-[10px] font-bold text-emerald-400">
                ● {t('common.active_fleet')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 dark:bg-zinc-850 border border-slate-700 dark:border-zinc-700 flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                <FleetIcons.Bus className="w-6 h-6 text-slate-300" />
              </div>
              <div>
                <div className="text-base font-black text-white">{fleet.name}</div>
                <div className="text-xs text-slate-400 font-mono">ID: {fleet.id}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 dark:bg-zinc-900/80 border border-slate-700 dark:border-zinc-750 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('common.organization')}:</span>
                <span className="font-bold text-white truncate max-w-[160px]">{typeof fleet.organization === 'object' && fleet.organization !== null ? (fleet.organization.name || fleet.organization.code || '—') : (fleet.organization || '—')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t('fleet.assign.location_hub')}</span>
                <span className="font-bold text-white">{fleet.location || 'Bangalore'}</span>
              </div>
            </div>
          </div>

          {/* Live Deployment Unit Preview Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('fleet.assign.operational_unit_preview')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.assign.binding_summary')}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-750 flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('common.vehicle')}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{activePlate || t('common.none_selected')}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-750 flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('common.driver')}:</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">{selectedDriver?.name || t('common.unassigned')}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-750 flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400">{t('common.gps_device')}:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{selectedGps?.id || t('common.unlinked')}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <FleetIcons.Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('fleet.assign.ready_to_deploy')}</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                {t('fleet.assign.deploy_desc_all3')}
              </p>
            </div>
          </div>

          {/* Action Submission Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{submitted ? 'Submitted!' : 'Submit & Complete Fleet Allocation'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/fleet-operator/fleets/${fleet.id}`)}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel & Return to Fleet
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate(`/fleet-operator/vehicles/add?fleetId=${fleet.id}`)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{t('fleet.assign.open_wireframe')}</span>
                <FleetIcons.ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

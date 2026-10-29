import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { adminVehicleService } from '../../api/services/admin/vehicle.service';

export const AssignVehicleSection = ({ fleet, onAssigned, onCancel }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [search, setSearch] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all organization vehicles
  useEffect(() => {
    setLoadingVehicles(true);
    adminVehicleService
      .getVehicles({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
        setVehicles(list);
      })
      .catch((err) => {
        toast.error(err?.message || 'Failed to load vehicles from directory');
      })
      .finally(() => setLoadingVehicles(false));
  }, []);

  const fleetId = fleet?.id;
  const fleetName = fleet?.name || `Fleet #${fleetId}`;
  const fleetDepot = fleet?.depot?.name || fleet?.depot_name || (fleet?.depot_id ? `Depot #${fleet?.depot_id}` : 'General Depot');

  // Filter vehicles by search term and unassigned toggle
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const busNum = String(v.bus_number || v.busNumber || v.code || '').toLowerCase();
      const model = String(v.model || v.vehicle_type || '').toLowerCase();
      const depot = String(v.depot?.name || v.depot_name || '').toLowerCase();
      const vin = String(v.vin || v.chassis_number || '').toLowerCase();

      const matchesSearch = !q || busNum.includes(q) || model.includes(q) || depot.includes(q) || vin.includes(q);
      const isUnassigned = !v.fleet_id;

      if (onlyUnassigned) {
        return matchesSearch && isUnassigned;
      }
      return matchesSearch;
    });
  }, [vehicles, search, onlyUnassigned]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => String(v.id) === String(selectedVehicleId));
  }, [vehicles, selectedVehicleId]);

  const isAlreadyAssigned = selectedVehicle && Number(selectedVehicle.fleet_id) === Number(fleetId);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle to assign.');
      return;
    }

    if (isAlreadyAssigned) {
      toast.error('This vehicle is already assigned to this fleet.');
      return;
    }

    setSubmitting(true);
    const busPlate = selectedVehicle?.bus_number || selectedVehicle?.code || `Vehicle #${selectedVehicleId}`;

    try {
      await toast.promise(
        adminVehicleService.updateVehicle(selectedVehicleId, { fleet_id: Number(fleetId) }),
        {
          loading: `Assigning vehicle ${busPlate} to ${fleetName}...`,
          success: `Vehicle ${busPlate} successfully assigned to ${fleetName}!`,
          error: (err) => err?.message || 'Failed to assign vehicle',
        }
      );

      if (onAssigned) {
        onAssigned(selectedVehicleId);
      }
    } catch {
      // Toast handles error display
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-blue-500/20 shrink-0">
            <FleetIcons.Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                Target: {fleetName}
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                {fleetDepot}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Select & Assign Vehicle to Fleet
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Choose an available transit vehicle from the organization directory to bind under <strong>{fleetName}</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>←</span>
          <span>Back to Assigned Vehicles</span>
        </button>
      </div>

      {/* 2. Main Content Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
                <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
              </span>
              <input
                type="text"
                placeholder="Search by registration plate (e.g. KA-01, MH-12), model, depot, VIN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                autoFocus
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-zinc-300 select-none bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 h-11 rounded-xl shrink-0 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={onlyUnassigned}
                onChange={(e) => setOnlyUnassigned(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-zinc-600"
              />
              <span>Unassigned Only</span>
            </label>
          </div>

          {/* Quick Select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider block">
              Quick Selection Dropdown:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all cursor-pointer"
            >
              <option value="">-- Click to choose a vehicle from the roster --</option>
              {filteredVehicles.map((v) => {
                const plate = v.bus_number || v.busNumber || v.code;
                const model = v.model || v.vehicle_type || 'Standard Bus';
                const isCurrent = Number(v.fleet_id) === Number(fleetId);
                const tag = isCurrent
                  ? ' [Already In This Fleet]'
                  : v.fleet_id
                  ? ` [In Fleet #${v.fleet_id}]`
                  : ' [Available / Unassigned]';
                return (
                  <option key={v.id} value={v.id}>
                    {plate} — {model} ({v.status || 'in_depot'}){tag}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* 3. Vehicle Cards Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Or Select Vehicle from Directory:
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              {filteredVehicles.length} vehicles found
            </span>
          </div>

          {loadingVehicles ? (
            <div className="p-12 text-center text-xs text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800 animate-pulse">
              Loading vehicles directory...
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 space-y-2">
              <p className="font-bold text-slate-700 dark:text-zinc-200 text-sm">No vehicles match your search.</p>
              <p className="text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">
                Try searching with a different registration plate or uncheck "Unassigned Only" to see all vehicles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredVehicles.map((v) => {
                const isSelected = String(v.id) === String(selectedVehicleId);
                const isCurrent = Number(v.fleet_id) === Number(fleetId);
                const busPlate = v.bus_number || v.busNumber || v.code;
                const depotName = v.depot?.name || v.depot_name || (v.depot_id ? `Depot #${v.depot_id}` : null);
                const driverName = v.driver?.name || (v.assigned_driver_id ? `Driver #${v.assigned_driver_id}` : null);
                const routeName = v.assigned_route || (v.route_id ? `Route #${v.route_id}` : null);

                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(String(v.id))}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {busPlate}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                            {v.model || v.vehicle_type || 'Standard Bus'} · {v.capacity || '42 Seater'}
                          </div>
                        </div>
                      </div>

                      {/* Fleet Status Badge */}
                      <div>
                        {isCurrent ? (
                          <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800 whitespace-nowrap">
                            Already In Fleet
                          </span>
                        ) : !v.fleet_id ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                            Available
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            Fleet #{v.fleet_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-zinc-800/60 rounded-lg border border-slate-100 dark:border-zinc-700/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Depot Base:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                          {depotName || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-zinc-500 block text-[10px]">Assigned Driver:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate block">
                          {driverName || 'Unassigned'}
                        </span>
                      </div>
                      {routeName && (
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-slate-400 dark:text-zinc-500 text-[10px]">Route: </span>
                          <span className="font-medium text-slate-700 dark:text-zinc-300">{routeName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Selected Vehicle Summary Banner */}
        {selectedVehicle && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-100">
            <div className="flex items-center gap-3">
              <FleetIcons.Pin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <div className="font-black text-blue-900 dark:text-blue-200 text-sm font-mono">
                  {selectedVehicle.bus_number || selectedVehicle.code}
                </div>
                <div className="text-blue-700 dark:text-blue-300 text-xs">
                  {selectedVehicle.model || 'Commercial Bus'} will be assigned to <strong>{fleetName}</strong>
                </div>
              </div>
            </div>

            {isAlreadyAssigned ? (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                Already In This Fleet
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Ready to Assign
              </span>
            )}
          </div>
        )}

        {/* 5. Action Footer */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel & Return
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedVehicleId || isAlreadyAssigned}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{submitting ? 'Assigning Vehicle...' : 'Confirm & Assign Vehicle to Fleet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { adminVehicleService } from '../../api/services/admin/vehicle.service';

export const AssignVehicleModal = ({ isOpen, onClose, fleet, onAssigned }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [search, setSearch] = useState('');
  const [onlyUnassigned, setOnlyUnassigned] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch all organization vehicles when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVehicleId('');
      setSearch('');
      setLoadingVehicles(true);
      adminVehicleService
        .getVehicles({ limit: 100 })
        .then((res) => {
          const list = Array.isArray(res) ? res : (res?.items || res?.rows || []);
          setVehicles(list);
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load vehicles');
        })
        .finally(() => setLoadingVehicles(false));
    }
  }, [isOpen]);

  const fleetId = fleet?.id;
  const fleetName = fleet?.name || `Fleet #${fleetId}`;

  // Filter vehicles by search term and unassigned toggle
  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      const busNum = String(v.bus_number || v.busNumber || v.code || '').toLowerCase();
      const model = String(v.model || v.vehicle_type || '').toLowerCase();
      const depot = String(v.depot?.name || v.depot_name || '').toLowerCase();
      const vin = String(v.vin || v.chassis_number || '').toLowerCase();

      const matchesSearch = !q || busNum.includes(q) || model.includes(q) || depot.includes(q) || vin.includes(q);
      const isAlreadyInThisFleet = Number(v.fleet_id) === Number(fleetId);
      const isUnassigned = !v.fleet_id;

      if (onlyUnassigned) {
        return matchesSearch && isUnassigned;
      }
      return matchesSearch;
    });
  }, [vehicles, search, onlyUnassigned, fleetId]);

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
      onClose();
    } catch {
      // Toast handles display
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-lg shrink-0">
              🚌
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Assign Vehicle to Fleet</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Fleet: <span className="font-bold text-blue-700">{fleetName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Search & Filter Controls */}
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <FleetIcons.Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search by plate number (e.g. KA-01, MH-12), model, depot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={onlyUnassigned}
                  onChange={(e) => setOnlyUnassigned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Show unassigned vehicles only</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                {filteredVehicles.length} vehicles found
              </span>
            </div>
          </div>

          {/* Quick Dropdown Selector */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Quick Select Dropdown:
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">-- Choose a Vehicle from List --</option>
              {filteredVehicles.map((v) => {
                const plate = v.bus_number || v.busNumber || v.code;
                const model = v.model || v.vehicle_type || 'Standard';
                const isCurrent = Number(v.fleet_id) === Number(fleetId);
                const statusTag = isCurrent
                  ? ' [Already In Fleet]'
                  : v.fleet_id
                    ? ` [Fleet #${v.fleet_id}]`
                    : ' [Unassigned]';
                return (
                  <option key={v.id} value={v.id}>
                    {plate} — {model} ({v.status || 'in_depot'}){statusTag}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Vehicles Scrollable List */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Or Click to Select:
            </label>

            {loadingVehicles ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100 animate-pulse">
                Loading available vehicles...
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                <p className="font-bold text-slate-700">No matching vehicles found</p>
                <p className="text-[11px] text-slate-400">Try changing your search query or unchecking "unassigned only".</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y-0">
                {filteredVehicles.map((v) => {
                  const isSelected = String(v.id) === String(selectedVehicleId);
                  const isCurrent = Number(v.fleet_id) === Number(fleetId);
                  const busPlate = v.bus_number || v.busNumber || v.code;
                  const depotName = v.depot?.name || v.depot_name || (v.depot_id ? `Depot #${v.depot_id}` : null);
                  const driverName = v.driver?.name || (v.assigned_driver_id ? `Driver #${v.assigned_driver_id}` : null);

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVehicleId(String(v.id))}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 font-mono text-xs">
                              {busPlate}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {v.model || v.vehicle_type || 'Commercial Bus'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            {depotName && <span>🏢 {depotName}</span>}
                            {driverName && <span>👤 {driverName}</span>}
                            <span className="capitalize">Status: {v.status || 'in_depot'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Fleet Allocation Badge */}
                      <div className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                            Already In Fleet
                          </span>
                        ) : !v.fleet_id ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            Fleet #{v.fleet_id}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Confirmation Box */}
          {selectedVehicle && (
            <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-between text-xs animate-in fade-in duration-100">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <div>
                  <span className="font-bold text-blue-900">
                    {selectedVehicle.bus_number || selectedVehicle.code}
                  </span>
                  <span className="text-blue-700 text-[11px] ml-1">
                    ({selectedVehicle.model || 'Bus'}) will be allocated to{' '}
                    <strong className="text-blue-950">{fleetName}</strong>
                  </span>
                </div>
              </div>
              {isAlreadyAssigned && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Already Assigned
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedVehicleId || isAlreadyAssigned}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{submitting ? 'Assigning Vehicle...' : 'Confirm & Assign Vehicle'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

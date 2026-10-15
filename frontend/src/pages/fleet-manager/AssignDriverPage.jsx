import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const AssignDriverPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, loadVehicles, assignDriver } = useFleetVehicle();
  const { drivers, loadDrivers } = useFleetDriver();

  useEffect(() => { loadVehicles().catch(() => {}); }, [loadVehicles]);
  useEffect(() => { loadDrivers().catch(() => {}); }, [loadDrivers]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);

  const targetVehicle = vehicleList.find(
    (v) => String(v.id) === String(id) || String(v.code) === String(id) || String(v.bus_number) === String(id)
  ) || {};

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Available'); // 'Available' or 'Assigned'
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const availableDrivers = driverList.filter(d => d.status === 'Available');
  const assignedDrivers = driverList.filter(d => d.status === 'Assigned');

  const currentList = activeTab === 'Available' ? availableDrivers : assignedDrivers;

  const filteredDrivers = currentList.filter(d => {
    const q = search.toLowerCase();
    return (d.name || '').toLowerCase().includes(q) ||
           (d.emp_id || '').toLowerCase().includes(q) ||
           (d.dl_number || '').toLowerCase().includes(q);
  });

  const nextRoute = `/fleet-manager/vehicles/${targetVehicle.id ?? id}/assign-gps`;

  const handleAssign = async () => {
    if (selectedDriverId && targetVehicle?.id) {
      try {
        await toast.promise(assignDriver(targetVehicle.id, selectedDriverId), {
          loading: 'Assigning...',
          success: 'Driver assigned',
          error: (err) => err?.message || 'Failed to assign driver',
        });
        await loadVehicles().catch(() => {});
      } catch {
        return; // stay on page so the user can retry
      }
    }
    // Navigate to next Step: Assign GPS Device
    navigate(nextRoute);
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
            { label: 'Vehicles Directory', path: '/fleet-manager/vehicles' },
            { label: targetVehicle.bus_number ?? targetVehicle.code ?? id },
            { label: 'Assign Driver' },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/fleet-manager/vehicles')} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Back to Vehicles"
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Assign Driver to Vehicle</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Select an authorized commercial driver from your roster to assign to this vehicle.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate(nextRoute)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Skip for Now →
            </button>
            <button
              type="button"
              onClick={handleAssign}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Driver className="w-4 h-4 text-white" />
              <span>Assign Driver &amp; Proceed</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Target Vehicle Summary Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-inner">
            <FleetIcons.Bus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Vehicle {targetVehicle.bus_number ?? targetVehicle.code ?? id}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 text-xs text-slate-500 dark:text-zinc-400 font-medium">
              <span>Type: <strong className="text-slate-700 dark:text-zinc-200 font-bold">{targetVehicle.vehicle_type ?? '—'}</strong></span>
              <span>•</span>
              <span>Fleet: <strong className="text-slate-700 dark:text-zinc-200 font-bold">{targetVehicle.fleet_id ?? '—'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-bold">
            Step 2 of 3: Crew Dispatch
          </span>
        </div>
      </div>

      {/* 3. Driver Selection & Search Grid */}
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Select Driver</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Choose an available driver to assign to this vehicle.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
              <FleetIcons.Search className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
            </span>
            <input
              type="text"
              placeholder="Search by name, employee ID or license number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('Available')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Available'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Available ({availableDrivers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Assigned')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'Assigned'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              Assigned ({assignedDrivers.length})
            </button>
          </div>
        </div>

        {/* Driver Roster Cards Grid */}
        <div className="space-y-3">
          {filteredDrivers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
              No {activeTab.toLowerCase()} drivers found matching &quot;{search}&quot;.
            </div>
          ) : (
            filteredDrivers.map((driver) => {
              const isSelected = selectedDriverId === driver.id;
              return (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriverId(driver.id)}
                  className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm'
                  }`}
                >
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-sm shrink-0 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-zinc-400">
                      {(driver.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{driver.name ?? '—'}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        <span>{driver.emp_id ?? driver.code ?? '—'}</span>
                        <span>•</span>
                        <span>{driver.dl_number ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center & Right: Expiry + Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">
                        License Type: <strong className="text-slate-800 dark:text-zinc-200">{driver.license_type ?? '—'}</strong>
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5 mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{driver.status ?? '—'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDriverId(driver.id);
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1.5">
                          <FleetIcons.Check className="w-3.5 h-3.5 text-white" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        'Assign'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Fallback Box */}
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FleetIcons.Profile className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Available Drivers?</h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Add a new driver to your personnel registry to assign this vehicle.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/fleet-manager/drivers/add?assignVehicle=${targetVehicle.id ?? id}`)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <FleetIcons.Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Driver</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(nextRoute)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Skip for Now
            </button>
          </div>
        </div>

        {/* Bottom CTA Action Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleAssign}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FleetIcons.Driver className="w-4 h-4 text-white" />
            <span>Assign Driver &amp; Proceed to GPS Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};


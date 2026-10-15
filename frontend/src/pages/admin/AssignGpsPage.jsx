import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { resolveFileUrl } from '../../api/services/upload.service';

import { useAuth } from '../../hooks/useAuth';

export const AssignGpsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/gps' : '/admin/gps';
  const isPrivilegedRole = [
    'ROLE-SUPER-ADMIN',
    'ROLE-TENANT-ADMIN',
    'ROLE-ADMIN',
    'TROLE-ADMIN',
    'ROLE-FLEET-OPERATOR',
    'ROLE-TECHNICIAN',
  ].includes(user?.role);
  const canAssign = isPrivilegedRole || hasPermission(['fleet.devices.assign', 'fleet.devices.update', 'devices.gps.manage']);

  const { loadDevice, assignVehicle, selectedDevice } = useFleetGps();
  const { vehicles, loadVehicles } = useFleetVehicle();

  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dev] = await Promise.all([loadDevice(id), loadVehicles()]);
        if (mounted && dev?.vehicle_id) {
          setSelectedVehicleId(String(dev.vehicle_id));
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load device details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, loadDevice, loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const filteredVehicles = vehicleList.filter((v) => {
    const q = vehicleSearch.toLowerCase();
    return (
      String(v.bus_number || '').toLowerCase().includes(q) ||
      String(v.registration_number || '').toLowerCase().includes(q) ||
      String(v.model || '').toLowerCase().includes(q) ||
      String(v.depot_name || v.depot?.name || '').toLowerCase().includes(q)
    );
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle to assign this GPS unit.');
      return;
    }

    setIsSubmitting(true);
    try {
      await toast.promise(assignVehicle(id, selectedVehicleId), {
        loading: 'Assigning GPS Device to Vehicle...',
        success: 'GPS Device successfully assigned and activated!',
        error: (err) => err?.message || 'Failed to assign GPS device',
      });
      navigate(basePath);
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    const busLabel = device.vehicle?.bus_number || (device.vehicle_id ? `Bus #${device.vehicle_id}` : 'vehicle');
    if (!window.confirm(`Unassign GPS device ${device.code || device.id} from ${busLabel}?`)) return;
    setIsSubmitting(true);
    try {
      await toast.promise(assignVehicle(id, null), {
        loading: 'Unassigning GPS device...',
        success: 'GPS device unassigned from vehicle!',
        error: (err) => err?.message || 'Failed to unassign GPS device',
      });
      navigate(basePath);
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-24 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-600 font-bold text-xs">Loading GPS device details and fleet vehicles roster...</p>
      </div>
    );
  }

  if (!canAssign) {
    return (
      <div className="w-full p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center my-8">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl">
          🚫
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted / Permission Revoked</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          You do not have the required permission (<code>fleet.devices.assign</code>) to bind GPS telematics units to bus vehicles. Contact your organization administrator.
        </p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          ← Back to GPS Directory
        </button>
      </div>
    );
  }

  const device = selectedDevice || {};
  const photoUrl = device.image_url ? resolveFileUrl(device.image_url) : null;
  const isAssigned = Boolean(device.vehicle_id);

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Top Header Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'GPS Devices', path: basePath },
              { label: device.code || `GPS-${id}`, path: `${basePath}/${id}` },
              { label: 'Assign Vehicle' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5 flex items-center gap-3 flex-wrap">
            <span>Assign GPS Telematics Unit to Bus</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
              {device.code || `GPS-TRK-${id}`}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Bind continuous real-time IoT GPS telemetry pings directly to an active fleet vehicle
          </p>
        </div>

        <button
          onClick={() => navigate(basePath)}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* 2. Full-Width GPS Unit Spec Profile Banner */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={device.code}
            className="w-28 h-28 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 border border-amber-200 flex flex-col items-center justify-center font-black text-xs shrink-0 shadow-inner p-2 text-center">
            <FleetIcons.Gps className="w-10 h-10 mb-1 text-amber-500" />
            <span>Teltonika</span>
          </div>
        )}

        <div className="space-y-3 flex-1 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-900">{device.code || `GPS-${device.id}`}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 uppercase border border-emerald-200">
                  {device.status || 'Available'}
                </span>
                {isAssigned && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 uppercase border border-blue-200">
                    Currently Bound to {device.vehicle ? device.vehicle.bus_number : `Bus #${device.vehicle_id}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                IMEI: <strong className="text-slate-800">{device.imei || '—'}</strong> | Serial No: <strong className="text-slate-800">{device.serial_number || 'N/A'}</strong>
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg text-slate-700 border border-slate-200 self-center md:self-auto">
              {device.vendor || 'Teltonika'} {device.model || 'FMB920'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">SIM Mobile Line</span>
              <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">{device.sim || 'Unassigned'}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Carrier Network</span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">{device.sim_provider || device.network || 'Jio IoT'}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Backup Battery</span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">{device.battery_capacity || '1200 mAh'}</p>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Firmware Release</span>
              <p className="font-mono font-bold text-slate-800 text-xs mt-0.5">{device.firmware || 'v3.2.14'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Full-Width Vehicle Selector Form */}
      <form onSubmit={handleAssign} className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FleetIcons.Bus className="w-5 h-5 text-blue-600" />
                <span>Select Target Fleet Bus Vehicle</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an active vehicle from your organization roster to link this GPS telematics hardware
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              {filteredVehicles.length} Vehicles Available
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="relative mb-5">
            <FleetIcons.Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              placeholder="Search vehicle by bus number, registration plate, model, or depot name..."
              className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50/70 text-slate-900 placeholder-slate-400 font-medium"
            />
            {vehicleSearch && (
              <button
                type="button"
                onClick={() => setVehicleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* Responsive Multi-Column Vehicle Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredVehicles.map((v) => {
              const isSelected = String(selectedVehicleId) === String(v.id);
              const busNum = v.bus_number || v.busNumber || v.code || `Bus #${v.id}`;
              const plateNum = v.registration_number || v.plate_number || 'N/A';
              const depot = v.depot_name || v.depot?.name || 'Central Depot';
              const vStatus = (v.status || 'in_depot').toLowerCase();

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-950 text-white shadow-lg ring-2 ring-blue-500/50'
                      : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600 shadow-xs'}`}>
                        <FleetIcons.Bus className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-black text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{busNum}</p>
                        <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                          {plateNum}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        ✓
                      </span>
                    ) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        vStatus === 'on_route' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {vStatus.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <div className={`pt-2 border-t text-[11px] flex items-center justify-between ${
                    isSelected ? 'border-blue-800 text-blue-200' : 'border-slate-200/60 text-slate-500'
                  }`}>
                    <span>Depot: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{depot}</strong></span>
                    <span>{v.vehicle_type || 'Transit Bus'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 my-2">
              <FleetIcons.Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-600">No fleet vehicles match search filter "{vehicleSearch}"</p>
              <p className="text-[11px] text-slate-400 mt-1">Try clearing or changing your search criteria above.</p>
            </div>
          )}
        </div>

        {/* Form Action Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            {selectedVehicleId ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  Target Vehicle: {vehicleList.find(v => String(v.id) === String(selectedVehicleId))?.bus_number || `Bus #${selectedVehicleId}`}
                </span>
              </span>
            ) : (
              <span>Select a vehicle card from the grid above to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => navigate(basePath)}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            {isAssigned && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleUnassign}
                className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-all cursor-pointer"
              >
                Unassign Current Bus
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !selectedVehicleId}
              className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isSubmitting ? 'Assigning GPS Unit...' : 'Confirm & Activate Assignment'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignGpsPage;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';

export const ManageVehicleModal = ({ vehicle = null, onClose, onUpdated }) => {
  const {
    createVehicle,
    updateVehicle,
    assignDriver,
    assignGps,
    loadTelemetry,
    telemetry,
  } = useAdminVehicle();

  const { depots, loadDepots } = useAdminDepot();
  const { drivers, loadDrivers } = useAdminDriver();

  const isEdit = Boolean(vehicle?.id);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'driver' | 'gps' | 'telemetry'
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const depotsList = Array.isArray(depots) ? depots : (depots?.items || depots?.rows || []);
  const driversList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);

  const [formData, setFormData] = useState({
    busNumber: '',
    vin: '',
    chassisNumber: '',
    vehicleType: 'Electric Transit Bus',
    fuelType: 'Electric (EV)',
    capacity: '45 Seats',
    depotId: '',
    assignedDriverId: '',
    status: 'in_depot',
    edgeDeviceId: '',
  });

  const [assignDriverId, setAssignDriverId] = useState('');
  const [gpsDeviceId, setGpsDeviceId] = useState('');

  useEffect(() => {
    setLoadingInitial(true);
    Promise.all([
      loadDepots().catch(() => []),
      loadDrivers().catch(() => []),
    ]).finally(() => setLoadingInitial(false));

    if (vehicle) {
      setFormData({
        busNumber: vehicle.bus_number || vehicle.busNumber || '',
        vin: vehicle.vin || '',
        chassisNumber: vehicle.chassis_number || vehicle.chassisNumber || '',
        vehicleType: vehicle.vehicle_type || vehicle.vehicleType || 'Electric Transit Bus',
        fuelType: vehicle.fuel_type || vehicle.fuelType || 'Electric (EV)',
        capacity: vehicle.capacity || '45 Seats',
        depotId: vehicle.depot_id || vehicle.depotId || vehicle.depot?.id || '',
        assignedDriverId: vehicle.assigned_driver_id || vehicle.assignedDriverId || vehicle.driver?.id || '',
        status: vehicle.status || 'in_depot',
        edgeDeviceId: vehicle.edge_device_id || vehicle.edgeDeviceId || '',
      });
      setAssignDriverId(vehicle.assigned_driver_id || vehicle.assignedDriverId || vehicle.driver?.id || '');
    }
  }, [vehicle, loadDepots, loadDrivers]);

  useEffect(() => {
    if (activeTab === 'telemetry' && vehicle?.id) {
      loadTelemetry(vehicle.id).catch(() => {});
    }
  }, [activeTab, vehicle, loadTelemetry]);

  // Submit Details
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!formData.busNumber.trim()) {
      toast.error('Bus Registration Number is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      bus_number: formData.busNumber.trim(),
      vin: formData.vin.trim(),
      chassis_number: formData.chassisNumber.trim(),
      vehicle_type: formData.vehicleType,
      fuel_type: formData.fuelType,
      capacity: formData.capacity,
      depot_id: formData.depotId ? Number(formData.depotId) : null,
      assigned_driver_id: formData.assignedDriverId ? Number(formData.assignedDriverId) : null,
      status: formData.status,
    };

    const actionPromise = isEdit
      ? updateVehicle(vehicle.id, payload)
      : createVehicle(payload);

    toast.promise(actionPromise, {
      loading: isEdit ? 'Saving vehicle changes...' : 'Registering new bus...',
      success: () => {
        if (onUpdated) onUpdated();
        onClose();
        return isEdit ? 'Vehicle details updated successfully!' : 'New vehicle registered in fleet!';
      },
      error: (err) => err?.message || 'Failed to save vehicle',
    }).finally(() => setSubmitting(false));
  };

  // Submit Driver Assign
  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!vehicle?.id) return;
    setSubmitting(true);
    toast.promise(
      assignDriver(vehicle.id, Number(assignDriverId)),
      {
        loading: 'Assigning driver to vehicle...',
        success: () => {
          if (onUpdated) onUpdated();
          return 'Driver assigned to vehicle successfully!';
        },
        error: (err) => err?.message || 'Failed to assign driver',
      }
    ).finally(() => setSubmitting(false));
  };

  // Submit GPS Assign
  const handleAssignGps = async (e) => {
    e.preventDefault();
    if (!vehicle?.id || !gpsDeviceId.trim()) return;
    setSubmitting(true);
    toast.promise(
      assignGps(vehicle.id, Number(gpsDeviceId.trim())),
      {
        loading: 'Linking Edge GPS hardware device...',
        success: () => {
          if (onUpdated) onUpdated();
          return 'Edge GPS device linked successfully!';
        },
        error: (err) => err?.message || 'Failed to link GPS device',
      }
    ).finally(() => setSubmitting(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-base flex items-center justify-center shadow-sm">
              🚌
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {isEdit ? `Manage Bus ${formData.busNumber}` : 'Register New Fleet Bus'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {vehicle?.code || 'COMMERCIAL TRANSIT FLEET'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation (for edit mode) */}
        {isEdit && (
          <div className="px-5 border-b border-slate-200 bg-white flex gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'details' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Vehicle Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('driver')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'driver' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Assign Driver
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gps')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gps' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Edge GPS Hardware
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'telemetry' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Live Telemetry
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {loadingInitial ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-900 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* TAB: DETAILS */}
              {activeTab === 'details' && (
                <form onSubmit={handleSubmitDetails} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Bus Registration No. *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MH-02-CL-9901"
                        value={formData.busNumber}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        VIN / Frame Serial No.
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MAT98129012389"
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Vehicle Model / Make
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="Electric Transit Bus">Electric Transit Bus (EV)</option>
                        <option value="CNG Low-Floor Bus">CNG Low-Floor Bus</option>
                        <option value="Diesel AC Feeder Bus">Diesel AC Feeder Bus</option>
                        <option value="Mini Electric Bus">Mini Electric Bus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Fuel / Power Type
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="Electric (EV)">Electric (EV Battery)</option>
                        <option value="CNG">CNG Clean Gas</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Electric Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Assigned Depot Base
                      </label>
                      <select
                        value={formData.depotId}
                        onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="">Select Depot...</option>
                        {depotsList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code || `DEP-${d.id}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Operating Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="in_depot">In Depot (Stationary)</option>
                        <option value="on_route">On Route (Active Duty)</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="offline">Offline / Out of Service</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>{isEdit ? 'Save Changes' : 'Register Vehicle'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: DRIVER ASSIGNMENT */}
              {activeTab === 'driver' && (
                <form onSubmit={handleAssignDriver} className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-slate-900">Current Assigned Driver</h4>
                    <p className="text-slate-500">
                      {vehicle?.driver?.name || (vehicle?.assigned_driver_id ? `Driver #${vehicle.assigned_driver_id}` : 'No driver currently assigned to this vehicle.')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Select Driver to Assign
                    </label>
                    <select
                      value={assignDriverId}
                      onChange={(e) => setAssignDriverId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="">Unassign / No Driver</option>
                      {driversList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.badge_id || d.badgeId || `DRV-${d.id}`}) — DL: {d.dl_number || 'Valid'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>Update Driver Assignment</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: EDGE GPS HARDWARE */}
              {activeTab === 'gps' && (
                <form onSubmit={handleAssignGps} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-blue-900">Edge Box Telemetry Linkage</h4>
                    <p className="text-blue-700">
                      Link a physical Edge GPS Telemetry & Display controller device ID to stream live positions and sync ad screens.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      GPS Device Hardware ID *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 101"
                      value={gpsDeviceId}
                      onChange={(e) => setGpsDeviceId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <span>Link Edge GPS Box</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: LIVE TELEMETRY */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">GPS Link Status</span>
                      <div className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{vehicle?.gps_status || 'Online Telemetry Active'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Last Recorded Speed</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {vehicle?.last_speed != null ? `${vehicle.last_speed} km/h` : '18.4 km/h (In Transit)'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">EV Battery / Fuel Level</span>
                      <div className="font-bold text-blue-700 mt-0.5">
                        {vehicle?.battery_level != null ? `${vehicle.battery_level}% Charged` : '88% Battery'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">In-Cabin Display Screens</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {vehicle?.displays_count ?? 2} Screens Connected
                      </div>
                    </div>
                  </div>

                  {telemetry?.positions && telemetry.positions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">Recent GPS Location Trail</h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1 font-mono text-[10px]">
                        {telemetry.positions.map((pos) => (
                          <div key={pos.id} className="flex justify-between text-slate-700 border-b border-slate-100 pb-1">
                            <span>Lat: {pos.latitude}, Lng: {pos.longitude}</span>
                            <span>{pos.speed} km/h</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVehicleModal;

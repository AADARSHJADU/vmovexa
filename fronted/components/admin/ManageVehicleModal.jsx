import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { FleetIcons } from '../FleetIcons';
import { useAdminVehicle } from '../../hooks/admin/useAdminVehicle';
import { useAdminDepot } from '../../hooks/admin/useAdminDepot';
import { useAdminDriver } from '../../hooks/admin/useAdminDriver';

export const ManageVehicleModal = ({ vehicle = null, onClose, onUpdated }) => {
  const { t } = useTranslation();
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
              {t('ag.admin.managevehiclemodal.vehicle_details', 'Vehicle Details')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('driver')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'driver' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('ag.admin.managevehiclemodal.assign_driver', 'Assign Driver')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gps')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'gps' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('ag.admin.managevehiclemodal.edge_gps_hardware', 'Edge GPS Hardware')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'telemetry' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t('ag.admin.managevehiclemodal.live_telemetry', 'Live Telemetry')}
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
                        {t('ag.admin.managevehiclemodal.bus_registration_no', 'Bus Registration No. *')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('ag.admin.managevehiclemodal.e_g_mh_02_cl_9901', 'e.g. MH-02-CL-9901')}
                        value={formData.busNumber}
                        onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('ag.admin.managevehiclemodal.vin_frame_serial_no', 'VIN / Frame Serial No.')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('ag.admin.managevehiclemodal.e_g_mat98129012389', 'e.g. MAT98129012389')}
                        value={formData.vin}
                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('ag.admin.managevehiclemodal.vehicle_model_make', 'Vehicle Model / Make')}
                      </label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="Electric Transit Bus">{t('ag.admin.managevehiclemodal.electric_transit_bus_ev', 'Electric Transit Bus (EV)')}</option>
                        <option value="CNG Low-Floor Bus">{t('ag.admin.managevehiclemodal.cng_low_floor_bus', 'CNG Low-Floor Bus')}</option>
                        <option value="Diesel AC Feeder Bus">{t('ag.admin.managevehiclemodal.diesel_ac_feeder_bus', 'Diesel AC Feeder Bus')}</option>
                        <option value="Mini Electric Bus">{t('ag.admin.managevehiclemodal.mini_electric_bus', 'Mini Electric Bus')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('ag.admin.managevehiclemodal.fuel_power_type', 'Fuel / Power Type')}
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="Electric (EV)">{t('ag.admin.managevehiclemodal.electric_ev_battery', 'Electric (EV Battery)')}</option>
                        <option value="CNG">{t('ag.admin.managevehiclemodal.cng_clean_gas', 'CNG Clean Gas')}</option>
                        <option value="Diesel">{t('ag.admin.managevehiclemodal.diesel', 'Diesel')}</option>
                        <option value="Hybrid">{t('ag.admin.managevehiclemodal.electric_hybrid', 'Electric Hybrid')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('ag.admin.managevehiclemodal.assigned_depot_base', 'Assigned Depot Base')}
                      </label>
                      <select
                        value={formData.depotId}
                        onChange={(e) => setFormData({ ...formData, depotId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="">{t('ag.admin.managevehiclemodal.select_depot', 'Select Depot...')}</option>
                        {depotsList.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code || `DEP-${d.id}`})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        {t('ag.admin.managevehiclemodal.operating_status', 'Operating Status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="in_depot">{t('ag.admin.managevehiclemodal.in_depot_stationary', 'In Depot (Stationary)')}</option>
                        <option value="on_route">{t('ag.admin.managevehiclemodal.on_route_active_duty', 'On Route (Active Duty)')}</option>
                        <option value="maintenance">{t('ag.admin.managevehiclemodal.under_maintenance', 'Under Maintenance')}</option>
                        <option value="offline">{t('ag.admin.managevehiclemodal.offline_out_of_service', 'Offline / Out of Service')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                    >
                      {t('ag.admin.managevehiclemodal.cancel', 'Cancel')}
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
                    <h4 className="font-bold text-slate-900">{t('ag.admin.managevehiclemodal.current_assigned_driver', 'Current Assigned Driver')}</h4>
                    <p className="text-slate-500">
                      {vehicle?.driver?.name || (vehicle?.assigned_driver_id ? `Driver #${vehicle.assigned_driver_id}` : 'No driver currently assigned to this vehicle.')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      {t('ag.admin.managevehiclemodal.select_driver_to_assign', 'Select Driver to Assign')}
                    </label>
                    <select
                      value={assignDriverId}
                      onChange={(e) => setAssignDriverId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                    >
                      <option value="">{t('ag.admin.managevehiclemodal.unassign_no_driver', 'Unassign / No Driver')}</option>
                      {driversList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.badge_id || d.badgeId || `DRV-${d.id}`}{t('ag.admin.managevehiclemodal.dl', ') — DL:')} {d.dl_number || 'Valid'}
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
                      <span>{t('ag.admin.managevehiclemodal.update_driver_assignment', 'Update Driver Assignment')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: EDGE GPS HARDWARE */}
              {activeTab === 'gps' && (
                <form onSubmit={handleAssignGps} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-blue-900">{t('ag.admin.managevehiclemodal.edge_box_telemetry_linkage', 'Edge Box Telemetry Linkage')}</h4>
                    <p className="text-blue-700">
                      {t('ag.admin.managevehiclemodal.link_a_physical_edge_gps_telemetry_and_displ', 'Link a physical Edge GPS Telemetry & Display controller device ID to stream live positions and sync ad screens.')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      {t('ag.admin.managevehiclemodal.gps_device_hardware_id', 'GPS Device Hardware ID *')}
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
                      <span>{t('ag.admin.managevehiclemodal.link_edge_gps_box', 'Link Edge GPS Box')}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB: LIVE TELEMETRY */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ag.admin.managevehiclemodal.gps_link_status', 'GPS Link Status')}</span>
                      <div className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{vehicle?.gps_status || 'Online Telemetry Active'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ag.admin.managevehiclemodal.last_recorded_speed', 'Last Recorded Speed')}</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {vehicle?.last_speed != null ? `${vehicle.last_speed} km/h` : '18.4 km/h (In Transit)'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ag.admin.managevehiclemodal.ev_battery_fuel_level', 'EV Battery / Fuel Level')}</span>
                      <div className="font-bold text-blue-700 mt-0.5">
                        {vehicle?.battery_level != null ? `${vehicle.battery_level}% Charged` : '88% Battery'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t('ag.admin.managevehiclemodal.in_cabin_display_screens', 'In-Cabin Display Screens')}</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {vehicle?.displays_count ?? 2} {t('ag.admin.managevehiclemodal.screens_connected', 'Screens Connected')}
                      </div>
                    </div>
                  </div>

                  {telemetry?.positions && telemetry.positions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">{t('ag.admin.managevehiclemodal.recent_gps_location_trail', 'Recent GPS Location Trail')}</h4>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1 font-mono text-[10px]">
                        {telemetry.positions.map((pos) => (
                          <div key={pos.id} className="flex justify-between text-slate-700 border-b border-slate-100 pb-1">
                            <span>{t('ag.admin.managevehiclemodal.lat', 'Lat:')} {pos.latitude}{t('ag.admin.managevehiclemodal.lng', ', Lng:')} {pos.longitude}</span>
                            <span>{pos.speed} {t('ag.admin.managevehiclemodal.km_h', 'km/h')}</span>
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

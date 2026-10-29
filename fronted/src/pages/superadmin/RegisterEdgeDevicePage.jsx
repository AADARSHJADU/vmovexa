import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperDevice } from '../../hooks/superadmin/useSuperDevice';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

export const RegisterEdgeDevicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // If id exists, it's Edit mode!
  const isEditMode = Boolean(id);

  const isSuperAdminTechnician = window.location.pathname.startsWith('/superadmin/technician');
  const isTechnician = window.location.pathname.startsWith('/technician') && !isSuperAdminTechnician;
  const portalTitle = isTechnician ? t('nav.technician', 'Technician Portal') : t('nav.superadmin', 'Super Admin');
  const portalPath = isTechnician ? '/technician/dashboard' : '/superadmin/dashboard';
  const devicesPath = isSuperAdminTechnician ? '/superadmin/technician/devices' : (isTechnician ? '/technician/devices' : '/superadmin/devices');

  const { createDevice, updateDevice } = useSuperDevice();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    box_id: '',
    mac: '',
    organization_id: '',
    fleet_id: '',
    vehicle_id: '',
    depot_id: '',
    agent_version: 'v2.4.1',
    sim_network: 'Airtel 4G IoT',
    is_active: true,
  });

  // Reference options
  const [organizations, setOrganizations] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [depots, setDepots] = useState([]);

  // Fetch reference dropdown options
  useEffect(() => {
    apiClient.get(ENDPOINTS.ORGANIZATIONS.LIST)
      .then((res) => {
        const orgs = res.data?.data?.rows || res.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        setOrganizations(orgs);
      })
      .catch(() => {});

    apiClient.get(`${ENDPOINTS.FLEET.FLEETS}?limit=200`)
      .then((res) => {
        const fl = res.data?.data?.rows || res.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        setFleets(fl);
      })
      .catch(() => {});

    apiClient.get(`${ENDPOINTS.FLEET.VEHICLES}?limit=200`)
      .then((res) => {
        const vehs = res.data?.data?.rows || res.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        setVehicles(vehs);
      })
      .catch(() => {});

    apiClient.get(`${ENDPOINTS.FLEET.DEPOTS}?limit=200`)
      .then((res) => {
        const depList = res.data?.data?.rows || res.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        setDepots(depList);
      })
      .catch(() => {});
  }, []);

  // Fetch device details if Edit mode
  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      apiClient.get(ENDPOINTS.DEVICES.EDGE_ONE(id))
        .then((res) => {
          const d = res.data?.data || res.data;
          if (d) {
            const orgId = d.organization_id || d.organization?.id || d.vehicle?.organization_id || '';
            const vehId = d.vehicle_id || d.vehicle?.id || '';
            const flId = d.vehicle?.fleet_id || d.vehicle?.fleet?.id || '';
            const depId = d.depot_id || d.vehicle?.depot_id || '';

            setFormData({
              box_id: d.box_id || d.boxId || '',
              mac: d.mac || '',
              organization_id: orgId ? String(orgId) : '',
              fleet_id: flId ? String(flId) : '',
              vehicle_id: vehId ? String(vehId) : '',
              depot_id: depId ? String(depId) : '',
              agent_version: d.agent_version || d.agentVersion || 'v2.4.1',
              sim_network: d.sim_network || d.simNetwork || 'Airtel 4G IoT',
              is_active: d.is_active !== undefined ? d.is_active : true,
            });
          }
        })
        .catch((err) => {
          toast.error(err?.message || 'Failed to load edge device details.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  // If editing an existing device that already has vehicle_id, auto-populate fleet and org from vehicles list
  useEffect(() => {
    if (formData.vehicle_id && vehicles.length > 0) {
      const v = vehicles.find((item) => String(item.id) === String(formData.vehicle_id));
      if (v) {
        setFormData((prev) => {
          let updated = false;
          const patch = {};
          if (!prev.fleet_id && v.fleet_id) {
            patch.fleet_id = String(v.fleet_id);
            updated = true;
          }
          if (!prev.organization_id && v.organization_id) {
            patch.organization_id = String(v.organization_id);
            updated = true;
          }
          if (!prev.depot_id && v.depot_id) {
            patch.depot_id = String(v.depot_id);
            updated = true;
          }
          return updated ? { ...prev, ...patch } : prev;
        });
      }
    }
  }, [formData.vehicle_id, vehicles]);

  // Fleets strictly filtered by selected Organization
  const availableFleets = useMemo(() => {
    if (!formData.organization_id) return [];
    return fleets.filter((f) => String(f.organization_id) === String(formData.organization_id));
  }, [fleets, formData.organization_id]);

  // Vehicles strictly filtered by selected Organization AND selected Fleet
  const availableVehicles = useMemo(() => {
    if (!formData.organization_id) return [];
    return vehicles.filter((v) => {
      const matchOrg = String(v.organization_id) === String(formData.organization_id);
      if (!formData.fleet_id) return matchOrg;
      return matchOrg && String(v.fleet_id) === String(formData.fleet_id);
    });
  }, [vehicles, formData.organization_id, formData.fleet_id]);

  const selectedFleet = useMemo(() => {
    return fleets.find((f) => String(f.id) === String(formData.fleet_id));
  }, [fleets, formData.fleet_id]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => String(v.id) === String(formData.vehicle_id));
  }, [vehicles, formData.vehicle_id]);

  // Derived assigned depot from fleet or vehicle (auto-resolved)
  const assignedDepot = useMemo(() => {
    const depId = selectedVehicle?.depot_id || selectedFleet?.depot_id || formData.depot_id;
    if (!depId) return null;
    return depots.find((d) => String(d.id) === String(depId)) || selectedFleet?.depot || null;
  }, [selectedVehicle, selectedFleet, formData.depot_id, depots]);

  // Auto-sync formData.depot_id with assignedDepot from fleet/vehicle
  useEffect(() => {
    const depId = selectedVehicle?.depot_id || selectedFleet?.depot_id;
    if (depId && String(formData.depot_id) !== String(depId)) {
      setFormData((prev) => ({ ...prev, depot_id: String(depId) }));
    }
  }, [selectedVehicle, selectedFleet, formData.depot_id]);

  // Cascading change handlers
  const handleOrganizationChange = (newOrgId) => {
    setFormData((prev) => ({
      ...prev,
      organization_id: newOrgId,
      fleet_id: '',
      vehicle_id: '',
      depot_id: '',
    }));
  };

  const handleFleetChange = (newFleetId) => {
    const fleetObj = fleets.find((f) => String(f.id) === String(newFleetId));
    setFormData((prev) => ({
      ...prev,
      fleet_id: newFleetId,
      vehicle_id: '',
      depot_id: fleetObj?.depot_id ? String(fleetObj.depot_id) : '',
    }));
  };

  const handleVehicleChange = (newVehicleId) => {
    const vehicleObj = vehicles.find((v) => String(v.id) === String(newVehicleId));
    setFormData((prev) => ({
      ...prev,
      vehicle_id: newVehicleId,
      depot_id: vehicleObj?.depot_id ? String(vehicleObj.depot_id) : prev.depot_id,
      fleet_id: vehicleObj?.fleet_id ? String(vehicleObj.fleet_id) : prev.fleet_id,
      organization_id: vehicleObj?.organization_id ? String(vehicleObj.organization_id) : prev.organization_id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.box_id) {
      toast.error(t('superadmin.devices.box_id_required', 'Box ID is required!'));
      return;
    }

    setSubmitting(true);
    const payload = {
      boxId: formData.box_id,
      mac: formData.mac || null,
      organizationId: formData.organization_id ? Number(formData.organization_id) : null,
      vehicleId: formData.vehicle_id ? Number(formData.vehicle_id) : null,
      depotId: formData.depot_id ? Number(formData.depot_id) : null,
      agentVersion: formData.agent_version || null,
      simNetwork: formData.sim_network || null,
      is_active: formData.is_active,
    };

    try {
      if (isEditMode) {
        await toast.promise(
          updateDevice(id, payload),
          {
            loading: 'Updating edge device configuration...',
            success: 'Edge device updated successfully!',
            error: (err) => err?.message || 'Failed to update edge device.',
          }
        );
      } else {
        await toast.promise(
          createDevice(payload),
          {
            loading: 'Registering new RK3588 edge device...',
            success: 'Edge device registered successfully!',
            error: (err) => err?.message || 'Failed to register edge device.',
          }
        );
      }
      navigate(devicesPath);
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: portalTitle, path: portalPath },
          { label: t('superadmin.devices.title', 'Edge Devices'), path: devicesPath },
          { label: isEditMode ? t('superadmin.devices.edit_device', 'Edit Device') : t('superadmin.devices.add_device', 'Add Device') },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? t('superadmin.devices.edit_device', 'Edit Device') : t('superadmin.devices.add_new_device', 'Add New Device')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {isEditMode
              ? t('superadmin.devices.update_details_for', 'Update details for Box ID: {{box_id}}', { box_id: formData.box_id })
              : t('superadmin.devices.fill_details_desc', 'Fill in the details below to add a device and link it to a vehicle.')}
          </p>
        </div>

        <Link
          to={devicesPath}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto flex items-center gap-2 cursor-pointer"
        >
          <FleetIcons.ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('superadmin.devices.back_to_devices', 'Back to Devices')}</span>
        </Link>
      </div>

      {/* Form Container - Full Width */}
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 font-medium animate-pulse space-y-3">
            <FleetIcons.Gps className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
            <span>{t('superadmin.devices.loading_details', 'Loading device details...')}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Device Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('superadmin.devices.section_device_info', 'Device Information')}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.devices.section_device_info_desc', 'Basic hardware details of the edge box.')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Box ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('superadmin.devices.box_id_label', 'Box ID / Serial Number')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditMode}
                    placeholder={t('superadmin.devices.box_id_ph', 'e.g. APC3588Q26360091')}
                    value={formData.box_id}
                    onChange={(e) => setFormData({ ...formData, box_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.devices.box_id_desc', 'Unique serial number of this device.')}</p>
                </div>

                {/* MAC Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('superadmin.devices.mac_label', 'MAC Address')} <span className="text-slate-400 font-normal">{t('common.optional', '(Optional)')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('superadmin.devices.mac_ph', 'e.g. ac:db:da:6a:0a:89')}
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.devices.mac_desc', 'Wi-Fi or LAN physical address.')}</p>
                </div>

                {/* Agent Version */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('superadmin.devices.agent_version_label', 'Software / Firmware Version')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('superadmin.devices.agent_version_ph', 'e.g. v2.4.1 or Android 14')}
                    value={formData.agent_version}
                    onChange={(e) => setFormData({ ...formData, agent_version: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.devices.agent_version_desc', 'Installed core software version.')}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Cascading Vehicle & Location Assignment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('superadmin.devices.section_assignment', 'Vehicle & Location Assignment')}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                    {t('superadmin.devices.section_assignment_desc', 'Select Organization → Fleet → Assigned Vehicle.')}
                  </p>
                </div>
              </div>

              {/* Step Flow indicator helper */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{t('superadmin.devices.flow_label', 'Flow:')}</span>
                <span>{t('superadmin.devices.flow_step1', '1. Select Organization')}</span>
                <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{t('superadmin.devices.flow_step2', '2. Select Fleet')}</span>
                <FleetIcons.ArrowRight className="w-3 h-3 text-slate-400" />
                <span>{t('superadmin.devices.flow_step3', '3. Select Bus / Vehicle')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Organization Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('superadmin.devices.org_label', '1. Organization / Company')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.organization_id}
                    onChange={(e) => handleOrganizationChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                  >
                    <option value="">{t('superadmin.devices.select_org_ph', 'Select Organization...')}</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code || org.id})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.devices.org_desc', 'Tenant or operator admin company.')}</p>
                </div>

                {/* 2. Fleet Select (Filtered by Organization) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t('superadmin.devices.fleet_label', '2. Fleet')}</span>
                    {formData.organization_id && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {t('superadmin.devices.available_count', '({{count}} available)', { count: availableFleets.length })}
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.fleet_id}
                    disabled={!formData.organization_id}
                    onChange={(e) => handleFleetChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-zinc-950 shadow-xs"
                  >
                    <option value="">
                      {!formData.organization_id
                        ? t('superadmin.devices.select_org_first', 'Select Organization first')
                        : availableFleets.length === 0
                        ? t('superadmin.devices.no_fleets_org', 'No Fleets in this Organization')
                        : t('superadmin.devices.select_fleet_ph', 'Select Fleet...')}
                    </option>
                    {availableFleets.map((fleet) => (
                      <option key={fleet.id} value={fleet.id}>
                        {fleet.name} ({fleet.fleet_type || 'Fleet'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    {!formData.organization_id ? t('superadmin.devices.fleet_disabled_desc', 'Disabled until organization selected.') : t('superadmin.devices.fleet_enabled_desc', 'Select fleet under chosen organization.')}
                  </p>
                </div>

                {/* 3. Bus / Vehicle Select (Filtered by Fleet) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t('superadmin.devices.bus_label', '3. Bus / Vehicle')}</span>
                    {formData.fleet_id && (
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        {t('superadmin.devices.buses_count', '({{count}} buses)', { count: availableVehicles.length })}
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.vehicle_id}
                    disabled={!formData.organization_id || !formData.fleet_id}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-zinc-950 shadow-xs"
                  >
                    <option value="">
                      {!formData.organization_id
                        ? t('superadmin.devices.select_org_first', 'Select Organization first')
                        : !formData.fleet_id
                        ? t('superadmin.devices.select_fleet_first', 'Select Fleet first')
                        : availableVehicles.length === 0
                        ? t('superadmin.devices.no_vehicles_fleet', 'No vehicles found in this Fleet')
                        : t('superadmin.devices.select_bus_ph', 'Unassigned / Select Bus...')}
                    </option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        Bus #{v.bus_number || v.busNumber || v.id} ({v.model || v.code || 'Vehicle'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    {!formData.fleet_id ? t('superadmin.devices.bus_disabled_desc', 'Disabled until fleet is selected.') : t('superadmin.devices.bus_enabled_desc', 'Select bus to bind this edge screen box to.')}
                  </p>
                </div>
              </div>

              {/* Row 2 of Section 2: Depot & SIM Network */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Depot / Garage (Auto-assigned via Fleet) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                    <span>{t('superadmin.devices.depot_garage', 'Depot / Garage')}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {t('superadmin.devices.auto_assigned_fleet', 'Auto-assigned from Fleet')}
                    </span>
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2 shadow-xs min-h-[38px]">
                    <FleetIcons.Depot className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {assignedDepot
                        ? `${assignedDepot.name} (${assignedDepot.code || 'DEP'})`
                        : formData.fleet_id
                        ? t('superadmin.devices.no_depot_fleet', 'No Depot linked to this Fleet')
                        : t('superadmin.devices.select_fleet_depot', 'Select Fleet to display assigned Depot')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    {t('superadmin.devices.depot_desc', 'Inherited automatically from the selected fleet operation.')}
                  </p>
                </div>

                {/* SIM Network */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    {t('superadmin.devices.sim_network_label', 'Internet / SIM Network')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('superadmin.devices.sim_network_ph', 'e.g. Airtel 4G IoT, Jio 5G, Wi-Fi')}
                    value={formData.sim_network}
                    onChange={(e) => setFormData({ ...formData, sim_network: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{t('superadmin.devices.sim_network_desc', 'Cellular / Wi-Fi provider for the IoT box.')}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Device Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('superadmin.devices.section_status', 'Device Status')}</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{t('superadmin.devices.section_status_desc', 'Control whether this device is enabled or disabled.')}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('superadmin.devices.enable_device', 'Enable Device')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    {t('superadmin.devices.enable_device_desc', 'When turned on, this device will receive ad campaigns, display updates, and send live GPS location.')}
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="page_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
              <Link
                to={devicesPath}
                className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                <FleetIcons.Check className="w-4 h-4" />
                <span>{submitting ? t('common.saving', 'Saving...') : isEditMode ? t('common.save_changes', 'Save Changes') : t('superadmin.devices.register_device', 'Register Device')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

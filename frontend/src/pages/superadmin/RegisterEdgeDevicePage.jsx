import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useSuperDevice } from '../../hooks/superadmin/useSuperDevice';
import { apiClient } from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import toast from 'react-hot-toast';

export const RegisterEdgeDevicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // If id exists, it's Edit mode!
  const isEditMode = Boolean(id);

  const isTechnician = window.location.pathname.startsWith('/technician');
  const portalTitle = isTechnician ? 'Technician Portal' : 'Super Admin';
  const portalPath = isTechnician ? '/technician/dashboard' : '/superadmin/dashboard';
  const devicesPath = isTechnician ? '/technician/devices' : '/superadmin/devices';

  const { createDevice, updateDevice } = useSuperDevice();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    box_id: '',
    mac: '',
    organization_id: '',
    vehicle_id: '',
    depot_id: '',
    agent_version: 'v2.4.1',
    sim_network: 'Airtel 4G IoT',
    is_active: true,
  });

  // Reference options
  const [organizations, setOrganizations] = useState([]);
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

    apiClient.get(ENDPOINTS.FLEET.VEHICLES)
      .then((res) => {
        const vehs = res.data?.data?.rows || res.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        setVehicles(vehs);
      })
      .catch(() => {});

    apiClient.get(ENDPOINTS.FLEET.DEPOTS)
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
            setFormData({
              box_id: d.box_id || d.boxId || '',
              mac: d.mac || '',
              organization_id: d.organization_id || d.organization?.id || '',
              vehicle_id: d.vehicle_id || d.vehicle?.id || '',
              depot_id: d.depot_id || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.box_id) {
      toast.error('Box ID is required!');
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
          { label: 'Devices', path: devicesPath },
          { label: isEditMode ? 'Edit Device' : 'Add Device' },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Device' : 'Add New Device'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            {isEditMode
              ? `Update details for Box ID: ${formData.box_id}`
              : 'Fill in the details below to add a device and link it to a vehicle.'}
          </p>
        </div>

        <Link
          to={devicesPath}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto flex items-center gap-2"
        >
          ← Back to Devices
        </Link>
      </div>

      {/* Form Container - Full Width */}
      <div className="w-full bg-white dark:bg-[#11141d] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-500 font-medium animate-pulse space-y-3">
            <FleetIcons.Gps className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
            <span>Loading device details...</span>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Device Information</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Basic hardware details of the edge box.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Box ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Box ID / Serial Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditMode}
                    placeholder="e.g. APC3588Q26360091"
                    value={formData.box_id}
                    onChange={(e) => setFormData({ ...formData, box_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Unique serial number of this device.</p>
                </div>

                {/* MAC Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    MAC Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ac:db:da:6a:0a:89"
                    value={formData.mac}
                    onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Wi-Fi or LAN physical address.</p>
                </div>

                {/* Agent Version */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Software / Firmware Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v2.4.1 or Android 14"
                    value={formData.agent_version}
                    onChange={(e) => setFormData({ ...formData, agent_version: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Installed core software version.</p>
                </div>
              </div>
            </div>

            {/* Section 2: Vehicle & Location Assignment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Vehicle & Location Assignment</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Link this device to a company, bus, and depot.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Organization Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Organization
                  </label>
                  <select
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Organization...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code || org.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Bus / Vehicle
                  </label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        Bus #{v.bus_number || v.busNumber || v.id} ({v.model || v.code || 'Vehicle'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Depot Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Depot / Garage
                  </label>
                  <select
                    value={formData.depot_id}
                    onChange={(e) => setFormData({ ...formData, depot_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Depot...</option>
                    {depots.map((dep) => (
                      <option key={dep.id} value={dep.id}>
                        {dep.name} ({dep.code || dep.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* SIM Network */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Internet / SIM Network
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel 4G, Jio 5G, Wi-Fi"
                    value={formData.sim_network}
                    onChange={(e) => setFormData({ ...formData, sim_network: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Device Status</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">Control whether this device is enabled or disabled.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Enable Device</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                    When turned on, this device will receive ad campaigns, display updates, and send live GPS location.
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
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                <FleetIcons.Check className="w-4 h-4" />
                <span>{submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Register Device'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

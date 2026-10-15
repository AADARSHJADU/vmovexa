import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useAuth } from '../../hooks/useAuth';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const AddGpsPage = () => {
  const { id } = useParams(); // If present, edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, hasPermission } = useAuth();

  const isFleetPortal = location.pathname.startsWith('/fleet-manager');
  const basePath = isFleetPortal ? '/fleet-manager/gps' : '/admin/gps';
  const isFleetOperator = user?.role === 'ROLE-FLEET-OPERATOR';
  const isEditMode = Boolean(id);

  const isPrivilegedRole = [
    'ROLE-SUPER-ADMIN',
    'ROLE-TENANT-ADMIN',
    'ROLE-ADMIN',
    'TROLE-ADMIN',
    'ROLE-FLEET-OPERATOR',
    'ROLE-TECHNICIAN',
  ].includes(user?.role);

  const canCreate = isPrivilegedRole || hasPermission(['fleet.devices.create', 'devices.register', 'devices.gps.manage']);
  const canUpdate = isPrivilegedRole || hasPermission(['fleet.devices.update', 'devices.configure', 'devices.gps.manage']);

  const assignVehicleParam = searchParams.get('assignVehicle') || '';

  const { createDevice, updateDevice, loadDevice, assignVehicle, loadDevices } = useFleetGps();
  const { vehicles, loadVehicles } = useFleetVehicle();

  const [loading, setLoading] = useState(isEditMode);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always load fleet vehicles so the vehicle dropdown is populated
  useEffect(() => {
    loadVehicles().catch(() => {});
  }, [loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  const [formData, setFormData] = useState({
    code: `GPS-TRK-${Math.floor(10000 + Math.random() * 90000)}`,
    imei: '',
    type: 'external',
    vendor: 'Teltonika',
    model: 'Teltonika FMB920',
    serialNumber: '',
    aliasName: '',
    vehicleId: '',
    mountingPosition: 'Behind Driver Dashboard',
    powerWire: 'Direct Battery Constant (+12V/24V)',
    installationDate: new Date().toISOString().split('T')[0],
    sim: '',
    simProvider: 'Jio',
    network: 'Jio 4G IoT',
    networkType: '4G LTE-M',
    batteryCapacity: '1200 mAh',
    firmware: 'v3.2.14-PROD',
    notes: '',
    imageUrl: '',
    status: 'available',
  });

  // Preselect vehicle if passed in query param
  useEffect(() => {
    if (assignVehicleParam && vehicleList.length > 0 && !isEditMode) {
      const match = vehicleList.find(
        (v) =>
          String(v.id) === String(assignVehicleParam) ||
          String(v.bus_number) === String(assignVehicleParam) ||
          String(v.code) === String(assignVehicleParam)
      );
      if (match) {
        setFormData((prev) => ({
          ...prev,
          vehicleId: String(match.id),
          status: isFleetOperator ? 'pending_approval' : 'assigned',
        }));
      }
    }
  }, [assignVehicleParam, vehicleList, isEditMode, isFleetOperator]);

  // Load existing GPS device details for Edit mode
  useEffect(() => {
    if (!isEditMode) return;
    let mounted = true;

    const fetchGpsDetails = async () => {
      setLoading(true);
      try {
        const device = await loadDevice(id);
        if (mounted && device) {
          setFormData({
            code: device.code || `GPS-TRK-${device.id}`,
            imei: device.imei || '',
            type: device.type || 'external',
            vendor: device.vendor || 'Teltonika',
            model: device.model || 'Teltonika FMB920',
            serialNumber: device.serial_number || device.serialNumber || '',
            aliasName: device.alias_name || device.aliasName || '',
            vehicleId: device.vehicle_id ? String(device.vehicle_id) : '',
            mountingPosition: device.mounting_position || device.mountingPosition || 'Behind Driver Dashboard',
            powerWire: device.power_wire || device.powerWire || 'Direct Battery Constant (+12V/24V)',
            installationDate: device.installed_at ? String(device.installed_at).split('T')[0] : '',
            sim: device.sim || '',
            simProvider: device.sim_provider || device.simProvider || 'Jio',
            network: device.network || 'Jio 4G IoT',
            networkType: device.network_type || device.networkType || '4G LTE-M',
            batteryCapacity: device.battery_capacity || device.batteryCapacity || '1200 mAh',
            firmware: device.firmware || 'v3.2.14-PROD',
            notes: device.notes || '',
            imageUrl: device.image_url || device.imageUrl || '',
            status: device.status || 'available',
          });
          if (device.image_url) {
            setImagePreviewUrl(resolveFileUrl(device.image_url));
          }
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load GPS device details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchGpsDetails();
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, loadDevice]);

  /** Client-side image selection (Deferred Upload) */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }
    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleVehicleChange = (selectedVId) => {
    setFormData((prev) => {
      let nextStatus = prev.status;
      if (!isFleetOperator) {
        nextStatus = selectedVId ? 'assigned' : 'available';
      }
      return {
        ...prev,
        vehicleId: selectedVId,
        status: nextStatus,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imei || !formData.model) {
      toast.error('IMEI Number and Device Model are required.');
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl = formData.imageUrl;

    // Deferred photo upload on submit
    if (selectedImageFile) {
      const uploadToast = toast.loading('Uploading hardware photo...');
      try {
        const uploadRes = await uploadFile(selectedImageFile, 'gps_device');
        finalImageUrl = uploadRes?.url || uploadRes?.file_url || uploadRes?.path || '';
        toast.dismiss(uploadToast);
      } catch (uploadErr) {
        toast.error(uploadErr?.message || 'Failed to upload hardware photo', { id: uploadToast });
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      code: formData.code,
      imei: formData.imei,
      type: formData.type || 'external',
      vendor: formData.vendor,
      model: formData.model,
      serial_number: formData.serialNumber,
      serialNumber: formData.serialNumber,
      alias_name: formData.aliasName,
      aliasName: formData.aliasName,
      vehicle_id: formData.vehicleId ? Number(formData.vehicleId) : null,
      vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
      mounting_position: formData.mountingPosition,
      mountingPosition: formData.mountingPosition,
      power_wire: formData.powerWire,
      powerWire: formData.powerWire,
      installation_date: formData.installationDate,
      installed_at: formData.installationDate,
      sim: formData.sim,
      sim_provider: formData.simProvider,
      simProvider: formData.simProvider,
      network: formData.network,
      network_type: formData.networkType,
      networkType: formData.networkType,
      battery_capacity: formData.batteryCapacity,
      batteryCapacity: formData.batteryCapacity,
      firmware: formData.firmware,
      notes: formData.notes,
      image_url: finalImageUrl,
      imageUrl: finalImageUrl,
      status: isFleetOperator ? 'pending_approval' : (formData.vehicleId ? 'assigned' : formData.status),
    };

    try {
      if (isEditMode) {
        await toast.promise(updateDevice(id, payload), {
          loading: 'Updating GPS Device...',
          success: 'GPS device configuration updated successfully!',
          error: (err) => err?.response?.data?.message || err?.message || 'Failed to update GPS device',
        });
      } else {
        const createdGps = await toast.promise(createDevice(payload), {
          loading: 'Saving GPS Device...',
          success: isFleetOperator
            ? 'GPS device submitted for Admin Approval!'
            : 'GPS device created and activated!',
          error: (err) => err?.response?.data?.message || err?.message || 'Failed to create GPS device',
        });

        if (formData.vehicleId && createdGps?.id) {
          await assignVehicle(createdGps.id, Number(formData.vehicleId)).catch(() => {});
        }
      }

      await loadDevices().catch(() => {});
      navigate(basePath);
    } catch (_) {
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center text-slate-500 font-medium">
        Loading device configuration details...
      </div>
    );
  }

  if ((isEditMode && !canUpdate) || (!isEditMode && !canCreate)) {
    return (
      <div className="w-full p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center my-8">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl">
          🚫
        </div>
        <h2 className="text-base font-bold text-slate-900">Access Restricted / Permission Revoked</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          You do not have permission to {isEditMode ? 'modify' : 'register'} GPS devices. Contact your administrator to grant access.
        </p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          ← Back to GPS Directory
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <Breadcrumb
            items={[
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-manager/dashboard' : '/admin/dashboard' },
              { label: 'GPS Devices', path: basePath },
              { label: isEditMode ? `Edit GPS Device #${id}` : 'Register New Device' },
            ]}
            className="mb-2"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            {isEditMode ? 'Edit GPS Device Configuration' : 'Register GPS Telematics Device'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure hardware telematics tracker, bus assignment, SIM connectivity, and hardware photo
          </p>
        </div>

        <button
          onClick={() => navigate(basePath)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all self-start md:self-auto"
        >
          Cancel
        </button>
      </div>

      {/* Fleet Operator Pending Notice */}
      {isFleetOperator && !isEditMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs font-medium">
          <FleetIcons.Refresh className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-900">Admin Approval Required</span>
            GPS devices registered by Fleet Operators will be submitted with <strong>Pending Approval</strong> status.
            An Organization Admin will review and approve the device before telematics activation.
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Device Identification & Hardware Specs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FleetIcons.Gps className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">1. Device Identification & Hardware Specs</h3>
              <p className="text-[11px] text-slate-400">Core hardware identification parameters and model identifiers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">GPS Device Serial / Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. GPS-TRK-9901"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">IMEI Number (15 Digits) *</label>
              <input
                type="text"
                required
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder="e.g. 864726041234567"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Device Hardware Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
              >
                <option value="external">External / Aftermarket Tracker</option>
                <option value="builtin">Built-in / OEM Factory Fitted</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hardware Vendor / Manufacturer</label>
              <select
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Teltonika">Teltonika</option>
                <option value="Concox / Jimi IoT">Concox / Jimi IoT</option>
                <option value="Queclink">Queclink</option>
                <option value="Ruptela">Ruptela</option>
                <option value="Coban">Coban</option>
                <option value="Custom OEM">Custom OEM</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hardware Model *</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g. Teltonika FMB920"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hardware Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="e.g. SN-99820-2024"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Device Alias / Label Name</label>
              <input
                type="text"
                value={formData.aliasName}
                onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                placeholder="e.g. Depot-North-Tracker-01"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vehicle Assignment & Installation Specs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FleetIcons.Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">2. Fleet Assignment & Installation Specs</h3>
              <p className="text-[11px] text-slate-400">Map GPS box to fleet bus and record wiring mounting location</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Vehicle (Bus)</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
              >
                <option value="">-- Standby Tracker (Unassigned) --</option>
                {vehicleList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.bus_number} — {v.model || 'Bus'} {v.vin ? `(${v.vin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mounting Location / Position</label>
              <select
                value={formData.mountingPosition}
                onChange={(e) => setFormData({ ...formData, mountingPosition: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Behind Driver Dashboard">Behind Driver Dashboard</option>
                <option value="Under Driver Seat">Under Driver Seat</option>
                <option value="Windshield Header / Sunvisor">Windshield Header / Sunvisor</option>
                <option value="Overhead Luggage Rack">Overhead Luggage Rack</option>
                <option value="Fuse Box / Electrical Junction">Fuse Box / Electrical Junction</option>
                <option value="Battery Compartment">Battery Compartment</option>
                <option value="OBD-II Diagnostic Port">OBD-II Diagnostic Port</option>
                <option value="Engine Bay / Firewall">Engine Bay / Firewall</option>
                <option value="External Waterproof Enclosure">External Waterproof Enclosure</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Power Wiring Type</label>
              <select
                value={formData.powerWire}
                onChange={(e) => setFormData({ ...formData, powerWire: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Direct Battery Constant (+12V/24V)">Direct Battery Constant (+12V/24V)</option>
                <option value="Ignition ACC Switched (+12V)">Ignition ACC Switched (+12V)</option>
                <option value="3-Wire (Constant + ACC Ignition + GND)">3-Wire (Constant + ACC Ignition + GND)</option>
                <option value="OBD-II Direct Plug & Play">OBD-II Direct Plug & Play</option>
                <option value="Internal Rechargeable Battery Only">Internal Rechargeable Battery Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Installation / Activation Date</label>
              <input
                type="date"
                value={formData.installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: SIM & Network Specs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FleetIcons.Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. SIM Line & Telematics Connectivity</h3>
              <p className="text-[11px] text-slate-400">Carrier SIM line parameters, APN profile, and IoT telemetry network</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">SIM Mobile Number / ICCID</label>
              <input
                type="text"
                value={formData.sim}
                onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                placeholder="e.g. +91 99101 23456"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telecom SIM Provider</label>
              <select
                value={formData.simProvider}
                onChange={(e) => setFormData({ ...formData, simProvider: e.target.value, network: `${e.target.value} IoT` })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
              >
                <option value="Jio">Reliance Jio Infocomm</option>
                <option value="Airtel">Bharti Airtel M2M</option>
                <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi) IoT</option>
                <option value="BSNL">BSNL Telematics</option>
                <option value="Tata Communications">Tata Communications MOVE</option>
                <option value="Aeris IoT">Aeris IoT</option>
                <option value="Global eSIM">Global Multi-IMSI eSIM</option>
                <option value="Other">Other Telecom Operator</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Network APN / Description</label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder="e.g. Jio 4G IoT / Airtel M2M"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Network Protocol / Technology</label>
              <select
                value={formData.networkType}
                onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="4G LTE-M">4G LTE-M (Cat-M1)</option>
                <option value="NB-IoT">NB-IoT (Narrowband)</option>
                <option value="4G LTE Cat 1">4G LTE Cat 1</option>
                <option value="2G GSM/GPRS">2G GSM/GPRS Fallback</option>
                <option value="5G IoT">5G RedCap / IoT</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Backup Battery Capacity</label>
              <input
                type="text"
                value={formData.batteryCapacity}
                onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                placeholder="e.g. 1200 mAh Li-Po"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Firmware Version</label>
              <input
                type="text"
                value={formData.firmware}
                onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                placeholder="e.g. v3.2.14-PROD"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Hardware Box Photo Upload (Deferred Upload) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FleetIcons.Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">4. Hardware Box Photo</h3>
              <p className="text-[11px] text-slate-400">
                Upload a clear photo of the GPS tracker box showing serial sticker or vehicle mounting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block font-bold text-slate-700 mb-2 text-xs">Upload Photo File</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-slate-400 transition-all bg-slate-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FleetIcons.Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Click or drag & drop GPS Box Photo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG or WEBP up to 5MB</p>
              </div>
            </div>

            {/* Photo Preview Card */}
            <div>
              <label className="block font-bold text-slate-700 mb-2 text-xs">Photo Preview</label>
              {imagePreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group h-40 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="GPS Box Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <FleetIcons.Gps className="w-8 h-8 mb-1 text-slate-300" />
                  <span>No Hardware Photo Selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Operational Notes & Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FleetIcons.Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">5. Operational Notes & Initial Status</h3>
              <p className="text-[11px] text-slate-400">Technician installation notes and device lifecycle state</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Operational Notes / Mounting Info</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Installed behind driver main fuse panel. External GPS patch antenna fixed to windshield header."
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                disabled={isFleetOperator}
                value={isFleetOperator ? 'pending_approval' : formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-medium"
              >
                <option value="available">Available (Unassigned)</option>
                <option value="assigned">Assigned to Vehicle</option>
                {isFleetOperator && <option value="pending_approval">Pending Approval</option>}
              </select>
              {isFleetOperator ? (
                <p className="text-[11px] text-amber-600 mt-1 font-medium">
                  Status locked to Pending Approval for Fleet Operators.
                </p>
              ) : formData.vehicleId ? (
                <p className="text-[11px] text-blue-600 mt-1 font-medium">
                  Automatically set to Assigned because a vehicle is selected.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(basePath)}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && <FleetIcons.Refresh className="w-4 h-4 animate-spin" />}
            <span>
              {isSubmitting
                ? 'Saving GPS Configuration...'
                : isEditMode
                ? 'Update Configuration'
                : 'Register & Save GPS Device'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGpsPage;

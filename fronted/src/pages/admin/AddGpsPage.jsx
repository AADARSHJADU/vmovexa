/* eslint-disable react-hooks/set-state-in-effect -- query/edit data hydrates the device form */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const AddGpsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // If present, edit mode
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, hasPermission } = useAuth();

  const isFleetPortal = (location.pathname.startsWith('/fleet-operator') || location.pathname.startsWith('/fleet-operator'));
  const basePath = isFleetPortal ? '/fleet-operator/edge-devices' : '/admin/edge-devices';
  const roleCode = typeof user?.role === 'string' ? user.role : user?.role?.code;
  const isFleetOperator = roleCode === 'ROLE-FLEET-OPERATOR';
  const isEditMode = Boolean(id);

  const canCreate = hasPermission(['fleet.devices.create', 'devices.register', 'devices.gps.manage']);
  const canUpdate = hasPermission(['fleet.devices.update', 'devices.configure', 'devices.gps.manage']);

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

  const vehicleList = useMemo(() => Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []), [vehicles]);

  const [formData, setFormData] = useState({
    code: '',
    imei: '',
    type: 'external',
    vendor: '',
    model: '',
    serialNumber: '',
    aliasName: '',
    vehicleId: '',
    mountingPosition: '',
    powerWire: '',
    installationDate: new Date().toISOString().split('T')[0],
    sim: '',
    simProvider: '',
    network: '',
    networkType: '',
    batteryCapacity: '',
    firmware: '',
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
            vendor: device.vendor || '',
            model: device.model || '',
            serialNumber: device.serial_number || device.serialNumber || '',
            aliasName: device.alias_name || device.aliasName || '',
            vehicleId: device.vehicle_id ? String(device.vehicle_id) : '',
            mountingPosition: device.mounting_position || device.mountingPosition || '',
            powerWire: device.power_wire || device.powerWire || '',
            installationDate: device.installed_at ? String(device.installed_at).split('T')[0] : '',
            sim: device.sim || '',
            simProvider: device.sim_provider || device.simProvider || '',
            network: device.network || '',
            networkType: device.network_type || device.networkType || '',
            batteryCapacity: device.battery_capacity || device.batteryCapacity || '',
            firmware: device.firmware || '',
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
    } catch {
      // toast.promise reports the API error.
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
          <FleetIcons.Shield className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.gps.access_revoked')}</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          You do not have permission to {isEditMode ? 'modify' : 'register'} GPS devices. Contact your administrator to grant access.
        </p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          {t('admin.gps.title')}
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
              { label: isFleetPortal ? 'Fleet Operator' : 'Tenant Admin', path: isFleetPortal ? '/fleet-operator/dashboard' : '/admin/dashboard' },
              { label: t('admin.gps.title'), path: basePath },
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
          {t('common.cancel')}
        </button>
      </div>

      {/* Fleet Operator Pending Notice */}
      {isFleetOperator && !isEditMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs font-medium">
          <FleetIcons.Refresh className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-900 dark:text-amber-300">{t('admin.gps.admin_approval_required')}</span>
            GPS devices registered by Fleet Operators will be submitted with <strong>{t('admin.gps.pending_approval')}</strong> status.
            An Organization Admin will review and approve the device before telematics activation.
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Device Identification & Hardware Specs */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FleetIcons.Gps className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.sec_identification_title')}</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('admin.gps.sec_identification_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.serial_code_label')}</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('admin.gps.serial_code_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.imei_label')}</label>
              <input
                type="text"
                required
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                placeholder={t('admin.gps.imei_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.hardware_type_label')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
              >
                <option value="external">{t('admin.gps.hw_type_external')}</option>
                <option value="builtin">{t('admin.gps.hw_type_oem')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.vendor_label')}</label>
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
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.hw_model_label')}</label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder={t('admin.gps.hw_model_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.hw_serial_label')}</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder={t('admin.gps.hw_serial_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.alias_label')}</label>
              <input
                type="text"
                value={formData.aliasName}
                onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                placeholder={t('admin.gps.alias_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Vehicle Assignment & Installation Specs */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FleetIcons.Bus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.sec_assignment_title')}</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('admin.gps.sec_assignment_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.assigned_bus_label')}</label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-medium"
              >
                <option value="">{t('admin.gps.standby_unassigned_opt')}</option>
                {vehicleList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.bus_number} — {v.model || 'Bus'} {v.vin ? `(${v.vin})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.mounting_location_label')}</label>
              <select
                value={formData.mountingPosition}
                onChange={(e) => setFormData({ ...formData, mountingPosition: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Behind Driver Dashboard">{t('admin.gps.loc_behind_dashboard')}</option>
                <option value="Under Driver Seat">{t('admin.gps.loc_under_seat')}</option>
                <option value="Windshield Header / Sunvisor">{t('admin.gps.loc_windshield_header')}</option>
                <option value="Overhead Luggage Rack">{t('admin.gps.loc_overhead_rack')}</option>
                <option value="Fuse Box / Electrical Junction">{t('admin.gps.loc_fuse_box')}</option>
                <option value="Battery Compartment">{t('admin.gps.loc_battery_compartment')}</option>
                <option value="OBD-II Diagnostic Port">{t('admin.gps.loc_obd_port')}</option>
                <option value="Engine Bay / Firewall">{t('admin.gps.loc_engine_bay')}</option>
                <option value="External Waterproof Enclosure">{t('admin.gps.loc_waterproof_enclosure')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.power_wiring_label')}</label>
              <select
                value={formData.powerWire}
                onChange={(e) => setFormData({ ...formData, powerWire: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Direct Battery Constant (+12V/24V)">{t('admin.gps.wire_direct_battery')}</option>
                <option value="Ignition ACC Switched (+12V)">{t('admin.gps.wire_ignition_acc')}</option>
                <option value="3-Wire (Constant + ACC Ignition + GND)">{t('admin.gps.wire_three_wire')}</option>
                <option value="OBD-II Direct Plug & Play">{t('admin.gps.wire_obd_plug')}</option>
                <option value="Internal Rechargeable Battery Only">{t('admin.gps.wire_internal_battery')}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.install_date_label')}</label>
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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <FleetIcons.Check className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.sec_telematics_title')}</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('admin.gps.sec_telematics_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.sim_number_label')}</label>
              <input
                type="text"
                value={formData.sim}
                onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                placeholder={t('admin.gps.sim_number_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.telecom_provider_label')}</label>
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
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.network_apn_label')}</label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                placeholder={t('admin.gps.network_apn_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.network_protocol_label')}</label>
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
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.backup_battery_label')}</label>
              <input
                type="text"
                value={formData.batteryCapacity}
                onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                placeholder={t('admin.gps.backup_battery_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.firmware_version_label')}</label>
              <input
                type="text"
                value={formData.firmware}
                onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                placeholder={t('admin.gps.firmware_version_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Hardware Box Photo Upload (Deferred Upload) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <FleetIcons.Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.sec_photo_title')}</h3>
              <p className="text-[11px] text-slate-400">
                Upload a clear photo of the GPS tracker box showing serial sticker or vehicle mounting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-2 text-xs">{t('admin.gps.upload_photo_file')}</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-slate-400 transition-all bg-slate-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FleetIcons.Plus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('admin.gps.drag_drop_photo')}</p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">{t('admin.gps.photo_file_types')}</p>
              </div>
            </div>

            {/* Photo Preview Card */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-2 text-xs">{t('admin.gps.photo_preview')}</label>
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
                      {t('common.remove_photo')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <FleetIcons.Gps className="w-8 h-8 mb-1 text-slate-300" />
                  <span>{t('admin.gps.no_photo_selected')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Operational Notes & Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FleetIcons.Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('admin.gps.sec_notes_title')}</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('admin.gps.sec_notes_desc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('admin.gps.operational_notes_label')}</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('admin.gps.notes_placeholder')}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">{t('common.status')}</label>
              <select
                disabled={isFleetOperator}
                value={isFleetOperator ? 'pending_approval' : formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 font-medium"
              >
                <option value="available">{t('admin.gps.status_opt_available')}</option>
                <option value="assigned">{t('admin.gps.status_opt_assigned')}</option>
                {isFleetOperator && <option value="pending_approval">{t('admin.gps.pending_approval')}</option>}
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
            {t('common.cancel')}
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

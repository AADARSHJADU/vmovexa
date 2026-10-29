import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const AddGpsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignVehiclePlate = searchParams.get('assignVehicle') || '';

  const { createDevice, assignVehicle, loadDevices } = useFleetGps();
  const { vehicles, loadVehicles } = useFleetVehicle();
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (assignVehiclePlate) loadVehicles().catch(() => {});
  }, [assignVehiclePlate, loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
  const targetVehicle = vehicleList.find(
    (v) => String(v.bus_number) === String(assignVehiclePlate) ||
           String(v.code) === String(assignVehiclePlate) ||
           String(v.id) === String(assignVehiclePlate)
  ) || {};

  const [formData, setFormData] = useState({
    id: '',
    imei: '',
    vendor: '',
    model: '',
    sim: '',
    network: '',
    networkType: '',
    batteryCapacity: '',
    installationDate: new Date().toISOString().slice(0, 10),
    serialNumber: '',
    firmware: '',
    aliasName: '',
    notes: '',
    imageUrl: '',
    status: 'available',
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('Uploading GPS device photo...');
    try {
      const res = await uploadFile(file, 'gps_device');
      const url = res?.url || res?.file_url || res?.path || '';
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        toast.success('Device photo uploaded!', { id: toastId });
      } else {
        toast.error('Upload succeeded but no URL returned', { id: toastId });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload photo', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imei || !formData.model) {
      toast.error('IMEI and Device Model are required.');
      return;
    }

    const payload = {
      code: formData.id,
      imei: formData.imei,
      vendor: formData.vendor,
      model: formData.model,
      sim: formData.sim,
      network: formData.network,
      network_type: formData.networkType,
      battery_capacity: formData.batteryCapacity,
      installation_date: formData.installationDate,
      serial_number: formData.serialNumber,
      firmware: formData.firmware,
      alias_name: formData.aliasName,
      notes: formData.notes,
      image_url: formData.imageUrl,
      status: formData.status,
    };

    try {
      const createdGps = await toast.promise(createDevice(payload), {
        loading: 'Saving GPS Device...',
        success: 'GPS device created successfully',
        error: (err) => err?.message || 'Failed to create GPS device',
      });
      await loadDevices().catch(() => {});

      if (assignVehiclePlate) {
        if (createdGps?.id && targetVehicle?.id) {
          await assignVehicle(createdGps.id, targetVehicle.id).catch(() => {});
        }
        navigate(`/fleet-operator/vehicles/${targetVehicle?.id ?? assignVehiclePlate}/setup-complete`);
      } else {
        navigate('/fleet-operator/gps');
      }
    } catch {
      /* toast handled error */
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Full-Width Breadcrumb Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Hardware Telematics', path: '/fleet-operator/gps' },
            { label: t('fleet.gps.register_device') },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/fleet-operator/gps')} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title={t('fleet.gps.back_gps')}
            >
              <FleetIcons.ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('fleet.gps.register_device')}</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Register device hardware identity, IoT cellular connectivity, and diagnostic telemetry parameters.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/fleet-operator/gps')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Gps className="w-4 h-4 text-white" />
              <span>{t('fleet.gps.register_device')}</span>
            </button>
          </div>
        </div>
      </div>


      {/* 2. Full-Width 2-Column Responsive Web Form Grid */}
      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 0: Device Photo Upload */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Device Hardware Photo (Optional)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.gps.upload_desc')}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-3xl overflow-hidden shrink-0 shadow-inner relative">
                {formData.imageUrl ? (
                  <img src={resolveFileUrl(formData.imageUrl)} alt="GPS Hardware" className="w-full h-full object-cover" />
                ) : (
                  <FleetIcons.Gps className="w-10 h-10 text-slate-400 dark:text-zinc-500" />
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-white text-xs font-bold">
                    ...
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer">
                  <FleetIcons.Camera className="w-4 h-4 text-white" />
                  <span>{formData.imageUrl ? 'Change Device Photo' : 'Upload Device Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('fleet.gps.supports_format')}</p>
              </div>
            </div>
          </div>

          {/* Section 1: Device Information Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Device Information
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.gps.enter_details_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* GPS Device ID / IMEI * with Scan Button */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  GPS Device ID / IMEI <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
                    <FleetIcons.QrCode className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={t('fleet.gps.ph_device_id')}
                    value={formData.imei}
                    onChange={(e) => setFormData({ ...formData, imei: e.target.value, id: `GPS-TRK-${e.target.value.slice(-5) || '00123'}` })}
                    className="w-full h-11 pl-10 pr-28 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono font-bold"
                  />
                  <button
                    type="button"
                    className="absolute right-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 dark:border-blue-800/40 cursor-pointer"
                  >
                    <FleetIcons.Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t('fleet.gps.scan')}</span>
                  </button>
                </div>
              </div>

              {/* Device Model * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Device Model <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                >
                  <option value="Teltonika FMB920">{t('fleet.gps.model_fmb920')}</option>
                  <option value="Teltonika FMB125">{t('fleet.gps.model_fmb125')}</option>
                  <option value="Queclink GV57">{t('fleet.gps.model_gv57')}</option>
                  <option value="Concox WeTrack2">{t('fleet.gps.model_wetrack2')}</option>
                </select>
              </div>

              {/* SIM Number * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.gps.sim_number')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fleet.gps.sim_placeholder')}
                  value={formData.sim}
                  onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Network Provider * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.gps.network_provider')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                >
                  <option value="Jio 4G IoT">{t('fleet.gps.net_jio')}</option>
                  <option value="Airtel IoT">{t('fleet.gps.net_airtel')}</option>
                  <option value="Vi IoT">{t('fleet.gps.net_vi')}</option>
                  <option value="BSNL M2M">{t('fleet.gps.net_bsnl')}</option>
                </select>
              </div>

              {/* Network Type * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.gps.network_type')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.networkType}
                  onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                >
                  <option value="4G LTE-M">{t('fleet.gps.type_4g_ltem')}</option>
                  <option value="NB-IoT">{t('fleet.gps.type_nbiot')}</option>
                  <option value="4G + 2G Fallback">{t('fleet.gps.type_fallback')}</option>
                </select>
              </div>

              {/* Battery Capacity (mAh) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.battery_capacity')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.battery_placeholder')}
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Installation Date * */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  {t('fleet.gps.install_date')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.installationDate}
                  onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* {t('fleet.gps.serial_number_optional')} */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.serial_number_optional')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.serial_placeholder_optional')}
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Additional Information (Optional) */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. {t('fleet.gps.additional_info')}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.gps.additional_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Firmware Version */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.firmware_version')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.firmware_placeholder')}
                  value={formData.firmware}
                  onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Device Name / Alias */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.device_name_alias')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.alias_placeholder')}
                  value={formData.aliasName}
                  onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Notes with 0/300 counter */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.wiring_notes')}</label>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">{formData.notes.length}/300</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder={t('fleet.gps.notes_placeholder')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: {t('fleet.gps.target_vehicle_context')}, Status & Action Card */}
        <div className="space-y-6">
          
          {/* Target Vehicle Assignment Card */}
          {assignVehiclePlate && (
            <div className="p-6 rounded-2xl bg-slate-900 dark:bg-zinc-900 text-white border border-slate-800 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                  Target Vehicle Context
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 text-[10px] font-bold text-emerald-400">
                  ● {t('common.active')}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 flex items-center justify-center text-2xl text-cyan-400 shrink-0">
                  <FleetIcons.Bus className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-base font-black text-white font-mono">{targetVehicle.bus_number ?? targetVehicle.code ?? assignVehiclePlate}</div>
                  <div className="text-xs text-slate-300 dark:text-zinc-400">{targetVehicle.vehicle_type ?? '—'}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 dark:bg-zinc-800/80 border border-slate-700 dark:border-zinc-700 text-xs space-y-1.5 text-slate-300 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-400">{t('common.fleet')}:</span>
                  <span className="font-bold text-white">{targetVehicle.fleet_id ?? '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-400">{t('common.driver')}:</span>
                  <span className="font-bold text-blue-400">{targetVehicle.assigned_driver_id ?? t('common.unassigned')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-400">{t('common.vehicle_type')}:</span>
                  <span className="font-bold text-white">{targetVehicle.vehicle_type ?? '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Status Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. {t('fleet.gps.operational_status')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.gps.readiness_desc')}</p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setFormData({ ...formData, status: 'Active' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  formData.status === 'Active'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.status === 'Active' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 dark:border-zinc-500'
                }`}>
                  {formData.status === 'Active' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.active')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.gps.active_desc')}</div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  formData.status === 'Inactive'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.status === 'Inactive' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-zinc-500'
                }`}>
                  {formData.status === 'Inactive' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.inactive')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.gps.inactive_desc')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 shadow-sm space-y-2 text-xs text-blue-900 dark:text-blue-300">
            <div className="font-bold flex items-center gap-2">
              <FleetIcons.Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('fleet.gps.hw_diagnostics')}</span>
            </div>
            <p className="text-blue-800/80 dark:text-blue-300/80 leading-relaxed text-[11px]">
              {t('fleet.gps.handshake_desc')}
            </p>
          </div>

          {/* Action Submission Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Gps className="w-4 h-4 text-white" />
              <span>{t('fleet.gps.add_device_finish')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/fleet-operator/gps')}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >{t('common.cancel_return')}</button>
          </div>
        </div>
      </form>
    </div>
  );
};

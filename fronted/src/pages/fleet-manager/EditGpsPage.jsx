import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const EditGpsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { loadDevice, updateDevice, deleteDevice } = useFleetGps();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    imei: '',
    vendor: 'Teltonika',
    model: 'Teltonika FMB920',
    sim: '',
    network: 'Jio 4G IoT',
    networkType: '4G LTE-M',
    batteryCapacity: '1200 mAh',
    installationDate: '',
    serialNumber: '',
    firmware: '',
    aliasName: '',
    notes: '',
    imageUrl: '',
    status: 'available',
    vehicleId: null,
  });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const device = await loadDevice(id);
        if (mounted && device) {
          setFormData({
            code: device.code || `GPS-TRK-${device.id}`,
            imei: device.imei || '',
            vendor: device.vendor || 'Teltonika',
            model: device.model || 'Teltonika FMB920',
            sim: device.sim || '',
            network: device.network || 'Jio 4G IoT',
            networkType: device.network_type || '4G LTE-M',
            batteryCapacity: device.battery_capacity || '1200 mAh',
            installationDate: device.installed_at ? String(device.installed_at).split('T')[0] : '',
            serialNumber: device.serial_number || '',
            firmware: device.firmware || '',
            aliasName: device.alias_name || '',
            notes: device.notes || '',
            imageUrl: device.image_url || '',
            status: device.status || 'available',
            vehicleId: device.vehicle_id || null,
          });
        }
      } catch (err) {
        toast.error(err?.message || 'Failed to load GPS device details');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [id, loadDevice]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const toastId = toast.loading('Uploading photo...');
    try {
      const res = await uploadFile(file, 'gps_device');
      const url = res?.url || res?.file_url || res?.path || '';
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }));
        toast.success('Photo uploaded!', { id: toastId });
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
      code: formData.code,
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
      await toast.promise(updateDevice(id, payload), {
        loading: 'Updating GPS Device...',
        success: 'GPS device updated successfully!',
        error: (err) => err?.message || 'Failed to update GPS device',
      });
      navigate('/fleet-operator/gps');
    } catch {
      /* toast handled error */
    }
  };

  const handleDelete = async () => {
    if (formData.vehicleId) {
      toast.error('Cannot delete a GPS device that is assigned to a vehicle. Unassign first.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this GPS device? This action cannot be undone.')) {
      return;
    }

    try {
      await toast.promise(deleteDevice(id), {
        loading: 'Deleting GPS Device...',
        success: 'GPS device deleted successfully',
        error: (err) => err?.message || 'Failed to delete GPS device',
      });
      navigate('/fleet-operator/gps');
    } catch {
      /* toast handled error */
    }
  };

  if (loading) {
    return (
      <div className="w-full p-12 text-center text-slate-500 dark:text-zinc-400 font-medium text-xs">
        Loading GPS device details...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* 1. Breadcrumb & Actions Header Banner */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Fleet Operator', path: '/fleet-operator/dashboard' },
            { label: 'Hardware Telematics', path: '/fleet-operator/gps' },
            { label: formData.code || 'Edit GPS Device' },
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Edit GPS Device <span className="font-mono text-blue-600 dark:text-blue-400">({formData.code})</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Update device telemetry config, hardware identity, or photo.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FleetIcons.Trash className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{t('fleet.gps.delete_device')}</span>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/fleet-operator/gps')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >{t('common.cancel')}</button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{t('fleet.gps.update_device')}</span>
            </button>
          </div>
        </div>
      </div>


      {/* 2. Web Form Grid */}
      <form onSubmit={handleSubmit} className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 0: Photo Upload */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Device Hardware Photo
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{t('fleet.gps.upload_photo_desc')}</p>
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
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('fleet.gps.supports_photo_ext')}</p>
              </div>
            </div>
          </div>

          {/* Section 1: Device Info */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. Device Identity &amp; Telematics
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{t('fleet.gps.configure_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* IMEI */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  GPS Device ID / IMEI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fleet.gps.ph_device_id')}
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.vendor_label')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.vendor_placeholder')}
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                />
              </div>

              {/* Device Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Device Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('fleet.gps.model_placeholder')}
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                />
              </div>

              {/* {t('fleet.gps.sim_number')} */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.sim_number')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.sim_placeholder')}
                  value={formData.sim}
                  onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* {t('fleet.gps.network_provider')} */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.network_provider')}</label>
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

              {/* Network Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.network_type')}</label>
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

              {/* Battery Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.battery_capacity')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.battery_placeholder')}
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Installation Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.install_date')}</label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.serial_number')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.serial_placeholder')}
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Additional Info */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Additional Settings &amp; Notes
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Firmware */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.firmware_version')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.firmware_placeholder')}
                  value={formData.firmware}
                  onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Alias Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.device_name_alias')}</label>
                <input
                  type="text"
                  placeholder={t('fleet.gps.alias_placeholder')}
                  value={formData.aliasName}
                  onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">{t('fleet.gps.wiring_notes')}</label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder={t('fleet.gps.notes_placeholder')}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Submission */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Operational Status
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setFormData({ ...formData, status: 'available' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  formData.status === 'available'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.status === 'available' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400 dark:border-zinc-500'
                }`}>
                  {formData.status === 'available' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.available')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.gps.avail_binding_desc')}</div>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, status: 'assigned' })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  formData.status === 'assigned'
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/30 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  formData.status === 'assigned' ? 'border-blue-600 bg-blue-600' : 'border-slate-400 dark:border-zinc-500'
                }`}>
                  {formData.status === 'assigned' && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{t('common.assigned')}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">{t('fleet.gps.assigned_active_desc')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>{t('common.save_changes')}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/fleet-operator/gps')}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

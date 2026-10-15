import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { uploadFile, resolveFileUrl } from '../../api/services/upload.service';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { FleetIcons } from '../../components/FleetIcons';

export const EditGpsPage = () => {
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
      navigate('/fleet-manager/gps');
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
      navigate('/fleet-manager/gps');
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
            { label: 'Fleet Manager', path: '/fleet-manager/dashboard' },
            { label: 'Hardware Telematics', path: '/fleet-manager/gps' },
            { label: formData.code || 'Edit GPS Device' },
          ]}
          className="mb-2"
        />

        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => navigate('/fleet-manager/gps')} 
              className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Back to GPS"
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
              <span>Delete Device</span>
            </button>
            <button 
              type="button"
              onClick={() => navigate('/fleet-manager/gps')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FleetIcons.Check className="w-4 h-4 text-white" />
              <span>Update GPS Device</span>
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
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Upload or update photo of installed device or barcode tag.</p>
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
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
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
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Configure hardware identifier, cellular SIM, and network.</p>
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
                  placeholder="Enter GPS Device ID or IMEI"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white font-mono font-bold focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Vendor / Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Teltonika, Queclink, Concox"
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
                  placeholder="e.g. Teltonika FMB920"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                />
              </div>

              {/* SIM Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">SIM Number</label>
                <input
                  type="text"
                  placeholder="Enter SIM number (e.g. +91 99101 23456)"
                  value={formData.sim}
                  onChange={(e) => setFormData({ ...formData, sim: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Network Provider */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Network Provider</label>
                <select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                >
                  <option value="Jio 4G IoT">Jio 4G IoT (eSIM / M2M)</option>
                  <option value="Airtel IoT">Airtel IoT Connected Grid</option>
                  <option value="Vi IoT">Vodafone Idea IoT</option>
                  <option value="BSNL M2M">BSNL M2M</option>
                </select>
              </div>

              {/* Network Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Network Type</label>
                <select
                  value={formData.networkType}
                  onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-medium"
                >
                  <option value="4G LTE-M">4G LTE-M / CAT-M1</option>
                  <option value="NB-IoT">NB-IoT (Narrowband IoT)</option>
                  <option value="4G + 2G Fallback">4G LTE + 2G Fallback</option>
                </select>
              </div>

              {/* Battery Capacity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Battery Capacity</label>
                <input
                  type="text"
                  placeholder="e.g. 1200 mAh"
                  value={formData.batteryCapacity}
                  onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Installation Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Installation Date</label>
                <input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Device Serial Number</label>
                <input
                  type="text"
                  placeholder="Enter device serial number"
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
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Firmware Version</label>
                <input
                  type="text"
                  placeholder="e.g. v3.2.14"
                  value={formData.firmware}
                  onChange={(e) => setFormData({ ...formData, firmware: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 font-mono"
                />
              </div>

              {/* Alias Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Device Alias / Tag Name</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Bus Tracker"
                  value={formData.aliasName}
                  onChange={(e) => setFormData({ ...formData, aliasName: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Installation Notes</label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="Notes..."
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
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Available</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Ready for vehicle binding</div>
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
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Assigned</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Bound to an active vehicle</div>
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
              <span>Save Changes</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/fleet-manager/gps')}
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

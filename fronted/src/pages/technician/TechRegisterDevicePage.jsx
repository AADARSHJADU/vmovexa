import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useTechnicianApp } from '../../hooks/technician/useTechnicianApp';
import { useAuth } from '../../hooks/useAuth';

export const TechRegisterDevicePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vehicles, loadVehicles, registerDevice } = useTechnicianApp();

  useEffect(() => {
    loadVehicles().catch(() => {});
  }, [loadVehicles]);

  const vehicleList = useMemo(() => (Array.isArray(vehicles) ? vehicles : (vehicles?.rows || [])), [vehicles]);

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Device Details
    technicianId: user?.badgeId ?? user?.id ?? '—',
    deviceName: '',
    deviceType: 'Passenger Display',
    hardwareModel: 'VMOVEXA UltraHD Screen X2',
    displaySize: '15.6 inch',
    resolution: '1920x1080 (1080p FHD)',
    description: '',
    locationDepot: 'Mumbai Central Depot',
    notes: '',

    // Step 2: {t('technician.devices.assigned_vehicle')}
    selectedVehicleId: '',
    mac: '',
    simNetwork: 'Wi-Fi',
    agentVersion: '',
    installationPosition: 'Front Section — Left Side',
    powerSource: 'Vehicle 24V Auxiliary Circuit',
    vehicleNotes: '',

    // Step 3: Configuration
    brightness: 80,
    screenTimeout: '5 Minutes',
    autoBrightness: true,
    displayMode: 'Full Screen',
    screenOrientation: 'Landscape',
    networkType: 'Wi-Fi',
    wifiSsid: 'VMOVEXA_CORP_NET',
    wifiPassword: '',
    autoPlay: true,
    syncInterval: 'Every 15 Minutes',
    rebootSchedule: 'Daily at 03:00 AM',
    timezone: 'GMT +5:30 (IST)',
  });

  const [confirmedDisclaimer, setConfirmedDisclaimer] = useState(true);

  // Default the selected vehicle once data loads.
  useEffect(() => {
    if (!formData.selectedVehicleId && vehicleList.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, selectedVehicleId: vehicleList[0].id }));
    }
  }, [vehicleList, formData.selectedVehicleId]);

  // Selected vehicle object (may be null before data loads)
  const selectedVehicle = vehicleList.find((v) => String(v.id) === String(formData.selectedVehicleId)) || null;

  const handleVehicleSelect = (vId) => {
    const veh = vehicleList.find((v) => String(v.id) === String(vId));
    setFormData((prev) => ({ ...prev, selectedVehicleId: veh ? veh.id : vId }));
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    if (!confirmedDisclaimer) return;
    const boxId = (formData.deviceName || '').trim() || `BOX-${Date.now()}`;
    const payload = {
      boxId,
      mac: formData.mac || undefined,
      vehicleId: selectedVehicle?.id ?? undefined,
      depotId: selectedVehicle?.depot_id ?? undefined,
      organizationId: selectedVehicle?.organization_id ?? undefined,
      agentVersion: formData.agentVersion || undefined,
      simNetwork: formData.networkType || undefined,
    };
    try {
      const registeredDevice = await toast.promise(registerDevice(payload), {
        loading: 'Registering device…',
        success: 'Device registered',
        error: (err) => err?.message || 'Failed to register device',
      });
      navigate('/technician/devices/register/success', { state: { device: registeredDevice } });
    } catch {
      /* toast surfaced the error */
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Breadcrumb
            items={[
              { label: 'Technician', path: '/technician/dashboard' },
              { label: 'Display Devices', path: '/technician/devices' },
              { label: 'Register Device' }
            ]}
            className="mb-2"
          />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('technician.register.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Provision, mount, configure, and assign a new display screen to a transit vehicle
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full self-start sm:self-auto">
          Step {currentStep} of 4
        </span>
      </div>

      {/* 4-Step Stepper Progress Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Device Details', desc: 'Hardware Specs' },
            { step: 2, title: 'Vehicle Assignment', desc: 'Depot & Bus ID' },
            { step: 3, title: 'Configuration', desc: 'Screen & Network' },
            { step: 4, title: 'Review & Save', desc: 'Verification' },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-3 ${
                currentStep === s.step
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : currentStep > s.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep === s.step
                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <div className="min-w-0 truncate">
                <div className="text-xs font-bold truncate leading-tight">{s.title}</div>
                <div className="text-[10px] opacity-80 truncate hidden sm:block">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: DEVICE DETAILS */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('technician.register.hw_info_title')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('technician.register.hw_info_desc')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.account.badge_id')}</label>
              <input
                type="text"
                readOnly
                value={formData.technicianId}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.box_id_label')}</label>
              <input
                type="text"
                required
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                placeholder="e.g. VMX-BOX-1001"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.device_type_label')}</label>
              <select
                value={formData.deviceType}
                onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <option value="Passenger Display">{t('technician.options.type_passenger') || 'Passenger Display (Interior)'}</option>
                <option value="Driver Display">{t('technician.options.type_driver_hud') || 'Driver Display / HUD'}</option>
                <option value="Exterior Display">{t('technician.options.type_exterior_led') || 'Exterior LED Route Sign'}</option>
                <option value="GPS Unit">{t('technician.options.type_gps') || 'GPS & Telematics Box'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.hw_model_label')}</label>
              <select
                value={formData.hardwareModel}
                onChange={(e) => setFormData({ ...formData, hardwareModel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <option value="VMOVEXA UltraHD Screen X2">VMOVEXA UltraHD Screen X2 (1080p)</option>
                <option value="VMOVEXA SlimLine 12">VMOVEXA SlimLine 12 (720p)</option>
                <option value="VMOVEXA DriverHUD Pro">VMOVEXA DriverHUD Pro</option>
                <option value="VMOVEXA DotMatrix Lumina">VMOVEXA DotMatrix Lumina</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.register.display_spec')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.screen_size')}</label>
                <select
                  value={formData.displaySize}
                  onChange={(e) => setFormData({ ...formData, displaySize: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="10.1 inch">{t('technician.options.size_10_1')}</option>
                  <option value="12.0 inch">{t('technician.options.size_12_0')}</option>
                  <option value="15.6 inch">{t('technician.options.size_15_6')}</option>
                  <option value="21.5 inch">{t('technician.options.size_21_5')}</option>
                  <option value="32.0 inch (Signage)">{t('technician.options.size_32_0')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.native_res')}</label>
                <select
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="1920x1080 (1080p FHD)">{t('technician.options.res_1080p')}</option>
                  <option value="1280x800 (HD)">{t('technician.options.res_800p')}</option>
                  <option value="3840x2160 (4K UHD)">{t('technician.options.res_4k')}</option>
                  <option value="256x64 LED Matrix">{t('technician.options.res_led')}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.desc_purpose')}</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.register.install_depot')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.depot_label')}</label>
                <select
                  value={formData.locationDepot}
                  onChange={(e) => setFormData({ ...formData, locationDepot: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Mumbai Central Depot">{t('technician.options.depot_mumbai')}</option>
                  <option value="Andheri Depot">{t('technician.options.depot_andheri')}</option>
                  <option value="Kurla West Terminus">{t('technician.options.depot_kurla')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.field_notes')}</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                  placeholder="e.g. Front bulkhead mounting"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Vehicle Assignment →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VEHICLE ASSIGNMENT */}
      {currentStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('technician.devices.assigned_vehicle')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('technician.register.vehicle_binding_desc')}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.search_vehicle')}</label>
            <select
              value={formData.selectedVehicleId}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
            >
              {vehicleList.length === 0 && <option value="">{t('technician.gps.no_vehicles')}</option>}
              {vehicleList.map((v) => (
                <option key={v.id} value={v.id}>
                  {(v.bus_number ?? v.code ?? v.id)} — {(v.vehicle_type ?? '—')} (Depot {v.depot_id ?? '—'})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Vehicle Card Preview */}
          {selectedVehicle ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 font-mono">{selectedVehicle.bus_number ?? selectedVehicle.code ?? '—'}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedVehicle.vehicle_type ?? '—'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('common.code')}:</span>
                    <div className="font-bold text-slate-800 truncate">{selectedVehicle.code ?? '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('technician.hardware_status.depot')}:</span>
                    <div className="font-bold text-slate-800">{selectedVehicle.depot_id ?? '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('common.organization')}:</span>
                    <div className="font-bold text-slate-800">{selectedVehicle.organization_id ?? '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('common.vehicle_id')}:</span>
                    <div className="font-bold text-slate-800 truncate">{selectedVehicle.id ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium">
              Select a vehicle to preview its details.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.mount_pos_label')}</label>
              <select
                value={formData.installationPosition}
                onChange={(e) => setFormData({ ...formData, installationPosition: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <option value="Front Section — Left Side">{t('technician.options.pos_bulkhead_left')}</option>
                <option value="Front Section — Right Side">{t('technician.options.pos_front_right')}</option>
                <option value="Center Ceiling Pillar">{t('technician.options.pos_ceiling_center')}</option>
                <option value="Rear Cabin Header">{t('technician.options.pos_rear_cabin')}</option>
                <option value="Dashboard Console Mount">{t('technician.options.pos_dashboard_hud')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.power_source_label')}</label>
              <select
                value={formData.powerSource}
                onChange={(e) => setFormData({ ...formData, powerSource: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              >
                <option value="Vehicle 24V Auxiliary Circuit">{t('technician.options.pwr_24v_aux')}</option>
                <option value="Direct Ignition ACC Line">{t('technician.options.pwr_acc_line')}</option>
                <option value="Auxiliary Inverter 230V">{t('technician.options.pwr_inverter_230v')}</option>
                <option value="Dedicated Solar Battery Pack">{t('technician.options.pwr_solar_battery')}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.wiring_notes')}</label>
              <textarea
                rows={2}
                value={formData.vehicleNotes}
                onChange={(e) => setFormData({ ...formData, vehicleNotes: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Configuration →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIGURATION */}
      {currentStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('technician.register.hw_net_config')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('technician.register.fine_tune_desc')}</p>
          </div>

          {/* Section 1: {t('technician.config.display_settings')} */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.config.display_settings')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">{t('technician.config.brightness')}</label>
                  <span className="text-xs font-mono font-bold text-slate-900">{formData.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={formData.brightness}
                  onChange={(e) => setFormData({ ...formData, brightness: Number(e.target.value) })}
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.config.timeout')}</label>
                <select
                  value={formData.screenTimeout}
                  onChange={(e) => setFormData({ ...formData, screenTimeout: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="5 Minutes">{t('technician.options.timeout_5m')}</option>
                  <option value="15 Minutes">{t('technician.options.timeout_15m')}</option>
                  <option value="Never">{t('technician.options.timeout_never')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">{t('technician.register.ambient_auto')}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{t('technician.register.adjust_via_photo')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoBrightness}
                  onChange={(e) => setFormData({ ...formData, autoBrightness: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-900">{t('technician.register.auto_boot')}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{t('technician.register.launch_on_acc')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoPlay}
                  onChange={(e) => setFormData({ ...formData, autoPlay: e.target.checked })}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
              </div>
            </div>
          </div>

          {/* Section 2: {t('technician.register.connectivity_settings')} */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('technician.register.connectivity_settings')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.network_type')}</label>
                <select
                  value={formData.networkType}
                  onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Wi-Fi">{t('technician.register.wifi_depot') || 'Wi-Fi (Depot Mesh & In-Bus Router)'}</option>
                  <option value="LTE 4G">{t('technician.config.iface_lte')}</option>
                  <option value="5G SA">{t('technician.register.5g_sa') || '5G SA High-Bandwidth Telematics'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.wifi_ssid')}</label>
                <input
                  type="text"
                  value={formData.wifiSsid}
                  onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.sync_interval')}</label>
                <select
                  value={formData.syncInterval}
                  onChange={(e) => setFormData({ ...formData, syncInterval: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Realtime (5 Sec)">{t('technician.options.sync_5s')}</option>
                  <option value="Every 15 Minutes">{t('technician.options.sync_15m')}</option>
                  <option value="Hourly">{t('technician.options.sync_hourly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">{t('technician.register.reboot_schedule')}</label>
                <select
                  value={formData.rebootSchedule}
                  onChange={(e) => setFormData({ ...formData, rebootSchedule: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-slate-300 focus:outline-none"
                >
                  <option value="Daily at 03:00 AM">{t('technician.options.reboot_3am')}</option>
                  <option value="Daily at 04:00 AM">{t('technician.options.reboot_4am')}</option>
                  <option value="Weekly">{t('technician.options.reboot_weekly')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Next: Review & Save →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SAVE */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{t('technician.register.review_title')}</h2>
            <p className="text-xs text-slate-500 font-medium">{t('technician.register.review_desc')}</p>
          </div>

          {/* Review Summary Accordions */}
          <div className="space-y-4">
            {/* Device Info Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('technician.register.step1_title')}</span>
                <span className="text-[11px] font-bold text-blue-700">{formData.deviceType}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.registered.device_id')}:</span>
                  <div className="font-bold text-slate-800">{formData.deviceName}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.register.hw_model_label')}</span>
                  <div className="font-bold text-slate-800">{formData.hardwareModel} ({formData.displaySize})</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.register.native_res')}:</span>
                  <div className="font-bold text-slate-800">{formData.resolution}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.hardware_status.depot')}:</span>
                  <div className="font-bold text-slate-800">{formData.locationDepot}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Assignment Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('technician.register.step2_title')}</span>
                <span className="text-[11px] font-bold text-emerald-700 font-mono">{selectedVehicle?.bus_number ?? selectedVehicle?.code ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs flex-1">
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('technician.register.mount_pos_label')}</span>
                    <div className="font-bold text-slate-800">{formData.installationPosition}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('technician.register.power_source_label')}</span>
                    <div className="font-bold text-slate-800">{formData.powerSource}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t('common.vehicle')}:</span>
                    <div className="font-bold text-emerald-700">{selectedVehicle?.vehicle_type ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('technician.register.step3_title')}</span>
                <span className="text-[11px] font-bold text-slate-600">{t('technician.register.settings_configured_6')}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.config.brightness')}:</span>
                  <div className="font-bold text-slate-800">{formData.brightness}%</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.register.network_type')}:</span>
                  <div className="font-bold text-slate-800">{formData.networkType} ({formData.wifiSsid})</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.register.sync_interval')}:</span>
                  <div className="font-bold text-slate-800">{formData.syncInterval}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">{t('technician.register.reboot_schedule')}:</span>
                  <div className="font-bold text-slate-800">{formData.rebootSchedule}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmedDisclaimer}
              onChange={(e) => setConfirmedDisclaimer(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-slate-900 rounded"
            />
            <label htmlFor="confirm" className="text-xs font-bold text-blue-900 cursor-pointer">
              By saving the device, you confirm all hardware mounting, wiring specifications, and telemetry parameters are verified and operational.
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleFinish}
              disabled={!confirmedDisclaimer}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <FleetIcons.Check className="w-4 h-4" />
              <span>{t('technician.register.save_btn')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

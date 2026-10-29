/* eslint-disable react-hooks/set-state-in-effect -- available fleets initialize the modal selection */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetManager } from '../../hooks/fleet/useFleetManager';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { Modal } from '../../components/Modal';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { FleetIcons } from '../../components/FleetIcons';

export const AddVehicleModal = ({ isOpen, onClose, onComplete }) => {
  const { t } = useTranslation();
  const { createVehicle, assignDriver, assignGps, loadVehicles } = useFleetVehicle();
  const { fleets, loadFleets } = useFleetManager();
  const { drivers, loadDrivers } = useFleetDriver();
  const { devices, loadDevices } = useFleetGps();
  const [openSection, setOpenSection] = useState(1); // 1 to 5

  useEffect(() => {
    if (!isOpen) return;
    loadFleets().catch(() => {});
    loadDrivers().catch(() => {});
    loadDevices().catch(() => {});
  }, [isOpen, loadFleets, loadDrivers, loadDevices]);

  const fleetList = useMemo(() => Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []), [fleets]);
  const driverList = Array.isArray(drivers) ? drivers : (drivers?.items || drivers?.rows || []);
  const gpsList = Array.isArray(devices) ? devices : (devices?.items || devices?.rows || []);

  const [formData, setFormData] = useState({
    fleetId: '',
    fleetName: '',
    plate: '',
    chassisNo: '',
    type: 'Electric Bus',
    model: 'Volvo B400 Electric',
    year: '2024',
    capacity: '42 Seater',
    fuelType: 'Electric (EV)',
    mobileNumber: '+91 90000 12345',
    assignedRoute: 'Route 101: Indiranagar - Majestic',
    destination: 'Kempegowda Bus Station (Majestic)',
    driverId: '',
    gpsId: '',
    displayBoardText: 'VMOVEXA 101: INDIRANAGAR → MAJESTIC',
    displayBrightness: 'High (100%)',
    status: 'Idle',
  });

  useEffect(() => {
    if (!formData.fleetId && fleetList.length > 0) {
      setFormData((prev) => ({ ...prev, fleetId: String(fleetList[0].id), fleetName: fleetList[0].name || '' }));
    }
  }, [fleetList, formData.fleetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plate) return;

    const payload = {
      bus_number: formData.plate,
      vin: formData.chassisNo,
      vehicle_type: formData.type,
      model: formData.model,
      year: formData.year,
      capacity: formData.capacity,
      fuel_type: formData.fuelType,
      fleet_id: formData.fleetId || null,
      assigned_route: formData.assignedRoute,
      destination: formData.destination,
      display_board_text: formData.displayBoardText,
      display_brightness: formData.displayBrightness,
      status: formData.status,
    };

    try {
      const created = await toast.promise(createVehicle(payload), {
        loading: 'Saving...',
        success: 'Vehicle created',
        error: (err) => err?.message || 'Failed to create vehicle',
      });
      // Optional driver / GPS assignment
      if (created?.id && formData.driverId) {
        await assignDriver(created.id, formData.driverId).catch(() => {});
      }
      if (created?.id && formData.gpsId) {
        await assignGps(created.id, formData.gpsId).catch(() => {});
      }
      await loadVehicles().catch(() => {});
      onClose();
      if (onComplete) onComplete(created);
    } catch {
      /* toast already surfaced the error */
    }
  };

  const toggleSection = (s) => setOpenSection(openSection === s ? 0 : s);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('fleet.vehicle.add_modal_title')} className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Accordion 1: {t('fleet.vehicle.fleet_basic_info')} */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(1)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
              <span>{t('fleet.vehicle.fleet_basic_info')}</span>
            </div>
            <span>{openSection === 1 ? '▲' : '▼'}</span>
          </button>

          {openSection === 1 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select 
                  label="Select Fleet *"
                  options={fleetList.map(f => ({ label: f.name ?? f.code ?? String(f.id), value: f.id }))}
                  value={formData.fleetId}
                  onChange={(e) => {
                    const sel = fleetList.find(f => String(f.id) === String(e.target.value));
                    setFormData({ ...formData, fleetId: e.target.value, fleetName: sel?.name || '' });
                  }}
                />
                <Input 
                  label={t('fleet.vehicle.registration_plate')}
                  placeholder={t('fleet.vehicle.plate_placeholder')}
                  required
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  label={t('fleet.vehicle.chassis_number')}
                  placeholder={t('fleet.vehicle.chassis_placeholder')}
                  value={formData.chassisNo}
                  onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
                />
                <Select 
                  label={t('fleet.vehicle.vehicle_type')}
                  options={[
                    { label: t('fleet.vehicle.type_electric_bus'), value: 'Electric Bus' },
                    { label: t('fleet.vehicle.type_cng_bus'), value: 'CNG City Bus' },
                    { label: t('fleet.vehicle.type_intercity_coach'), value: 'Electric Coach' },
                    { label: t('fleet.vehicle.type_shuttle_van'), value: 'Luxury Van' },
                  ]}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <Select 
                  label={t('fleet.vehicle.fuel_power_type')}
                  options={[
                    { label: t('fleet.vehicle.fuel_electric'), value: 'Electric (EV)' },
                    { label: t('fleet.vehicle.fuel_cng'), value: 'CNG' },
                    { label: t('fleet.vehicle.fuel_diesel'), value: 'Diesel' },
                    { label: t('fleet.vehicle.fuel_hybrid'), value: 'Hybrid' },
                  ]}
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  label={t('fleet.vehicle.make_model')}
                  placeholder={t('fleet.vehicle.model_placeholder')}
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
                <Input 
                  label={t('fleet.vehicle.mfg_year')}
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
                <Input 
                  label={t('fleet.vehicle.passenger_capacity')}
                  placeholder={t('fleet.vehicle.capacity_placeholder')}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Route Information */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(2)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">2</span>
              <span>{t('fleet.vehicle.route_assignment')}</span>
            </div>
            <span>{openSection === 2 ? <FleetIcons.ChevronUp className="w-4 h-4 inline" /> : <FleetIcons.ChevronDown className="w-4 h-4 inline" />}</span>
          </button>

          {openSection === 2 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input 
                  label={t('fleet.vehicle.assigned_route_name')}
                  placeholder={t('fleet.vehicle.route_placeholder')}
                  value={formData.assignedRoute}
                  onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                />
                <Input 
                  label={t('fleet.vehicle.primary_destination')}
                  placeholder={t('fleet.vehicle.destination_placeholder')}
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Vehicle Documents */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(3)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">3</span>
              <span>{t('fleet.vehicle.docs_compliance')}</span>
            </div>
            <span>{openSection === 3 ? <FleetIcons.ChevronUp className="w-4 h-4 inline" /> : <FleetIcons.ChevronDown className="w-4 h-4 inline" />}</span>
          </button>

          {openSection === 3 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{t('fleet.vehicle.rc_label')}</div>
                    <div className="text-[10px] text-[var(--muted)]">{t('fleet.vehicle.expires')}: 12 Dec 2029</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> {t('fleet.vehicle.attached')}</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{t('fleet.vehicle.insurance_label')}</div>
                    <div className="text-[10px] text-[var(--muted)]">{t('fleet.vehicle.expires')}: 15 Aug 2025</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> {t('fleet.vehicle.attached')}</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{t('fleet.vehicle.fitness_label')}</div>
                    <div className="text-[10px] text-[var(--muted)]">{t('fleet.vehicle.expires')}: 10 Jan 2026</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> {t('fleet.vehicle.attached')}</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{t('fleet.vehicle.permit_label')}</div>
                    <div className="text-[10px] text-[var(--muted)]">{t('fleet.vehicle.expires')}: 30 Nov 2027</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> {t('fleet.vehicle.attached')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Display Screen Configuration */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(4)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">4</span>
              <span>{t('fleet.vehicle.display_board')}</span>
            </div>
            <span>{openSection === 4 ? '▲' : '▼'}</span>
          </button>

          {openSection === 4 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              {/* LED Display Board Preview */}
              <div className="p-4 rounded-xl bg-black border-2 border-cyan-500/40 text-center shadow-inner">
                <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">{t('fleet.vehicle.front_led_preview')}</div>
                <div className="font-mono text-base md:text-lg font-black tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] py-2">
                  {formData.displayBoardText || 'VMOVEXA SMART BUS'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input 
                  label="Display Board Text"
                  placeholder={t('fleet.vehicle.text_to_show')}
                  value={formData.displayBoardText}
                  onChange={(e) => setFormData({ ...formData, displayBoardText: e.target.value.toUpperCase() })}
                />
                <Select 
                  label="LED Brightness Mode"
                  options={[
                    { label: 'Auto Adaptive (Ambient sensor)', value: 'Auto' },
                    { label: 'High (100% Daylight)', value: 'High' },
                    { label: 'Night Mode (40% Soft)', value: 'Night' },
                  ]}
                  value={formData.displayBrightness}
                  onChange={(e) => setFormData({ ...formData, displayBrightness: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 5: Driver & GPS Assignment */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(5)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">5</span>
              <span>{t('fleet.vehicle.hardware_linkage')}</span>
            </div>
            <span>{openSection === 5 ? '▲' : '▼'}</span>
          </button>

          {openSection === 5 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select 
                  label="Assign Driver"
                  options={[
                    { label: '-- Select Driver (Optional) --', value: '' },
                    ...driverList.map(d => ({ label: `${d.name ?? '—'} (${d.emp_id ?? d.code ?? d.id}) - ${d.status ?? '—'}`, value: d.id }))
                  ]}
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                />
                <Select 
                  label="Connect GPS Telematics Device"
                  options={[
                    { label: '-- Select GPS Hardware (Optional) --', value: '' },
                    ...gpsList.map(g => ({ label: `${g.code ?? g.id} (${g.model ?? '—'}) - ${g.status ?? '—'}`, value: g.id }))
                  ]}
                  value={formData.gpsId}
                  onChange={(e) => setFormData({ ...formData, gpsId: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[var(--primary)] text-white px-8 font-bold">
            Complete Vehicle Setup
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleModal;

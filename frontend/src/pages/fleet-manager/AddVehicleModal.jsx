import React, { useState, useEffect } from 'react';
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

  const fleetList = Array.isArray(fleets) ? fleets : (fleets?.items || fleets?.rows || []);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Vehicle (5-Step Configuration)" className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Accordion 1: Fleet & Basic Information */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection(1)}
            className="w-full p-4 bg-[var(--surface)] flex items-center justify-between font-bold text-xs text-[var(--foreground)]"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px]">1</span>
              <span>Fleet & Basic Information</span>
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
                  label="Registration / License Plate *"
                  placeholder="e.g. MH12AB1234"
                  required
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  label="Chassis Number"
                  placeholder="e.g. CHS-89234710"
                  value={formData.chassisNo}
                  onChange={(e) => setFormData({ ...formData, chassisNo: e.target.value })}
                />
                <Select 
                  label="Vehicle Type"
                  options={[
                    { label: 'Electric Bus', value: 'Electric Bus' },
                    { label: 'CNG City Bus', value: 'CNG City Bus' },
                    { label: 'Intercity Coach', value: 'Electric Coach' },
                    { label: 'Airport Shuttle Van', value: 'Luxury Van' },
                  ]}
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
                <Select 
                  label="Fuel / Power Type"
                  options={[
                    { label: 'Electric (EV)', value: 'Electric (EV)' },
                    { label: 'CNG', value: 'CNG' },
                    { label: 'Diesel', value: 'Diesel' },
                    { label: 'Hybrid', value: 'Hybrid' },
                  ]}
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input 
                  label="Make & Model"
                  placeholder="e.g. Volvo B400 Electric"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
                <Input 
                  label="Manufacturing Year"
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
                <Input 
                  label="Passenger Capacity"
                  placeholder="e.g. 42 Seater"
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
              <span>Route & Assignment Schedule</span>
            </div>
            <span>{openSection === 2 ? '▲' : '▼'}</span>
          </button>

          {openSection === 2 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input 
                  label="Assigned Route Name"
                  placeholder="e.g. Route 101: Indiranagar to Majestic"
                  value={formData.assignedRoute}
                  onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                />
                <Input 
                  label="Primary Destination"
                  placeholder="e.g. Kempegowda Bus Station"
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
              <span>Vehicle Documents & Compliance</span>
            </div>
            <span>{openSection === 3 ? '▲' : '▼'}</span>
          </button>

          {openSection === 3 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Registration Certificate (RC)</div>
                    <div className="text-[10px] text-[var(--muted)]">Expires: 12 Dec 2029</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> Attached</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Commercial Insurance</div>
                    <div className="text-[10px] text-[var(--muted)]">Expires: 15 Aug 2025</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> Attached</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Fitness Certificate</div>
                    <div className="text-[10px] text-[var(--muted)]">Expires: 10 Jan 2026</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> Attached</span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Transport Permit</div>
                    <div className="text-[10px] text-[var(--muted)]">Expires: 30 Nov 2027</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold"><FleetIcons.Check className="w-3 h-3" /> Attached</span>
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
              <span>Digital Display Board Configuration</span>
            </div>
            <span>{openSection === 4 ? '▲' : '▼'}</span>
          </button>

          {openSection === 4 && (
            <div className="p-4 bg-[var(--surface)]/50 border-t border-[var(--border)] space-y-3">
              {/* LED Display Board Preview */}
              <div className="p-4 rounded-xl bg-black border-2 border-cyan-500/40 text-center shadow-inner">
                <div className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase mb-1">FRONT LED DESTINATION BOARD PREVIEW</div>
                <div className="font-mono text-base md:text-lg font-black tracking-widest text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] py-2">
                  {formData.displayBoardText || 'VMOVEXA SMART BUS'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input 
                  label="Display Board Text"
                  placeholder="Text to show on LED screen"
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
              <span>Driver & GPS Hardware Linkage</span>
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

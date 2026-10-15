import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FleetIcons } from '../../components/FleetIcons';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetGps } from '../../hooks/fleet/useFleetGps';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';

export const AssignGpsModal = ({ isOpen, onClose, device, gpsDevice }) => {
  const target = device || gpsDevice;
  const { vehicles, loadVehicles } = useFleetVehicle();
  const { assignVehicle, loadDevices } = useFleetGps();
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    if (isOpen) loadVehicles().catch(() => {});
  }, [isOpen, loadVehicles]);

  const vehicleList = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);

  useEffect(() => {
    if (!selectedVehicle && vehicleList.length > 0) setSelectedVehicle(String(vehicleList[0].id));
  }, [vehicleList, selectedVehicle]);

  if (!target) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!target.id || !selectedVehicle) return;
    try {
      await toast.promise(assignVehicle(target.id, selectedVehicle), {
        loading: 'Assigning...',
        success: 'GPS device assigned',
        error: (err) => err?.message || 'Failed to assign GPS device',
      });
      await loadDevices().catch(() => {});
      onClose();
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign GPS Hardware to Vehicle" className="max-w-lg">
      <form onSubmit={handleAssign} className="space-y-5 pt-2">
        {/* Context Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <FleetIcons.Gps className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{target.code ?? target.id}</h4>
            <p className="text-xs text-cyan-300 font-mono">Model: {target.model ?? '—'}</p>
            <p className="text-[11px] text-[var(--muted)]">Network: {target.network ?? '—'} • Signal: {target.signal ?? '—'}</p>
          </div>
        </div>

        <Select 
          label="Select Target Vehicle *"
          options={vehicleList.map(v => ({ label: `${v.bus_number ?? v.code ?? v.id} (${v.vehicle_type ?? '—'})`, value: v.id }))}
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
        />

        <div className="pt-3 flex justify-end gap-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[var(--primary)] text-white px-6 font-bold">
            Connect GPS
          </Button>
        </div>
      </form>
    </Modal>
  );
};

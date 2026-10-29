/* eslint-disable react-hooks/set-state-in-effect -- available vehicles initialize the modal selection */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';
import { useFleetVehicle } from '../../hooks/fleet/useFleetVehicle';
import { useFleetDriver } from '../../hooks/fleet/useFleetDriver';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { FleetIcons } from '../../components/FleetIcons';

export const AssignDriverModal = ({ isOpen, onClose, driver }) => {
  const { t } = useTranslation();
  const { vehicles, loadVehicles } = useFleetVehicle();
  const { assignBus, loadDrivers } = useFleetDriver();
  const [selectedVehicle, setSelectedVehicle] = useState('');

  useEffect(() => {
    if (isOpen) loadVehicles({ exclude_status: 'pending_approval,pending,rejected', limit: 100 }).catch(() => {});
  }, [isOpen, loadVehicles]);

  const vehicleList = useMemo(() => {
    const list = Array.isArray(vehicles) ? vehicles : (vehicles?.items || vehicles?.rows || []);
    return list.filter((v) => {
      const s = String(v?.status || '').toLowerCase().trim();
      return s !== 'pending_approval' && s !== 'pending' && s !== 'rejected';
    });
  }, [vehicles]);

  useEffect(() => {
    if (!selectedVehicle && vehicleList.length > 0) setSelectedVehicle(String(vehicleList[0].id));
  }, [vehicleList, selectedVehicle]);

  if (!driver) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!driver.id || !selectedVehicle) return;
    try {
      await toast.promise(assignBus(driver.id, selectedVehicle), {
        loading: 'Assigning...',
        success: 'Driver assigned',
        error: (err) => err?.message || 'Failed to assign driver',
      });
      await loadDrivers().catch(() => {});
      onClose();
    } catch {
      /* toast already surfaced the error */
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('fleet.assign.driver_title')} className="max-w-lg">
      <form onSubmit={handleAssign} className="space-y-5 pt-2">
        {/* Context Banner */}
        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
            <FleetIcons.Driver className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{driver.name ?? '—'}</h4>
            <p className="text-xs text-blue-300 font-mono">Employee ID: {driver.emp_id ?? driver.code ?? '—'}</p>
            <p className="text-[11px] text-[var(--muted)]">{driver.license_type ?? '—'}</p>
          </div>
        </div>

        <Select 
          label="Choose Target Vehicle *"
          options={vehicleList.map(v => ({ label: `${v.bus_number ?? v.code ?? v.id} (${v.vehicle_type ?? '—'})`, value: v.id }))}
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
        />

        <div className="pt-3 flex justify-end gap-3 border-t border-[var(--border)]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[var(--primary)] text-white px-6 font-bold">
            Confirm Assignment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignDriverModal;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FleetIcons } from '../../components/FleetIcons';

export const SetupCompleteModal = ({ isOpen, onClose, vehicleData }) => {
  const navigate = useNavigate();

  if (!vehicleData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-lg p-6 text-center">
      <div className="flex flex-col items-center py-4">
        {/* Animated Checkmark Shield */}
        <div className="w-20 h-20 relative flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500 animate-ping opacity-25"></div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl shadow-xl shadow-blue-500/30">
            <FleetIcons.Check className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-xl font-black text-[var(--foreground)]">Vehicle Successfully Configured!</h2>
        <p className="text-xs text-[var(--muted)] mt-1">All 5 configuration steps and telemetry links have been verified.</p>

        {/* Checklist */}
        <div className="w-full bg-[var(--secondary)]/40 border border-[var(--border)] rounded-2xl p-4 mt-6 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Vehicle Plate:</span>
            <span className="font-bold text-[var(--foreground)]">{vehicleData.plate}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Fleet:</span>
            <span className="font-bold text-[var(--foreground)]">{vehicleData.fleetName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <span className="text-[var(--muted)]">Assigned Driver:</span>
            <span className="font-bold text-blue-400">{vehicleData.driver?.name || 'Unassigned'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--muted)]">GPS Hardware ID:</span>
            <span className="font-bold text-emerald-500">{vehicleData.gpsDevice?.id || 'Connected'}</span>
          </div>
        </div>

        {/* Success items check */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4 text-[11px] text-emerald-500 font-semibold text-left">
          <div className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5" /> Fleet Linked</div>
          <div className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5" /> Documents Verified</div>
          <div className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5" /> Display Board Configured</div>
          <div className="flex items-center gap-1.5"><FleetIcons.Check className="w-3.5 h-3.5" /> GPS Telematics Live</div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full space-y-2 mt-6">
          <Button 
            onClick={() => {
              onClose();
              navigate(`/fleet-manager/vehicles`);
            }}
            className="w-full bg-[var(--primary)] text-white font-bold py-2.5 rounded-xl shadow-lg shadow-[var(--primary)]/20"
          >
            View Vehicle List
          </Button>
          <button 
            onClick={onClose}
            className="w-full text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SetupCompleteModal;

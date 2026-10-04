import { useState, useEffect } from 'react';
import { Modal } from '../../../shared/ui/Components';
import { VehicleEntry } from './TruckInfoCard';

const CHECKLIST_ITEMS = [
  { key: 'sealVerified', label: 'Cargo seals verified and intact' },
  { key: 'tempChecked', label: 'Cargo temperature checked' },
  { key: 'manifestSigned', label: 'Loading manifest signed by driver' },
  { key: 'safetyCheck', label: 'Vehicle safety inspection passed' },
] as const;

type ChecklistState = Record<(typeof CHECKLIST_ITEMS)[number]['key'], boolean>;

interface DepartureClearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleEntry | null;
  onConfirm: (vehicle: VehicleEntry) => void;
}

export function DepartureClearanceModal({
  isOpen,
  onClose,
  vehicle,
  onConfirm,
}: DepartureClearanceModalProps) {
  const [checklist, setChecklist] = useState<ChecklistState>({
    sealVerified: false,
    tempChecked: false,
    manifestSigned: false,
    safetyCheck: false,
  });

  useEffect(() => {
    if (isOpen) {
      setChecklist({
        sealVerified: false,
        tempChecked: false,
        manifestSigned: false,
        safetyCheck: false,
      });
    }
  }, [isOpen]);

  if (!vehicle) return null;

  const allChecked = Object.values(checklist).every(Boolean);

  const handleAuthorize = () => {
    if (allChecked) {
      onConfirm(vehicle);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Departure clearance checklist"
    >
      <div className="loader-clearance-content">
        <p>Complete all safety checks for {vehicle.plate} before departure.</p>
        <div className="loader-checklist">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="loader-checklist-item">
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={(e) =>
                  setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                }
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        <div className="loader-clearance-actions">
          <button
            type="button"
            className="loader-action-button"
            disabled={!allChecked}
            onClick={handleAuthorize}
          >
            Authorize departure
          </button>
        </div>
      </div>
    </Modal>
  );
}

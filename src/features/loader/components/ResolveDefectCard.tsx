import { useState } from 'react';
import { Check, Circle, Lock } from 'lucide-react';
import { DefectPackageItem } from './AffectedPackagesList';

interface ResolveDefectCardProps {
  selectedItem: DefectPackageItem | null;
  onConfirmDefect: (item: DefectPackageItem) => void;
  onRescan: (item: DefectPackageItem) => void;
  onMarkResolved: (item: DefectPackageItem) => void;
}

export function ResolveDefectCard({
  selectedItem,
  onConfirmDefect,
  onRescan,
  onMarkResolved,
}: ResolveDefectCardProps) {
  const [evidenceReviewed, setEvidenceReviewed] = useState(true);
  const [quantityVerified, setQuantityVerified] = useState(true);
  const [dispositionSelected, setDispositionSelected] = useState(false);

  if (!selectedItem) {
    return (
      <div className="resolve-defect-card">
        <div className="resolve-header">
          <h3>Resolve selected defect</h3>
          <p>Select an affected package from the list</p>
        </div>
      </div>
    );
  }

  const severityLabel =
    selectedItem.severity === 'high'
      ? 'High severity'
      : selectedItem.severity === 'medium'
      ? 'Medium severity'
      : 'Low severity';

  return (
    <div className="resolve-defect-card">
      {/* Header */}
      <div className="resolve-header">
        <h3>Resolve selected defect</h3>
        <p>
          {selectedItem.packageCode} • {selectedItem.issueNote.split(';')[0]} •{' '}
          {severityLabel}
        </p>
      </div>

      {/* Verification Steps */}
      <div className="resolve-checklist">
        {/* Step 1: Evidence reviewed */}
        <button
          type="button"
          className={`checklist-step-row ${evidenceReviewed ? 'checked' : ''}`}
          onClick={() => setEvidenceReviewed(!evidenceReviewed)}
        >
          <div className="step-icon-circle checked">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="step-label">Evidence reviewed</span>
        </button>

        {/* Step 2: Quantity verified */}
        <button
          type="button"
          className={`checklist-step-row ${quantityVerified ? 'checked' : ''}`}
          onClick={() => setQuantityVerified(!quantityVerified)}
        >
          <div className="step-icon-circle checked">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="step-label">Quantity verified</span>
        </button>

        {/* Step 3: Disposition selected */}
        <button
          type="button"
          className={`checklist-step-row ${dispositionSelected ? 'checked' : 'pending'}`}
          onClick={() => setDispositionSelected(!dispositionSelected)}
        >
          <div className={`step-icon-circle ${dispositionSelected ? 'checked' : 'pending'}`}>
            {dispositionSelected ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
          <span className="step-label">Disposition selected</span>
        </button>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        className="btn-resolve-confirm-defect"
        onClick={() => onConfirmDefect(selectedItem)}
      >
        Confirm defect
      </button>

      {/* Sub-Action Buttons Row */}
      <div className="resolve-sub-actions-row">
        <button
          type="button"
          className="btn-resolve-rescan"
          onClick={() => onRescan(selectedItem)}
        >
          Re-scan
        </button>
        <button
          type="button"
          className="btn-resolve-resolved"
          onClick={() => onMarkResolved(selectedItem)}
        >
          Mark resolved
        </button>
      </div>

      {/* Bottom Resumption Notice */}
      <div className="resolve-notice-pill">
        <Lock className="w-4 h-4 text-gray-500" />
        <span>Loading resumes when all defects are resolved.</span>
      </div>
    </div>
  );
}

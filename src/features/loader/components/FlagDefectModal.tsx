import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { PackageData } from './PackageScannerCard';

interface FlagDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportDefect: (defect: {
    packageId: string;
    issueType: string;
    severity: string;
    notes: string;
  }) => void;
  currentPackage: PackageData;
}

export function FlagDefectModal({
  isOpen,
  onClose,
  onReportDefect,
  currentPackage,
}: FlagDefectModalProps) {
  const [issueType, setIssueType] = useState('Damaged Box / Punctured');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'critical'>('medium');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportDefect({
      packageId: currentPackage.id,
      issueType,
      severity,
      notes,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNotes('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container flag-defect-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge red-badge">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3>Flag a Defect</h3>
              <p>Report damaged or irregular cargo for inspection</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="modal-success-splash">
            <CheckCircle className="w-12 h-12 text-red-600 mb-2" />
            <h4>Defect Logged Successfully</h4>
            <p>
              {currentPackage.id} has been flagged as <strong>{issueType}</strong> and moved to the quarantine inspection queue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form-body">
            {/* Package Summary Chip */}
            <div className="defect-package-summary">
              <div>
                <span className="summary-label">Target Package</span>
                <strong>{currentPackage.id}</strong>
              </div>
              <div>
                <span className="summary-label">Type &amp; Weight</span>
                <strong>
                  {currentPackage.type} • {currentPackage.weight}
                </strong>
              </div>
            </div>

            {/* Issue Category */}
            <div className="form-group">
              <label htmlFor="defect-type-select">Issue Category</label>
              <select
                id="defect-type-select"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="Damaged Box / Punctured">Damaged Box / Punctured</option>
                <option value="Broken Seal / Tampered">Broken Seal / Tampered</option>
                <option value="Leaking Fluid / Wet Cargo">Leaking Fluid / Wet Cargo</option>
                <option value="Wrong Destination / Misrouted">Wrong Destination / Misrouted</option>
                <option value="Unreadable Barcode / Missing Tag">Unreadable Barcode / Missing Tag</option>
                <option value="Temperature Abuse / Thawed">Temperature Abuse / Thawed</option>
              </select>
            </div>

            {/* Severity Pill Selector */}
            <div className="form-group">
              <label>Severity Level</label>
              <div className="severity-pill-group">
                <button
                  type="button"
                  className={`severity-pill low ${severity === 'low' ? 'active' : ''}`}
                  onClick={() => setSeverity('low')}
                >
                  Minor Flaw
                </button>
                <button
                  type="button"
                  className={`severity-pill medium ${severity === 'medium' ? 'active' : ''}`}
                  onClick={() => setSeverity('medium')}
                >
                  Hold for Review
                </button>
                <button
                  type="button"
                  className={`severity-pill critical ${severity === 'critical' ? 'active' : ''}`}
                  onClick={() => setSeverity('critical')}
                >
                  Reject &amp; Quarantine
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="defect-notes">Observation Notes</label>
              <textarea
                id="defect-notes"
                rows={3}
                placeholder="Describe visible damage, tears, odors, or label discrepancies..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Attachment preview trigger */}
            <div className="photo-attachment-chip">
              <Camera className="w-4 h-4 text-gray-500" />
              <span>Attach inspection snapshot (Optional)</span>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-modal-submit red"
              >
                Submit Defect Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

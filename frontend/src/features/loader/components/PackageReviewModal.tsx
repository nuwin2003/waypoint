import { X, CheckCircle2, ShieldCheck, MapPin, Scale, Box, Tag } from 'lucide-react';
import { PackageData } from './PackageScannerCard';

interface PackageReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageData;
  onConfirmScanned: () => void;
}

export function PackageReviewModal({
  isOpen,
  onClose,
  packageData,
  onConfirmScanned,
}: PackageReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container review-package-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge green-badge">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3>Package Verification</h3>
              <p>Matched Cargo Details &amp; Validation</p>
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

        <div className="package-review-grid">
          <div className="review-stat-card">
            <Tag className="w-4 h-4 text-purple-600" />
            <span>Package ID</span>
            <strong>{packageData.id}</strong>
          </div>
          <div className="review-stat-card">
            <Box className="w-4 h-4 text-purple-600" />
            <span>Format</span>
            <strong>{packageData.type}</strong>
          </div>
          <div className="review-stat-card">
            <Scale className="w-4 h-4 text-purple-600" />
            <span>Weight</span>
            <strong>{packageData.weight}</strong>
          </div>
          <div className="review-stat-card">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Zone Staging</span>
            <strong>{packageData.zone ?? 'Zone B – Bay 04'}</strong>
          </div>
        </div>

        <div className="manifest-match-status">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <strong>Manifest Match Confirmed</strong>
            <p>
              Package matches electronic dispatch manifest for Truck LB-2229 (Peliyagoda to Gampaha).
            </p>
          </div>
        </div>

        <div className="modal-actions-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-modal-submit purple"
            onClick={() => {
              onConfirmScanned();
              onClose();
            }}
          >
            Confirm &amp; Proceed to Next
          </button>
        </div>
      </div>
    </div>
  );
}

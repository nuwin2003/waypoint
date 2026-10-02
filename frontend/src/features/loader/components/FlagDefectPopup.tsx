import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import '../modalPopups.css';

export interface FlagDefectPopupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: { packageInfo: string; notes: string; photo?: File | null }) => void;
  defaultPackage?: string;
}

export function FlagDefectPopup({
  isOpen = true,
  onClose,
  onSubmit,
  defaultPackage = 'PKG-9041 · Summit Foods',
}: FlagDefectPopupProps) {
  const [packageInfo, setPackageInfo] = useState(defaultPackage);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ packageInfo, notes });
    }
  };

  return (
    <div className="waypoint-popup-backdrop" onClick={onClose}>
      <div
        className="waypoint-popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flag-defect-title"
      >
        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            className="waypoint-popup-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="waypoint-popup-header">
          <h2 id="flag-defect-title" className="waypoint-popup-title">
            Flag a defect
          </h2>
          <p className="waypoint-popup-subtitle">
            Photo required · Notifies dispatch instantly
          </p>
        </div>

        {/* Form Body */}
        <form className="flag-defect-form" onSubmit={handleSubmit}>
          {/* Field: Package */}
          <div className="popup-field-group">
            <label className="popup-field-label">
              Package<span className="required-star">*</span>
            </label>
            <input
              type="text"
              className="popup-text-input"
              value={packageInfo}
              onChange={(e) => setPackageInfo(e.target.value)}
              placeholder="e.g. PKG-9041 · Summit Foods"
              required
            />
          </div>

          {/* Field: Photo Evidence */}
          <div className="popup-field-group">
            <label className="popup-field-label">
              Photo evidence<span className="required-star">*</span>
            </label>
            <div className="popup-photo-capture-box" role="button" tabIndex={0}>
              <div className="popup-camera-icon-badge">
                <Camera className="w-5 h-5" />
              </div>
              <strong className="popup-capture-title">Capture photo</strong>
              <span className="popup-capture-sub">Glove-friendly tap target</span>
            </div>
            <span className="popup-field-hint">
              JPG or PNG, max 10MB · Hold tablet steady
            </span>
          </div>

          {/* Field: Notes */}
          <div className="popup-field-group">
            <label className="popup-field-label">Notes</label>
            <textarea
              className="popup-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the defect... e.g. corner crushed, wet patch ~10cm, smells like leak"
            />
          </div>

          {/* Submit CTA */}
          <button type="submit" className="btn-popup-primary">
            Submit defect
          </button>
        </form>
      </div>
    </div>
  );
}

export default FlagDefectPopup;

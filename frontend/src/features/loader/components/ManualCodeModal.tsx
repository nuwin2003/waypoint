import React, { useState } from 'react';
import { X, Keyboard, CheckCircle, AlertCircle } from 'lucide-react';
import { PackageData } from './PackageScannerCard';

interface ManualCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeSubmit: (code: string) => boolean;
  currentPackage: PackageData;
}

export function ManualCodeModal({
  isOpen,
  onClose,
  onCodeSubmit,
  currentPackage,
}: ManualCodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError('Please enter a package or barcode number.');
      return;
    }

    const matched = onCodeSubmit(code.trim().toUpperCase());
    if (matched) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode('');
        onClose();
      }, 1000);
    } else {
      setError(`Code "${code.trim()}" not found in current loading queue.`);
    }
  };

  const handleUseCurrentCode = () => {
    setCode(currentPackage.id);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container manual-code-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div className="modal-title-with-icon">
            <div className="modal-icon-badge purple-badge">
              <Keyboard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3>Enter Package Code</h3>
              <p>Manual barcode / identifier fallback</p>
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

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-group">
            <label htmlFor="package-code-input">Package ID / Barcode</label>
            <div className="input-with-button-wrapper">
              <input
                id="package-code-input"
                type="text"
                placeholder="e.g. PKG-007"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                autoFocus
              />
              <button
                type="button"
                className="btn-paste-target"
                onClick={handleUseCurrentCode}
              >
                Use {currentPackage.id}
              </button>
            </div>
          </div>

          {error && (
            <div className="modal-alert-box error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="modal-alert-box success">
              <CheckCircle className="w-4 h-4" />
              <span>Package verified and marked scanned!</span>
            </div>
          )}

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
              className="btn-modal-submit purple"
            >
              Verify &amp; Confirm Scan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

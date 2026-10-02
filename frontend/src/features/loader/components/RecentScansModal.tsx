import { X, Check, Search } from 'lucide-react';
import { useState } from 'react';
import { RecentScanItem } from './RecentScansCard';

interface RecentScansModalProps {
  isOpen: boolean;
  onClose: () => void;
  scans: RecentScanItem[];
}

export function RecentScansModal({
  isOpen,
  onClose,
  scans,
}: RecentScansModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = scans.filter(
    (s) =>
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="modal-container recent-scans-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <div>
            <h3>All Scanned Packages</h3>
            <p>{scans.length} total packages logged for current truck load</p>
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

        <div className="modal-search-box">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by package ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="modal-scans-scroll-list">
          {filtered.map((scan) => (
            <div className="modal-scan-row" key={scan.id}>
              <div className="scan-item-icon">
                <Check className="w-4 h-4" />
              </div>
              <div className="scan-item-details">
                <strong>{scan.code}</strong>
                <span>{scan.details}</span>
              </div>
              <span className="scan-item-time">{scan.time}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="no-scans-placeholder">No matching packages found.</p>
          )}
        </div>

        <div className="modal-actions-row">
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

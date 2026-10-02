import { Check } from 'lucide-react';

export interface RecentScanItem {
  id: string;
  code: string;
  details: string;
  time: string;
}

interface RecentScansCardProps {
  scans: RecentScanItem[];
}

export function RecentScansCard({ scans }: RecentScansCardProps) {
  return (
    <div className="loader-side-card recent-scans-card">
      <div className="card-header-flex">
        <h3>Recent scans</h3>
        <span className="recent-scans-count-badge">
          {scans.length} logged
        </span>
      </div>

      {/* Scrollable list: latest on top */}
      <div className="recent-scans-scrollable-list">
        {scans.map((scan) => (
          <div className="recent-scan-item" key={scan.id}>
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

        {scans.length === 0 && (
          <p className="no-scans-placeholder">No packages scanned yet.</p>
        )}
      </div>
    </div>
  );
}

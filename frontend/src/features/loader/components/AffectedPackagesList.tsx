export interface DefectPackageItem {
  id: string;
  stopId: string;
  packageCode: string;
  typeAndCargo: string;
  issueNote: string;
  quantityNote: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'unresolved' | 'confirmed' | 'resolved';
}

interface AffectedPackagesListProps {
  items: DefectPackageItem[];
  selectedId: string;
  onSelect: (item: DefectPackageItem) => void;
  onRescan: (item: DefectPackageItem) => void;
  onConfirmDefect: (item: DefectPackageItem) => void;
}

export function AffectedPackagesList({
  items,
  selectedId,
  onSelect,
  onRescan,
  onConfirmDefect,
}: AffectedPackagesListProps) {
  const unresolvedCount = items.filter((item) => item.status !== 'resolved').length;

  return (
    <div className="affected-packages-card">
      {/* Card Header */}
      <div className="affected-card-header">
        <div className="affected-header-text">
          <h2>Affected packages &amp; items</h2>
          <p>{items.length} items • newest scan first</p>
        </div>
        <div className="unresolved-badge">
          <span className="amber-dot" />
          <span>{unresolvedCount} unresolved</span>
        </div>
      </div>

      {/* Package Items List */}
      <div className="affected-items-list">
        {items.map((item) => {
          const isSelected = item.id === selectedId;

          return (
            <div
              key={item.id}
              className={`affected-item-row ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(item)}
            >
              {/* Left Thumbnail with Timestamp Pill */}
              <div className="affected-thumb-box">
                <span className="thumb-time-pill">{item.timestamp}</span>
              </div>

              {/* Middle Details */}
              <div className="affected-item-details">
                <strong className="affected-item-title">{item.packageCode}</strong>
                <span className="affected-item-meta">
                  {item.typeAndCargo} • {item.quantityNote}
                </span>
                <p className="affected-item-description">{item.issueNote}</p>
              </div>

              {/* Right Action Buttons */}
              <div
                className="affected-item-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn-affected-rescan"
                  onClick={() => onRescan(item)}
                >
                  Re-scan
                </button>
                <button
                  type="button"
                  className={`btn-affected-confirm ${
                    isSelected || item.status === 'confirmed' ? 'solid-purple' : 'soft-purple'
                  }`}
                  onClick={() => onConfirmDefect(item)}
                >
                  Confirm defect
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="no-defects-placeholder">
            <p>No defect items logged for this load.</p>
          </div>
        )}
      </div>
    </div>
  );
}

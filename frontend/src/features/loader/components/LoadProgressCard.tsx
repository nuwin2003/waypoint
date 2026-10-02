interface LoadProgressCardProps {
  scannedCount: number;
  totalCount: number;
  loadedWeight: string;
}

export function LoadProgressCard({
  scannedCount,
  totalCount,
  loadedWeight,
}: LoadProgressCardProps) {
  const percentage = totalCount > 0 ? Math.round((scannedCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - scannedCount);

  return (
    <div className="loader-side-card load-progress-card">
      <div className="progress-header">
        <h3>Load progress</h3>
        <span className="progress-percent-val">{percentage}%</span>
      </div>

      {/* Progress Track */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stat Metric Boxes */}
      <div className="progress-stats-grid">
        <div className="stat-pill-box primary-stat">
          <strong className="stat-number">{scannedCount}</strong>
          <span className="stat-tag">SCANNED</span>
        </div>
        <div className="stat-pill-box neutral-stat">
          <strong className="stat-number">{remainingCount}</strong>
          <span className="stat-tag">REMAINING</span>
        </div>
        <div className="stat-pill-box neutral-stat">
          <strong className="stat-number">{loadedWeight}</strong>
          <span className="stat-tag">LOADED</span>
        </div>
      </div>
    </div>
  );
}

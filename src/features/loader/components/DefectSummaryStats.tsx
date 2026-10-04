interface DefectSummaryStatsProps {
  scannedCount: number;
  remainingCount: number;
  defectCount: number;
  recordedCount: number;
  totalCount: number;
}

export function DefectSummaryStats({
  scannedCount,
  remainingCount,
  defectCount,
  recordedCount,
  totalCount,
}: DefectSummaryStatsProps) {
  const progressPct = totalCount > 0 ? Math.round((recordedCount / totalCount) * 100) : 0;

  return (
    <div className="defect-summary-stats-grid">
      {/* 1. Scanned Card */}
      <div className="defect-stat-card">
        <span className="defect-stat-label">Scanned</span>
        <div className="defect-stat-value-group">
          <strong className="defect-stat-number neutral">{scannedCount}</strong>
          <span className="defect-stat-unit">packages</span>
        </div>
      </div>

      {/* 2. Remaining Card */}
      <div className="defect-stat-card">
        <span className="defect-stat-label">Remaining</span>
        <div className="defect-stat-value-group">
          <strong className="defect-stat-number purple">{remainingCount}</strong>
        </div>
      </div>

      {/* 3. Defects Card */}
      <div className="defect-stat-card">
        <span className="defect-stat-label">Defects</span>
        <div className="defect-stat-value-group">
          <strong className="defect-stat-number red">{defectCount}</strong>
        </div>
      </div>

      {/* 4. Load Progress Card */}
      <div className="defect-stat-card progress-stat-card">
        <div className="defect-progress-header">
          <span className="defect-stat-label">Load progress</span>
          <strong className="defect-progress-pct">{progressPct}%</strong>
        </div>
        <div className="defect-progress-track">
          <div
            className="defect-progress-bar"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="defect-progress-sub">
          {recordedCount} of {totalCount} packages recorded
        </span>
      </div>
    </div>
  );
}

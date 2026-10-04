interface TruckCapacityCardProps {
  loadPct: number;
  maxTons?: number;
}

export function TruckCapacityCard({ loadPct, maxTons = 13.5 }: TruckCapacityCardProps) {
  const currentLoad = ((maxTons * loadPct) / 100).toFixed(1);

  return (
    <article className="loader-capacity-card">
      <h2>Capacity &amp; load</h2>
      <div className="loader-capacity-content">
        <div
          className="loader-capacity-ring"
          role="img"
          aria-label={`${loadPct}% weight capacity used`}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="loader-capacity-track" cx="50" cy="50" r="43" />
            <circle
              className="loader-capacity-value"
              cx="50"
              cy="50"
              r="43"
              style={{
                strokeDasharray: 270.18,
                strokeDashoffset: 270.18 * (1 - loadPct / 100),
              }}
            />
          </svg>
          <div>
            <strong>{loadPct}%</strong>
            <span>Weight</span>
          </div>
        </div>
        <div className="loader-capacity-numbers">
          <div>
            <span>Current load</span>
            <strong>
              {currentLoad}
              <small> tons</small>
            </strong>
          </div>
          <div>
            <span>Max. Capacity</span>
            <strong>
              {maxTons}
              <small> tons</small>
            </strong>
          </div>
        </div>
      </div>
    </article>
  );
}

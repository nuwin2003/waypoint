import { Warehouse } from 'lucide-react';
import { STOPS } from '../data/driverData';

interface DvMapProps {
  activeIndex: number;
  /** Extra class for height/variant. */
  className?: string;
  status?: string;
  showDriver?: boolean;
}

// Fixed sample coordinates (0–100 space) so the route line and markers render
// consistently. A real map would come from the Google Maps integration described
// in docs/google-maps.md once API keys are configured.
const DEPOT_POINT = { x: 20, y: 82 };
const STOP_POINTS = [
  { x: 42, y: 58 },
  { x: 64, y: 70 },
  { x: 78, y: 40 },
  { x: 56, y: 20 },
];

export function DvMap({ activeIndex, className = '', status, showDriver = false }: DvMapProps) {
  const points = [DEPOT_POINT, ...STOP_POINTS];
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={`dv-map ${className}`} role="img" aria-label="Route map preview">
      <svg className="dv-map-canvas" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="dv-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--dv-map-line)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dv-grid)" />
        <path d={path} fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
        <path d={path} fill="none" stroke="var(--purple-600)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <span className="dv-map-marker dv-map-depot" style={{ left: `${DEPOT_POINT.x}%`, top: `${DEPOT_POINT.y}%` }}>
        <Warehouse size={14} aria-hidden />
      </span>

      {STOPS.map((stop, i) => {
        const p = STOP_POINTS[i];
        const state = i === activeIndex ? 'active' : i < activeIndex ? 'done' : '';
        return (
          <span
            key={stop.position}
            className={`dv-map-marker dv-map-stop ${state}`}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {stop.position}
          </span>
        );
      })}

      {showDriver && (
        <span className="dv-map-driver" style={{ left: `${DEPOT_POINT.x}%`, top: `${DEPOT_POINT.y}%` }} />
      )}

      {status && <span className="dv-map-status">{status}</span>}
      <span className="dv-map-attribution">Map preview · connect Google Maps</span>
    </div>
  );
}

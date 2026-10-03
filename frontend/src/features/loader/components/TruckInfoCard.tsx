import { Phone, MessageSquare, Send } from 'lucide-react';

export type LoadStatus = 'loading' | 'ready' | 'flagged' | 'not-started';

export interface VehicleEntry {
  tripId?: string;
  id: string;
  plate: string;
  type: string;
  dock: string;
  route: string;
  originSub: string;
  destSub: string;
  driver: string;
  loadPct: number;
  status: LoadStatus;
  packages: number;
  tempReq: 'Chilled' | 'Dry';
  stopsDone: number;
  totalStops: number;
}

interface TruckInfoCardProps {
  vehicle: VehicleEntry;
  onClearDeparture?: (vehicle: VehicleEntry) => void;
}

const STATUS_LABELS: Record<LoadStatus, string> = {
  loading: 'Loading',
  ready: 'Ready',
  flagged: 'Flagged',
  'not-started': 'Not started',
};

export function TruckInfoCard({ vehicle, onClearDeparture }: TruckInfoCardProps) {
  const [routeOrigin = 'Peliyagoda', routeDestination = 'Gampaha'] = vehicle.route.split(' to ');

  return (
    <article className="loader-info-card">
      <div className="loader-info-card-title">
        <strong>{vehicle.plate}</strong>
        <span className={`loader-status-pill ${vehicle.status}`}>
          <i />
          {STATUS_LABELS[vehicle.status]}
        </span>
      </div>

      <div className="loader-driver-row">
        <div className="loader-driver-avatar" aria-hidden="true" />
        <div className="loader-driver-name">
          <span>DRIVER</span>
          <strong>{vehicle.driver}</strong>
        </div>
        <div className="loader-driver-actions">
          <button
            type="button"
            className="loader-driver-icon-btn"
            aria-label={`Call driver ${vehicle.driver}`}
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="loader-driver-icon-btn"
            aria-label={`Message driver ${vehicle.driver}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
        {vehicle.status === 'ready' && onClearDeparture && (
          <button
            className="loader-clear-button"
            type="button"
            onClick={() => onClearDeparture(vehicle)}
          >
            Clear for departure
          </button>
        )}
        {vehicle.status === 'flagged' && (
          <span className="loader-issue-note">Issue flagged</span>
        )}
      </div>

      <div className="loader-vehicle-facts">
        <div>
          <span>Truck ID</span>
          <strong>{vehicle.id}</strong>
        </div>
        <div>
          <span>Dock</span>
          <strong>{`Dock #${Number(vehicle.dock.slice(2)) || vehicle.dock}`}</strong>
        </div>
        <div>
          <span>Started</span>
          <strong>08:34 AM</strong>
        </div>
      </div>

      <div className="loader-route-line">
        <div>
          <strong>{routeOrigin}</strong>
          <span>{vehicle.originSub || 'Colombo'}</span>
        </div>
        <span className="loader-route-track">
          <i>
            <Send className="w-3 h-3" />
          </i>
        </span>
        <div className="destination">
          <strong>{routeDestination}</strong>
          <span>{vehicle.destSub || 'Gampaha'}</span>
        </div>
      </div>
    </article>
  );
}

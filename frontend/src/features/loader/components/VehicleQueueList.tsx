import { ChevronRight } from 'lucide-react';
import { VehicleEntry, LoadStatus } from './TruckInfoCard';

interface VehicleQueueListProps {
  vehicles: VehicleEntry[];
  activeVehicleIndex: number;
  vehicleFilter: 'all' | LoadStatus;
  onFilterChange: (filter: 'all' | LoadStatus) => void;
  onSelectVehicle: (index: number) => void;
}

const STATUS_LABELS: Record<LoadStatus, string> = {
  loading: 'Loading',
  ready: 'Ready',
  flagged: 'Flagged',
  'not-started': 'Not started',
};

export function VehicleQueueList({
  vehicles,
  activeVehicleIndex,
  vehicleFilter,
  onFilterChange,
  onSelectVehicle,
}: VehicleQueueListProps) {
  const filtered =
    vehicleFilter === 'all'
      ? vehicles
      : vehicles.filter((v) => v.status === vehicleFilter);

  const vehicleCounts = {
    total: vehicles.length,
    loading: vehicles.filter((v) => v.status === 'loading').length,
    ready: vehicles.filter((v) => v.status === 'ready').length,
    flagged: vehicles.filter((v) => v.status === 'flagged').length,
  };

  return (
    <section className="loader-vehicle-dashboard" aria-label="Vehicle loading dashboard">
      <header className="loader-dashboard-heading">
        <div>
          <h1>Vehicles</h1>
          <p>Peliyagoda distribution centre · Morning loading window</p>
        </div>
      </header>

      {/* Top 4 Quick Stats */}
      <div className="loader-dashboard-stats">
        {[
          { label: 'Trucks today', value: vehicleCounts.total, note: 'Peliyagoda', status: 'all' as const },
          { label: 'Loading', value: vehicleCounts.loading, note: 'In progress', status: 'loading' as const },
          { label: 'Ready', value: vehicleCounts.ready, note: 'Departure cleared', status: 'ready' as const },
          { label: 'Flagged', value: vehicleCounts.flagged, note: 'Needs attention', status: 'flagged' as const },
        ].map((stat) => (
          <button
            className={`loader-dashboard-stat${vehicleFilter === stat.status ? ' selected' : ''}`}
            key={stat.label}
            type="button"
            onClick={() => onFilterChange(stat.status)}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </button>
        ))}
      </div>

      {/* Filter Pills */}
      <div className="loader-filter-pills" aria-label="Filter vehicles">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'Loading', value: 'loading' as const },
          { label: 'Ready', value: 'ready' as const },
          { label: 'Flagged', value: 'flagged' as const },
          { label: 'Not started', value: 'not-started' as const },
        ].map((option) => (
          <button
            className={vehicleFilter === option.value ? 'active' : ''}
            type="button"
            key={option.value}
            onClick={() => onFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Queue Header */}
      <div className="loader-queue-heading">
        <h2>Vehicle queue</h2>
        <span>{filtered.length} vehicles</span>
      </div>

      {/* Queue Rows */}
      <div className="loader-vehicle-queue">
        {filtered.map((entry) => {
          const index = vehicles.findIndex((item) => item.id === entry.id);

          return (
            <button
              className={`loader-queue-row${index === activeVehicleIndex ? ' selected' : ''}`}
              key={entry.id}
              type="button"
              onClick={() => onSelectVehicle(index)}
              aria-label={`Open truck ${entry.plate}, ${STATUS_LABELS[entry.status]}`}
            >
              <span className="loader-queue-vehicle">
                <i>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 5h13v12H2zM15 9h4l3 3v5h-7M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                </i>
                <span>
                  <strong>{entry.plate}</strong>
                  <small>Dock {entry.dock}</small>
                </span>
              </span>
              <span className="loader-queue-route">
                <small>Route</small>
                <strong>{entry.route.replace(' to ', ' → ')}</strong>
              </span>
              <span className="loader-queue-progress">
                <small>Load progress</small>
                <strong>
                  {entry.stopsDone} of {entry.totalStops} stops
                </strong>
              </span>
              <span className={`loader-queue-status ${entry.status}`}>
                {STATUS_LABELS[entry.status]}
              </span>
              <ChevronRight className="loader-chevron" />
            </button>
          );
        })}

        {filtered.length === 0 && (
          <p className="loader-empty-state">No vehicles match this filter.</p>
        )}
      </div>
    </section>
  );
}

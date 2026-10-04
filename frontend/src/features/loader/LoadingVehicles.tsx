import { CheckCircle2 } from 'lucide-react';
import {
  sortStops,
  getActiveStopId,
  vehicleConfigs,
  type Item,
  type Stop,
  type VehicleConfig,
} from './loading-logic';
import './loading-vehicles.css';

export { vehicleConfigs };
export type { Item, Stop, VehicleConfig };

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export const loadingVehicles = {
  truck: vehicleConfigs.reeferTruck,
  lorry: vehicleConfigs.refrigeratedLorry,
  van: vehicleConfigs.van,
} as const;

export interface LoadingVehiclesProps {
  vehicle: VehicleConfig;
  stops: Stop[];
  loadedIds?: Set<string>;
  onItemClick?: (item: Item) => void;
  onLoadNext?: () => void;
}

/**
 * Visual vehicle cargo loading diagram with LIFO sequence (Cab -> Rear Door).
 * The cargo hold is divided into main drop sections for each delivery point.
 * Inside each drop section, it divides into the individual package delivery items.
 * As items are loaded, the package cells visually fill up.
 */
export function LoadingVehicles({
  vehicle,
  stops,
  loadedIds = new Set(),
  onItemClick,
}: LoadingVehiclesProps) {
  // LIFO sequence: Drop 3 (last drop) -> Drop 2 -> Drop 1 (rear door)
  const ordered = sortStops(stops);
  const activeId = getActiveStopId(stops, loadedIds);

  return (
    <section className="diagram-section" aria-label="Vehicle cargo loading layout">
      {/* Visual Vehicle Stage with Cargo Hold Overlay */}
      <div className="vehicle-scroll">
        <div
          className={cn(
            'vehicle-stage',
            vehicle.type === 'van' && 'vehicle-stage-van',
            vehicle.type === 'lorry' && 'vehicle-stage-lorry',
            vehicle.type === 'truck' && 'vehicle-stage-truck'
          )}
        >
          {/* Base Vehicle Shell Image */}
          <img
            className="vehicle-shell"
            src={vehicle.image}
            alt={`${vehicle.type} cargo view`}
          />

          {/* Truck Container outline overlay */}
          {vehicle.type === 'truck' && (
            <img
              className="vehicle-container-outline"
              src="/images/truck-container.svg"
              alt=""
              aria-hidden="true"
            />
          )}

          {/* Cargo Zones Overlay placed precisely inside container */}
          <div className="cargo-overlay" style={vehicle.cargoRect}>
            {ordered.map((stop) => {
              const done = stop.items.every((i) => loadedIds.has(i.id));
              const active = stop.id === activeId;
              const volume = stop.items.reduce((s, i) => s + i.volumeM3, 0);

              return (
                <div
                  key={stop.id}
                  className={cn(
                    'cargo-zone',
                    done ? 'cargo-zone-done' : active ? 'cargo-zone-active' : 'cargo-zone-locked'
                  )}
                  style={{ flexGrow: Math.max(volume, 0.1) }}
                >
                  {/* Drop Section Header */}
                  <div className="cargo-zone-head">
                    <div>
                      <span>DROP {stop.sequence}</span>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-label="Drop fully loaded" />}
                    </div>
                    <strong title={stop.outletName}>{stop.outletName}</strong>
                  </div>

                  {/* Divided Package Item Cells for this Delivery Point */}
                  <div className="cargo-cells">
                    {stop.items.map((item) => {
                      const loaded = loadedIds.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onItemClick?.(item)}
                          aria-label={`${item.id}, ${item.weightKg} kg, ${loaded ? 'loaded' : item.flagged ?? 'pending'}`}
                          title={`${item.id} (${item.weightKg} kg)`}
                          className={cn(
                            'cargo-item',
                            loaded
                              ? 'cargo-item-loaded'
                              : item.flagged
                              ? 'cargo-item-flagged'
                              : 'cargo-item-pending'
                          )}
                        >
                          <span className="cargo-item-weight">{item.weightKg} kg</span>
                          <span className="cargo-item-id">{item.id}</span>
                          {item.flagged && <span className="cargo-item-state">{item.flagged}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoadingVehicles;

import truckPhoto from '../../assets/waypoint-truck.png';
import vanPhoto from '../../assets/waypoint-city-van.png';
import lorryPhoto from '../../assets/waypoint-refrigerated-lorry.png';

export type Item = {
  id: string;
  label: string;
  volumeM3: number;
  weightKg: number;
  temp: 'chilled' | 'ambient';
  loaded: boolean;
  flagged?: 'damaged' | 'missing';
};

export type Stop = {
  id: string;
  sequence: number;
  outletName: string;
  district: string;
  items: Item[];
};

export type VehicleConfig = {
  id: string;
  type: 'truck' | 'van' | 'lorry';
  temp: 'reefer' | 'ambient';
  weightCapKg: number;
  volumeCapM3: number;
  image: string;
  cargoRect: { left: string; top: string; width: string; height: string };
};

export const vehicleConfigs: Record<string, VehicleConfig> = {
  reeferTruck: {
    id: 'reefer-truck',
    type: 'truck',
    temp: 'reefer',
    weightCapKg: 3500,
    volumeCapM3: 22,
    image: truckPhoto,
    cargoRect: { left: '23.2%', top: '8.5%', width: '74%', height: '55.5%' },
  },
  dryTruck: {
    id: 'dry-truck',
    type: 'truck',
    temp: 'ambient',
    weightCapKg: 3500,
    volumeCapM3: 22,
    image: truckPhoto,
    cargoRect: { left: '23.2%', top: '8.5%', width: '74%', height: '55.5%' },
  },
  van: {
    id: 'delivery-van',
    type: 'van',
    temp: 'ambient',
    weightCapKg: 1100,
    volumeCapM3: 8,
    image: vanPhoto,
    cargoRect: { left: '37.5%', top: '6%', width: '58%', height: '58%' },
  },
  refrigeratedLorry: {
    id: 'refrigerated-lorry',
    type: 'lorry',
    temp: 'reefer',
    weightCapKg: 3500,
    volumeCapM3: 22,
    image: lorryPhoto,
    cargoRect: { left: '28.2%', top: '5%', width: '68.5%', height: '62%' },
  },
};

/**
 * Sorts stops according to LIFO loading sequence (descending sequence).
 * The last drop to be delivered (highest sequence number) is placed first (cab-side / back of truck),
 * and earlier drops are placed towards the rear door.
 */
export function sortStops(stops: Stop[]): Stop[] {
  return [...stops].sort((a, b) => b.sequence - a.sequence);
}

/**
 * Returns the stop ID that should currently be loaded in LIFO sequence.
 */
export function getActiveStopId(stops: Stop[], loadedIds: Set<string>): string | null {
  return sortStops(stops).find((stop) => stop.items.some((item) => !loadedIds.has(item.id)))?.id ?? null;
}

export function getLoadTotals(stops: Stop[], loadedIds: Set<string>) {
  const items = stops.flatMap((stop) => stop.items);
  return {
    plannedVolume: items.reduce((sum, item) => sum + item.volumeM3, 0),
    plannedWeight: items.reduce((sum, item) => sum + item.weightKg, 0),
    loadedVolume: items.filter((item) => loadedIds.has(item.id)).reduce((sum, item) => sum + item.volumeM3, 0),
    loadedWeight: items.filter((item) => loadedIds.has(item.id)).reduce((sum, item) => sum + item.weightKg, 0),
    loadedCount: items.filter((item) => loadedIds.has(item.id)).length,
    itemCount: items.length,
  };
}

export function getBlockingErrors(vehicle: VehicleConfig, stops: Stop[]): string[] {
  const totals = getLoadTotals(stops, new Set());
  const errors: string[] = [];
  if (totals.plannedWeight > vehicle.weightCapKg) errors.push('Planned weight exceeds vehicle capacity.');
  if (totals.plannedVolume > vehicle.volumeCapM3) errors.push('Planned volume exceeds vehicle capacity.');
  if (vehicle.temp === 'ambient' && stops.some((stop) => stop.items.some((item) => item.temp === 'chilled'))) {
    errors.push('Chilled goods need a refrigerated vehicle.');
  }
  if (stops.some((stop) => stop.items.some((item) => item.flagged))) {
    errors.push('Flagged items need dispatcher review before confirmation.');
  }
  return errors;
}

import {
  LoadingVehicles,
  type Stop,
  type Item,
  type VehicleConfig,
  loadingVehicles,
} from '../LoadingVehicles';

interface TruckVisualCardProps {
  plate?: string;
  vehicleConfig?: VehicleConfig;
  stops?: Stop[];
  loadedIds?: Set<string>;
  onItemClick?: (item: Item) => void;
  onLoadNext?: () => void;
}

// Default demonstration stops if no live trip stops are provided
const DEFAULT_DEMO_STOPS: Stop[] = [
  {
    id: 'drop-01',
    sequence: 1,
    outletName: 'Keells Super - Ja-Ela',
    district: 'Gampaha',
    items: [
      { id: 'AM-101', label: 'Produce Box 01', volumeM3: 0.8, weightKg: 28, temp: 'chilled', loaded: false },
      { id: 'AM-102', label: 'Dairy Pallet 02', volumeM3: 1.2, weightKg: 95, temp: 'chilled', loaded: false },
      { id: 'AM-103', label: 'Beverages 03', volumeM3: 0.9, weightKg: 42, temp: 'chilled', loaded: false },
    ],
  },
  {
    id: 'drop-02',
    sequence: 2,
    outletName: 'Cargills Food City - Gampaha',
    district: 'Gampaha',
    items: [
      { id: 'AM-201', label: 'Meat Crates 01', volumeM3: 1.4, weightKg: 110, temp: 'chilled', loaded: false },
      { id: 'AM-202', label: 'Frozen Seafood 02', volumeM3: 1.1, weightKg: 85, temp: 'chilled', loaded: false },
    ],
  },
  {
    id: 'drop-03',
    sequence: 3,
    outletName: 'Glomark - Negombo',
    district: 'Gampaha',
    items: [
      { id: 'AM-301', label: 'Bakery Trays 01', volumeM3: 0.7, weightKg: 35, temp: 'ambient', loaded: false },
      { id: 'AM-302', label: 'General Freight 02', volumeM3: 1.5, weightKg: 125, temp: 'ambient', loaded: false },
      { id: 'AM-303', label: 'Canned Goods 03', volumeM3: 0.8, weightKg: 60, temp: 'ambient', loaded: false },
      { id: 'AM-304', label: 'Packaging 04', volumeM3: 0.6, weightKg: 20, temp: 'ambient', loaded: false },
    ],
  },
];

export function TruckVisualCard({
  plate = 'truck',
  vehicleConfig = loadingVehicles.truck,
  stops = DEFAULT_DEMO_STOPS,
  loadedIds = new Set(),
  onItemClick,
  onLoadNext,
}: TruckVisualCardProps) {
  return (
    <div className="loader-truck-visual" data-plate={plate}>
      <LoadingVehicles
        vehicle={vehicleConfig}
        stops={stops}
        loadedIds={loadedIds}
        onItemClick={onItemClick}
        onLoadNext={onLoadNext}
      />
    </div>
  );
}

export default TruckVisualCard;

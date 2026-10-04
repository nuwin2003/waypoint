import { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, LoadingTripDetails } from '../../../api';
import { TruckInfoCard, VehicleEntry, LoadStatus } from '../components/TruckInfoCard';
import { TruckCapacityCard } from '../components/TruckCapacityCard';
import { TruckVisualCard } from '../components/TruckVisualCard';
import { ShipmentSequenceSection, ShipmentItem } from '../components/ShipmentSequenceSection';
import { VehicleQueueList } from '../components/VehicleQueueList';
import { DepartureClearanceModal } from '../components/DepartureClearanceModal';
import {
  vehicleConfigs,
  sortStops,
  type Stop,
  type Item,
  type VehicleConfig,
} from '../loading-logic';
import '../loader.css';

const VEHICLES: VehicleEntry[] = [
  {
    id: 'TRC-204',
    plate: 'LG-3342',
    type: 'Freezer Truck',
    dock: 'D-03',
    route: 'Peliyagoda to Gampaha',
    originSub: 'Colombo',
    destSub: 'Gampaha',
    driver: 'Sarith Siriwaddana',
    loadPct: 0,
    status: 'loading',
    packages: 8,
    tempReq: 'Chilled',
    stopsDone: 0,
    totalStops: 3,
  },
  {
    id: 'TRC-208',
    plate: 'LG-6789',
    type: 'Dry-Box Truck',
    dock: 'D-01',
    route: 'Peliyagoda to Negombo',
    originSub: 'Colombo',
    destSub: 'Negombo',
    driver: 'N. Perera',
    loadPct: 0,
    status: 'flagged',
    packages: 8,
    tempReq: 'Dry',
    stopsDone: 0,
    totalStops: 3,
  },
  {
    id: 'TRC-212',
    plate: 'LG-3345',
    type: 'Refrigerated Lorry',
    dock: 'D-05',
    route: 'Peliyagoda to Ja-Ela',
    originSub: 'Colombo',
    destSub: 'Ja-Ela',
    driver: 'A. Silva',
    loadPct: 0,
    status: 'not-started',
    packages: 7,
    tempReq: 'Chilled',
    stopsDone: 0,
    totalStops: 3,
  },
  {
    id: 'TRC-219',
    plate: 'LG-4954',
    type: 'Freezer Truck',
    dock: 'D-02',
    route: 'Peliyagoda to Kelaniya',
    originSub: 'Colombo',
    destSub: 'Kelaniya',
    driver: 'S. Fernando',
    loadPct: 100,
    status: 'ready',
    packages: 9,
    tempReq: 'Chilled',
    stopsDone: 3,
    totalStops: 3,
  },
  {
    id: 'TRC-223',
    plate: 'LP-8211',
    type: 'Dry-Box Truck',
    dock: 'D-04',
    route: 'Peliyagoda to Wattala',
    originSub: 'Colombo',
    destSub: 'Wattala',
    driver: 'K. Bandara',
    loadPct: 100,
    status: 'ready',
    packages: 8,
    tempReq: 'Dry',
    stopsDone: 3,
    totalStops: 3,
  },
  {
    id: 'TRC-231',
    plate: 'LW-6589',
    type: 'Van',
    dock: 'D-06',
    route: 'Peliyagoda to Ragama',
    originSub: 'Colombo',
    destSub: 'Ragama',
    driver: 'M. Rizwan',
    loadPct: 0,
    status: 'loading',
    packages: 5,
    tempReq: 'Dry',
    stopsDone: 0,
    totalStops: 3,
  },
];

// Preserved original shipment card templates with 3 delivery points
const BASE_SHIPMENTS = [
  {
    id: 'SHP-9821',
    dropSequence: 1,
    outletName: 'Keells Super - Ja-Ela',
    route: 'Peliyagoda → Ja-Ela',
    type: 'Pallet/Box',
    quantity: '3 items',
    weight: '165 Kg',
    dimensions: '1.0×0.6×1m',
    tag: 'Standard',
    items: [
      { id: 'SHP-9821-01', label: 'Item 01', volumeM3: 0.8, weightKg: 28, temp: 'chilled' as const, loaded: false },
      { id: 'SHP-9821-02', label: 'Item 02', volumeM3: 1.2, weightKg: 95, temp: 'chilled' as const, loaded: false },
      { id: 'SHP-9821-03', label: 'Item 03', volumeM3: 0.9, weightKg: 42, temp: 'chilled' as const, loaded: false },
    ],
  },
  {
    id: 'SHP-9822',
    dropSequence: 2,
    outletName: 'Cargills Food City - Gampaha',
    route: 'Peliyagoda → Gampaha',
    type: 'Pallet/Box',
    quantity: '2 items',
    weight: '195 Kg',
    dimensions: '1.2×0.8×1m',
    tag: 'Standard',
    items: [
      { id: 'SHP-9822-01', label: 'Item 01', volumeM3: 1.4, weightKg: 110, temp: 'chilled' as const, loaded: false },
      { id: 'SHP-9822-02', label: 'Item 02', volumeM3: 1.1, weightKg: 85, temp: 'chilled' as const, loaded: false },
    ],
  },
  {
    id: 'SHP-9823',
    dropSequence: 3,
    outletName: 'Glomark - Negombo',
    route: 'Peliyagoda → Negombo',
    type: 'Pallet/Box',
    quantity: '3 items',
    weight: '150 Kg',
    dimensions: '0.8×0.6×1m',
    tag: 'Priority',
    items: [
      { id: 'SHP-9823-01', label: 'Item 01', volumeM3: 1.0, weightKg: 70, temp: 'chilled' as const, loaded: false },
      { id: 'SHP-9823-02', label: 'Item 02', volumeM3: 0.8, weightKg: 45, temp: 'chilled' as const, loaded: false },
      { id: 'SHP-9823-03', label: 'Item 03', volumeM3: 0.7, weightKg: 35, temp: 'chilled' as const, loaded: false },
    ],
  },
];

function resolveVehicleConfig(entry?: VehicleEntry | null): VehicleConfig {
  if (!entry) return vehicleConfigs.reeferTruck;
  const typeLower = (entry.type || '').toLowerCase();
  if (typeLower.includes('van')) {
    return vehicleConfigs.van;
  }
  if (typeLower.includes('lorry')) {
    return vehicleConfigs.refrigeratedLorry;
  }
  if (typeLower.includes('freezer') || entry.tempReq === 'Chilled') {
    return vehicleConfigs.reeferTruck;
  }
  return vehicleConfigs.dryTruck;
}

export function LoaderDashboardPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'truck'>('truck');
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | LoadStatus>('all');
  const [selectedVehicleForClearance, setSelectedVehicleForClearance] = useState<VehicleEntry | null>(null);
  const [clearedVehicle, setClearedVehicle] = useState<string | null>(null);
  const [liveVehicles, setLiveVehicles] = useState<VehicleEntry[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<LoadingTripDetails | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Loaded package IDs keyed by vehicle plate
  const [loadedIdsByPlate, setLoadedIdsByPlate] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    api.loadingQueue()
      .then((trips) => {
        if (trips && trips.length > 0) {
          setLiveVehicles(
            trips.map((trip) => ({
              tripId: trip.tripId,
              id: trip.vehicleId,
              plate: trip.vehicleId,
              type: trip.temperature === 'CHILLED' ? 'Freezer Truck' : 'Dry-Box Truck',
              dock: 'D-03',
              route: `Peliyagoda to ${trip.districtId}`,
              originSub: 'Peliyagoda',
              destSub: trip.districtId,
              driver: 'Unassigned',
              loadPct: trip.totalStops === 0 ? 0 : Math.round((trip.completedStops / trip.totalStops) * 100),
              status:
                trip.completedStops === trip.totalStops && trip.totalStops > 0
                  ? 'ready'
                  : trip.completedStops > 0
                  ? 'loading'
                  : 'not-started',
              packages: trip.totalStops,
              tempReq: trip.temperature === 'CHILLED' ? 'Chilled' : 'Dry',
              stopsDone: trip.completedStops,
              totalStops: trip.totalStops,
            }))
          );
        }
      })
      .catch((error) => {
        setLiveVehicles([]);
        setLoadingError(error instanceof Error ? error.message : 'Could not load the vehicle queue.');
      });
  }, []);

  const vehicles = liveVehicles.length > 0 ? liveVehicles : VEHICLES;
  const vehicle = vehicles[activeVehicleIndex] ?? vehicles[0];

  const changeVehicle = (step: number) => {
    if (vehicles.length === 0) return;
    setActiveVehicleIndex((index) => (index + step + vehicles.length) % vehicles.length);
  };

  useEffect(() => {
    if (!vehicle?.tripId) {
      setSelectedTrip(null);
      return;
    }
    api.loadingTrip(vehicle.tripId)
      .then(setSelectedTrip)
      .catch((error) => {
        setSelectedTrip(null);
        setLoadingError(error instanceof Error ? error.message : 'Could not load the trip sequence.');
      });
  }, [vehicle?.tripId]);

  // Stops model for the truck diagram (3 delivery points with items)
  const currentStops: Stop[] = useMemo(() => {
    if (selectedTrip?.stops && selectedTrip.stops.length > 0) {
      return selectedTrip.stops.map((s, idx) => {
        const units = Math.max(1, s.units || 1);
        const items: Item[] = Array.from({ length: units }, (_, i) => ({
          id: units === 1 ? s.orderRef : `${s.orderRef}-${String.fromCharCode(65 + i)}`,
          label: `${s.outletName} Package ${i + 1}`,
          volumeM3: +(s.volumeM3 / units).toFixed(2) || 0.8,
          weightKg: Math.round(s.weightKg / units) || 30,
          temp: vehicle?.tempReq === 'Chilled' ? 'chilled' : 'ambient',
          loaded: s.status === 'LOADED',
        }));

        return {
          id: s.orderRef || s.stopId || `drop-${idx + 1}`,
          sequence: s.sequence || idx + 1,
          outletName: s.outletName || `Drop Point ${idx + 1}`,
          district: vehicle?.destSub || 'Gampaha',
          items,
        };
      });
    }

    return BASE_SHIPMENTS.map((s) => ({
      id: s.id,
      sequence: s.dropSequence,
      outletName: s.outletName,
      district: vehicle?.destSub || 'Gampaha',
      items: s.items.map((item) => ({
        ...item,
        temp: vehicle?.tempReq === 'Chilled' ? ('chilled' as const) : ('ambient' as const),
      })),
    }));
  }, [selectedTrip, vehicle?.destSub, vehicle?.tempReq]);

  // Initial loaded IDs for currently selected vehicle
  const initialLoadedIds = useMemo(() => {
    return new Set(
      currentStops
        .flatMap((s) => s.items)
        .filter((i) => i.loaded)
        .map((i) => i.id)
    );
  }, [currentStops]);

  // Current loaded set for selected vehicle
  const currentLoadedIds = useMemo(() => {
    if (vehicle?.plate && loadedIdsByPlate[vehicle.plate]) {
      return loadedIdsByPlate[vehicle.plate];
    }
    return initialLoadedIds;
  }, [vehicle?.plate, loadedIdsByPlate, initialLoadedIds]);

  // Toggle single item loaded state when clicking in the truck visual
  const handleItemClick = (item: Item) => {
    if (!vehicle?.plate) return;
    setLoadedIdsByPlate((prev) => {
      const currentSet = new Set(prev[vehicle.plate] ?? initialLoadedIds);
      if (currentSet.has(item.id)) {
        currentSet.delete(item.id);
      } else {
        currentSet.add(item.id);
      }
      return { ...prev, [vehicle.plate]: currentSet };
    });
  };

  // Load ONLY ONE package at a time for this delivery drop when user clicks "Load"
  const handleLoadOneItem = (shipmentId: string) => {
    if (!vehicle?.plate) return;
    const targetStop = currentStops.find(
      (s) => s.id === shipmentId || s.items.some((i) => i.id.startsWith(shipmentId))
    );
    if (!targetStop) return;

    // Find the next pending package in this drop
    const nextPending = targetStop.items.find((i) => !currentLoadedIds.has(i.id));
    if (!nextPending) return;

    setLoadedIdsByPlate((prev) => {
      const currentSet = new Set(prev[vehicle.plate] ?? initialLoadedIds);
      currentSet.add(nextPending.id);
      return { ...prev, [vehicle.plate]: currentSet };
    });
  };

  // LIFO "Load Next" action: loads the next pending item in LIFO sequence (Drop 3 -> Drop 2 -> Drop 1)
  const handleLoadNext = () => {
    if (!vehicle?.plate) return;
    const lifoOrderedStops = sortStops(currentStops);
    for (const stop of lifoOrderedStops) {
      const pendingItem = stop.items.find((item) => !currentLoadedIds.has(item.id));
      if (pendingItem) {
        handleItemClick(pendingItem);
        break;
      }
    }
  };

  // Calculate dynamic load metrics
  const totalItemsCount = currentStops.flatMap((s) => s.items).length;
  const loadedItemsCount = currentStops
    .flatMap((s) => s.items)
    .filter((i) => currentLoadedIds.has(i.id)).length;
  const dynamicLoadPct = totalItemsCount > 0 ? Math.round((loadedItemsCount / totalItemsCount) * 100) : 0;
  const isVehicleReady = totalItemsCount > 0 && loadedItemsCount === totalItemsCount;

  // Active vehicle entry with real-time dynamic load metrics
  const activeVehicleEntry: VehicleEntry = useMemo(() => {
    return {
      ...vehicle,
      loadPct: dynamicLoadPct,
      status: isVehicleReady ? 'ready' : loadedItemsCount > 0 ? 'loading' : 'not-started',
      stopsDone: currentStops.filter((s) => s.items.every((i) => currentLoadedIds.has(i.id))).length,
      totalStops: currentStops.length,
      packages: totalItemsCount,
    };
  }, [vehicle, dynamicLoadPct, isVehicleReady, loadedItemsCount, currentStops, currentLoadedIds, totalItemsCount]);

  const vehicleConfig = resolveVehicleConfig(activeVehicleEntry);

  const handleOpenClearance = (entry: VehicleEntry) => {
    setSelectedVehicleForClearance(entry);
  };

  const handleConfirmClearance = (entry: VehicleEntry) => {
    if (entry.tripId) {
      api.updateLoadingTrip(entry.tripId, 'LOADED').catch((error) => {
        setLoadingError(error instanceof Error ? error.message : 'Could not clear the vehicle for departure.');
      });
    }
    setClearedVehicle(entry.plate);
    setSelectedVehicleForClearance(null);
  };

  // Map to the previous cards format (SHP-9821, SHP-9822, SHP-9823)
  const shipmentCards: ShipmentItem[] = useMemo(() => {
    if (selectedTrip?.stops && selectedTrip.stops.length > 0) {
      return selectedTrip.stops.map((stop) => {
        const stopItems = currentStops.find((s) => s.id === stop.orderRef)?.items ?? [];
        const loadedInStop = stopItems.filter((i) => currentLoadedIds.has(i.id)).length;
        return {
          id: stop.orderRef,
          route: `Peliyagoda → ${stop.outletName}`,
          type: 'Order',
          quantity: `${stop.units} units`,
          weight: `${stop.weightKg} Kg`,
          dimensions: `${stop.volumeM3} m³`,
          tag: stop.status,
          loadedCount: loadedInStop,
          totalCount: stop.units,
        };
      });
    }

    return BASE_SHIPMENTS.map((s) => {
      const stopItems = currentStops.find((cs) => cs.id === s.id)?.items ?? s.items;
      const loadedInStop = stopItems.filter((i) => currentLoadedIds.has(i.id)).length;
      return {
        id: s.id,
        route: s.route,
        type: s.type,
        quantity: s.quantity,
        weight: s.weight,
        dimensions: s.dimensions,
        tag: s.tag,
        loadedCount: loadedInStop,
        totalCount: stopItems.length,
      };
    });
  }, [selectedTrip, currentStops, currentLoadedIds]);

  return (
    <div className="loader-workspace">
      {loadingError && <div className="loader-clearance-notice" role="alert">{loadingError}</div>}
      
      {/* Departure Clearance Notice Banner */}
      {clearedVehicle && (
        <div className="loader-clearance-notice" role="status">
          Vehicle {clearedVehicle} cleared for departure.
          <button
            type="button"
            onClick={() => setClearedVehicle(null)}
            aria-label="Dismiss clearance message"
          >
            ×
          </button>
        </div>
      )}

      {currentView === 'dashboard' || !vehicle ? (
        /* View 1: Vehicle Queue & Statistics */
        <VehicleQueueList
          vehicles={vehicles}
          activeVehicleIndex={activeVehicleIndex}
          vehicleFilter={vehicleFilter}
          onFilterChange={setVehicleFilter}
          onSelectVehicle={(index) => {
            setActiveVehicleIndex(index);
            setCurrentView('truck');
          }}
        />
      ) : (
        /* View 2: Truck Information & Interactive Cargo Loading */
        <>
          {/* Header */}
          <header className="loader-truck-header">
            <div className="loader-heading-group">
              <button
                className="loader-back-button"
                type="button"
                onClick={() => setCurrentView('dashboard')}
                aria-label="Back to vehicle dashboard"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1>Truck Information</h1>
            </div>
            <div className="loader-vehicle-controls" aria-label="Select truck">
              <button
                type="button"
                onClick={() => changeVehicle(-1)}
                aria-label="Previous truck"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => changeVehicle(1)}
                aria-label="Next truck"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Upper Section: Details & Visual */}
          <section className="loader-truck-overview" aria-label="Selected truck details">
            <div className="loader-truck-details">
              <TruckInfoCard
                vehicle={activeVehicleEntry}
                onClearDeparture={handleOpenClearance}
              />
              <TruckCapacityCard
                loadPct={activeVehicleEntry.loadPct}
              />
            </div>

            {/* Interactive Vehicle Diagram with LIFO Cargo Loading */}
            <TruckVisualCard
              plate={activeVehicleEntry.plate}
              vehicleConfig={vehicleConfig}
              stops={currentStops}
              loadedIds={currentLoadedIds}
              onItemClick={handleItemClick}
              onLoadNext={handleLoadNext}
            />
          </section>

          {/* Bottom Section: Previous Shipment Cards with Scan/Confirm -> Load One by One flow */}
          <ShipmentSequenceSection
            shipments={shipmentCards}
            onLoadOneItem={handleLoadOneItem}
          />
        </>
      )}

      {/* Clearance Modal */}
      <DepartureClearanceModal
        isOpen={Boolean(selectedVehicleForClearance)}
        onClose={() => setSelectedVehicleForClearance(null)}
        vehicle={selectedVehicleForClearance}
        onConfirm={handleConfirmClearance}
      />
    </div>
  );
}

export default LoaderDashboardPage;

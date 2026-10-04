import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, LoadingTripDetails } from '../../../api';
import { TruckInfoCard, VehicleEntry, LoadStatus } from '../components/TruckInfoCard';
import { TruckCapacityCard } from '../components/TruckCapacityCard';
import { TruckVisualCard } from '../components/TruckVisualCard';
import { ShipmentSequenceSection, ShipmentItem } from '../components/ShipmentSequenceSection';
import { VehicleQueueList } from '../components/VehicleQueueList';
import { DepartureClearanceModal } from '../components/DepartureClearanceModal';
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
    loadPct: 48,
    status: 'loading',
    packages: 19,
    tempReq: 'Chilled',
    stopsDone: 4,
    totalStops: 6,
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
    loadPct: 25,
    status: 'flagged',
    packages: 8,
    tempReq: 'Dry',
    stopsDone: 2,
    totalStops: 8,
  },
  {
    id: 'TRC-212',
    plate: 'LG-3345',
    type: 'Freezer Truck',
    dock: 'D-05',
    route: 'Peliyagoda to Ja-Ela',
    originSub: 'Colombo',
    destSub: 'Ja-Ela',
    driver: 'A. Silva',
    loadPct: 0,
    status: 'not-started',
    packages: 0,
    tempReq: 'Chilled',
    stopsDone: 0,
    totalStops: 5,
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
    packages: 32,
    tempReq: 'Chilled',
    stopsDone: 8,
    totalStops: 8,
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
    packages: 16,
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
    loadPct: 14,
    status: 'loading',
    packages: 3,
    tempReq: 'Dry',
    stopsDone: 1,
    totalStops: 7,
  },
];

const SHIPMENTS: ShipmentItem[] = [
  {
    id: 'SHP-9821',
    route: 'NY → Neg',
    type: 'Pallet/Box',
    quantity: '10 pallets',
    weight: '500 Kg',
    dimensions: '1×0.6×1m',
    tag: 'Standard',
  },
  {
    id: 'SHP-9822',
    route: 'NY → Neg',
    type: 'Pallet/Box',
    quantity: '8 pallets',
    weight: '420 Kg',
    dimensions: '1×0.6×1m',
    tag: 'Standard',
  },
  {
    id: 'SHP-9823',
    route: 'NY → Neg',
    type: 'Pallet/Box',
    quantity: '6 pallets',
    weight: '350 Kg',
    dimensions: '0.8×0.6×1m',
    tag: 'Standard',
  },
  {
    id: 'SHP-9824',
    route: 'NY → Neg',
    type: 'Pallet/Box',
    quantity: '12 pallets',
    weight: '620 Kg',
    dimensions: '1.2×0.8×1m',
    tag: 'Priority',
  },
  {
    id: 'SHP-9825',
    route: 'NY → Neg',
    type: 'Pallet/Box',
    quantity: '5 pallets',
    weight: '280 Kg',
    dimensions: '1×0.6×0.8m',
    tag: 'Fragile',
  },
];

export function LoaderDashboardPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'truck'>('dashboard');
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | LoadStatus>('all');
  const [selectedVehicleForClearance, setSelectedVehicleForClearance] = useState<VehicleEntry | null>(null);
  const [clearedVehicle, setClearedVehicle] = useState<string | null>(null);
  const [liveVehicles, setLiveVehicles] = useState<VehicleEntry[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<LoadingTripDetails | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    api.loadingQueue()
      .then((trips) => {
        const mapped: VehicleEntry[] = trips.map((trip) => {
          const loadPct = trip.totalStops === 0 ? 0 : Math.round((trip.completedStops / trip.totalStops) * 100);
          const status: LoadStatus = trip.flaggedStops > 0 ? 'flagged'
            : ['LOADED', 'CLEARED'].includes(trip.status) ? 'ready'
              : trip.status === 'LOADING' || trip.completedStops > 0 ? 'loading' : 'not-started';
          return {
            tripId: trip.tripId,
            tripNo: trip.tripNo,
            departureCleared: trip.status === 'CLEARED',
            id: trip.vehicleId,
            plate: trip.vehicleId,
            type: trip.temperature === 'CHILLED' ? 'Freezer Truck' : 'Dry-Box Truck',
            dock: 'D-01',
            route: `Peliyagoda to ${trip.districtId}`,
            originSub: 'Peliyagoda',
            destSub: trip.districtId,
            driver: 'Assigned Driver',
            loadPct,
            status,
            packages: trip.totalStops,
            tempReq: trip.temperature === 'CHILLED' ? 'Chilled' : 'Dry',
            stopsDone: trip.completedStops,
            totalStops: trip.totalStops,
          };
        });
        setLiveVehicles(mapped);
      })
      .catch((error) => {
        setLiveVehicles([]);
        setLoadingError(error instanceof Error ? error.message : 'Could not load the vehicle queue.');
      });
  }, []);

  const vehicles = liveVehicles;
  const vehicle = vehicles[activeVehicleIndex] ?? null;

  const changeVehicle = (step: number) => {
    if (vehicles.length === 0) return;
    setActiveVehicleIndex((index) => (index + step + vehicles.length) % vehicles.length);
  };

  useEffect(() => {
    if (!vehicle?.tripId) {
      setSelectedTrip(null);
      return;
    }
    api.loadingTrip(vehicle.tripId).then(setSelectedTrip).catch((error) => {
      setSelectedTrip(null);
      setLoadingError(error instanceof Error ? error.message : 'Could not load the trip sequence.');
    });
  }, [vehicle?.tripId]);

  const handleOpenClearance = (entry: VehicleEntry) => {
    setSelectedVehicleForClearance(entry);
  };

  const handleConfirmClearance = async (entry: VehicleEntry) => {
    if (!entry.tripId) return;
    setLoadingError(null);
    try {
      await api.updateLoadingTrip(entry.tripId, 'CLEARED');
      setLiveVehicles((current) => current.map((vehicle) => vehicle.tripId === entry.tripId
        ? { ...vehicle, departureCleared: true } : vehicle));
      setClearedVehicle(`${entry.plate} · Trip ${entry.tripNo ?? ''}`);
      setSelectedVehicleForClearance(null);
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : 'Could not clear the vehicle for departure.');
    }
  };

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
        /* View 2: Truck Information & Loading Sequence */
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
                vehicle={vehicle}
                onClearDeparture={handleOpenClearance}
              />
              <TruckCapacityCard
                loadPct={vehicle.loadPct}
              />
            </div>

            <TruckVisualCard
              plate={vehicle.plate}
            />
          </section>

          {/* Bottom Section: Loading Sequence */}
          <ShipmentSequenceSection
            shipments={(selectedTrip?.stops ?? []).map((stop) => ({
          id: stop.orderRef,
          route: `Peliyagoda → ${stop.outletName}`,
          type: 'Order',
          quantity: `${stop.units} units`,
          weight: `${stop.weightKg} Kg`,
          dimensions: `${stop.volumeM3} m³`,
          tag: stop.status,
            }))}
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

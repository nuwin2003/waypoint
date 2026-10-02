import { useMemo, useState } from 'react';
import { Modal } from '../../shared/ui/Components';
import truckInfoImage from '../../assets/truck-info.png';
import './loader.css';

type LoadStatus = 'loading' | 'ready' | 'flagged' | 'not-started';
type ShipmentStatus = 'scanned' | 'missing';

interface VehicleEntry {
  id: string;
  plate: string;
  type: string;
  dock: string;
  route: string;
  driver: string;
  loadPct: number;
  status: LoadStatus;
  packages: number;
  tempReq: 'Chilled' | 'Dry';
  stopsDone: number;
  totalStops: number;
}

const VEHICLES: VehicleEntry[] = [
  { id: 'TRC-204', plate: 'LG-3342', type: 'Freezer Truck', dock: 'D-03', route: 'Peliyagoda to Gampaha', driver: 'Sarith Siriwaddana', loadPct: 48, status: 'loading', packages: 19, tempReq: 'Chilled', stopsDone: 4, totalStops: 6 },
  { id: 'TRC-208', plate: 'LG-6789', type: 'Dry-Box Truck', dock: 'D-01', route: 'Peliyagoda to Negombo', driver: 'N. Perera', loadPct: 25, status: 'flagged', packages: 8, tempReq: 'Dry', stopsDone: 2, totalStops: 8 },
  { id: 'TRC-212', plate: 'LG-3345', type: 'Freezer Truck', dock: 'D-05', route: 'Peliyagoda to Ja-Ela', driver: 'A. Silva', loadPct: 0, status: 'not-started', packages: 0, tempReq: 'Chilled', stopsDone: 0, totalStops: 5 },
  { id: 'TRC-219', plate: 'LG-4954', type: 'Freezer Truck', dock: 'D-02', route: 'Peliyagoda to Kelaniya', driver: 'S. Fernando', loadPct: 100, status: 'ready', packages: 32, tempReq: 'Chilled', stopsDone: 8, totalStops: 8 },
  { id: 'TRC-223', plate: 'LP-8211', type: 'Dry-Box Truck', dock: 'D-04', route: 'Peliyagoda to Wattala', driver: 'K. Bandara', loadPct: 100, status: 'ready', packages: 16, tempReq: 'Dry', stopsDone: 3, totalStops: 3 },
  { id: 'TRC-231', plate: 'LW-6589', type: 'Van', dock: 'D-06', route: 'Peliyagoda to Ragama', driver: 'M. Rizwan', loadPct: 14, status: 'loading', packages: 3, tempReq: 'Dry', stopsDone: 1, totalStops: 7 },
];

const SHIPMENTS = [
  { id: 'SHP-9821', route: 'NY → Neg', type: 'Pallet/Box', quantity: '10 pallets', weight: '500 Kg', dimensions: '1×0.6×1m' },
  { id: 'SHP-9822', route: 'NY → Neg', type: 'Pallet/Box', quantity: '8 pallets', weight: '420 Kg', dimensions: '1×0.6×1m' },
  { id: 'SHP-9823', route: 'NY → Neg', type: 'Pallet/Box', quantity: '6 pallets', weight: '350 Kg', dimensions: '0.8×0.6×1m' },
];

const STATUS_LABELS: Record<LoadStatus, string> = {
  loading: 'Loading',
  ready: 'Ready',
  flagged: 'Flagged',
  'not-started': 'Not started',
};

const CHECKLIST_ITEMS = [
  { key: 'sealVerified', label: 'Cargo seals verified and intact' },
  { key: 'tempChecked', label: 'Cargo temperature checked' },
  { key: 'manifestSigned', label: 'Loading manifest signed by driver' },
  { key: 'safetyCheck', label: 'Vehicle safety inspection passed' },
] as const;

type Checklist = Record<(typeof CHECKLIST_ITEMS)[number]['key'], boolean>;

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return <svg className={`loader-chevron ${direction}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>;
}

export function LoaderWorkspace() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'truck'>('dashboard');
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | LoadStatus>('all');
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [listView, setListView] = useState(false);
  const [shipmentStatuses, setShipmentStatuses] = useState<Record<string, ShipmentStatus | undefined>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleEntry | null>(null);
  const [checklist, setChecklist] = useState<Checklist>({
    sealVerified: false,
    tempChecked: false,
    manifestSigned: false,
    safetyCheck: false,
  });
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearedVehicle, setClearedVehicle] = useState<string | null>(null);

  const vehicle = VEHICLES[activeVehicleIndex];
  const [routeOrigin = 'Peliyagoda', routeDestination = 'Gampaha'] = vehicle.route.split(' to ');
  const currentLoad = ((13.5 * vehicle.loadPct) / 100).toFixed(1);
  const allChecked = Object.values(checklist).every(Boolean);
  const vehicleCounts = {
    total: VEHICLES.length,
    loading: VEHICLES.filter((entry) => entry.status === 'loading').length,
    ready: VEHICLES.filter((entry) => entry.status === 'ready').length,
    flagged: VEHICLES.filter((entry) => entry.status === 'flagged').length,
  };
  const filteredVehicles = vehicleFilter === 'all' ? VEHICLES : VEHICLES.filter((entry) => entry.status === vehicleFilter);

  const visibleShipments = useMemo(() => {
    const query = shipmentSearch.trim().toLowerCase();
    return SHIPMENTS
      .filter((shipment) => shipment.id.toLowerCase().includes(query))
      .slice()
      .sort((a, b) => sortAscending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
  }, [shipmentSearch, sortAscending]);

  const changeVehicle = (step: number) => {
    setActiveVehicleIndex((index) => (index + step + VEHICLES.length) % VEHICLES.length);
  };

  const handleClearDeparture = (entry: VehicleEntry) => {
    setSelectedVehicle(entry);
    setChecklist({ sealVerified: false, tempChecked: false, manifestSigned: false, safetyCheck: false });
    setIsClearanceModalOpen(true);
  };

  const handleConfirmClearance = () => {
    if (selectedVehicle) setClearedVehicle(selectedVehicle.plate);
    setIsClearanceModalOpen(false);
  };

  const updateShipmentStatus = (shipmentId: string, status: ShipmentStatus) => {
    setShipmentStatuses((current) => ({ ...current, [shipmentId]: current[shipmentId] === status ? undefined : status }));
  };

  return (
    <div className="loader-workspace">
      {clearedVehicle && (
        <div className="loader-clearance-notice" role="status">
          Vehicle {clearedVehicle} cleared for departure.
          <button type="button" onClick={() => setClearedVehicle(null)} aria-label="Dismiss clearance message">×</button>
        </div>
      )}

      {currentView === 'dashboard' ? (
        <section className="loader-vehicle-dashboard" aria-label="Vehicle loading dashboard">
          <header className="loader-dashboard-heading">
            <div>
              <h1>Vehicles</h1>
              <p>Peliyagoda distribution centre · Morning loading window</p>
            </div>
          </header>

          <div className="loader-dashboard-stats">
            {([
              { label: 'Trucks today', value: vehicleCounts.total, note: 'Peliyagoda', status: 'all' as const },
              { label: 'Loading', value: vehicleCounts.loading, note: 'In progress', status: 'loading' as const },
              { label: 'Ready', value: vehicleCounts.ready, note: 'Departure cleared', status: 'ready' as const },
              { label: 'Flagged', value: vehicleCounts.flagged, note: 'Needs attention', status: 'flagged' as const },
            ]).map((stat) => (
              <button className={`loader-dashboard-stat${vehicleFilter === stat.status ? ' selected' : ''}`} key={stat.label} type="button" onClick={() => setVehicleFilter(stat.status)}>
                <span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small>
              </button>
            ))}
          </div>

          <div className="loader-filter-pills" aria-label="Filter vehicles">
            {([
              { label: 'All', value: 'all' as const },
              { label: 'Loading', value: 'loading' as const },
              { label: 'Ready', value: 'ready' as const },
              { label: 'Flagged', value: 'flagged' as const },
              { label: 'Not started', value: 'not-started' as const },
            ]).map((option) => (
              <button className={vehicleFilter === option.value ? 'active' : ''} type="button" key={option.value} onClick={() => setVehicleFilter(option.value)}>{option.label}</button>
            ))}
          </div>

          <div className="loader-queue-heading">
            <h2>Vehicle queue</h2>
            <span>{filteredVehicles.length} vehicles</span>
          </div>

          <div className="loader-vehicle-queue">
            {filteredVehicles.map((entry) => {
              const index = VEHICLES.findIndex((item) => item.id === entry.id);
              return (
                <button
                  className={`loader-queue-row${index === activeVehicleIndex ? ' selected' : ''}`}
                  key={entry.id}
                  type="button"
                  onClick={() => { setActiveVehicleIndex(index); setCurrentView('truck'); }}
                  aria-label={`Open truck ${entry.plate}, ${STATUS_LABELS[entry.status]}`}
                >
                  <span className="loader-queue-vehicle"><i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h13v12H2zM15 9h4l3 3v5h-7M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg></i><span><strong>{entry.plate}</strong><small>Dock {entry.dock}</small></span></span>
                  <span className="loader-queue-route"><small>Route</small><strong>{entry.route.replace(' to ', ' → ')}</strong></span>
                  <span className="loader-queue-progress"><small>Load progress</small><strong>{entry.stopsDone} of {entry.totalStops} stops</strong></span>
                  <span className={`loader-queue-status ${entry.status}`}>{STATUS_LABELS[entry.status]}</span>
                  <Chevron direction="right" />
                </button>
              );
            })}
            {filteredVehicles.length === 0 && <p className="loader-empty-state">No vehicles match this filter.</p>}
          </div>
        </section>
      ) : (
        <>
      <header className="loader-truck-header">
        <div className="loader-heading-group">
          <button className="loader-back-button" type="button" onClick={() => setCurrentView('dashboard')} aria-label="Back to vehicle dashboard">
            <Chevron direction="left" />
          </button>
          <h1>Truck Information</h1>
        </div>
        <div className="loader-vehicle-controls" aria-label="Select truck">
          <button type="button" onClick={() => changeVehicle(-1)} aria-label="Previous truck"><Chevron direction="left" /></button>
          <button type="button" onClick={() => changeVehicle(1)} aria-label="Next truck"><Chevron direction="right" /></button>
        </div>
      </header>

      <section className="loader-truck-overview" aria-label="Selected truck details">
        <div className="loader-truck-details">
          <article className="loader-info-card">
            <div className="loader-info-card-title">
              <strong>{vehicle.plate}</strong>
              <span className={`loader-status-pill ${vehicle.status}`}><i />{STATUS_LABELS[vehicle.status]}</span>
            </div>

            <div className="loader-driver-row">
              <div className="loader-driver-avatar" aria-hidden="true">{vehicle.driver.slice(0, 1)}</div>
              <div className="loader-driver-name">
                <span>Driver</span>
                <strong>{vehicle.driver}</strong>
              </div>
              {vehicle.status === 'ready' && (
                <button className="loader-clear-button" type="button" onClick={() => handleClearDeparture(vehicle)}>Clear for departure</button>
              )}
              {vehicle.status === 'flagged' && <span className="loader-issue-note">Issue flagged</span>}
            </div>

            <div className="loader-vehicle-facts">
              <div><span>Truck ID</span><strong>{vehicle.id}</strong></div>
              <div><span>Dock</span><strong>{`Dock #${Number(vehicle.dock.slice(2))}`}</strong></div>
              <div><span>Started</span><strong>08:34 AM</strong></div>
            </div>

            <div className="loader-route-line">
              <div><strong>{routeOrigin}</strong><span>Origin</span></div>
              <span className="loader-route-track"><i /></span>
              <div className="destination"><strong>{routeDestination}</strong><span>Destination</span></div>
            </div>
          </article>

          <article className="loader-capacity-card">
            <h2>Capacity &amp; load</h2>
            <div className="loader-capacity-content">
              <div className="loader-capacity-ring" role="img" aria-label={`${vehicle.loadPct}% weight capacity used`}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle className="loader-capacity-track" cx="50" cy="50" r="43" />
                  <circle className="loader-capacity-value" cx="50" cy="50" r="43" style={{ strokeDasharray: 270.18, strokeDashoffset: 270.18 * (1 - vehicle.loadPct / 100) }} />
                </svg>
                <div><strong>{vehicle.loadPct}%</strong><span>Weight</span></div>
              </div>
              <div className="loader-capacity-numbers">
                <div><span>Current load</span><strong>{currentLoad}<small> tons</small></strong></div>
                <div><span>Max. capacity</span><strong>13.5<small> tons</small></strong></div>
              </div>
            </div>
          </article>
        </div>

        <div className="loader-truck-visual">
          <img src={truckInfoImage} alt={`${vehicle.type} ${vehicle.plate}, ${STATUS_LABELS[vehicle.status]}`} />
        </div>
      </section>

      <section className="loader-sequence" aria-labelledby="loading-sequence-title">
        <div className="loader-sequence-header">
          <h2 id="loading-sequence-title">Loading Sequence</h2>
          <div className="loader-sequence-controls">
            <label className="loader-shipment-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
              <input type="search" placeholder="Search for shipment ID" value={shipmentSearch} onChange={(event) => setShipmentSearch(event.target.value)} />
            </label>
            <button className="loader-toolbar-button" type="button" onClick={() => setSortAscending((ascending) => !ascending)}>
              <span aria-hidden="true">↕</span> Sort by
            </button>
            <button className={`loader-toolbar-button loader-grid-toggle${listView ? ' active' : ''}`} type="button" onClick={() => setListView((current) => !current)} aria-label={listView ? 'Show grid view' : 'Show list view'} title={listView ? 'Show grid view' : 'Show list view'}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>
              <span>Grid</span>
            </button>
          </div>
        </div>

        <div className={`loader-shipment-grid${listView ? ' list-view' : ''}`}>
          {visibleShipments.map((shipment) => {
            const status = shipmentStatuses[shipment.id];
            return (
              <article className={`loader-shipment-card${status ? ` ${status}` : ''}`} key={shipment.id}>
                <div className="loader-shipment-card-heading">
                  <div className="loader-package-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5 9-5zM3 8v9l9 4 9-4V8m-9 5v8"/></svg></div>
                  <strong>{shipment.id}</strong>
                  <span className="loader-shipment-type"><i />Standard</span>
                </div>
                <div className="loader-shipment-details">
                  <div><span>Route</span><strong>{shipment.route}</strong></div>
                  <div><span>Type</span><strong>{shipment.type}</strong></div>
                  <div><span>Quantity</span><strong>{shipment.quantity}</strong></div>
                  <div><span>Total weight</span><strong>{shipment.weight}</strong></div>
                  <div><span>Dimension</span><strong>{shipment.dimensions}</strong></div>
                </div>
                {status && <div className="loader-shipment-feedback" role="status">{status === 'scanned' ? 'Shipment scanned' : 'Marked as missing'}</div>}
                <div className="loader-shipment-actions">
                  <button className="loader-scan-button" type="button" onClick={() => updateShipmentStatus(shipment.id, 'scanned')} disabled={status === 'scanned'}>{status === 'scanned' ? 'Scanned' : 'Scan'}</button>
                  <button className="loader-missing-button" type="button" onClick={() => updateShipmentStatus(shipment.id, 'missing')}>{status === 'missing' ? 'Undo' : 'Missing'}</button>
                </div>
              </article>
            );
          })}
          {visibleShipments.length === 0 && <p className="loader-empty-state">No shipments match that ID.</p>}
        </div>
      </section>
        </>
      )}

      <Modal
        isOpen={isClearanceModalOpen}
        onClose={() => setIsClearanceModalOpen(false)}
        title={`Departure Clearance · ${selectedVehicle?.plate}`}
      >
        <div className="loader-clearance-modal">
          <div className="loader-clearance-summary">
            <div><span>Vehicle</span><strong>{selectedVehicle?.plate}</strong><small>{selectedVehicle?.type}</small></div>
            <div><span>Route</span><strong>{selectedVehicle?.route}</strong><small>Driver: {selectedVehicle?.driver}</small></div>
            <div><span>Packages</span><strong>{selectedVehicle?.packages}</strong></div>
          </div>
          <h3>Pre-departure checklist</h3>
          {CHECKLIST_ITEMS.map((item) => (
            <label className={`loader-checklist-item${checklist[item.key] ? ' checked' : ''}`} key={item.key}>
              <input type="checkbox" checked={checklist[item.key]} onChange={(event) => setChecklist((current) => ({ ...current, [item.key]: event.target.checked }))} />
              <span>{item.label}</span>
            </label>
          ))}
          {!allChecked && <p className="loader-checklist-hint">Complete all checklist items to enable clearance.</p>}
          <div className="loader-clearance-actions">
            <button className="btn-secondary" type="button" onClick={() => setIsClearanceModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="button" disabled={!allChecked} onClick={handleConfirmClearance}>Confirm clearance</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List, Box } from 'lucide-react';

export type ShipmentStatus = 'scanned' | 'missing';

export interface ShipmentItem {
  id: string;
  route: string;
  type: string;
  quantity: string;
  weight: string;
  dimensions: string;
  tag: string;
}

interface ShipmentSequenceSectionProps {
  shipments: ShipmentItem[];
  onScan?: (shipmentId: string) => void;
  onMarkMissing?: (shipmentId: string) => void;
}

export function ShipmentSequenceSection({
  shipments,
  onScan,
  onMarkMissing,
}: ShipmentSequenceSectionProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [shipmentStatuses, setShipmentStatuses] = useState<Record<string, ShipmentStatus | undefined>>({});

  const visibleShipments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments
      .filter(
        (s) =>
          s.id.toLowerCase().includes(query) ||
          s.route.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query)
      )
      .slice()
      .sort((a, b) => (sortAscending ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)));
  }, [shipments, search, sortAscending]);

  const handleScan = (id: string) => {
    if (onScan) {
      onScan(id);
    } else {
      navigate('/load/scan-packages');
    }
  };

  const handleMissing = (id: string) => {
    setShipmentStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'missing' ? undefined : 'missing',
    }));
    if (onMarkMissing) {
      onMarkMissing(id);
    }
  };

  return (
    <section className="loader-sequence" aria-label="Loading Sequence">
      {/* Header & Controls */}
      <div className="loader-sequence-header">
        <h2>Loading Sequence</h2>
        <div className="loader-sequence-controls">
          <div className="loader-shipment-search">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search for shipment ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="loader-toolbar-button"
            onClick={() => setSortAscending((prev) => !prev)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Sort by</span>
          </button>
          <button
            type="button"
            className="loader-toolbar-button active"
            onClick={() => setIsGridView((prev) => !prev)}
            aria-label={`Switch to ${isGridView ? 'List' : 'Grid'} view`}
          >
            {isGridView ? (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span>Grid</span>
              </>
            ) : (
              <>
                <List className="w-4 h-4" />
                <span>List</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shipment Cards Grid / List */}
      <div className={`loader-shipment-grid ${isGridView ? '' : 'list-view'}`}>
        {visibleShipments.map((shipment) => {
          const status = shipmentStatuses[shipment.id];

          return (
            <article
              key={shipment.id}
              className={`loader-shipment-card ${status || ''}`}
            >
              <div className="loader-shipment-card-heading">
                <div className="loader-shipment-card-title-group">
                  <div className="loader-package-icon">
                    <Box className="w-4 h-4" />
                  </div>
                  <strong>{shipment.id}</strong>
                </div>
                <span className="loader-shipment-type">
                  <i />
                  {shipment.tag}
                </span>
              </div>

              <div className="loader-shipment-details">
                <div>
                  <span>Route</span>
                  <strong>{shipment.route}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{shipment.type}</strong>
                </div>
                <div>
                  <span>Quantity</span>
                  <strong>{shipment.quantity}</strong>
                </div>
                <div>
                  <span>Total weight</span>
                  <strong>{shipment.weight}</strong>
                </div>
                <div>
                  <span>Dimension</span>
                  <strong>{shipment.dimensions}</strong>
                </div>
              </div>

              {status && (
                <div className="loader-shipment-feedback">
                  {status === 'scanned' && '✓ Marked scanned'}
                  {status === 'missing' && '⚠ Flagged as missing'}
                </div>
              )}

              <div className="loader-shipment-actions">
                <button
                  type="button"
                  className="loader-scan-button"
                  onClick={() => handleScan(shipment.id)}
                >
                  Scan
                </button>
                <button
                  type="button"
                  className="loader-missing-button"
                  onClick={() => handleMissing(shipment.id)}
                >
                  Missing
                </button>
              </div>
            </article>
          );
        })}

        {visibleShipments.length === 0 && (
          <p className="loader-empty-state">No shipments match your search.</p>
        )}
      </div>
    </section>
  );
}

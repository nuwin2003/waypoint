import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, Box } from 'lucide-react';
import { VerifyPackagePopup } from './VerifyPackagePopup';
import { OrderSummaryPopup, OrderSummaryData } from './OrderSummaryPopup';
import { FlagDefectPopup } from './FlagDefectPopup';

export type ShipmentStatus = 'scanned' | 'missing';

export interface ShipmentItem {
  id: string;
  route: string;
  type: string;
  quantity: string;
  weight: string;
  dimensions: string;
  tag: string;
  loadedCount?: number;
  totalCount?: number;
  isConfirmed?: boolean;
}

interface ShipmentSequenceSectionProps {
  shipments: ShipmentItem[];
  onScan?: (shipmentId: string) => void;
  onMarkMissing?: (shipmentId: string) => void;
  onLoadOneItem?: (shipmentId: string) => void;
  onConfirmShipment?: (shipmentId: string) => void;
}

export function ShipmentSequenceSection({
  shipments,
  onScan,
  onMarkMissing,
  onLoadOneItem,
  onConfirmShipment,
}: ShipmentSequenceSectionProps) {
  const [search, setSearch] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [shipmentStatuses, setShipmentStatuses] = useState<Record<string, ShipmentStatus | undefined>>({});
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  // Active shipment being processed in the modal flow
  const [activeShipment, setActiveShipment] = useState<ShipmentItem | null>(null);

  // Modal flow states
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [isFlagDefectOpen, setIsFlagDefectOpen] = useState(false);

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

  // Step 1: User clicks "Scan" on a card -> Opens VerifyPackagePopup
  const handleOpenScan = (shipment: ShipmentItem) => {
    setActiveShipment(shipment);
    setIsVerifyOpen(true);
    if (onScan) {
      onScan(shipment.id);
    }
  };

  // Step 2: User clicks "Scan" inside VerifyPackagePopup -> Opens OrderSummaryPopup
  const handleVerifyScanSuccess = () => {
    setIsVerifyOpen(false);
    setIsOrderSummaryOpen(true);
  };

  // Step 3A: User clicks "Confirm" in OrderSummaryPopup -> Marks package as confirmed & scanned
  // After confirm, both scan and missing buttons disappear and load button appears!
  const handleConfirmOrder = () => {
    if (activeShipment) {
      setConfirmedIds((prev) => new Set(prev).add(activeShipment.id));
      setShipmentStatuses((prev) => ({
        ...prev,
        [activeShipment.id]: 'scanned',
      }));
      onConfirmShipment?.(activeShipment.id);
    }
    setIsOrderSummaryOpen(false);
  };

  // Step 3B: User clicks "Report Defect" in OrderSummaryPopup -> Transitions to FlagDefectPopup
  const handleReportDefectTransition = () => {
    setIsOrderSummaryOpen(false);
    setIsFlagDefectOpen(true);
  };

  // Step 4: User submits defect form -> Flags package and closes
  const handleSubmitDefect = () => {
    if (activeShipment) {
      setShipmentStatuses((prev) => ({
        ...prev,
        [activeShipment.id]: 'missing',
      }));
    }
    setIsFlagDefectOpen(false);
  };

  const handleToggleMissing = (id: string) => {
    setShipmentStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === 'missing' ? undefined : 'missing',
    }));
    if (onMarkMissing) {
      onMarkMissing(id);
    }
  };

  const orderSummaryData: OrderSummaryData = {
    orderId: activeShipment?.id || 'SHP-9821',
    shippingAddress: activeShipment?.route || 'Peliyagoda → Gampaha',
    trackingId: activeShipment?.id || 'SHP-9821',
    quantity: activeShipment?.quantity.replace(/\D/g, '') || '3',
    itemCount: activeShipment?.quantity.replace(/\D/g, '') || '3',
    estDeliveryDate: '11/03/26; 04:54 pm',
    tag: activeShipment?.tag || 'Standard',
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
          const isConfirmed = shipment.isConfirmed || confirmedIds.has(shipment.id);
          const loadedCount = shipment.loadedCount ?? 0;
          const totalCount = shipment.totalCount ?? 3;
          const isDone = totalCount > 0 && loadedCount >= totalCount;

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
                  {status === 'scanned' && (isDone ? '✓ All packages loaded into truck' : '✓ Scanned & Confirmed — Ready to load')}
                  {status === 'missing' && '⚠ Flagged as missing'}
                </div>
              )}

              {/* Action Buttons:
                  Before confirm: Scan and Missing buttons are visible.
                  After confirm: Both disappear, and Load button appears!
                  Clicking Load fills one truck package at a time. */}
              <div className={`loader-shipment-actions ${isConfirmed ? 'single-action' : ''}`}>
                {!isConfirmed ? (
                  <>
                    <button
                      type="button"
                      className="loader-scan-button"
                      onClick={() => handleOpenScan(shipment)}
                    >
                      Scan
                    </button>
                    <button
                      type="button"
                      className="loader-missing-button"
                      onClick={() => handleToggleMissing(shipment.id)}
                    >
                      Missing
                    </button>
                  </>
                ) : isDone ? (
                  <button
                    type="button"
                    className="loader-load-button loaded"
                    disabled
                  >
                    Loaded Successfully
                  </button>
                ) : (
                  <button
                    type="button"
                    className="loader-load-button"
                    onClick={() => onLoadOneItem?.(shipment.id)}
                    title={`Click to load next package into truck (${loadedCount + 1}/${totalCount})`}
                  >
                    Load Package ({loadedCount}/{totalCount})
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {visibleShipments.length === 0 && (
          <p className="loader-empty-state">No shipments match your search.</p>
        )}
      </div>

      {/* Popups Workflow */}
      {/* 1. Verify the package popup */}
      <VerifyPackagePopup
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        onScan={handleVerifyScanSuccess}
      />

      {/* 2. Order summary popup */}
      <OrderSummaryPopup
        isOpen={isOrderSummaryOpen}
        onClose={() => setIsOrderSummaryOpen(false)}
        onConfirm={handleConfirmOrder}
        onReportDefect={handleReportDefectTransition}
        data={orderSummaryData}
      />

      {/* 3. Flag a defect popup */}
      <FlagDefectPopup
        isOpen={isFlagDefectOpen}
        onClose={() => setIsFlagDefectOpen(false)}
        onSubmit={handleSubmitDefect}
        defaultPackage={activeShipment ? `${activeShipment.id} · Summit Foods` : 'PKG-9041 · Summit Foods'}
      />
    </section>
  );
}

export default ShipmentSequenceSection;

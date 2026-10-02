import { useState } from 'react';
import { DefectSummaryStats } from '../components/DefectSummaryStats';
import { AffectedPackagesList, DefectPackageItem } from '../components/AffectedPackagesList';
import { ResolveDefectCard } from '../components/ResolveDefectCard';
import { RescanModal } from '../components/RescanModal';
import '../defectPage.css';

const INITIAL_DEFECT_ITEMS: DefectPackageItem[] = [
  {
    id: 'defect-1',
    packageCode: 'PKG-007',
    typeAndCargo: 'Box 07 · Glass cookware set · Crushed corner',
    quantityNote: '1 of 4 units',
    issueNote: 'Outer carton compressed 6 cm at rear-right edge.',
    severity: 'high',
    timestamp: '09:43:18',
    status: 'unresolved',
  },
  {
    id: 'defect-2',
    packageCode: 'PKG-009',
    typeAndCargo: 'Pallet 09 · Small appliances · Torn stretch wrap',
    quantityNote: '1 pallet',
    issueNote: 'Wrap split along left face; product cartons still sealed.',
    severity: 'medium',
    timestamp: '09:46:02',
    status: 'unresolved',
  },
  {
    id: 'defect-3',
    packageCode: 'PKG-010',
    typeAndCargo: 'Box 10 · Mixer accessories · Wet label',
    quantityNote: '2 of 8 cartons',
    issueNote: 'Barcode readable; surface moisture near shipping label.',
    severity: 'medium',
    timestamp: '09:48:27',
    status: 'unresolved',
  },
];

export function DefectItemsPage() {
  const [defectItems, setDefectItems] = useState<DefectPackageItem[]>(INITIAL_DEFECT_ITEMS);
  const [selectedItem, setSelectedItem] = useState<DefectPackageItem | null>(INITIAL_DEFECT_ITEMS[0]);
  const [rescanTarget, setRescanTarget] = useState<DefectPackageItem | null>(null);

  // Stats calculations
  const unresolvedItems = defectItems.filter((i) => i.status !== 'resolved');
  const defectCount = unresolvedItems.length;
  const scannedCount = 10;
  const remainingCount = 8;
  const recordedCount = 8;
  const totalCount = 10;

  const handleSelectItem = (item: DefectPackageItem) => {
    setSelectedItem(item);
  };

  const handleConfirmDefect = (item: DefectPackageItem) => {
    setDefectItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: 'confirmed' } : i
      )
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, status: 'confirmed' });
    }
  };

  const handleMarkResolved = (item: DefectPackageItem) => {
    setDefectItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: 'resolved' } : i
      )
    );
    // Switch selection to next unresolved if present
    const remaining = defectItems.filter((i) => i.id !== item.id && i.status !== 'resolved');
    setSelectedItem(remaining.length > 0 ? remaining[0] : null);
  };

  const handleOpenRescan = (item: DefectPackageItem) => {
    setRescanTarget(item);
  };

  const handleConfirmRescan = (item: DefectPackageItem) => {
    // Re-scan resolves the defect
    handleMarkResolved(item);
  };

  return (
    <div className="defect-items-page-container">
      {/* 1. Page Header */}
      <div className="defect-page-header">
        <h1 className="defect-page-title">Defect Items</h1>
        <p className="defect-page-subtitle">
          Load LG-3342 · Dock #3 · Shipment SHP-9821 · Scan review
        </p>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <DefectSummaryStats
        scannedCount={scannedCount}
        remainingCount={remainingCount}
        defectCount={defectCount}
        recordedCount={recordedCount}
        totalCount={totalCount}
      />

      {/* 3. Main 2-Column Section */}
      <div className="defect-main-grid">
        {/* Left Column: Affected packages & items */}
        <AffectedPackagesList
          items={defectItems}
          selectedId={selectedItem ? selectedItem.id : ''}
          onSelect={handleSelectItem}
          onRescan={handleOpenRescan}
          onConfirmDefect={handleConfirmDefect}
        />

        {/* Right Column: Resolve selected defect */}
        <ResolveDefectCard
          selectedItem={selectedItem}
          onConfirmDefect={handleConfirmDefect}
          onRescan={handleOpenRescan}
          onMarkResolved={handleMarkResolved}
        />
      </div>

      {/* 4. Re-scan Modal */}
      <RescanModal
        isOpen={Boolean(rescanTarget)}
        onClose={() => setRescanTarget(null)}
        item={rescanTarget}
        onConfirmRescan={handleConfirmRescan}
      />
    </div>
  );
}

export default DefectItemsPage;

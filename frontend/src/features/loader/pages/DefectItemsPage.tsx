import { useEffect, useState } from 'react';
import { api } from '../../../api';
import { DefectSummaryStats } from '../components/DefectSummaryStats';
import { AffectedPackagesList, DefectPackageItem } from '../components/AffectedPackagesList';
import { ResolveDefectCard } from '../components/ResolveDefectCard';
import { RescanModal } from '../components/RescanModal';
import '../defectPage.css';

export function DefectItemsPage() {
  const [defectItems, setDefectItems] = useState<DefectPackageItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DefectPackageItem | null>(null);
  const [rescanTarget, setRescanTarget] = useState<DefectPackageItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDefects = () => api.loadingDefects().then((items) => {
    const mapped = items.map((item) => ({
      id: item.id, stopId: item.stopId, packageCode: item.packageCode, typeAndCargo: item.typeAndCargo,
      quantityNote: `${item.units} units`, issueNote: item.issueNote || 'No notes provided.',
      severity: item.severity === 'critical' ? 'high' : item.severity,
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
      status: item.status,
    } as DefectPackageItem));
    setDefectItems(mapped);
    setSelectedItem((current) => mapped.find((item) => item.id === current?.id) ?? mapped[0] ?? null);
  });

  useEffect(() => { loadDefects().catch((e) => setError(e instanceof Error ? e.message : 'Could not load defects.')); }, []);

  // Stats calculations
  const unresolvedItems = defectItems.filter((i) => i.status !== 'resolved');
  const defectCount = unresolvedItems.length;
  const totalCount = defectItems.reduce((max, item) => Math.max(max, Number(item.quantityNote.match(/\d+/)?.[0] ?? 0)), 0);
  const recordedCount = defectItems.length;
  const scannedCount = defectItems.filter((item) => item.status !== 'unresolved').length;
  const remainingCount = Math.max(0, totalCount - recordedCount);

  const handleSelectItem = (item: DefectPackageItem) => {
    setSelectedItem(item);
  };

  const handleConfirmDefect = async (item: DefectPackageItem) => {
    try {
      await api.updateLoadingDefect(item.id, 'confirmed');
      await loadDefects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not confirm defect.');
    }
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, status: 'confirmed' });
    }
  };

  const handleMarkResolved = async (item: DefectPackageItem) => {
    try {
      await api.updateLoadingDefect(item.id, 'resolved');
      await api.updateLoadingStop(item.stopId, 'LOADING');
      await loadDefects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resolve defect.');
    }
  };

  const handleOpenRescan = (item: DefectPackageItem) => {
    setRescanTarget(item);
  };

  const handleConfirmRescan = async (item: DefectPackageItem) => {
    try {
      await api.updateLoadingStop(item.stopId, 'LOADED');
      await api.updateLoadingDefect(item.id, 'resolved');
      await loadDefects();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the rescan.');
    }
  };

  return (
    <div className="defect-items-page-container">
      {error && <p role="alert">{error}</p>}
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

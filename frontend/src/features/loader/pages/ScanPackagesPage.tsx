import { useState, useMemo } from 'react';
import { ChevronDown, CheckCircle2, Truck } from 'lucide-react';
import { PackageScannerCard, PackageData } from '../components/PackageScannerCard';
import { LoadProgressCard } from '../components/LoadProgressCard';
import { RecentScansCard, RecentScanItem } from '../components/RecentScansCard';
import { FinishLoadCard } from '../components/FinishLoadCard';
import { LoadingSequenceCard } from '../components/LoadingSequenceCard';
import { ManualCodeModal } from '../components/ManualCodeModal';
import { FlagDefectModal } from '../components/FlagDefectModal';
import { PackageReviewModal } from '../components/PackageReviewModal';
import '../scanPage.css';

interface TruckData {
  id: string;
  name: string;
  loadCode: string;
  dock: string;
  shipment: string;
  packages: PackageData[];
}

const TRUCK_DATASETS: Record<string, TruckData> = {
  'Truck – LB 2229': {
    id: 'TRC-204',
    name: 'Truck – LB 2229',
    loadCode: 'Load LG-3342',
    dock: 'Dock #3',
    shipment: 'Shipment SHP-9821',
    packages: [
      { id: 'PKG-001', type: 'Box 01', weight: '28 kg', zone: 'Zone A', category: 'General', status: 'scanned', timestamp: '09:22' },
      { id: 'PKG-002', type: 'Pallet 02', weight: '95 kg', zone: 'Zone A', category: 'Hardware', status: 'scanned', timestamp: '09:28' },
      { id: 'PKG-003', type: 'Box 03', weight: '34 kg', zone: 'Zone B', category: 'Textiles', status: 'scanned', timestamp: '09:32' },
      { id: 'PKG-004', type: 'Pallet 04', weight: '118 kg', zone: 'Zone B', category: 'Beverages', status: 'scanned', timestamp: '09:36' },
      { id: 'PKG-005', type: 'Box 05', weight: '31 kg', zone: 'Zone B', category: 'Perishables', status: 'scanned', timestamp: '09:39' },
      { id: 'PKG-006', type: 'Pallet 06', weight: '84 kg', zone: 'Zone A', category: 'Home appliances', status: 'scanned', timestamp: '09:41' },
      { id: 'PKG-007', type: 'Box 07', weight: '42 kg', zone: 'Zone B', category: 'Fragile', status: 'current' },
      { id: 'PKG-008', type: 'Pallet 08', weight: '126 kg', zone: 'Zone C', category: 'General freight', status: 'pending' },
      { id: 'PKG-009', type: 'Box 09', weight: '55 kg', zone: 'Zone C', category: 'Electronics', status: 'pending' },
      { id: 'PKG-010', type: 'Pallet 10', weight: '160 kg', zone: 'Zone C', category: 'Heavy goods', status: 'pending' },
    ],
  },
  'Truck – LG 3342': {
    id: 'TRC-208',
    name: 'Truck – LG 3342',
    loadCode: 'Load LG-3345',
    dock: 'Dock #1',
    shipment: 'Shipment SHP-9822',
    packages: [
      { id: 'PKG-101', type: 'Pallet 01', weight: '110 kg', zone: 'Zone A', category: 'Produce', status: 'scanned', timestamp: '08:45' },
      { id: 'PKG-102', type: 'Box 02', weight: '40 kg', zone: 'Zone A', category: 'Dairy', status: 'scanned', timestamp: '08:52' },
      { id: 'PKG-103', type: 'Pallet 03', weight: '85 kg', zone: 'Zone B', category: 'Frozen Meat', status: 'current' },
      { id: 'PKG-104', type: 'Box 04', weight: '60 kg', zone: 'Zone B', category: 'Chilled Seafood', status: 'pending' },
      { id: 'PKG-105', type: 'Pallet 05', weight: '140 kg', zone: 'Zone C', category: 'Poultry', status: 'pending' },
    ],
  },
  'Truck – LG 6789': {
    id: 'TRC-212',
    name: 'Truck – LG 6789',
    loadCode: 'Load LG-6789',
    dock: 'Dock #5',
    shipment: 'Shipment SHP-9823',
    packages: [
      { id: 'PKG-201', type: 'Box 01', weight: '30 kg', zone: 'Zone A', category: 'Dry Cargo', status: 'current' },
      { id: 'PKG-202', type: 'Box 02', weight: '45 kg', zone: 'Zone A', category: 'Packaging', status: 'pending' },
      { id: 'PKG-203', type: 'Pallet 03', weight: '120 kg', zone: 'Zone B', category: 'Canned Goods', status: 'pending' },
    ],
  },
};

const TRUCK_KEYS = Object.keys(TRUCK_DATASETS);

export function ScanPackagesPage() {
  const [selectedTruckKey, setSelectedTruckKey] = useState<string>(TRUCK_KEYS[0]);
  const [truckDropdownOpen, setTruckDropdownOpen] = useState(false);

  // State keyed by truck
  const [truckState, setTruckState] = useState<Record<string, { packages: PackageData[]; currentIndex: number; scans: RecentScanItem[] }>>({
    'Truck – LB 2229': {
      packages: TRUCK_DATASETS['Truck – LB 2229'].packages,
      currentIndex: 6, // PKG-007
      scans: [
        { id: '1', code: 'PKG-006', details: 'Pallet 06 • 84 kg', time: '09:41' },
        { id: '2', code: 'PKG-005', details: 'Box 05 • 31 kg', time: '09:39' },
        { id: '3', code: 'PKG-004', details: 'Pallet 04 • 118 kg', time: '09:36' },
      ],
    },
    'Truck – LG 3342': {
      packages: TRUCK_DATASETS['Truck – LG 3342'].packages,
      currentIndex: 2,
      scans: [
        { id: '102', code: 'PKG-102', details: 'Box 02 • 40 kg', time: '08:52' },
        { id: '101', code: 'PKG-101', details: 'Pallet 01 • 110 kg', time: '08:45' },
      ],
    },
    'Truck – LG 6789': {
      packages: TRUCK_DATASETS['Truck – LG 6789'].packages,
      currentIndex: 0,
      scans: [],
    },
  });

  // Modals
  const [manualCodeOpen, setManualCodeOpen] = useState(false);
  const [flagDefectOpen, setFlagDefectOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [loadCompleteSuccess, setLoadCompleteSuccess] = useState(false);

  const activeTruck = TRUCK_DATASETS[selectedTruckKey] ?? TRUCK_DATASETS['Truck – LB 2229'];
  const currentTruckState = truckState[selectedTruckKey] ?? {
    packages: activeTruck.packages,
    currentIndex: 0,
    scans: [],
  };

  const { packages, currentIndex, scans } = currentTruckState;
  const currentPackage = packages[currentIndex] ?? packages[packages.length - 1] ?? {
    id: 'PKG-001',
    type: 'Box',
    weight: '30 kg',
    status: 'scanned',
  };

  const scannedCount = packages.filter((p) => p.status === 'scanned').length;
  const totalCount = packages.length;
  const remainingCount = Math.max(0, totalCount - scannedCount);
  const isAllCompleted = remainingCount === 0;

  // Calculate dynamic loaded weight
  const loadedWeight = useMemo(() => {
    const baseWeight = 5.9; // base tons
    const additional = (scannedCount * 0.1);
    return `${(baseWeight + additional).toFixed(1)}t`;
  }, [scannedCount]);

  // Execute scan transition
  const executeScan = (targetIndex: number) => {
    const updated = [...packages];
    const pkgToScan = updated[targetIndex];
    if (!pkgToScan) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updated[targetIndex] = {
      ...pkgToScan,
      status: 'scanned',
      timestamp: timeStr,
    };

    // Prepend new scan to the top of recent scans list
    const newScanItem: RecentScanItem = {
      id: Date.now().toString() + '-' + pkgToScan.id,
      code: pkgToScan.id,
      details: `${pkgToScan.type} • ${pkgToScan.weight}`,
      time: timeStr,
    };

    const newScans = [newScanItem, ...scans];

    // Find next unscanned package
    const nextUnscannedIndex = updated.findIndex((p, idx) => idx > targetIndex && p.status !== 'scanned');
    const nextIndex = nextUnscannedIndex !== -1 ? nextUnscannedIndex : targetIndex;

    if (nextUnscannedIndex !== -1) {
      updated[nextUnscannedIndex] = {
        ...updated[nextUnscannedIndex],
        status: 'current',
      };
    }

    setTruckState((prev) => ({
      ...prev,
      [selectedTruckKey]: {
        packages: updated,
        currentIndex: nextIndex,
        scans: newScans,
      },
    }));
  };

  const handleConfirmCurrentScan = () => {
    executeScan(currentIndex);
  };

  const handleManualCodeSubmit = (code: string) => {
    const targetIdx = packages.findIndex((p) => p.id === code);
    if (targetIdx !== -1) {
      executeScan(targetIdx);
      return true;
    }
    return false;
  };

  const handleReportDefect = (defect: { packageId: string; issueType: string; severity: string; notes: string }) => {
    console.log('Defect flagged for package:', defect);
    // Advance to next pending package
    const nextIdx = packages.findIndex((p, idx) => idx > currentIndex && p.status !== 'scanned');
    if (nextIdx !== -1) {
      const updated = [...packages];
      updated[nextIdx] = { ...updated[nextIdx], status: 'current' };
      setTruckState((prev) => ({
        ...prev,
        [selectedTruckKey]: {
          ...prev[selectedTruckKey],
          packages: updated,
          currentIndex: nextIdx,
        },
      }));
    }
  };

  const handleCompleteLoad = () => {
    setLoadCompleteSuccess(true);
  };

  return (
    <div className="scan-packages-page-container">
      {/* Page Header */}
      <div className="scan-page-header">
        <div className="scan-page-title-area">
          <h1>Scan Packages</h1>
          <p className="scan-page-subtitle">
            {activeTruck.loadCode} • {activeTruck.dock} • {activeTruck.shipment}
          </p>
        </div>

        {/* Status indicator badge */}
        <div className="scan-header-right">
          <div className={`status-indicator-badge ${isAllCompleted ? 'status-completed' : ''}`}>
            <span className={isAllCompleted ? 'green-dot' : 'amber-dot'} />
            <span>{isAllCompleted ? 'Loading completed' : 'Loading in progress'}</span>
          </div>
        </div>
      </div>

      {/* Truck Selector Dropdown */}
      <div className="truck-selector-row">
        <div className="truck-dropdown-wrapper">
          <button
            type="button"
            className="truck-dropdown-trigger"
            onClick={() => setTruckDropdownOpen(!truckDropdownOpen)}
          >
            <Truck className="w-5 h-5 text-purple-600 inline" />
            <span>{selectedTruckKey}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
          {truckDropdownOpen && (
            <div className="truck-dropdown-menu">
              {TRUCK_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`truck-dropdown-item ${key === selectedTruckKey ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTruckKey(key);
                    setTruckDropdownOpen(false);
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="scan-main-grid">
        {/* Left Column: Camera Scanner Card */}
        <div className="scan-grid-left">
          <PackageScannerCard
            currentPackage={currentPackage}
            onPrevPackage={() => {
              const newIdx = Math.max(0, currentIndex - 1);
              setTruckState((prev) => ({
                ...prev,
                [selectedTruckKey]: { ...prev[selectedTruckKey], currentIndex: newIdx },
              }));
            }}
            onNextPackage={() => {
              const newIdx = Math.min(packages.length - 1, currentIndex + 1);
              setTruckState((prev) => ({
                ...prev,
                [selectedTruckKey]: { ...prev[selectedTruckKey], currentIndex: newIdx },
              }));
            }}
            onOpenManualCode={() => setManualCodeOpen(true)}
            onOpenFlagDefect={() => setFlagDefectOpen(true)}
            onReviewPackage={() => setReviewOpen(true)}
            onScanSuccess={() => handleConfirmCurrentScan()}
            isAllCompleted={isAllCompleted}
          />
        </div>

        {/* Right Column: 3 Side Widget Cards */}
        <div className="scan-grid-right">
          {/* 1. Load Progress Card (dynamically updates percentage, bar fill, and counts) */}
          <LoadProgressCard
            scannedCount={scannedCount}
            totalCount={totalCount}
            loadedWeight={loadedWeight}
          />

          {/* 2. Recent Scans Card (Scrollable, newest on top, without view all button) */}
          <RecentScansCard
            scans={scans}
          />

          {/* 3. Finish Load Card (Activates when remaining count === 0) */}
          <FinishLoadCard
            remainingCount={remainingCount}
            totalCount={totalCount}
            onCompleteLoad={handleCompleteLoad}
          />
        </div>
      </div>

      {/* Bottom Section: Loading Sequence Carousel Card */}
      <div className="scan-bottom-row">
        <LoadingSequenceCard
          packages={packages}
          currentIndex={currentIndex}
          onSelectIndex={(index) => {
            setTruckState((prev) => ({
              ...prev,
              [selectedTruckKey]: { ...prev[selectedTruckKey], currentIndex: index },
            }));
          }}
        />
      </div>

      {/* Interactive Modals */}
      <ManualCodeModal
        isOpen={manualCodeOpen}
        onClose={() => setManualCodeOpen(false)}
        onCodeSubmit={handleManualCodeSubmit}
        currentPackage={currentPackage}
      />

      <FlagDefectModal
        isOpen={flagDefectOpen}
        onClose={() => setFlagDefectOpen(false)}
        onReportDefect={handleReportDefect}
        currentPackage={currentPackage}
      />

      <PackageReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        packageData={currentPackage}
        onConfirmScanned={handleConfirmCurrentScan}
      />

      {/* Completion Modal */}
      {loadCompleteSuccess && (
        <div className="modal-backdrop-overlay" onClick={() => setLoadCompleteSuccess(false)}>
          <div className="modal-container success-complete-modal" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3" />
            <h2>Loading Complete!</h2>
            <p>All {totalCount} packages have been successfully loaded for <strong>{selectedTruckKey}</strong> ({loadedWeight} total cargo).</p>
            <p className="text-sm text-gray-500 mt-2">Vehicle is cleared for driver manifest signature and departure.</p>
            <button
              type="button"
              className="btn-modal-submit purple mt-4"
              onClick={() => setLoadCompleteSuccess(false)}
            >
              Close &amp; Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

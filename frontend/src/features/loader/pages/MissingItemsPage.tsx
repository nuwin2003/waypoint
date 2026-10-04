import { useEffect, useState } from 'react';
import { api, LoadingMissingItem } from '../../../api';
import { PackageMinus, Search, RefreshCw } from 'lucide-react';
import '../scanPage.css';

interface MissingItem {
  id: string;
  stopId: string;
  packageCode: string;
  shipmentId: string;
  expectedDock: string;
  truck: string;
  weight: string;
  status: 'pending-investigation' | 'located';
}

export function MissingItemsPage() {
  const [missing, setMissing] = useState<MissingItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadMissing = () => api.loadingMissing().then((items: LoadingMissingItem[]) => setMissing(items.map((item) => ({
    id: item.id, stopId: item.stopId, packageCode: item.packageCode, shipmentId: item.orderRef, expectedDock: 'Not assigned',
    truck: item.vehicleId, weight: item.weight, status: item.status,
  }))));
  useEffect(() => { loadMissing().catch((e) => setError(e instanceof Error ? e.message : 'Could not load missing items.')); }, []);

  const filtered = missing.filter(
    (m) =>
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      m.truck.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkLocated = (id: string) => {
    const item = missing.find((candidate) => candidate.id === id);
    if (!item) return;
    api.updateLoadingMissing(item.id, 'located').then(loadMissing)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not update missing item.'));
  };

  return (
    <div className="scan-packages-page-container">
      {error && <p role="alert">{error}</p>}
      <div className="scan-page-header">
        <div className="scan-page-title-area">
          <h1>Missing Items</h1>
          <p className="scan-page-subtitle">
            Unscanned shipments and missing inventory tracking
          </p>
        </div>
      </div>

      <div className="modal-search-box" style={{ maxWidth: '480px' }}>
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by package, shipment, or truck..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="scanner-card">
        <div className="table-container">
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Missing Package ID</th>
                <th>Shipment ID</th>
                <th>Expected Dock</th>
                <th>Target Truck</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.packageCode}</strong></td>
                  <td>{item.shipmentId}</td>
                  <td>{item.expectedDock}</td>
                  <td>{item.truck}</td>
                  <td>{item.weight}</td>
                  <td>
                    <span className={`badge-pill ${item.status === 'located' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.status !== 'located' && (
                      <button
                        type="button"
                        className="btn-modal-submit purple"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleMarkLocated(item.id)}
                      >
                        Mark Located
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

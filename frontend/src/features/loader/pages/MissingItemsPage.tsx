import { useState } from 'react';
import { PackageMinus, Search, RefreshCw } from 'lucide-react';
import '../scanPage.css';

interface MissingItem {
  id: string;
  shipmentId: string;
  expectedDock: string;
  truck: string;
  weight: string;
  status: 'pending-investigation' | 'located';
}

const INITIAL_MISSING: MissingItem[] = [
  { id: 'PKG-044', shipmentId: 'SHP-9821', expectedDock: 'Dock #3', truck: 'LG-3342', weight: '54 kg', status: 'pending-investigation' },
  { id: 'PKG-078', shipmentId: 'SHP-9823', expectedDock: 'Dock #1', truck: 'LG-6789', weight: '22 kg', status: 'pending-investigation' },
];

export function MissingItemsPage() {
  const [missing, setMissing] = useState<MissingItem[]>(INITIAL_MISSING);
  const [search, setSearch] = useState('');

  const filtered = missing.filter(
    (m) =>
      m.id.toLowerCase().includes(search.toLowerCase()) ||
      m.shipmentId.toLowerCase().includes(search.toLowerCase()) ||
      m.truck.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkLocated = (id: string) => {
    setMissing((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'located' } : item
      )
    );
  };

  return (
    <div className="scan-packages-page-container">
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
                  <td><strong>{item.id}</strong></td>
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

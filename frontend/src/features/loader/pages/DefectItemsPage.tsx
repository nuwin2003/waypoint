import { useState } from 'react';
import { AlertTriangle, Flag, CheckCircle, Search, Filter } from 'lucide-react';
import '../scanPage.css';

interface DefectItem {
  id: string;
  packageId: string;
  type: string;
  issue: string;
  severity: 'critical' | 'medium' | 'low';
  dock: string;
  reportedBy: string;
  time: string;
  status: 'quarantined' | 'reviewed' | 'resolved';
}

const INITIAL_DEFECTS: DefectItem[] = [
  { id: 'DEF-101', packageId: 'PKG-007', type: 'Box 07 (Fragile)', issue: 'Damaged Box / Punctured Corner', severity: 'medium', dock: 'Dock #3', reportedBy: 'Loader Sarith', time: '09:42', status: 'quarantined' },
  { id: 'DEF-102', packageId: 'PKG-014', type: 'Pallet 14 (Chilled)', issue: 'Temperature Abuse (+8.4°C)', severity: 'critical', dock: 'Dock #1', reportedBy: 'Loader Nimal', time: '08:50', status: 'reviewed' },
  { id: 'DEF-103', packageId: 'PKG-022', type: 'Box 22 (Liquid)', issue: 'Leaking Fluid / Wet Outer Carton', severity: 'critical', dock: 'Dock #4', reportedBy: 'Loader Kamal', time: '08:15', status: 'quarantined' },
];

export function DefectItemsPage() {
  const [defects, setDefects] = useState<DefectItem[]>(INITIAL_DEFECTS);
  const [search, setSearch] = useState('');

  const filtered = defects.filter(
    (d) =>
      d.packageId.toLowerCase().includes(search.toLowerCase()) ||
      d.issue.toLowerCase().includes(search.toLowerCase()) ||
      d.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleResolve = (id: string) => {
    setDefects((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'resolved' } : item
      )
    );
  };

  return (
    <div className="scan-packages-page-container">
      <div className="scan-page-header">
        <div className="scan-page-title-area">
          <h1>Defect Items</h1>
          <p className="scan-page-subtitle">
            Flagged cargo inspection and quarantine quarantine log
          </p>
        </div>
      </div>

      <div className="modal-search-box" style={{ maxWidth: '480px' }}>
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by package ID or defect description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="scanner-card">
        <div className="table-container">
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Package ID</th>
                <th>Type</th>
                <th>Issue Category</th>
                <th>Severity</th>
                <th>Dock</th>
                <th>Reported At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.packageId}</strong></td>
                  <td>{item.type}</td>
                  <td>{item.issue}</td>
                  <td>
                    <span className={`severity-pill ${item.severity} active`}>
                      {item.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>{item.dock}</td>
                  <td>{item.time}</td>
                  <td>
                    <span className={`badge-pill ${item.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        className="btn-modal-submit purple"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => handleResolve(item.id)}
                      >
                        Clear Defect
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

import { useState } from 'react';
import { Modal } from '../../shared/ui/Components';

type LoadStatus = 'loading' | 'ready' | 'flagged' | 'not-started';

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
}

const VEHICLES: VehicleEntry[] = [
  { id: 'V-01', plate: 'LP-6387', type: 'Freezer Truck', dock: 'D-1', route: 'R-1 · Colombo', driver: 'N. Perera', loadPct: 78, status: 'loading', packages: 19, tempReq: 'Chilled' },
  { id: 'V-04', plate: 'LP-4201', type: 'Dry-Box Truck', dock: 'D-2', route: 'R-2 · Kandy', driver: 'S. Fernando', loadPct: 100, status: 'ready', packages: 34, tempReq: 'Dry' },
  { id: 'V-02', plate: 'LP-5510', type: 'Freezer Truck', dock: 'D-3', route: 'R-3 · Galle', driver: 'A. Silva', loadPct: 55, status: 'loading', packages: 12, tempReq: 'Chilled' },
  { id: 'V-07', plate: 'LP-3309', type: 'Van', dock: 'D-4', route: 'R-4 · Kandy', driver: 'K. Bandara', loadPct: 100, status: 'ready', packages: 8, tempReq: 'Dry' },
  { id: 'V-03', plate: 'LP-9124', type: 'Dry-Box Truck', dock: 'D-5', route: 'R-5 · Negombo', driver: 'M. Rizwan', loadPct: 20, status: 'flagged', packages: 0, tempReq: 'Dry' },
  { id: 'V-06', plate: 'LP-7711', type: 'Freezer Truck', dock: 'D-6', route: 'Unassigned', driver: '—', loadPct: 0, status: 'not-started', packages: 0, tempReq: 'Chilled' },
];

const STATUS_LABELS: Record<LoadStatus, string> = {
  loading: 'Loading',
  ready: 'Ready',
  flagged: 'Flagged',
  'not-started': 'Not started',
};

type FilterType = 'all' | LoadStatus;

export function LoaderWorkspace() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleEntry | null>(null);
  const [checklist, setChecklist] = useState({
    sealVerified: false,
    tempChecked: false,
    manifestSigned: false,
    safetyCheck: false,
  });
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearedVehicle, setClearedVehicle] = useState<string | null>(null);

  const stats = {
    total: VEHICLES.length,
    loading: VEHICLES.filter((v) => v.status === 'loading').length,
    ready: VEHICLES.filter((v) => v.status === 'ready').length,
    flagged: VEHICLES.filter((v) => v.status === 'flagged').length,
  };

  const filtered = filter === 'all' ? VEHICLES : VEHICLES.filter((v) => v.status === filter);

  const handleClearDeparture = (vehicle: VehicleEntry) => {
    setSelectedVehicle(vehicle);
    setChecklist({ sealVerified: false, tempChecked: false, manifestSigned: false, safetyCheck: false });
    setIsClearanceModalOpen(true);
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const handleConfirmClearance = () => {
    if (selectedVehicle) setClearedVehicle(selectedVehicle.plate);
    setIsClearanceModalOpen(false);
  };

  const filterPills: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Loading', value: 'loading' },
    { label: 'Ready', value: 'ready' },
    { label: 'Flagged', value: 'flagged' },
    { label: 'Not started', value: 'not-started' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Peliyagoda distribution centre · Morning loading window</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" type="button">
            📥 Import Manifest
          </button>
          <button className="btn-primary" type="button">
            + Flag Issue
          </button>
        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="stat-cards-grid">
        {/* Trucks today */}
        <div
          className="stat-card"
          onClick={() => setFilter('all')}
          style={{ cursor: 'pointer', borderColor: filter === 'all' ? 'var(--purple-400)' : undefined }}
        >
          <div>
            <div className="stat-card-title">Trucks today</div>
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-meta">Scheduled this window</div>
          </div>
          <div className="stat-card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
        </div>

        {/* Loading */}
        <div
          className="stat-card"
          onClick={() => setFilter('loading')}
          style={{ cursor: 'pointer', borderColor: filter === 'loading' ? 'var(--purple-400)' : undefined }}
        >
          <div>
            <div className="stat-card-title">Loading</div>
            <div className="stat-card-value" style={{ color: 'var(--status-purple-text)' }}>{stats.loading}</div>
            <div className="stat-card-meta">In progress now</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'var(--status-purple-bg)', color: 'var(--status-purple-text)' }}>
            ⏳
          </div>
        </div>

        {/* Ready */}
        <div
          className="stat-card"
          onClick={() => setFilter('ready')}
          style={{ cursor: 'pointer', borderColor: filter === 'ready' ? 'var(--purple-400)' : undefined }}
        >
          <div>
            <div className="stat-card-title">Ready</div>
            <div className="stat-card-value" style={{ color: 'var(--status-good-text)' }}>{stats.ready}</div>
            <div className="stat-card-meta">Cleared for departure</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'var(--status-good-bg)', color: 'var(--status-good-text)' }}>
            ✅
          </div>
        </div>

        {/* Flagged */}
        <div
          className="stat-card"
          onClick={() => setFilter('flagged')}
          style={{ cursor: 'pointer', borderColor: filter === 'flagged' ? 'var(--purple-400)' : undefined }}
        >
          <div>
            <div className="stat-card-title">Flagged</div>
            <div className="stat-card-value" style={{ color: 'var(--status-danger-text)' }}>{stats.flagged}</div>
            <div className="stat-card-meta">Needs attention</div>
          </div>
          <div className="stat-card-icon" style={{ background: 'var(--status-danger-bg)', color: 'var(--status-danger-text)' }}>
            🚨
          </div>
        </div>
      </div>

      {/* ── DEPARTURE CLEARED BANNER ── */}
      {clearedVehicle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: 'var(--status-good-bg)',
            border: '1px solid #86EFAC',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--status-good-text)',
          }}
        >
          <span>✅ Vehicle {clearedVehicle} cleared for departure!</span>
          <button
            type="button"
            onClick={() => setClearedVehicle(null)}
            style={{ background: 'transparent', border: 0, color: 'var(--status-good-text)', cursor: 'pointer', fontSize: 18 }}
          >
            ×
          </button>
        </div>
      )}

      {/* ── FILTER PILLS ── */}
      <div className="filter-pills-row">
        {filterPills.map((p) => (
          <button
            key={p.value}
            type="button"
            className={`filter-pill${filter === p.value ? ' active' : ''}`}
            onClick={() => setFilter(p.value)}
          >
            {p.label}
            {p.value !== 'all' && (
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 99,
                  background: filter === p.value ? 'rgba(255,255,255,0.25)' : 'var(--bg-subtle)',
                  color: filter === p.value ? '#fff' : 'var(--text-muted)',
                }}
              >
                {p.value === 'loading' ? stats.loading : p.value === 'ready' ? stats.ready : p.value === 'flagged' ? stats.flagged : VEHICLES.filter(v => v.status === 'not-started').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── VEHICLE QUEUE LIST ── */}
      <div className="table-card">
        <div className="table-header-title">
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              VEHICLE LOADING QUEUE
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Dock</th>
                <th>Route</th>
                <th>Driver</th>
                <th>Load progress</th>
                <th>Temp</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="col-bold">{v.plate}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{v.type}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--purple-600)' }}>{v.dock}</span>
                  </td>
                  <td>{v.route}</td>
                  <td>{v.driver}</td>
                  <td style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="bar-track" style={{ flex: 1, height: 6 }}>
                        <div
                          className="bar-fill"
                          style={{
                            width: `${v.loadPct}%`,
                            backgroundColor: v.loadPct === 100 ? '#16A34A' : v.status === 'flagged' ? '#EF4444' : 'var(--purple-600)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', minWidth: 30 }}>
                        {v.loadPct}%
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {v.packages} pkg{v.packages !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: v.tempReq === 'Chilled' ? 'var(--status-info-bg)' : 'var(--status-warn-bg)',
                        color: v.tempReq === 'Chilled' ? 'var(--status-info-text)' : 'var(--status-warn-text)',
                      }}
                    >
                      {v.tempReq === 'Chilled' ? '❄️ Chilled' : '📦 Dry'}
                    </span>
                  </td>
                  <td>
                    <span className={`pill-badge ${v.status}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td>
                    {v.status === 'ready' ? (
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}
                        onClick={() => handleClearDeparture(v)}
                      >
                        Clear →
                      </button>
                    ) : v.status === 'flagged' ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, borderColor: '#EF4444', color: '#991B1B' }}
                        onClick={() => setSelectedVehicle(v)}
                      >
                        Resolve
                      </button>
                    ) : (
                      <button
                        type="button"
                        style={{ background: 'transparent', border: 0, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}
                        onClick={() => setSelectedVehicle(v)}
                        aria-label="View details"
                      >
                        ›
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE CARD LIST (visible on small screens) ── */}
      <style>{`
        @media (max-width: 768px) {
          .loader-desktop-table { display: none !important; }
          .loader-mobile-list { display: flex !important; }
        }
        @media (min-width: 769px) {
          .loader-mobile-list { display: none !important; }
        }
      `}</style>

      <div className="loader-mobile-list" style={{ flexDirection: 'column', gap: 12 }}>
        {filtered.map((v) => (
          <div
            key={v.id}
            className="card"
            style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{v.plate}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.type} · {v.dock}</div>
              </div>
              <span className={`pill-badge ${v.status}`}>{STATUS_LABELS[v.status]}</span>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>Route:</strong> {v.route} &nbsp;|&nbsp; <strong>Driver:</strong> {v.driver}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Load progress</span>
                <span>{v.loadPct}% · {v.packages} pkgs</span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${v.loadPct}%`,
                    backgroundColor: v.loadPct === 100 ? '#16A34A' : v.status === 'flagged' ? '#EF4444' : 'var(--purple-600)',
                  }}
                />
              </div>
            </div>

            {v.status === 'ready' && (
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 10 }}
                onClick={() => handleClearDeparture(v)}
              >
                Clear for Departure →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── DEPARTURE CLEARANCE CHECKLIST MODAL ── */}
      <Modal
        isOpen={isClearanceModalOpen}
        onClose={() => setIsClearanceModalOpen(false)}
        title={`Departure Clearance · ${selectedVehicle?.plate}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Vehicle Summary */}
          <div style={{ background: 'var(--bg-subtle)', padding: 14, borderRadius: 10, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>VEHICLE</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{selectedVehicle?.plate}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedVehicle?.type}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>ROUTE</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedVehicle?.route}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Driver: {selectedVehicle?.driver}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>PACKAGES</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--purple-600)' }}>{selectedVehicle?.packages}</div>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            Pre-departure Checklist
          </div>

          {[
            { key: 'sealVerified' as const, label: 'Cargo seals verified and intact', icon: '🔒' },
            { key: 'tempChecked' as const, label: selectedVehicle?.tempReq === 'Chilled' ? 'Freezer temperature confirmed ≤ 4°C' : 'Cargo properly secured (dry goods)', icon: selectedVehicle?.tempReq === 'Chilled' ? '❄️' : '📦' },
            { key: 'manifestSigned' as const, label: 'Loading manifest signed by driver', icon: '📋' },
            { key: 'safetyCheck' as const, label: 'Vehicle safety inspection passed', icon: '✅' },
          ].map((item) => (
            <label
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                background: checklist[item.key] ? 'var(--status-good-bg)' : 'var(--bg-card)',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--purple-600)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: checklist[item.key] ? 'var(--status-good-text)' : 'var(--text-secondary)' }}>
                {item.label}
              </span>
            </label>
          ))}

          {!allChecked && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
              Complete all checklist items to enable clearance
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button className="btn-secondary" type="button" onClick={() => setIsClearanceModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={!allChecked}
              onClick={handleConfirmClearance}
              style={{ opacity: allChecked ? 1 : 0.5 }}
            >
              Confirm Clearance →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

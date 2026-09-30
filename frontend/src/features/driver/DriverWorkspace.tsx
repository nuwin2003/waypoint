import { useState } from 'react';
import { Modal } from '../../shared/ui/Components';

export function DriverWorkspace() {
  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);

  // POD Form State
  const [receiverName, setReceiverName] = useState('');
  const [delivered, setDelivered] = useState(false);

  return (
    <div className="driver-mobile-container">
      {/* Driver Header Greeting */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          TUESDAY, 29 SEPTEMBER
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: 2 }}>
          Good morning, Nuwan<span style={{ color: 'var(--purple-600)' }}>.</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
          Let's make every stop count.
        </p>
      </div>

      {/* TODAY'S ROUTE Purple Card */}
      <div className="driver-today-card">
        <div className="driver-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            TODAY'S ROUTE
          </div>

          <span className="driver-tag-pill">Ready to go</span>
        </div>

        <div>
          <div className="driver-plate-title">LP-6387</div>
          <div className="driver-route-subtitle">Peliyagoda -&gt; Colombo</div>
        </div>

        <div className="driver-stats-trio">
          <div className="trio-item">
            <span className="trio-val">04</span>
            <span className="trio-lbl">delivery stops</span>
          </div>
          <div className="trio-item" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
            <span className="trio-val">19</span>
            <span className="trio-lbl">packages</span>
          </div>
          <div className="trio-item">
            <span className="trio-val">14.8<small style={{ fontSize: 14 }}>km</small></span>
            <span className="trio-lbl">planned distance</span>
          </div>
        </div>

        <div className="driver-time-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          First delivery before 8:00 AM
        </div>
      </div>

      {/* Quick Action Grid (2 Action Cards) */}
      <div className="quick-actions-row">
        <button className="action-card-btn" onClick={() => setIsRefuelModalOpen(true)} type="button">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>Fuel</span> Log refuel
          </div>
          <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
        </button>

        <button className="action-card-btn" onClick={() => setIsFineModalOpen(true)} type="button">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>Fine</span> Report a fine
          </div>
          <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
        </button>
      </div>

      {/* Your Next Stop Card */}
      <div className="next-stop-card">
        <div className="next-stop-header">
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
            Your next stop
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: 'var(--purple-100)', color: 'var(--purple-700)' }}>
            1/4
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Northgate Market
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              42 Negombo Road, Peliyagoda
            </p>
          </div>

          <div className="stop-eta-badge">
            6:55
            <span>AM . ETA</span>
          </div>
        </div>

        {/* Badges Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            [Box] 5 packages
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            -&gt; 3.2 km away
          </span>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--status-good-bg)', color: 'var(--status-good-text)' }}>
            Fresh
          </span>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsJourneyModalOpen(true)}
          style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, justifyContent: 'center' }}
          type="button"
        >
          Start journey {'->'}
        </button>
      </div>

      {/* Refuel Modal */}
      <Modal isOpen={isRefuelModalOpen} onClose={() => setIsRefuelModalOpen(false)} title="Log Refuel Event">
        <form onSubmit={(e) => { e.preventDefault(); setIsRefuelModalOpen(false); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700 }}>Vehicle: LP-6387</label>
          <input type="number" placeholder="Fuel (Liters)" required style={{ height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }} />
          <input type="number" placeholder="Cost (LKR)" required style={{ height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }} />
          <button className="btn-primary" type="submit">Submit Fuel Receipt {'->'}</button>
        </form>
      </Modal>

      {/* Fine Modal */}
      <Modal isOpen={isFineModalOpen} onClose={() => setIsFineModalOpen(false)} title="Report Traffic Fine">
        <form onSubmit={(e) => { e.preventDefault(); setIsFineModalOpen(false); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input type="text" placeholder="Location / Violation" required style={{ height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }} />
          <input type="number" placeholder="Fine Amount (LKR)" required style={{ height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }} />
          <button className="btn-primary" type="submit">Report Fine {'->'}</button>
        </form>
      </Modal>

      {/* Start Journey & POD Modal */}
      <Modal isOpen={isJourneyModalOpen} onClose={() => setIsJourneyModalOpen(false)} title="Delivery & POD . Northgate Market">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--purple-50)', padding: 14, borderRadius: 10 }}>
            <strong>Stop 1 of 4: Northgate Market</strong>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>5 Packages . Chilled Groceries . ETA 6:55 AM</p>
          </div>

          {!delivered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Confirm Arrival & Delivery</div>
              <input
                type="text"
                placeholder="Receiver Name (e.g. S. Perera)"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                style={{ height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}
              />

              <div style={{ border: '1px dashed var(--purple-400)', height: 100, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                [ Digital Signature Pad Area ]
              </div>

              <button
                className="btn-primary"
                onClick={() => setDelivered(true)}
                disabled={!receiverName}
                type="button"
              >
                Complete Delivery & Sign POD {'->'}
              </button>
            </div>
          ) : (
            <div style={{ background: 'var(--status-good-bg)', color: 'var(--status-good-text)', padding: 16, borderRadius: 10, textAlign: 'center' }}>
              <strong>Stop Completed!</strong>
              <p style={{ fontSize: 12, marginTop: 4 }}>POD captured for {receiverName}. Proceeding to Stop 2.</p>
              <button className="btn-primary" onClick={() => { setIsJourneyModalOpen(false); setDelivered(false); }} style={{ marginTop: 12 }} type="button">Next Stop {'->'}</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

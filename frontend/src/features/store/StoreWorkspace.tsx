import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Modal } from '../../shared/ui/Components';

export function StoreWorkspace() {
  const { searchQuery } = (useOutletContext() as { searchQuery?: string }) || {};
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Form states for new order
  const [orderType, setOrderType] = useState<'dry' | 'chilled'>('chilled');
  const [units, setUnits] = useState('12');
  const [weight, setWeight] = useState('120');

  const initialOrders = [
    { id: 'O-0988', day: 'Fri 25 Sep', type: 'dry', units: 34, invoice: 'INV-2210', status: 'delivered' },
    { id: 'O-0989', day: 'Fri 25 Sep', type: 'chilled', units: 12, invoice: '--', status: 'deferred' },
    { id: 'O-0954', day: 'Thu 24 Sep', type: 'dry', units: 30, invoice: 'INV-2198', status: 'delivered' },
    { id: 'O-0955', day: 'Thu 24 Sep', type: 'chilled', units: 15, invoice: 'INV-2199', status: 'delivered' },
  ];

  const filteredOrders = initialOrders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.day.toLowerCase().includes(q) ||
      order.type.toLowerCase().includes(q) ||
      order.invoice.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Store Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Fresh Negombo . Today's order and delivery status
        </p>
      </div>

      {/* Place Order Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--purple-600), var(--purple-700))',
          borderRadius: 20,
          padding: '24px 32px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 2 }}>
          {/* Cloud Illustration */}
          <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
            <path d="M20 60 C10 60 5 50 15 40 C10 25 30 15 45 25 C55 10 75 15 80 30 C90 30 95 45 85 55 C95 65 80 75 70 70 Z" fill="#FFFFFF" fillOpacity="0.25" />
            <path d="M40 45 L65 30 L55 60 L48 48 Z" fill="#FFFFFF" />
          </svg>

          <div>
            <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: '0.02em' }}>
              PLACE ORDER NOW
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, fontWeight: 500 }}>
              Orders close at 4:00 PM
            </div>
          </div>
        </div>

        <button
          className="btn-white"
          onClick={() => setIsOrderModalOpen(true)}
          style={{ padding: '12px 24px', fontSize: 14, zIndex: 2 }}
          type="button"
        >
          Order {'->'}
        </button>
      </div>

      {/* Today's Order Status - 4 Stat Cards */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 12, textTransform: 'uppercase' }}>
          Today's Order Status
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Card 1: Submitted */}
          <div className="stat-card">
            <div>
              <div className="stat-card-title">Submitted</div>
              <div className="stat-card-value">2</div>
              <div className="stat-card-meta">Awaiting confirmation</div>
            </div>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </div>
          </div>

          {/* Card 2: Confirmed */}
          <div className="stat-card">
            <div>
              <div className="stat-card-title">Confirmed</div>
              <div className="stat-card-value">2</div>
              <div className="stat-card-meta">Accepted for planning</div>
            </div>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>

          {/* Card 3: In transit */}
          <div className="stat-card">
            <div>
              <div className="stat-card-title">In transit</div>
              <div className="stat-card-value">1</div>
              <div className="stat-card-meta">On the way now</div>
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

          {/* Card 4: Delivered */}
          <div className="stat-card">
            <div>
              <div className="stat-card-title">Delivered</div>
              <div className="stat-card-value">1</div>
              <div className="stat-card-meta">Delivered today</div>
            </div>
            <div className="stat-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Next Expected Delivery Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              NEXT EXPECTED DELIVERY
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--status-info-bg)', color: 'var(--status-info-text)' }}>
              Live ETA
            </span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
            07:45
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
            O-1005 . Fresh chilled
          </div>
        </div>

        {/* Vector Illustration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="180" height="70" viewBox="0 0 200 80" fill="none">
            <circle cx="40" cy="40" r="28" fill="var(--purple-100)" />
            <path d="M40 24 V40 H52" stroke="var(--purple-700)" strokeWidth="3" strokeLinecap="round" />
            <path d="M90 40 C110 20, 130 60, 160 40" stroke="var(--purple-300)" strokeWidth="3" strokeDasharray="4 4" fill="none" />
            <circle cx="160" cy="40" r="8" fill="var(--purple-600)" />
          </svg>

          <button
            className="btn-primary"
            onClick={() => setIsTrackModalOpen(true)}
            style={{ borderRadius: 10, padding: '12px 20px' }}
            type="button"
          >
            Track Order {'->'}
          </button>
        </div>
      </div>

      {/* Recent Orders Table Card */}
      <div className="table-card">
        <div className="table-header-title">
          <div>
            <h3>Recent Orders</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Past orders, invoices and delivery receipts</span>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Day</th>
                <th>Type</th>
                <th>Units</th>
                <th>Invoice</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((row) => (
                <tr key={row.id}>
                  <td className="col-bold">{row.id}</td>
                  <td>{row.day}</td>
                  <td>{row.type}</td>
                  <td>{row.units}</td>
                  <td>{row.invoice}</td>
                  <td>
                    <span className={`pill-badge ${row.status}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Order Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Place New Order">
        <form onSubmit={(e) => { e.preventDefault(); setIsOrderModalOpen(false); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Goods Category</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as 'dry' | 'chilled')}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}
            >
              <option value="chilled">Fresh Chilled Goods</option>
              <option value="dry">Ambient / Dry Goods</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Quantity (Units)</label>
              <input
                type="number"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}
              />
            </div>
          </div>

          <div style={{ background: 'var(--purple-50)', padding: 12, borderRadius: 8, fontSize: 12, color: 'var(--purple-800)' }}>
            Cutoff Alert: Orders placed before 4:00 PM are scheduled for tomorrow morning delivery before 8:00 AM.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button className="btn-secondary" type="button" onClick={() => setIsOrderModalOpen(false)}>Cancel</button>
            <button className="btn-primary" type="submit">Submit Order {'->'}</button>
          </div>
        </form>
      </Modal>

      {/* Track Order Modal */}
      <Modal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} title="Live Order Tracking . O-1005">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-subtle)', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Order O-1005 (Fresh Chilled)</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Vehicle LP-6387 . Driver: Nuwan Perera</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--purple-600)', marginTop: 8 }}>ETA: 07:45 AM</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12, borderLeft: '2px solid var(--purple-300)' }}>
            <div>
              <strong style={{ fontSize: 13 }}>05:30 AM . Departed Depot</strong>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Peliyagoda Distribution Centre</p>
            </div>
            <div>
              <strong style={{ fontSize: 13, color: 'var(--purple-700)' }}>07:15 AM . En route (3.2 km away)</strong>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current location: Negombo Road</p>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setIsTrackModalOpen(false)} type="button">Close Tracking</button>
        </div>
      </Modal>
    </div>
  );
}

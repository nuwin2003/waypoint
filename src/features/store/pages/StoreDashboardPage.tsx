import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from '@/lib/router-compat';
import { api, type Order } from '../../../api';
import storeManagerHero from '../../../assets/store-manager-hero.png';
import expectedDelivery from '../../../assets/expected-delivery.png';
import arrowIcon from '../../../assets/arrow-icon.png';
import { useOrderCutoff } from '../components/StoreUI';
import '../store.css';

export function StoreDashboardPage() {
  const { searchQuery } = (useOutletContext() as { searchQuery?: string }) || {};
  const navigate = useNavigate();
  const { beforeCutoff } = useOrderCutoff();

  const [initialOrders, setInitialOrders] = useState<Array<{ id: string; day: string; type: string; units: number; invoice: string; status: string }>>([]);
  useEffect(() => {
    api.orders().then((orders) => setInitialOrders(orders.map((order: Order) => {
      const raw = order.status.toUpperCase();
      const status = /DELIVER|RECEIV/.test(raw) ? 'delivered' : /DEFER|NEXT_RUN/.test(raw) ? 'deferred' : /TRANSIT|DEPART/.test(raw) ? 'in transit' : /LOAD|PLAN/.test(raw) ? 'confirmed' : 'submitted';
      const type = order.productBrand === 'FRESH' ? (order.tempRequirement === 'CHILLED' ? 'chilled' : 'dry') : order.productBrand.toLowerCase();
      return { id: order.orderRef, day: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date unavailable', type, units: order.units, invoice: '—', status };
    }))).catch(() => setInitialOrders([]));
  }, []);

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
        <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Store Dashboard
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Fresh Negombo . Today's order and delivery status
        </p>
      </div>

      {/* Place Order Banner */}
      {beforeCutoff && (
        <div className="store-order-banner">
          <img className="store-order-art" src={storeManagerHero} alt="Order sheet and paper plane" />
          <div className="store-order-copy">
            <div className="store-order-title">PLACE ORDER NOW</div>
            <div className="store-order-subtitle">Orders close at 4:00 PM</div>
          </div>
          <button
            className="btn-white"
            onClick={() => navigate('/store/place-order')}
            style={{ padding: '12px 24px', fontSize: 16 }}
            type="button"
          >
            Order <img className="store-order-arrow" src={arrowIcon} alt="" aria-hidden="true" />
          </button>
        </div>
      )}

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
              <div className="stat-card-value">{initialOrders.filter((order) => order.status === 'submitted').length}</div>
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
              <div className="stat-card-value">{initialOrders.filter((order) => order.status === 'confirmed').length}</div>
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
              <div className="stat-card-value">{initialOrders.filter((order) => order.status === 'in transit').length}</div>
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
              <div className="stat-card-value">{initialOrders.filter((order) => order.status === 'delivered').length}</div>
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
      <div className="card store-delivery-card">
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              NEXT EXPECTED DELIVERY
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--status-info-bg)', color: 'var(--status-info-text)' }}>
              ETA unavailable
            </span>
          </div>
          <div style={{ fontSize: 38, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            —
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 600 }}>
            {initialOrders.find((order) => order.status !== 'delivered')?.id ?? 'No active orders'} . {initialOrders.find((order) => order.status !== 'delivered')?.type ?? ''}
          </div>
        </div>

        <div className="store-delivery-actions">
          <img className="store-delivery-art" src={expectedDelivery} alt="Delivery truck following a route" />
          <button
            className="btn-primary"
            onClick={() => navigate('/store/track')}
            style={{ borderRadius: 10, padding: '12px 20px' }}
            type="button"
          >
            Track Order <img className="store-track-arrow" src={arrowIcon} alt="" aria-hidden="true" />
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


    </div>
  );
}

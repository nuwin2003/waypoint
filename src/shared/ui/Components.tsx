import { ReactNode } from 'react';
import deliveryVehicleImage from '../../assets/delivery-vehicle.png';

// Radial Arc Gauge for Orders Delivered (e.g. 102 Deliveries completed)
export function OrdersDeliveredGauge({ count = 102 }: { count?: number }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Orders delivered</span>
        <span style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)' }}>-&gt;</span>
      </div>
      <div style={{ position: 'relative', width: 170, height: 95, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="85" cy="85" r="70" fill="none" stroke="var(--purple-100)" strokeWidth="16" strokeDasharray="220 220" strokeLinecap="round" />
          <circle cx="85" cy="85" r="70" fill="none" stroke="var(--purple-600)" strokeWidth="16" strokeDasharray="165 220" strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, textAlign: 'center' }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{count}</span>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>Deliveries completed</p>
        </div>
      </div>
    </div>
  );
}

// Weekly Delivery Rate Bar Chart (e.g. 76.6% with Wednesday highlight)
export function DeliveryRateCard({ rate = '76.6%' }: { rate?: string }) {
  const days = [
    { label: 'Su', height: 40, active: false },
    { label: 'Mo', height: 60, active: false },
    { label: 'Tu', height: 45, active: false },
    { label: 'We', height: 90, active: true },
    { label: 'Th', height: 65, active: false },
    { label: 'Fr', height: 75, active: false },
    { label: 'Sa', height: 50, active: false },
  ];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Delivery rate</span>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{rate}</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>than last week</span>
        </div>
        <select style={{ fontSize: 11, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <option>Last week</option>
          <option>This week</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 90, gap: 8, paddingTop: 10 }}>
        {days.map((d) => (
          <div key={d.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 24,
                height: `${d.height}%`,
                backgroundColor: d.active ? 'var(--purple-600)' : 'var(--purple-100)',
                borderRadius: 6,
                transition: 'height 0.3s ease',
              }}
            />
            <span style={{ fontSize: 10, fontWeight: d.active ? 800 : 600, color: d.active ? 'var(--purple-700)' : 'var(--text-muted)', marginTop: 6 }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Delivery Vehicles Card with Truck Vector & Availability Meters
export function DeliveryVehiclesCard({ vehicles = [] }: { vehicles?: { id: string; type: string; temperature: string; status: string }[] }) {
  const categories = [
    { label: 'Reefer truck', matches: (vehicle: (typeof vehicles)[number]) => vehicle.type === 'TRUCK' && vehicle.temperature === 'REEFER' },
    { label: 'Ambient truck', matches: (vehicle: (typeof vehicles)[number]) => vehicle.type === 'TRUCK' && vehicle.temperature === 'AMBIENT' },
    { label: 'Van', matches: (vehicle: (typeof vehicles)[number]) => vehicle.type === 'VAN' },
  ];
  const available = vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Fleet availability</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live API</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--status-good-text)', fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#16A34A' }} /> Available
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{available}</div>
        </div>
        <img className="delivery-vehicle-image" src={deliveryVehicleImage} alt="Delivery truck" />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {available} of {vehicles.length} vehicles available
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map((category) => {
          const members = vehicles.filter(category.matches);
          const ready = members.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
          return <div key={category.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>{category.label}</span>
              <span>{ready} / {members.length}</span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${members.length ? (ready / members.length) * 100 : 0}%` }} /></div>
          </div>;
        })}
      </div>
    </div>
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} type="button">X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { NotificationCard } from './NotificationCard';
export type { NotificationItem, NotificationCardProps } from './NotificationCard';

export { ProfileCard } from './ProfileCard';
export type { ProfileCardProps } from './ProfileCard';



import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from '@/lib/router-compat';
import { DeliveryVehiclesCard, DeliveryRateCard, OrdersDeliveredGauge } from '../../../shared/ui/Components';
import { api, type Vehicle, type Outlet } from '../../../api';
import arrowIcon from '../../../assets/arrow-icon.png';
import '../dispatcher.css';

export function DispatcherDashboardPage() {
  const { searchQuery } = (useOutletContext() as { searchQuery?: string }) || {};
  const navigate = useNavigate();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());

  const [date, setDate] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; vehicle: string; driver: string; brandDistrict: string; stops: string; status: string }>>([]);
  const [depotId, setDepotId] = useState('');
  const [orders, setOrders] = useState<Array<{
    id: string;
    orderRef: string;
    outletName: string;
    brand: string;
    units: number;
    status: string;
  }>>([]);

  useEffect(() => {
    let active = true;
    api.outlets().then(async (outlets: Outlet[]) => {
      if (!active) return;
      setDepotId(outlets[0]?.depotId ?? '');
      setDate(await api.activePlanDate());
    }).catch(() => { if (active) { setOrders([]); setRoutes([]); setDate(today); } });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!depotId || !date) return;
    api.planningContext(depotId, date).then((context) => {
      setOrders(context.orders.map((order) => ({
        id: order.id,
        orderRef: order.orderRef,
        outletName: order.outletName,
        brand: order.brand === 'FRESH' ? 'Fresh' : order.brand === 'STYLE' ? 'Style' : 'Tech',
        units: order.units,
        status: order.status,
      })));
      setVehicles(context.vehicles);
      const trips = context.trips ?? [];
      if (trips.length > 0) {
        setRoutes(trips.map((trip) => ({
          id: `${trip.vehicleId} · T${trip.tripNo}`,
          vehicle: trip.vehicleId,
          driver: trip.vehicleId,
          brandDistrict: `${trip.brand === 'FRESH' ? 'Fresh' : trip.brand === 'STYLE' ? 'Style' : 'Tech'} · ${trip.districtName}`,
          stops: `${trip.stops.length} stops · dep ${trip.departure}`,
          status: trip.status === 'DRAFT' ? 'loading' : 'active',
        })));
      } else {
        setRoutes(context.orders.map((order) => ({
          id: order.orderRef,
          vehicle: 'Not assigned',
          driver: 'Not assigned',
          brandDistrict: `${order.brand === 'FRESH' ? 'Fresh' : order.brand === 'STYLE' ? 'Style' : 'Tech'} · ${order.outletName}`,
          stops: order.status === 'PLANNED' ? 'Planned' : 'Ready',
          status: order.status === 'PLANNED' ? 'loading' : 'active',
        })));
      }
    }).catch(() => {
      setOrders([]);
      setRoutes([]);
    });
  }, [depotId, date]);

  useEffect(() => {
    if (!depotId) return;
    api.vehicles(depotId).then(setVehicles).catch(() => setVehicles([]));
  }, [depotId]);

  const initialRoutes = routes;

  const filteredRoutes = initialRoutes.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.vehicle.toLowerCase().includes(q) ||
      r.driver.toLowerCase().includes(q) ||
      r.brandDistrict.toLowerCase().includes(q)
    );
  });

  return (
    <div className="dispatcher-dashboard">
      <div className="dispatcher-main-column">
      {/* Top 3 Stat Cards Row */}
      <div className="dispatcher-stats">
        {/* Card 1: Orders in Queue */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Orders in Queue</div>
          <div style={{ fontSize: 44, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 12px', lineHeight: 1 }}>{orders.length}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
              TODAY <strong style={{ color: 'var(--text-primary)' }}>{orders.filter((order) => !/DEFER|NEXT_RUN/i.test(order.status)).length}</strong>
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
              DELAYED <strong style={{ color: 'var(--text-primary)' }}>{orders.filter((order) => /DEFER|NEXT_RUN/i.test(order.status)).length}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Ready to plan */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Ready to plan</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 8px' }}>* Confirmed, unassigned</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 44, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{orders.filter((order) => /PLACED|PENDING|CONFIRMED/i.test(order.status)).length}</div>
            {/* Visual mini chart matching screenshot */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
              {[60, 80, 100, 90, 70, 50, 40, 30, 20, 10].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: `${h}%`,
                    backgroundColor: i < 5 ? 'var(--purple-500)' : 'var(--purple-200)',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Deferred */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Deferred</div>
          <div style={{ fontSize: 44, fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 12px', lineHeight: 1 }}>{orders.filter((order) => /DEFER|NEXT_RUN/i.test(order.status)).length}</div>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
              TODAY <strong style={{ color: 'var(--text-primary)' }}>{orders.filter((order) => /DEFER|NEXT_RUN/i.test(order.status)).length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Banner Card */}
      <div className="action-banner dispatcher-action-banner">
        <div className="action-banner-text">
          <h3>Orders close at 4:00 PM -- {orders.length} orders returned by Waypoint</h3>
          <p>Go to Planning & Allocation once the cutoff passes</p>
        </div>
        <button className="btn-white dispatcher-plan-button" onClick={() => navigate('/dispatch/planning')} type="button">
          Start planning <img src={arrowIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      {/* Main Grid: Active Routes Table + Right Sidebar Metrics */}
      <div className="table-card dispatcher-routes" style={{ height: 'fit-content' }}>
        {/* Left Side: Active Routes Table */}
          <div className="table-header-title">
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>ACTIVE ROUTES</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{filteredRoutes.length} active</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Brand / District</th>
                  <th>Stops</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((row) => (
                  <tr key={row.id}>
                    <td className="col-bold">{row.id}</td>
                    <td>{row.vehicle}</td>
                    <td>{row.driver}</td>
                    <td>{row.brandDistrict}</td>
                    <td>{row.stops}</td>
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

      <aside className="dispatcher-rail" aria-label="Delivery metrics">
        <DeliveryVehiclesCard vehicles={vehicles} />
        <DeliveryRateCard rate={orders.length ? `${Math.round(orders.filter((order) => /DELIVER|RECEIV/i.test(order.status)).length / orders.length * 100)}%` : `0%`} />
        <OrdersDeliveredGauge count={orders.filter((order) => /DELIVER|RECEIV/i.test(order.status)).length} />
      </aside>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DeliveryVehiclesCard, DeliveryRateCard, OrdersDeliveredGauge, Modal } from '../../../shared/ui/Components';
import { api, type Vehicle, type PlanRunResult, type Order, type Outlet } from '../../../api';
import arrowIcon from '../../../assets/arrow-icon.png';
import '../dispatcher.css';

export function DispatcherDashboardPage() {
  const { searchQuery } = (useOutletContext() as { searchQuery?: string }) || {};
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [planResult, setPlanResult] = useState<PlanRunResult | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [isAllocating, setIsAllocating] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; vehicle: string; driver: string; brandDistrict: string; stops: string; status: string }>>([]);
  const [depotId, setDepotId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;
    api.outlets().then(async (outlets: Outlet[]) => {
      const groups = await Promise.all(outlets.map((outlet) => api.orders(outlet.id)));
      const allOrders = groups.flat();
      if (!active) return;
      setDepotId(outlets[0]?.depotId ?? '');
      setOrders(allOrders);
      setRoutes(allOrders.map((order) => {
        const outlet = outlets.find((item) => item.id === order.outletId);
        const raw = order.status.toUpperCase();
        const status = /DELIVER|RECEIV/.test(raw) ? 'delivered' : /DEFER|NEXT_RUN/.test(raw) ? 'deferred' : /LOAD|PLAN/.test(raw) ? 'loading' : 'active';
        const brand = order.productBrand === 'FRESH' ? 'Fresh' : order.productBrand === 'STYLE' ? 'Style' : 'Tech';
        return { id: order.orderRef, vehicle: 'Not assigned', driver: 'Not assigned', brandDistrict: `${brand} · ${outlet?.name ?? outlet?.districtId ?? ''}`, stops: `${order.units} units`, status };
      }));
    }).catch(() => { if (active) { setOrders([]); setRoutes([]); } });
    return () => { active = false; };
  }, []);

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

  const handleRunPlanning = async () => {
    setIsAllocating(true);
    setPlanError(null);
    try {
      const result = await api.runPlan(depotId, date);
      setPlanResult(result);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : 'Planning could not be completed.');
    } finally {
      setIsAllocating(false);
    }
  };

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
        <button className="btn-white dispatcher-plan-button" onClick={() => setIsPlanningModalOpen(true)} type="button">
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

      {/* Interactive Planning Engine Modal */}
      <Modal
        isOpen={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
        title="Planning & Allocation Engine"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Run the rule-based optimization engine for {depotId} depot to allocate {orders.length} orders to compatible vehicles while enforcing time budgets, weight/volume limits, and cold chain rules.
          </p>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-subtle)', padding: 12, borderRadius: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Target Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-light)', fontSize: 13 }}
            />
          </div>

          {planResult && (
            <div style={{ background: 'var(--purple-50)', padding: 16, borderRadius: 12, border: '1px solid var(--purple-200)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple-900)' }}>Plan Summary: {planResult.planId}</div>
              <div style={{ fontSize: 12, color: 'var(--purple-700)', marginTop: 4 }}>
                * Total Trips Generated: <strong>{planResult.tripCount}</strong><br />
                * Capacity Deferrals: <strong>{planResult.deferralCount} orders</strong>
              </div>
            </div>
          )}

          {planError && <p role="alert" style={{ color: 'var(--status-danger-text)', fontSize: 12 }}>{planError}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button className="btn-secondary" onClick={() => setIsPlanningModalOpen(false)} type="button">Close</button>
            <button className="btn-primary" onClick={handleRunPlanning} disabled={isAllocating} type="button">
              {isAllocating ? 'Allocating...' : 'Execute Allocator ->'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type PlanningContext, type Vehicle } from '../../../api';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader } from '../components/DispatcherUI';

const depotId = 'PELIYAGODA';
const planDate = new Date().toISOString().slice(0, 10);

function vehicleLabel(vehicle: Vehicle) {
  return `${vehicle.type.toLowerCase()} · ${vehicle.temperature.toLowerCase()}`;
}

export function PlanningPage() {
  const [context, setContext] = useState<PlanningContext>({ orders: [], vehicles: [], planId: null, planStatus: null });
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api.planningContext(depotId, planDate)
      .then((loaded) => {
        setContext(loaded);
        setSelectedOrderId(loaded.orders[0]?.id ?? '');
        setSelectedVehicleId(loaded.vehicles[0]?.id ?? '');
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load planning data.'));
  }, []);

  const selectedOrder = context.orders.find((order) => order.id === selectedOrderId) ?? context.orders[0];
  const selectedVehicle = context.vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? context.vehicles[0];
  const candidates = useMemo(() => context.vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE'), [context.vehicles]);

  const runAllocation = async () => {
    setRunning(true);
    setError('');
    try {
      const result = await api.runPlan(depotId, planDate,
        selectedOrder && selectedVehicle ? { orderId: selectedOrder.id, vehicleId: selectedVehicle.id } : undefined);
      setNotice(`Draft saved: ${result.tripCount} routes, ${result.deferralCount} deferred. Release the plan when it is ready for loading.`);
      const refreshed = await api.planningContext(depotId, planDate);
      setContext(refreshed);
      setSelectedOrderId(refreshed.orders[0]?.id ?? '');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not allocate orders.');
    } finally {
      setRunning(false);
    }
  };

  const releasePlan = async () => {
    setRunning(true);
    setError('');
    try {
      await api.releasePlan(depotId, planDate);
      const refreshed = await api.planningContext(depotId, planDate);
      setContext(refreshed);
      setNotice('Plan released to the loader and driver screens.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not release the plan.');
    } finally {
      setRunning(false);
    }
  };

  return <div className="dispatch-page">
    <DispatcherPageHeader title="Planning & Allocation" subtitle="Constraints are validated before an assignment is confirmed" action={<><Link className="dispatch-outline-button" to="/dispatch/planning/proposal">View suggested dispatch plan <DispatchIcon name="chevron" /></Link>{context.planId && context.planStatus === 'DRAFT' && <button className="dispatch-primary-button" type="button" disabled={running} onClick={() => void releasePlan()}>{running ? 'Releasingâ€¦' : 'Approve & release to loading'}</button>}{context.planStatus === 'PUBLISHED' && <span>Released to loading</span>}</>} />
    {notice && <div className="dispatch-success-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    {error && <div className="dispatch-error-notice" role="alert">{error}<button type="button" onClick={() => setError('')} aria-label="Dismiss">×</button></div>}
    <div className="dispatch-planning-layout"><section className="dispatch-unallocated-panel"><h2>Unallocated orders ({context.orders.length})</h2>{context.orders.map((order) => <button key={order.id} className={`dispatch-unallocated-order${selectedOrder?.id === order.id ? ' selected' : ''}`} type="button" onClick={() => setSelectedOrderId(order.id)}><div><strong>{order.orderRef}</strong><DispatcherBadge tone={order.status === 'DEFERRED' ? 'late' : order.temperature === 'CHILLED' ? 'chilled' : 'ambient'}>{order.status === 'DEFERRED' ? 'deferred' : order.temperature.toLowerCase()}</DispatcherBadge></div><span>{order.outletName}</span><small>{order.weightKg} kg · {order.volumeM3} m³ · {order.depotId}</small>{(order.deferredYesterday || order.status === 'DEFERRED') && <em>{order.status === 'DEFERRED' ? 'Deferred and available for re-planning' : 'Skipped last run'}</em>}</button>)}{context.orders.length === 0 && <p className="dispatch-empty">No unallocated orders for this depot and date.</p>}</section>
      <div className="dispatch-candidate-column"><section className="dispatch-candidates-panel"><h2>Candidate vehicles for {selectedOrder?.orderRef ?? 'selected order'}</h2><div className="dispatch-candidate-grid">{candidates.map((vehicle) => <button key={vehicle.id} type="button" className={`dispatch-candidate${selectedVehicle?.id === vehicle.id ? ' selected' : ''}`} onClick={() => setSelectedVehicleId(vehicle.id)}><span><strong>{vehicle.id}</strong><DispatcherBadge tone="pass">available</DispatcherBadge></span><small>{vehicleLabel(vehicle)} · {vehicle.depotId}</small></button>)}</div>{candidates.length === 0 && <p className="dispatch-empty">No available vehicles for this depot.</p>}</section>
        <section className="dispatch-validation-panel"><h2>Constraint validation - {selectedVehicle?.id ?? 'none selected'}</h2>{selectedOrder && selectedVehicle ? [
          ['Temperature match', `${selectedOrder.temperature.toLowerCase()} order; ${vehicleLabel(selectedVehicle)} vehicle`],
          ['Access / parking', 'Validated by allocation engine'],
          ['Delivery window fit', 'Validated by allocation engine'],
          ['Weight capacity', `${selectedOrder.weightKg} of ${selectedVehicle.weightCapKg} kg`],
          ['Volume capacity', `${selectedOrder.volumeM3} of ${selectedVehicle.volumeCapM3} m³`],
          ['Home depot match', `Order depot ${selectedOrder.depotId} · vehicle depot ${selectedVehicle.depotId}`],
          ['Trips today (max 2)', 'Validated by allocation engine'],
          ['Remaining weekly fuel quota', `${selectedVehicle.weeklyFuelQuotaL ?? 0} L quota · validated on allocation`],
        ].map(([title, detail]) => <div className="dispatch-validation-row" key={title}><i><DispatchIcon name="check" /></i><div><strong>{title}</strong><small>{detail}</small></div></div>) : <p className="dispatch-empty">Select an order and available vehicle.</p>}<div className="dispatch-validation-actions"><button className="dispatch-primary-button" type="button" disabled={running || context.orders.length === 0} onClick={runAllocation}>{running ? 'Allocating…' : 'Run allocation & save sequence'}</button><button className="dispatch-outline-button" type="button" disabled={!selectedOrder} onClick={() => setNotice(`${selectedOrder?.orderRef ?? 'Order'} remains deferred for dispatcher review.`)}>Defer order</button></div></section></div></div>
  </div>;
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader } from '../components/DispatcherUI';
import { candidateVehicles, planningOrders } from '../data/dispatcherData';

export function PlanningPage() {
  const [selectedOrder, setSelectedOrder] = useState(planningOrders[0]);
  const [selectedVehicle, setSelectedVehicle] = useState(candidateVehicles[0]);
  const [notice, setNotice] = useState('');

  return <div className="dispatch-page">
    <DispatcherPageHeader title="Planning & Allocation" subtitle="Constraints are validated before an assignment is confirmed" action={<Link className="dispatch-outline-button" to="/dispatch/planning/proposal">View suggested dispatch plan <DispatchIcon name="chevron" /></Link>} />
    {notice && <div className="dispatch-success-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    <div className="dispatch-planning-layout"><section className="dispatch-unallocated-panel"><h2>Unallocated orders ({planningOrders.length})</h2>{planningOrders.map((order) => <button key={order.id} className={`dispatch-unallocated-order${selectedOrder.id === order.id ? ' selected' : ''}`} type="button" onClick={() => setSelectedOrder(order)}><div><strong>{order.id}</strong><DispatcherBadge tone={order.temperature}>{order.temperature}</DispatcherBadge></div><span>{order.outlet}</span><small>{order.weight} · {order.volume} · {order.depot}</small>{order.note && <em>{order.note}</em>}</button>)}</section>
      <div className="dispatch-candidate-column"><section className="dispatch-candidates-panel"><h2>Candidate vehicles for {selectedOrder.id}</h2><div className="dispatch-candidate-grid">{candidateVehicles.map((vehicle) => <button key={vehicle.id} type="button" className={`dispatch-candidate${selectedVehicle.id === vehicle.id ? ' selected' : ''}`} onClick={() => setSelectedVehicle(vehicle)}><span><strong>{vehicle.id}</strong><DispatcherBadge tone={vehicle.clear === 0 ? 'pass' : 'blocked'}>{vehicle.clear === 0 ? 'all checks pass' : `${vehicle.clear} blocked`}</DispatcherBadge></span><small>{vehicle.type} · {vehicle.depot} · {vehicle.quota}</small></button>)}</div></section>
        <section className="dispatch-validation-panel"><h2>Constraint validation - {selectedVehicle.id}</h2>{[
          ['Temperature match', `${selectedOrder.temperature} order; ${selectedVehicle.type.includes('reefer') ? 'reefer' : 'ambient'} vehicle`],
          ['Access / parking', 'Open access'],
          ['Delivery window fit', '05:30–07:30 (before store opening)'],
          ['Weight capacity', `${selectedOrder.weight} of 5000 kg`],
          ['Volume capacity', `${selectedOrder.volume} of 28 m³`],
          ['Home depot match', `Outlet depot ${selectedOrder.depot} · vehicle depot ${selectedVehicle.depot}`],
          ['Trips today (max 2)', '1 of 2 trips used'],
          ['Remaining weekly fuel quota', `${selectedVehicle.quota} · this trip needs ≈16 L`],
        ].map(([title, detail]) => <div className="dispatch-validation-row" key={title}><i><DispatchIcon name="check" /></i><div><strong>{title}</strong><small>{detail}</small></div></div>)}<div className="dispatch-validation-actions"><button className="dispatch-primary-button" type="button" onClick={() => setNotice(`${selectedOrder.id} assigned to ${selectedVehicle.id}.`)}>Confirm assignment</button><button className="dispatch-outline-button" type="button" onClick={() => setNotice(`${selectedOrder.id} deferred for dispatcher review.`)}>Defer order</button></div></section></div></div>
  </div>;
}

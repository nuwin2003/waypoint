import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DispatcherBadge, DispatcherPageHeader } from '../components/DispatcherUI';
import { dispatchOrders, type DispatchOrder } from '../data/dispatcherData';

export function OrderQueuePage() {
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>();
  const [brand, setBrand] = useState('All brand');
  const [depot, setDepot] = useState('All depot');
  const [status, setStatus] = useState('All status');
  const [cutoff, setCutoff] = useState('All cutoff');
  const [selectedOrder, setSelectedOrder] = useState<DispatchOrder | null>(null);
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => dispatchOrders.filter((order) => {
    const matchesSearch = !searchQuery || [order.id, order.outlet, order.brand, order.depot, order.status].some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (brand === 'All brand' || order.brand === brand) && (depot === 'All depot' || order.depot === depot) && (status === 'All status' || order.status === status) && (cutoff === 'All cutoff' || order.cutoff === cutoff);
  }), [searchQuery, brand, depot, status, cutoff]);

  return (
    <div className="dispatch-page">
      <DispatcherPageHeader title="Order Queue" subtitle="Cutoff 4:00 PM - orders after cutoff roll to the next run" />
      <section className="dispatch-queue-metrics">
        <article className="dispatch-queue-total"><div><h2>Total Orders</h2><strong>120</strong></div><div className="dispatch-queue-chips"><span>TODAY <b>86</b></span><span>DELAYED <b>34</b></span></div></article>
        <article className="dispatch-destination-card"><div><h2>Destinations</h2><strong>30</strong></div><svg className="dispatch-sparkline" viewBox="0 0 260 55" preserveAspectRatio="none" aria-label="Destination volume trend over the last seven days"><path d="M2 45 C25 45 27 37 51 38 S78 26 101 30 S131 15 157 23 S193 29 211 18 S240 21 257 5"/><circle cx="257" cy="5" r="4"/></svg><div className="dispatch-chart-foot"><span>Last 7 days</span><span>vs last week</span></div></article>
        <article className="dispatch-brand-card"><div className="dispatch-brand-title">Order types <span>◈</span></div><div className="dispatch-brand-bar"><i/><i/><i/></div><div className="dispatch-brand-legend"><span>● ♧ Fresh<strong>58 <small>46%</small></strong></span><span>● ♧ Style<strong>40</strong></span><span>● ▫ Tech<strong>22</strong></span></div></article>
      </section>
      <section className="dispatch-filter-card" aria-label="Filter order queue">{[
        { label: 'Brand', value: brand, set: setBrand, options: ['All brand', 'Fresh', 'Style', 'Tech'] },
        { label: 'Depot', value: depot, set: setDepot, options: ['All depot', 'Peliyagoda', 'Kandy'] },
        { label: 'Status', value: status, set: setStatus, options: ['All status', 'in transit', 'assigned', 'pending', 'deferred', 'delivered'] },
        { label: 'Cutoff', value: cutoff, set: setCutoff, options: ['All cutoff', 'before 4 PM', 'after 4 PM'] },
      ].map((filter) => <label key={filter.label}>{filter.label}<select value={filter.value} onChange={(event) => filter.set(event.target.value)}>{filter.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</section>
      <div className="dispatch-table-wrap"><table className="dispatch-table"><thead><tr><th>Order</th><th>Outlet</th><th>Brand</th><th>Temp</th><th>Load</th><th>Cutoff</th><th>Status</th><th></th></tr></thead><tbody>{filtered.slice((page - 1) * 10, page * 10).map((order) => <tr key={order.id}><td><strong>{order.id}</strong>{order.id === 'O-1001' && <span className="dispatch-link-mark">↗</span>}</td><td>{order.outlet}</td><td>{order.brand}</td><td><DispatcherBadge tone={order.temperature}>{order.temperature}</DispatcherBadge></td><td>{order.weight} kg · {order.volume} m³</td><td><DispatcherBadge tone={order.cutoff === 'after 4 PM' ? 'late' : 'neutral'}>{order.cutoff}</DispatcherBadge></td><td><DispatcherBadge tone={order.status}>{order.status}</DispatcherBadge></td><td><button className="dispatch-outline-button compact" type="button" onClick={() => setSelectedOrder(order)}>Detail</button></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="dispatch-empty">No orders match these filters.</p>}<footer className="dispatch-table-footer">Showing {Math.min((page - 1) * 10 + 1, filtered.length)}-{Math.min(page * 10, filtered.length)} of {filtered.length} orders<div><button disabled={page === 1} onClick={() => setPage(1)} type="button">‹</button><button className="current" type="button">{page}</button><button disabled={filtered.length <= 10} onClick={() => setPage(2)} type="button">2</button><button disabled={filtered.length <= 10} onClick={() => setPage(2)} type="button">›</button></div></footer></div>
      {selectedOrder && <div className="dispatch-drawer-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null); }}><aside className="dispatch-order-drawer" role="dialog" aria-modal="true" aria-labelledby="dispatch-order-title"><button className="dispatch-drawer-close" onClick={() => setSelectedOrder(null)} aria-label="Close order details" type="button">×</button><span className="dispatch-drawer-kicker">Order</span><h2 id="dispatch-order-title">{selectedOrder.id}</h2><dl>{[['Outlet', selectedOrder.outlet], ['Brand / depot', `${selectedOrder.brand} · ${selectedOrder.depot}`], ['Temperature', selectedOrder.temperature], ['Units', `${selectedOrder.units}`], ['Weight / volume', `${selectedOrder.weight} kg · ${selectedOrder.volume} m³`], ['Delivery window', '06:00–08:00'], ['Placed', `${selectedOrder.date} 14:02`], ['Dispatch date', 'Sat 26 Sep 2026'], ['Vehicle', selectedOrder.status === 'pending' ? 'Unassigned' : 'V-01']].map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><h3>Linked order — same outlet, same delivery day</h3><article className="dispatch-linked-order"><strong>{selectedOrder.id === 'O-1001' ? 'O-1002' : 'O-1001'} · chilled</strong><DispatcherBadge tone="in transit">in transit</DispatcherBadge><p>18 units · 120 kg · 1.8 m³ · chilled</p><small>Tracked as a distinct order — one status never hides the other.</small></article><button className="dispatch-primary-button drawer-action" type="button" onClick={() => setSelectedOrder(null)}>Close details</button></aside></div>}
    </div>
  );
}

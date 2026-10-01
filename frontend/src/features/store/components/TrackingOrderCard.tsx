import { useState } from 'react';
import type { StoreOrder } from '../data/storeData';
import { StoreIcon } from './StoreUI';
import redWarningIcon from '../../../assets/red-warning.png';
import yellowWarningIcon from '../../../assets/yellow-warning.png';

export function TrackingOrderCard({ order }: { order: StoreOrder }) {
  const [expanded, setExpanded] = useState(false);
  const isAtRisk = Boolean(order.risk);
  return (
    <article className={`store-tracking-order${isAtRisk && order.status === 'deferred' ? ' at-risk' : ''}`}>
      <div className="store-tracking-order-body">
      <div className="store-tracking-order-top"><div className="store-order-id-group"><strong>#{order.id}</strong><span className={`store-brand-tag ${order.brand === 'Fresh chilled' ? 'chilled' : 'dry'}`}>{order.brand === 'Fresh chilled' ? 'CHILLED' : 'DRY'}</span></div><span className={`store-shipment-status ${order.status.replace(/ /g, '-')}`}>{order.status === 'departed' ? 'Departed' : order.status === 'arriving soon' ? 'Arriving soon' : order.status[0].toUpperCase() + order.status.slice(1)}</span></div>
        <div className="store-eta-row"><strong>ETA {order.eta}</strong><span>window closes {order.windowCloses}</span></div>
        {order.risk ? <p className={`store-risk-line${order.status === 'deferred' ? ' warning' : ''}`}>{order.status === 'deferred' ? <img src={yellowWarningIcon} alt="" aria-hidden="true" /> : <StoreIcon name="check" />}{order.status === 'deferred' ? `At risk · ${order.risk}` : `On time · ${order.risk}`}</p> : <p className="store-on-time"><StoreIcon name="check" />On time</p>}
        <p className="store-order-items"><StoreIcon name="box" /><strong>{order.units} cases</strong><span>·</span>{order.itemSummary}</p>
        <div className="store-tracking-order-bottom"><span className="store-vehicle-chip"><StoreIcon name="truck" />{order.vehicle} · {order.driver}</span>{order.status === 'deferred' && <span className="store-vehicle-warning"><img src={redWarningIcon} alt="" aria-hidden="true" />Vehicle maintenance delay</span>}<button type="button" className="store-timeline-toggle" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? 'Hide timeline' : 'View timeline'}<span aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></span></button></div>
      </div>
      {expanded && <div className="store-tracking-details"><div className="store-order-timeline"><h3>Order timeline <span>Record</span></h3><ol>{order.timeline.map((event, index) => <li key={`${event.title}-${index}`} className={event.complete ? 'complete' : ''}><i>{event.complete ? <StoreIcon name="check" /> : <span />}</i><div><strong>{event.title}</strong><p>{event.time}</p>{event.detail && <small>{event.detail}</small>}</div></li>)}</ol></div><div className="store-order-breakdown"><h3>Item breakdown</h3>{order.breakdown.map((item) => <div className="store-breakdown-row" key={item.item}><span>{item.item}</span><strong>{item.units} cases</strong></div>)}<div className="store-breakdown-row total"><strong>Total</strong><strong>{order.units} cases</strong></div><p className="store-breakdown-vehicle"><StoreIcon name="truck" />{order.vehicle} · {order.driver}</p><p className="store-delivery-note">Delivery confirmation is available after your outlet receives the order.</p></div></div>}
    </article>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader } from '../components/DispatcherUI';

const stops = [
  { name: 'Fresh Peliyagoda 014', detail: 'Dry + chilled · two orders · Rear dock · 12 min service', eta: '05:38', window: '05:30–07:45', status: 'Within window' },
  { name: 'Fresh Kelaniya 021', detail: 'Chilled · Rear dock · 14 min service', eta: '06:17', window: '05:30–07:45', status: 'Within window' },
  { name: 'Fresh Wattala 037', detail: 'Frozen · 9 min arrival margin', eta: '06:51', window: '05:30–07:00', status: 'Tight' },
  { name: 'Fresh Ja-Ela 052', detail: 'Dry · Curbside · 10 min service', eta: '07:19', window: '06:00–07:50', status: 'Within window' },
  { name: 'Fresh Kandana 065', detail: 'Chilled · 12 min arrival margin', eta: '07:43', window: '06:00–07:55', status: 'Tight' },
];

export function RouteReviewPage() {
  const { routeId = 'RT-1042' } = useParams();
  const navigate = useNavigate();
  const [approved, setApproved] = useState(false);
  const [changed, setChanged] = useState(false);
  return <div className="dispatch-page dispatch-route-review"><header className="dispatch-review-header"><div><span>03 / ROUTE DECISION</span><h1>Review {routeId} · WP-R12</h1><p>Peliyagoda · Reefer truck · route 1 of 2 · departure 05:05</p></div><div><button className="dispatch-outline-button" type="button" onClick={() => setChanged((value) => !value)}>{changed ? 'WP-V04 selected' : 'Change vehicle'}</button><button className="dispatch-primary-button" type="button" onClick={() => setApproved(true)}>{approved ? 'Approved' : 'Approve route'}</button></div></header>
    {approved && <div className="dispatch-success-notice" role="status">Route {routeId} approved for dispatch.</div>}
    <div className="dispatch-route-review-grid"><section className="dispatch-stop-panel"><header><div><h2>Stop sequence</h2><p>Predicted arrival · Sri Lanka time</p></div><DispatcherBadge tone="late">Two tight margins</DispatcherBadge></header><ol>{stops.map((stop, index) => <li key={stop.name}><span className="dispatch-stop-number">{index + 1}</span><div className="dispatch-stop-copy"><strong>{stop.name}</strong><p>{stop.detail}</p></div><div className="dispatch-stop-time"><strong>{stop.eta}</strong><span>{stop.window}</span><DispatcherBadge tone={stop.status === 'Tight' ? 'late' : 'pass'}>{stop.status}</DispatcherBadge></div></li>)}</ol><div className="dispatch-delay-warning"><DispatchIcon name="alert"/><div><strong>Predicted delay risk</strong><p>Stop 3 is expected at 06:51. Its window ends at 07:00, leaving nine minutes of margin.</p></div></div></section>
      <aside className="dispatch-review-rail"><section className="dispatch-constraint-panel"><h2>Vehicle and rule checks</h2><p>Hard constraints must pass before approval</p>{[['Temperature', 'Reefer carries frozen, chilled and ambient'], ['Weight', '2,160 / 3,000 kg · 72% used'], ['Volume', '15.6 / 20 m³ · 78% used'], ['Access', 'All five outlets allow trucks'], ['Fuel quota', '76 km planned · 124 km remains'], ['Trip limit', 'First of at most two routes today']].map(([title, detail]) => <div className="dispatch-rule-row" key={title}><i><DispatchIcon name="check" /></i><div><strong>{title}</strong><small>{detail}</small></div></div>)}</section><section className="dispatch-why-panel"><h2>Why the model picked this vehicle</h2><p>It belongs to the correct depot, supports mixed temperatures, and fits the load, fuel, access, and trip rules. Predicted service and travel time put all five arrivals within their windows, with two narrow margins.</p><small>This sample proposal is not connected to a live model.</small><button className="dispatch-text-button" type="button" onClick={() => navigate('/dispatch/planning/proposal')}>Back to suggested plan <DispatchIcon name="chevron" /></button></section></aside></div>
  </div>;
}

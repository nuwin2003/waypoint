import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader, DispatcherStat } from '../components/DispatcherUI';

const proposedRoutes = [
  { id: 'RT-1042', vehicle: 'WP-R12', type: 'RT-1042 · Reefer truck', depot: 'Peliyagoda', trip: 'Route 1 of 2', departure: '05:05 · 5 stops', weight: 72, volume: 78, fuel: '124 km', arrival: 'Tight window' },
  { id: 'RT-1043', vehicle: 'WP-D23', type: 'RT-1043 · Dry-box truck', depot: 'Peliyagoda', trip: 'Route 1 of 1', departure: '08:10 · 4 stops', weight: 48, volume: 91, fuel: '86 km', arrival: 'Within windows' },
  { id: 'RT-1044', vehicle: 'WP-V04', type: 'RT-1044 · Refrigerated van', depot: 'Kandy', trip: 'Route 1 of 1', departure: '05:25 · 3 stops', weight: 62, volume: 69, fuel: '54 km', arrival: 'Within windows' },
  { id: 'RT-1045', vehicle: 'WP-D14', type: 'RT-1045 · Dry-box truck', depot: 'Peliyagoda', trip: 'Route 1 of 2', departure: '07:30 · 4 stops', weight: 59, volume: 83, fuel: '72 km', arrival: 'Mall window' },
  { id: 'RT-1046', vehicle: 'WP-V06', type: 'RT-1046 · Small van', depot: 'Kandy', trip: 'Route 1 of 1', departure: '06:10 · 3 stops', weight: 81, volume: 73, fuel: '39 km', arrival: 'Within windows' },
];

export function SuggestedDispatchPlanPage() {
  const navigate = useNavigate();
  const [depot, setDepot] = useState('All depots');
  const [search, setSearch] = useState('');
  const routes = proposedRoutes.filter((route) => (depot === 'All depots' || route.depot === depot) && (!search || `${route.vehicle} ${route.id} ${route.depot}`.toLowerCase().includes(search.toLowerCase())));
  return <div className="dispatch-page dispatch-suggested-page">
    <DispatcherPageHeader title="Suggested dispatch plan" subtitle="The model proposed vehicles and stop sequences after the cutoff. Inspect why each route fits before approval." action={<DispatcherBadge tone="neutral">Sample proposal</DispatcherBadge>} />
    <section className="dispatch-suggested-stats"><DispatcherStat label="Orders assigned" value="137 / 148" note="92.6% of confirmed orders" icon={<DispatchIcon name="box" />} /><DispatcherStat label="Vehicles · routes" value="47 · 52" note="No more than two per vehicle" icon={<DispatchIcon name="truck" />} /><DispatcherStat label="Window risk" value="4" note="Dispatcher review needed" icon={<DispatchIcon name="clock" />} /><DispatcherStat label="Deferred" value="11" note="3 reasons still needed" icon={<DispatchIcon name="alert" />} /></section>
    <section className="dispatch-proposal-table-card"><header><div><h2>Model assigned routes</h2><p>Illustrative predictions, subject to dispatcher approval</p></div><div className="dispatch-proposal-tools"><select value={depot} onChange={(event) => setDepot(event.target.value)} aria-label="Filter by depot"><option>All depots</option><option>Peliyagoda</option><option>Kandy</option></select><input type="search" placeholder="Route or vehicle" value={search} onChange={(event) => setSearch(event.target.value)} /></div></header><div className="dispatch-table-scroll"><table className="dispatch-proposal-table"><thead><tr><th>Assigned vehicle</th><th>Depot / trip</th><th>Departs · stops</th><th>Weight</th><th>Volume</th><th>Fuel left</th><th>Predicted arrival</th><th></th></tr></thead><tbody>{routes.map((route) => <tr key={route.id}><td><strong>{route.vehicle}</strong><small>{route.type}</small></td><td><strong>{route.depot}</strong><small>{route.trip}</small></td><td>{route.departure}</td><td><span className="dispatch-progress"><i style={{ width: `${route.weight}%` }} /></span><small>{route.weight}%</small></td><td><span className="dispatch-progress"><i style={{ width: `${route.volume}%` }} /></span><small>{route.volume}%</small></td><td>{route.fuel}</td><td><DispatcherBadge tone={route.arrival === 'Within windows' ? 'pass' : 'late'}>{route.arrival}</DispatcherBadge></td><td><button className="dispatch-text-button" onClick={() => navigate(`/dispatch/planning/routes/${route.id}`)} type="button">Inspect <DispatchIcon name="chevron" /></button></td></tr>)}</tbody></table></div></section>
  </div>;
}

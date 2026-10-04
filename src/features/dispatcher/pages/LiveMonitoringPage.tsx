import { useMemo, useState } from 'react';
import { useOutletContext } from '@/lib/router-compat';
import { DispatchIcon, DispatcherBadge, DispatcherPageHeader } from '../components/DispatcherUI';
import { liveTrips } from '../data/dispatcherData';
import lorry1 from '../../../assets/lorries/lorry1.png';
import lorry2 from '../../../assets/lorries/lorry2.png';
import lorry3 from '../../../assets/lorries/lorry3.png';

const lorryImages = { lorry1, lorry2, lorry3 };
type LiveFilter = 'All' | 'On route' | 'Waiting' | 'Inactive';

export function LiveMonitoringPage() {
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>();
  const [filter, setFilter] = useState<LiveFilter>('All');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState('Today');
  const query = `${searchQuery} ${search}`.trim().toLowerCase();
  const trips = useMemo(() => liveTrips.filter((trip) => (filter === 'All' || trip.status.toLowerCase() === filter.toLowerCase()) && (!query || `${trip.id} ${trip.route} ${trip.stops.join(' ')}`.toLowerCase().includes(query))), [filter, query]);
  const filters: LiveFilter[] = ['All', 'On route', 'Waiting', 'Inactive'];
  return <div className="dispatch-page dispatch-live-page"><DispatcherPageHeader title="Tracking" subtitle={`${liveTrips.length * 9 + 4} deliveries`} />
    <div className="dispatch-live-controls"><div className="dispatch-live-tabs" role="group" aria-label="Filter tracked vehicles">{filters.map((item) => <button key={item} className={filter === item ? 'active' : ''} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>{item} ({item === 'All' ? 8 : item === 'On route' ? 6 : item === 'Waiting' ? 2 : 0})</button>)}</div><div className="dispatch-live-search-row"><label className="dispatch-sr-only" htmlFor="live-search">Search tracked deliveries</label><input id="live-search" type="search" placeholder="Search for track ID, customer, delivery status, destination" value={search} onChange={(event) => setSearch(event.target.value)} /><button className={showFilters ? 'active' : ''} type="button" onClick={() => setShowFilters((value) => !value)}>Filters <span>☷</span></button><label className="dispatch-time-select"><span className="dispatch-sr-only">Time range</span><select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}><option>Today</option><option>Last 24 hours</option><option>This week</option></select></label></div>{showFilters && <div className="dispatch-extra-filters"><label>Depot<select><option>All depots</option><option>Peliyagoda</option><option>Kandy</option></select></label><label>Status<select value={filter} onChange={(event) => setFilter(event.target.value as LiveFilter)}>{filters.map((value) => <option key={value}>{value}</option>)}</select></label></div>}</div>
    <div className="dispatch-live-grid">{trips.map((trip) => <article className="dispatch-live-card" key={trip.id}><div className="dispatch-live-card-summary"><div className="dispatch-live-status"><i className={trip.status === 'on route' ? 'online' : 'waiting'} />{trip.status}</div><strong>{trip.id}</strong><dl><div><dt>Distance</dt><dd>{trip.distance}</dd></div><div><dt>Estimated time</dt><dd>{trip.eta}</dd></div></dl></div><div className="dispatch-live-route-panel"><header><strong>{trip.route}</strong><span>{trip.remaining}</span></header><ol>{trip.stops.map((stop, index) => <li key={stop}><i className={index === 0 ? 'visited' : ''} /><span>{index === 0 ? '18001' : index === 1 ? '18600' : '29001'}</span><strong>{stop.split(' ').slice(1).join(' ') || stop}</strong></li>)}</ol><img className="dispatch-lorry-image" src={lorryImages[trip.image]} alt={`${trip.id} delivery lorry`} /><button type="button" className="dispatch-live-detail" aria-label={`View ${trip.id} trip details`}><DispatchIcon name="chevron" /></button></div></article>)}{trips.length === 0 && <p className="dispatch-empty">No tracked deliveries match your search.</p>}</div>
  </div>;
}

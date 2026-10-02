import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { StorePageHeader, StoreStatCard } from '../components/StoreUI';
import { TrackingOrderCard } from '../components/TrackingOrderCard';
import { storeOrders } from '../data/storeData';

type TrackFilter = 'All' | 'Dry' | 'Chilled' | 'Deferred';

export function TrackOrdersPage() {
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>();
  const [filter, setFilter] = useState<TrackFilter>('All');
  const [localSearch, setLocalSearch] = useState('');
  const query = `${searchQuery} ${localSearch}`.trim().toLowerCase();
  const orders = useMemo(() => storeOrders.filter((order) => {
    const byFilter = filter === 'All' || (filter === 'Dry' && order.brand === 'Fresh dry') || (filter === 'Chilled' && order.brand === 'Fresh chilled') || (filter === 'Deferred' && order.status === 'deferred');
    const bySearch = !query || [order.id, order.brand, order.status, order.itemSummary, order.vehicle, order.driver].some((value) => value.toLowerCase().includes(query));
    return byFilter && bySearch;
  }), [filter, query]);
  const today = orders.filter((order) => order.status === 'confirmed' || order.status === 'deferred');
  const transit = orders.filter((order) => order.status === 'departed' || order.status === 'arriving soon');
  const upcoming = orders.filter((order) => order.status === 'loading');
  const filters: TrackFilter[] = ['All', 'Dry', 'Chilled', 'Deferred'];

  return (
    <div className="store-page store-track-page">
      <StorePageHeader title="Tracking orders" subtitle="5 active · 2 arriving today · Outlet COL-07 · Fresh Kottawa" />
      <div className="store-tracking-summary"><div className="store-tracking-stats"><StoreStatCard label="On-time rate" value="60%" note="↑ 3% vs yesterday" icon="clock" /><StoreStatCard label="Active orders" value="5" note="of 12 slots" icon="box" /></div><div className="store-filter-tools"><label className="store-visually-hidden" htmlFor="track-search">Search orders</label><input id="track-search" className="store-search-input" type="search" placeholder="Search order or item" value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} /><div className="store-filter-tabs" role="group" aria-label="Filter orders">{filters.map((value) => <button key={value} type="button" className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div></div></div>
      <section className="store-delivery-group"><div className="store-delivery-group-heading"><h2>Today's delivery</h2><span>{today.length ? 'Tue, Sep 28 · 2 orders' : 'No orders'}</span></div>{today.map((order) => <TrackingOrderCard key={order.id} order={order} />)}</section>
      <section className="store-delivery-group"><div className="store-delivery-group-heading"><h2>In transit</h2><span>{transit.length} orders · Live tracking</span></div>{transit.map((order) => <TrackingOrderCard key={order.id} order={order} />)}</section>
      <section className="store-delivery-group"><div className="store-delivery-group-heading"><h2>Upcoming</h2><span>{upcoming.length} order · Tomorrow</span></div>{upcoming.map((order) => <TrackingOrderCard key={order.id} order={order} />)}</section>
      {orders.length === 0 && <p className="store-empty-state">No orders match your search.</p>}
    </div>
  );
}

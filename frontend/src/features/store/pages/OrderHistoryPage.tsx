import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../../../api';
import { StorePageHeader, StoreStatusBadge } from '../components/StoreUI';
import { storeOrderFromApi } from '../orderMapping';

export function OrderHistoryPage() {
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>();
  const [recordSearch, setRecordSearch] = useState('');
  const [brand, setBrand] = useState('All brands');
  const [status, setStatus] = useState('All statuses');
  const [historyRecords, setHistoryRecords] = useState<Array<{ id: string; brand: string; date: string; units: number; status: string; receipt: string; invoice: string; feedback: string }>>([]);
  useEffect(() => {
    api.orders().then((orders) => setHistoryRecords(orders.map((order) => {
      const view = storeOrderFromApi(order);
      return { id: view.id, brand: view.brand, date: view.date, units: view.units, status: view.status, receipt: 'Not available', invoice: 'Not available', feedback: 'Not available' };
    }))).catch(() => setHistoryRecords([]));
  }, []);
  const query = `${searchQuery} ${recordSearch}`.trim().toLowerCase();
  const records = useMemo(() => historyRecords.filter((record) => {
    const matchesSearch = !query || [record.id, record.brand, record.date, record.invoice, record.receipt].some((text) => text.toLowerCase().includes(query));
    return matchesSearch && (brand === 'All brands' || record.brand === brand) && (status === 'All statuses' || record.status === status);
  }), [query, brand, status]);

  return (
    <div className="store-page store-history-page">
      <StorePageHeader title="History" subtitle="Past orders and delivery statuses from Waypoint" />
      <div className="store-history-filters">
        <label>Search records<input type="search" placeholder="Order, invoice, or date" value={recordSearch} onChange={(event) => setRecordSearch(event.target.value)} /></label>
        <label>Brand<select value={brand} onChange={(event) => setBrand(event.target.value)}>{['All brands', 'Fresh dry', 'Fresh chilled', 'Style', 'Tech'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{['All statuses', 'confirmed', 'deferred', 'departed', 'loading', 'delivered'].map((value) => <option key={value} value={value}>{value === 'All statuses' ? value : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
      </div>
      <div className="store-history-list">{records.map((record) => <article className="store-history-card" key={record.id}>
        <header><div><h2>{record.id} · {record.brand}</h2><p>{record.date} · {record.units} units</p></div><StoreStatusBadge status={record.status} /></header>
        <div className="store-history-details"><div><span>Delivery receipt</span><strong>{record.receipt}</strong></div><div><span>Invoice</span><strong>{record.invoice}</strong></div><div><span>Feedback</span><strong>{record.feedback !== 'Not submitted' && <span className="store-rating-star">★</span>}{record.feedback}</strong></div></div>
      </article>)}{records.length === 0 && <p className="store-empty-state">No history records match these filters.</p>}</div>
    </div>
  );
}

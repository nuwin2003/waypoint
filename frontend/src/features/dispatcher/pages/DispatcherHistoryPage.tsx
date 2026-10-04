import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api, type DispatcherHistory } from '../../../api';
import { DispatchIcon, DispatcherBadge, DispatcherStat } from '../components/DispatcherUI';

const PAGE_SIZE = 7;
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));

export function DispatcherHistoryPage() {
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [periodDays, setPeriodDays] = useState(30);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState<DispatcherHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState('');
  const combinedSearch = [searchQuery, search].filter(Boolean).join(' ').trim();

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    api.dispatcherHistory({
      periodDays,
      page,
      pageSize: PAGE_SIZE,
      type,
      status,
      search: combinedSearch,
    }).then((result) => {
      if (current) setHistory(result);
    }).catch((reason: unknown) => {
      if (current) setError(reason instanceof Error ? reason.message : 'Could not load dispatcher history.');
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [periodDays, page, type, status, combinedSearch]);

  const updateFilter = (update: () => void) => {
    setPage(1);
    update();
  };
  const stats = history?.stats;
  const pages = Math.max(1, Math.ceil((history?.total ?? 0) / PAGE_SIZE));
  const firstRow = history?.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastRow = Math.min(page * PAGE_SIZE, history?.total ?? 0);

  return <div className="dispatch-page dispatch-history-page">
    <section className="dispatch-history-stats">
      <DispatcherStat label="Events today" value={stats?.eventsToday.toLocaleString() ?? '—'} note="Recorded in this depot" icon={<DispatchIcon name="check" />} />
      <DispatcherStat label="Trips completed" value={stats?.tripsCompleted.toLocaleString() ?? '—'} note="Completed today" icon={<DispatchIcon name="pin" />} />
      <DispatcherStat label="Interventions" value={stats?.interventions.toLocaleString() ?? '—'} note="Loading issues today" icon={<DispatchIcon name="alert" />} />
      <DispatcherStat label="Incidents resolved" value={stats?.incidentsResolved.toLocaleString() ?? '—'} note="All resolved reports" icon={<DispatchIcon name="check" />} />
    </section>

    {detail && <div className="dispatch-success-notice" role="status">{detail}<button type="button" onClick={() => setDetail('')} aria-label="Dismiss">×</button></div>}
    {error && <div className="dispatch-error-notice" role="alert">{error}</div>}

    <div className="dispatch-history-controls">
      <label className="dispatch-history-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search event, driver, vehicle, route, or ID" value={search} onChange={(event) => updateFilter(() => setSearch(event.target.value))} /></label>
      <label className="dispatch-date-range"><select aria-label="History date range" value={periodDays} onChange={(event) => updateFilter(() => setPeriodDays(Number(event.target.value)))}>
        <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={3650}>All history</option>
      </select><span aria-hidden="true">▦</span></label>
      <select aria-label="Filter status" value={status} onChange={(event) => updateFilter(() => setStatus(event.target.value))}>
        <option value="ALL">All statuses</option><option value="DELIVERED">Delivered</option><option value="PARTIAL_DELIVERY">Partial delivery</option><option value="UNABLE_TO_DELIVER">Unable to deliver</option><option value="open">Open</option><option value="resolved">Resolved</option><option value="reported">Reported</option><option value="under-review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="reimbursed">Reimbursed</option><option value="Published">Published</option><option value="unresolved">Unresolved</option><option value="confirmed">Confirmed</option><option value="located">Located</option><option value="pending-investigation">Pending investigation</option>
      </select>
      <select aria-label="Filter event type" value={type} onChange={(event) => updateFilter(() => setType(event.target.value))}>
        <option value="ALL">All types</option><option value="Delivery">Delivery</option><option value="Incident">Incident</option><option value="Intervention">Intervention</option><option value="Trip">Trip</option>
      </select>
    </div>

    <section className="dispatch-history-table-card"><div className="dispatch-table-scroll"><table className="dispatch-history-table"><thead><tr><th>Time</th><th>Type</th><th>Event</th><th>Driver / vehicle</th><th>Outcome / owner</th><th></th></tr></thead><tbody>
      {history?.events.map((event) => <tr key={`${event.time}-${event.type}-${event.event}-${event.vehicle}`}>
        <td><strong>{formatTime(event.time)}</strong><small>{formatDate(event.time)}</small></td>
        <td><DispatcherBadge tone={event.type.toLowerCase()}>{event.type}</DispatcherBadge></td>
        <td><strong>{event.event}</strong><small>{event.detail}</small></td>
        <td><strong>{event.owner}</strong><small>{event.vehicle} · {event.route}</small></td>
        <td><strong className={event.type === 'Delivery' ? 'dispatch-good-text' : ''}>{event.outcome}</strong></td>
        <td><button className="dispatch-text-button" type="button" onClick={() => setDetail(`${formatTime(event.time)} · ${event.event} · ${event.detail}`)}>↗ Details</button></td>
      </tr>)}
    </tbody></table>
      {loading && <p className="dispatch-empty">Loading history…</p>}
      {!loading && !error && (history?.events.length ?? 0) === 0 && <p className="dispatch-empty">No history events match these filters.</p>}
    </div><footer className="dispatch-table-footer">Showing {firstRow}–{lastRow} of {history?.total.toLocaleString() ?? '0'} events<div>
      <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>‹</button>
      <button className="current" type="button" aria-current="page">{page}</button>
      <button type="button" aria-label="Next page" disabled={page >= pages || loading} onClick={() => setPage((value) => value + 1)}>›</button>
    </div></footer></section>
  </div>;
}

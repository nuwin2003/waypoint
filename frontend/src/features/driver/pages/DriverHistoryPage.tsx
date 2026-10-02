import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal, Route as RouteIcon, Clock, Navigation, Package, Truck,
  ChevronDown, Check, ClipboardList, UploadCloud,
} from 'lucide-react';
import { useNow } from '../useNow';
import {
  TRIPS, tripsForPeriod, daysAgoDate, formatDayMonth, formatShortDate,
  type HistoryPeriod, type Trip,
} from '../data/driverData';

const PERIODS: { key: HistoryPeriod; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

type JourneyFilter = 'all' | 'ontime' | 'delays';

function JourneysPanel({ trips, now }: { trips: Trip[]; now: Date }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<JourneyFilter>('all');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const counts = {
    all: trips.length,
    ontime: trips.filter((t) => t.onTime === 100).length,
    delays: trips.filter((t) => t.onTime < 100).length,
  };
  const options: { key: JourneyFilter; label: string }[] = [
    { key: 'all', label: 'All trips' },
    { key: 'ontime', label: 'Fully on time' },
    { key: 'delays', label: 'With delays' },
  ];
  const label = options.find((o) => o.key === filter)?.label ?? 'All trips';

  const rows = trips.filter((t) =>
    filter === 'ontime' ? t.onTime === 100 : filter === 'delays' ? t.onTime < 100 : true);

  return (
    <section className="dv-panel">
      <div className="dv-panel-head">
        <h2>Recent journeys</h2>
        <div className="dv-select-menu" ref={ref}>
          <button
            type="button"
            className={`dv-select-button${open ? ' open' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {label} <ChevronDown size={16} aria-hidden />
          </button>
          {open && (
            <ul className="dv-select-options" role="listbox">
              {options.map((o) => (
                <li key={o.key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={filter === o.key}
                    className={`dv-select-option${filter === o.key ? ' selected' : ''}`}
                    onClick={() => { setFilter(o.key); setOpen(false); }}
                  >
                    {o.label}
                    <span className="dv-count-badge">{counts[o.key]}</span>
                    {filter === o.key && <Check size={16} aria-hidden className="dv-select-check" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="dv-empty">{trips.length === 0 ? 'No trips in this period.' : 'No trips match this filter.'}</p>
      ) : (
        <div className="dv-journeys">
          {rows.map((t) => (
            <div className="dv-journey" key={t.id}>
              <span className="dv-journey-icon"><Truck size={20} aria-hidden /></span>
              <div className="dv-journey-body">
                <div className="dv-journey-id">{t.id}</div>
                <div className="dv-journey-meta">{formatShortDate(daysAgoDate(now, t.daysAgo))} · {t.duration}</div>
                <div className="dv-journey-meta dv-journey-strong">{t.stops} stops · {t.km} km</div>
              </div>
              <span className={t.onTime === 100 ? 'dv-status-green' : 'dv-status-amber'}>{t.onTime}% on time</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function DriverHistoryPage() {
  const now = useNow();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [period, setPeriod] = useState<HistoryPeriod>('30d');

  const trips = useMemo(() => tripsForPeriod(period), [period]);

  const metrics = useMemo(() => {
    const count = trips.length;
    const onTime = count ? Math.round(trips.reduce((s, t) => s + t.onTime, 0) / count) : null;
    const distance = trips.reduce((s, t) => s + t.km, 0);
    const packages = trips.reduce((s, t) => s + t.packages, 0);
    let range = 'No trips in this period';
    if (count === 1) range = formatDayMonth(daysAgoDate(now, trips[0].daysAgo));
    else if (count > 1) {
      const newest = trips.reduce((a, b) => (a.daysAgo < b.daysAgo ? a : b));
      const oldest = trips.reduce((a, b) => (a.daysAgo > b.daysAgo ? a : b));
      range = `${formatDayMonth(daysAgoDate(now, oldest.daysAgo))} – ${formatDayMonth(daysAgoDate(now, newest.daysAgo))}`;
    }
    return { count, onTime, distance, packages, range };
  }, [trips, now]);

  const isDefault = period === '30d';
  const eyebrow = isDefault
    ? 'YOUR WORK, ALL IN ONE PLACE'
    : (PERIODS.find((p) => p.key === period)?.label ?? '').toUpperCase();

  return (
    <>
      <div className="dv-page-head">
        <div>
          <h1 className="dv-title">Trip history</h1>
          <p className="dv-eyebrow dv-eyebrow-below">{eyebrow}</p>
        </div>
        <button
          type="button"
          className={`dv-filter-toggle${filtersOpen || !isDefault ? ' active' : ''}`}
          aria-expanded={filtersOpen}
          aria-controls="dv-history-filters"
          aria-label="Filter trip history"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal size={20} aria-hidden />
          {!isDefault && <span className="dv-filter-dot" />}
        </button>
      </div>

      {filtersOpen && (
        <div className="dv-filter-panel dv-history-filters" id="dv-history-filters">
          <div className="dv-chip-group" role="group" aria-label="Time period">
            <span className="dv-chip-label">Period</span>
            <div className="dv-chips">
              {PERIODS.map((p) => (
                <button key={p.key} type="button" className="dv-chip dv-chip-soft" aria-pressed={period === p.key} onClick={() => setPeriod(p.key)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {!isDefault && <button type="button" className="dv-filter-reset" onClick={() => setPeriod('30d')}>Reset</button>}
        </div>
      )}

      <div className="dv-metric-grid">
        <div className="dv-metric-card">
          <span className="dv-metric-label"><RouteIcon size={16} aria-hidden /> Recent trips</span>
          <span className="dv-metric-val">{metrics.count}</span>
          <span className="dv-metric-desc">{metrics.range}</span>
        </div>
        <div className="dv-metric-card">
          <span className="dv-metric-label"><Clock size={16} aria-hidden /> On-time rate</span>
          <span className="dv-metric-val">{metrics.onTime === null ? '—' : metrics.onTime}<small>%</small></span>
          <span className="dv-metric-desc">Average across trips</span>
        </div>
        <div className="dv-metric-card">
          <span className="dv-metric-label"><Navigation size={16} aria-hidden /> Distance</span>
          <span className="dv-metric-val">{metrics.distance}<small>km</small></span>
          <span className="dv-metric-desc">Completed trips</span>
        </div>
        <div className="dv-metric-card">
          <span className="dv-metric-label"><Package size={16} aria-hidden /> Packages</span>
          <span className="dv-metric-val">{metrics.packages}</span>
          <span className="dv-metric-desc">Handed over</span>
        </div>
      </div>

      <JourneysPanel trips={trips} now={now} />

      <section className="dv-panel dv-reports">
        <div className="dv-panel-head">
          <h2>Reports &amp; records</h2>
          <ClipboardList size={18} aria-hidden className="dv-muted-icon" />
        </div>
        <div className="dv-reports-empty">
          <ClipboardList size={32} aria-hidden />
          <strong>No reports yet</strong>
          <span>Your fine and fuel records will appear here.</span>
        </div>
      </section>

      <section className="dv-panel dv-sync-card">
        <UploadCloud size={20} aria-hidden className="dv-sync-icon" />
        <div>
          <strong>Your records are up to date</strong>
          <p>Demo records stay on this device.</p>
        </div>
      </section>

      <p className="dv-footnote">Showing {TRIPS.length} trips in total.</p>
    </>
  );
}

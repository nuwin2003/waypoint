import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SlidersHorizontal, Route as RouteIcon, Clock, Navigation, Package, Truck,
  ChevronDown, Check, ClipboardList, UploadCloud,
} from 'lucide-react';
import { useDriverData } from '../DriverDataContext';

type HistoryPeriod = '7d' | '30d' | 'all';
const PERIODS: { key: HistoryPeriod; label: string; days: number }[] = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'all', label: 'All time', days: 365 },
];

type JourneyFilter = 'all' | 'ontime' | 'delays';

function JourneysPanel({ trips }: { trips: Array<{
  routeId: string; routeLabel: string; planDate: string; status: string; stops: number;
  packages: number; distanceKm: number; onTimePercent: number;
}> }) {
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
    ontime: trips.filter((t) => t.onTimePercent === 100).length,
    delays: trips.filter((t) => t.onTimePercent < 100).length,
  };
  const options: { key: JourneyFilter; label: string }[] = [
    { key: 'all', label: 'All trips' },
    { key: 'ontime', label: 'Fully on time' },
    { key: 'delays', label: 'With delays' },
  ];
  const label = options.find((o) => o.key === filter)?.label ?? 'All trips';

  const rows = trips.filter((t) =>
    filter === 'ontime' ? t.onTimePercent === 100 : filter === 'delays' ? t.onTimePercent < 100 : true);

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
            <div className="dv-journey" key={t.routeId}>
              <span className="dv-journey-icon"><Truck size={20} aria-hidden /></span>
              <div className="dv-journey-body">
                <div className="dv-journey-id">{t.routeLabel}</div>
                <div className="dv-journey-meta">{new Date(t.planDate).toLocaleDateString()} · {t.status}</div>
                <div className="dv-journey-meta dv-journey-strong">{t.stops} stops · {t.distanceKm} km</div>
              </div>
              <span className={t.onTimePercent === 100 ? 'dv-status-green' : 'dv-status-amber'}>{t.onTimePercent}% on time</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function DriverHistoryPage() {
  const { history, historyLoading, historyError, loadHistory } = useDriverData();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [period, setPeriod] = useState<HistoryPeriod>('30d');

  const periodConfig = PERIODS.find((item) => item.key === period) ?? PERIODS[1];
  useEffect(() => { void loadHistory(periodConfig.days); }, [periodConfig.days]);

  const metrics = useMemo(() => {
    return {
      count: history?.tripCount ?? 0,
      onTime: history?.tripCount ? history.onTimePercent : null,
      distance: history?.distanceKm ?? 0,
      packages: history?.packages ?? 0,
      range: history?.tripCount ? periodConfig.label : 'No trips in this period',
    };
  }, [history, periodConfig]);

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

      {historyLoading && <p className="dv-panel-help">Loading trip history…</p>}
      {historyError && <p className="dv-photo-error" role="alert">{historyError}</p>}
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

      <JourneysPanel trips={history?.trips ?? []} />

      <section className="dv-panel dv-reports">
        <div className="dv-panel-head">
          <h2>Reports &amp; records</h2>
          <ClipboardList size={18} aria-hidden className="dv-muted-icon" />
        </div>
        {history && history.fineReports.length === 0 && history.fuelLogs.length === 0 ? (
          <div className="dv-reports-empty">
            <ClipboardList size={32} aria-hidden />
            <strong>No reports yet</strong>
            <span>Your fine and fuel records will appear here.</span>
          </div>
        ) : (
          <div className="dv-journeys">
            {history?.fineReports.map((report) => (
              <div className="dv-journey" key={report.id}>
                <span className="dv-journey-icon"><ClipboardList size={20} aria-hidden /></span>
                <div className="dv-journey-body">
                  <div className="dv-journey-id">Parking fine · {report.currency} {report.amount}</div>
                  <div className="dv-journey-meta">{new Date(report.issuedAt).toLocaleDateString()} · {report.status}</div>
                  <div className="dv-journey-meta">{report.reason}</div>
                </div>
              </div>
            ))}
            {history?.fuelLogs.map((log) => (
              <div className="dv-journey" key={log.id}>
                <span className="dv-journey-icon"><Truck size={20} aria-hidden /></span>
                <div className="dv-journey-body">
                  <div className="dv-journey-id">Fuel · {log.litres} L</div>
                  <div className="dv-journey-meta">{log.fuelDate} · {log.station}</div>
                  <div className="dv-journey-meta">{log.currency} {log.cost ?? '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dv-panel dv-sync-card">
        <UploadCloud size={20} aria-hidden className="dv-sync-icon" />
        <div>
          <strong>Your records are up to date</strong>
          <p>Records are synced with Waypoint.</p>
        </div>
      </section>

      <p className="dv-footnote">Showing {history?.tripCount ?? 0} trips in this period.</p>
    </>
  );
}

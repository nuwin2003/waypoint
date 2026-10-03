import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, SlidersHorizontal, MapPin, ArrowRight } from 'lucide-react';
import { useModal } from '../DriverModals';
import { DvMap, type MapStop } from '../components/DvMap';
import { useDriverData } from '../DriverDataContext';

type SortKey = 'route' | 'window' | 'packages';
const SORT_LABELS: Record<SortKey, string> = {
  route: 'Route order',
  window: 'Earliest window',
  packages: 'Most packages',
};

function windowStartMinutes(window: string): number {
  // "6:30–8:00 AM" -> minutes from midnight of the start time.
  const [startRaw, endRaw] = window.split('–');
  const period = (/(AM|PM)/.exec(startRaw)?.[1]) ?? (/(AM|PM)/.exec(endRaw)?.[1]) ?? 'AM';
  const match = /(\d+):(\d+)/.exec(startRaw);
  if (!match) return 0;
  let h = Number(match[1]);
  const m = Number(match[2]);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export function RoutePage() {
  const setModal = useModal();
  const { route, routeLoading, routeError, refreshRoute } = useDriverData();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('route');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => Array.from(new Set(route?.stops.map((s) => s.category) ?? [])), [route]);
  const isDefault = sort === 'route' && category === null;

  const visible = useMemo(() => {
    let rows = (route?.stops ?? []).filter((s) => (category ? s.category === category : true));
    if (sort === 'window') {
      rows = [...rows].sort((a, b) => windowStartMinutes(a.window) - windowStartMinutes(b.window) || a.sequence - b.sequence);
    } else if (sort === 'packages') {
      rows = [...rows].sort((a, b) => b.packages - a.packages || a.sequence - b.sequence);
    }
    return rows;
  }, [route, sort, category]);

  const reset = () => { setSort('route'); setCategory(null); };
  const mapStops: MapStop[] = (route?.stops ?? []).flatMap((stop) => (
    stop.latitude === null || stop.longitude === null
      ? []
      : [{ lat: stop.latitude, lng: stop.longitude, position: stop.sequence, name: stop.outletName }]
  ));

  return (
    <>
      {routeLoading && <p className="dv-panel-help">Loading your route…</p>}
      {routeError && <div className="dv-panel" role="alert"><p>{routeError}</p><button className="dv-secondary-button" type="button" onClick={() => void refreshRoute()}>Try again</button></div>}
      {!route && !routeLoading ? <p className="dv-empty">No route is assigned to your vehicle today.</p> : route && <>
      <div className="dv-page-head">
        <div>
          <h1 className="dv-title">Your route</h1>
          <p className="dv-subhead">One stop at a time. You're on track.</p>
        </div>
        <button className="dv-alert-tile" type="button" onClick={() => setModal('incident')} aria-label="Open emergency incident report">
          <BellRing size={22} aria-hidden />
        </button>
      </div>

      <section className="dv-panel">
        <div className="dv-panel-head">
          <h2>Route at a glance</h2>
          <Link to="/drive/route/map" className="dv-text-button">View route <ArrowRight size={16} aria-hidden /></Link>
        </div>
        <DvMap activeIndex={0} stops={mapStops} className="dv-map-glance" />
        <div className="dv-map-foot">
          <span className="dv-map-foot-left"><MapPin size={14} aria-hidden /> {route.depotName} depot</span>
          <span className="dv-map-foot-right">{route.totalStops} stops · {route.plannedDistanceKm.toFixed(1)} km · {route.plannedMinutes} min</span>
        </div>
      </section>

      <section className="dv-panel">
        <div className="dv-panel-head">
          <h2>Stop sequence</h2>
          <button
            type="button"
            className={`dv-filter-toggle${optionsOpen || !isDefault ? ' active' : ''}`}
            aria-expanded={optionsOpen}
            aria-controls="dv-sequence-options"
            aria-label="Sort and filter stops"
            onClick={() => setOptionsOpen((v) => !v)}
          >
            <SlidersHorizontal size={20} aria-hidden />
            {!isDefault && <span className="dv-filter-dot" />}
          </button>
        </div>

        {optionsOpen && (
          <div className="dv-filter-panel" id="dv-sequence-options">
            <div className="dv-chip-group">
              <span className="dv-chip-label">Sort</span>
              <div className="dv-chips">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="dv-chip"
                    aria-pressed={sort === key}
                    onClick={() => setSort(key)}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
            <div className="dv-chip-group">
              <span className="dv-chip-label">Show</span>
              <div className="dv-chips">
                <button type="button" className="dv-chip" aria-pressed={category === null} onClick={() => setCategory(null)}>All stops</button>
                {categories.map((c) => (
                  <button key={c} type="button" className="dv-chip" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
            {!isDefault && <button type="button" className="dv-filter-reset" onClick={reset}>Reset</button>}
          </div>
        )}

        {!isDefault && (
          <p className="dv-filter-summary">
            Showing {visible.length} of {route.totalStops} stops
            {sort !== 'route' ? ` · ${SORT_LABELS[sort].toLowerCase()}` : ''}
          </p>
        )}

        <div className="dv-sequence">
          {visible.map((stop) => (
            <div className="dv-sequence-row" key={stop.stopId}>
              <span className={`dv-seq-badge${stop.sequence === route.stops.find((item) => !['DELIVERED', 'PARTIAL_DELIVERY', 'UNABLE_TO_DELIVER', 'SKIPPED'].includes(item.status))?.sequence ? ' current' : ''}`}>{stop.sequence}</span>
              <div className="dv-seq-body">
                <div className="dv-stop-name dv-seq-name">{stop.outletName}</div>
                <div className="dv-seq-line">
                  {stop.packages} packages · {stop.category} · {stop.window} · {stop.distanceKm.toFixed(1)} km, {stop.driveMinutes} min drive
                </div>
                <div className="dv-seq-line">{stop.access}</div>
              </div>
            </div>
          ))}
        </div>
      </section></>}
    </>
  );
}

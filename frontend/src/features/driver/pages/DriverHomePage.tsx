import { Link } from 'react-router-dom';
import {
  Layers, Clock, Fuel, BellRing, ChevronRight, Package, Navigation, ArrowRight,
} from 'lucide-react';
import { useNow } from '../useNow';
import { useModal } from '../DriverModals';
import {
  ROUTE_ID, DEPOT, DESTINATION, DRIVER_NAME, STOPS, CURRENT_STOP_INDEX,
  TOTAL_PACKAGES, PLANNED_DISTANCE_KM, FIRST_DELIVERY,
  greeting, formatLongDate, formatClock, addMinutes,
} from '../data/driverData';

export function DriverHomePage() {
  const now = useNow();
  const setModal = useModal();
  const stop = STOPS[CURRENT_STOP_INDEX];
  const eta = formatClock(addMinutes(now, stop.driveMin));

  return (
    <>
      <p className="dv-eyebrow">{formatLongDate(now).toUpperCase()}</p>
      <h1 className="dv-title">{greeting(now)}, {DRIVER_NAME}<span className="dv-accent">.</span></h1>
      <p className="dv-subhead">Let's make every stop count.</p>

      <section className="dv-route-card">
        <div className="dv-route-card-head">
          <span className="dv-route-eyebrow"><Layers size={16} aria-hidden /> TODAY'S ROUTE</span>
          <Link to="/drive/route/map" className="dv-outline-pill">Ready to go</Link>
        </div>

        <div className="dv-route-id">
          {ROUTE_ID}<span className="dv-route-leg"> {DEPOT} → {DESTINATION}</span>
        </div>

        <div className="dv-route-stats">
          <div className="dv-route-stat">
            <span className="dv-route-stat-val">{STOPS.length.toString().padStart(2, '0')}</span>
            <span className="dv-route-stat-cap">delivery stops</span>
          </div>
          <div className="dv-route-stat">
            <span className="dv-route-stat-val">{TOTAL_PACKAGES}</span>
            <span className="dv-route-stat-cap">packages</span>
          </div>
          <div className="dv-route-stat">
            <span className="dv-route-stat-val">{PLANNED_DISTANCE_KM.toFixed(1)}<small>km</small></span>
            <span className="dv-route-stat-cap">planned distance</span>
          </div>
        </div>

        <div className="dv-route-foot">
          <Clock size={14} aria-hidden /> First delivery {FIRST_DELIVERY}
        </div>
      </section>

      <div className="dv-quick-actions">
        <button className="dv-quick-action" type="button" onClick={() => setModal('fine')}>
          <span className="dv-quick-action-label"><Fuel size={18} aria-hidden /> Log refuel</span>
          <ChevronRight size={16} aria-hidden className="dv-chevron" />
        </button>
        <button className="dv-quick-action" type="button" onClick={() => setModal('incident')}>
          <span className="dv-quick-action-label"><BellRing size={18} aria-hidden /> Report a fine</span>
          <ChevronRight size={16} aria-hidden className="dv-chevron" />
        </button>
      </div>

      <section className="dv-panel dv-next-stop">
        <div className="dv-panel-head">
          <h2>Your next stop</h2>
          <span className="dv-step-pill">{stop.position} / {STOPS.length}</span>
        </div>

        <div className="dv-next-stop-main">
          <div>
            <div className="dv-stop-name">{stop.name}</div>
            <div className="dv-stop-address">{stop.address}</div>
          </div>
          <div className="dv-eta">
            <span className="dv-eta-time">{eta.replace(/ (AM|PM)$/, '')}</span>
            <span className="dv-eta-cap">{eta.endsWith('PM') ? 'PM' : 'AM'} · ETA</span>
          </div>
        </div>

        <div className="dv-meta-row">
          <span className="dv-meta"><Package size={14} aria-hidden /> {stop.packages} packages</span>
          <span className="dv-meta"><Navigation size={14} aria-hidden /> {stop.distanceKm.toFixed(1)} km away</span>
          <span className="dv-tag">{stop.category}</span>
        </div>

        <Link to="/drive/route/map" className="dv-primary-button">
          Start journey <ArrowRight size={18} aria-hidden />
        </Link>
      </section>
    </>
  );
}

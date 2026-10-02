import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CornerUpRight, BellRing, Volume2, VolumeX, LocateFixed,
  Navigation as NavIcon, X, CheckCheck,
} from 'lucide-react';
import { useNow } from '../useNow';
import { useModal } from '../DriverModals';
import { DvMap } from '../components/DvMap';
import {
  STOPS, CURRENT_STOP_INDEX, formatClock, addMinutes,
} from '../data/driverData';

export function NavigationPage() {
  const now = useNow();
  const setModal = useModal();
  const [navigating, setNavigating] = useState(false);
  const [muted, setMuted] = useState(false);

  const stop = STOPS[CURRENT_STOP_INDEX];
  const eta = formatClock(addMinutes(now, stop.driveMin));

  return (
    <div className="dv-nav">
      {!navigating && (
        <div className="dv-nav-topbar">
          <Link to="/drive/route" className="dv-nav-back" aria-label="Back to route overview">
            <ArrowLeft size={20} aria-hidden />
          </Link>
          <span className="dv-nav-title">Navigation</span>
          <span className="dv-nav-step">Stop {stop.position} of {STOPS.length}</span>
        </div>
      )}

      <div className={`dv-nav-turn${navigating ? ' navigating' : ''}`} aria-live="polite">
        <span className="dv-nav-turn-icon"><CornerUpRight size={navigating ? 28 : 22} aria-hidden /></span>
        <div className="dv-nav-turn-text">
          <strong>60 m</strong>
          <span>Turn right toward Gnanarathana Mawatha</span>
          {navigating && <span className="dv-nav-turn-then">Then turn left onto Gnanarathana Mawatha</span>}
        </div>
      </div>

      <div className="dv-nav-map">
        <DvMap activeIndex={CURRENT_STOP_INDEX} className="dv-map-full" showDriver />
        <span className="dv-nav-gps">{navigating ? 'Waiting for GPS…' : 'Locating…'}</span>
        {navigating && (
          <>
            <button className="dv-nav-recenter" type="button">
              <LocateFixed size={18} aria-hidden /> Recenter
            </button>
            <button
              className="dv-nav-mute"
              type="button"
              aria-pressed={muted}
              aria-label={muted ? 'Unmute voice guidance' : 'Mute voice guidance'}
              onClick={() => setMuted((v) => !v)}
            >
              {muted ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />}
            </button>
          </>
        )}
        <button className="dv-nav-emergency" type="button" onClick={() => setModal('incident')}>
          <BellRing size={20} aria-hidden /> Emergency
        </button>
      </div>

      <div className="dv-nav-card">
        {!navigating && (
          <div className="dv-nav-card-label">
            <span className="dv-step-pill">STOP {stop.position} · {stop.category.toUpperCase()}</span>
            <span className="dv-nav-away">{stop.distanceKm.toFixed(1)} km away</span>
          </div>
        )}

        <div className="dv-nav-card-main">
          <div>
            <div className="dv-stop-name">{stop.name}</div>
            <div className="dv-stop-address">{stop.address}</div>
          </div>
          <div className="dv-eta">
            <span className="dv-eta-time">{eta.replace(/ (AM|PM)$/, '')}</span>
            <span className="dv-eta-cap">{eta.endsWith('PM') ? 'PM' : 'AM'} · ETA</span>
          </div>
        </div>

        {navigating ? (
          <div className="dv-nav-trip-stats">
            <div className="dv-nav-stat"><span>{stop.distanceKm.toFixed(1)} km</span><small>to go</small></div>
            <div className="dv-nav-stat"><span>{stop.driveMin} min</span><small>drive</small></div>
            <div className="dv-nav-stat dv-nav-stat-wide"><span>{stop.window}</span><small>window</small></div>
          </div>
        ) : (
          <div className="dv-nav-window">
            <NavIcon size={16} aria-hidden /> Delivery window {stop.window}
          </div>
        )}

        {navigating ? (
          <>
            <Link to="/drive/delivery" className="dv-primary-button dv-nav-confirm">
              <CheckCheck size={18} aria-hidden /> Confirm delivery
            </Link>
            <button className="dv-nav-cta secondary" type="button" onClick={() => setNavigating(false)}>
              <X size={18} aria-hidden /> End navigation
            </button>
          </>
        ) : (
          <button className="dv-nav-cta" type="button" onClick={() => setNavigating(true)}>
            <NavIcon size={18} aria-hidden /> Start navigation
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowUp, ArrowUpLeft, ArrowUpRight, BellRing, Volume2, VolumeX, LocateFixed,
  Navigation as NavIcon, X, CheckCheck, CornerUpLeft, CornerUpRight,
  Undo2, Redo2, RotateCcw, RotateCw, Merge, Ship, MapPin,
} from 'lucide-react';
import { useNow } from '../useNow';
import { useModal } from '../DriverModals';
import { DvMap } from '../components/DvMap';
import { useGeolocation } from '../useGeolocation';
import { loadDrivingRoute, type DrivingRouteResult, type RouteStep } from '../drivingRoute';
import {
  STOPS, CURRENT_STOP_INDEX, DEPOT_POINT, formatClock, addMinutes,
  distanceMeters, formatDistance,
} from '../data/driverData';

const ARRIVED_M = 60;

function ManeuverIcon({ maneuver, size }: { maneuver: string; size: number }) {
  const name = maneuver.toUpperCase();
  let icon: ReactNode = <ArrowUp size={size} aria-hidden />;
  if (name.includes('FERRY')) icon = <Ship size={size} aria-hidden />;
  else if (name.includes('DESTINATION') || name.includes('ARRIVE')) icon = <MapPin size={size} aria-hidden />;
  else if (name.includes('MERGE')) icon = <Merge size={size} aria-hidden />;
  else if (name.includes('ROUNDABOUT') && name.includes('LEFT')) icon = <RotateCcw size={size} aria-hidden />;
  else if (name.includes('ROUNDABOUT')) icon = <RotateCw size={size} aria-hidden />;
  else if (name.includes('UTURN') && name.includes('LEFT')) icon = <Undo2 size={size} aria-hidden />;
  else if (name.includes('UTURN')) icon = <Redo2 size={size} aria-hidden />;
  else if ((name.includes('SLIGHT') || name.includes('FORK') || name.includes('RAMP')) && name.includes('LEFT')) icon = <ArrowUpLeft size={size} aria-hidden />;
  else if (name.includes('SLIGHT') || name.includes('FORK') || name.includes('RAMP')) icon = <ArrowUpRight size={size} aria-hidden />;
  else if (name.includes('LEFT')) icon = <CornerUpLeft size={size} aria-hidden />;
  else if (name.includes('RIGHT')) icon = <CornerUpRight size={size} aria-hidden />;
  return icon;
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  window.speechSynthesis.speak(utterance);
}

export function NavigationPage() {
  const now = useNow();
  const setModal = useModal();
  const { fix, status } = useGeolocation();
  const [navigating, setNavigating] = useState(false);
  const [following, setFollowing] = useState(true);
  const [muted, setMuted] = useState(false);
  const [route, setRoute] = useState<DrivingRouteResult | null>(null);
  const [routeWarning, setRouteWarning] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(true);

  const fixRef = useRef(fix);
  fixRef.current = fix;
  const hasFix = fix !== null;
  useEffect(() => {
    let cancelled = false;
    void loadDrivingRoute(fixRef.current ?? DEPOT_POINT, STOPS).then((result) => {
      if (cancelled) return;
      setRoute(result.route);
      setRouteWarning(result.warning);
      setRouteLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [hasFix]);

  const stop = STOPS[CURRENT_STOP_INDEX];
  const origin = fix ?? DEPOT_POINT;
  const steps = route?.steps ?? [];
  const currentStep: RouteStep | undefined = steps[0];
  const followingStep = steps[1];
  const toStop = distanceMeters(origin, stop);
  const meters = route?.distanceMeters ?? toStop;
  const driveMinutes = route
    ? Math.max(1, Math.round(route.durationSeconds / 60))
    : Math.max(1, Math.round(toStop / 500));
  const arrived = toStop <= ARRIVED_M;
  const eta = formatClock(addMinutes(now, driveMinutes));

  const gpsLabel = status === 'active' && fix
    ? `GPS ±${Math.round(fix.accuracy)} m`
    : status === 'denied'
      ? 'Location off · route from depot'
      : status === 'unavailable'
        ? 'No GPS · route from depot'
        : navigating
          ? 'Waiting for GPS…'
          : 'Locating…';

  const start = () => {
    setNavigating(true);
    setFollowing(true);
    if (!muted) speak(`Starting navigation to ${stop.name}`);
  };

  const end = () => {
    setNavigating(false);
    setFollowing(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

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
        <span className="dv-nav-turn-icon">
          {arrived
            ? <CheckCheck size={navigating ? 28 : 22} aria-hidden />
            : <ManeuverIcon maneuver={currentStep?.maneuver ?? 'STRAIGHT'} size={navigating ? 28 : 22} />}
        </span>
        <div className="dv-nav-turn-text">
          <strong>
            {arrived ? "You've arrived" : routeLoading ? 'Calculating route…' : formatDistance(currentStep?.distanceMeters ?? meters)}
          </strong>
          <span>
            {arrived
              ? stop.name
              : routeLoading
                ? stop.address
                : currentStep?.instruction ?? routeWarning ?? `Head toward ${stop.name}`}
          </span>
          {navigating && !arrived && followingStep && (
            <span className="dv-nav-turn-then">
              Then {followingStep.instruction.charAt(0).toLowerCase()}{followingStep.instruction.slice(1)}
            </span>
          )}
        </div>
      </div>

      <div className="dv-nav-map">
        <DvMap
          activeIndex={CURRENT_STOP_INDEX}
          className="dv-map-full"
          showDriver
          interactive
          driver={fix}
          camera={navigating && following && fix ? 'follow' : 'fit'}
          frameKey={`${navigating ? 'navigating' : 'preview'}-${route?.path.length ?? 0}`}
          routePath={route?.path}
          onUserPan={navigating ? () => setFollowing(false) : undefined}
        />
        <span className="dv-nav-gps">{gpsLabel}</span>
        {navigating && !following && (
          <button className="dv-nav-recenter" type="button" onClick={() => setFollowing(true)}>
            <LocateFixed size={18} aria-hidden /> Recenter
          </button>
        )}
        {navigating && (
          <button
            className="dv-nav-mute"
            type="button"
            aria-pressed={muted}
            aria-label={muted ? 'Unmute voice guidance' : 'Mute voice guidance'}
            onClick={() => {
              setMuted((value) => {
                if (!value && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                return !value;
              });
            }}
          >
            {muted ? <VolumeX size={20} aria-hidden /> : <Volume2 size={20} aria-hidden />}
          </button>
        )}
        <button className="dv-nav-emergency" type="button" onClick={() => setModal('incident')}>
          <BellRing size={20} aria-hidden /> Emergency
        </button>
      </div>

      <div className="dv-nav-card">
        {!navigating && (
          <div className="dv-nav-card-label">
            <span className="dv-step-pill">STOP {stop.position} · {stop.category.toUpperCase()}</span>
            <span className="dv-nav-away">{formatDistance(toStop)} away</span>
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
            <div className="dv-nav-stat"><span>{formatDistance(meters)}</span><small>to go</small></div>
            <div className="dv-nav-stat"><span>{driveMinutes} min</span><small>drive</small></div>
            <div className="dv-nav-stat dv-nav-stat-wide"><span>{stop.window}</span><small>window</small></div>
          </div>
        ) : (
          <div className="dv-nav-window">
            <NavIcon size={16} aria-hidden /> Delivery window {stop.window}
          </div>
        )}

        {arrived && (
          <Link to="/drive/delivery" className="dv-primary-button dv-nav-confirm">
            <CheckCheck size={18} aria-hidden /> Confirm delivery
          </Link>
        )}
        {navigating ? (
          <button className="dv-nav-cta secondary" type="button" onClick={end}>
            <X size={18} aria-hidden /> End navigation
          </button>
        ) : (
          <button className="dv-nav-cta" type="button" onClick={start}>
            <NavIcon size={18} aria-hidden /> Start navigation
          </button>
        )}
      </div>
    </div>
  );
}

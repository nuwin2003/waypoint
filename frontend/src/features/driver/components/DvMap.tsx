import { useEffect, useState } from 'react';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { DEPOT_POINT, STOPS } from '../data/driverData';

export interface MapPoint {
  lat: number;
  lng: number;
}

interface DvMapProps {
  activeIndex: number;
  /** Extra class for height/variant. */
  className?: string;
  status?: string;
  showDriver?: boolean;
  /** One-finger pan and zoom. The route overview keeps two-finger gestures so the page can scroll. */
  interactive?: boolean;
  /** Driver position. Falls back to the depot when GPS is off. */
  driver?: MapPoint | null;
  /** fit frames the driver and the current stop. follow locks zoom 17 on the driver. */
  camera?: 'fit' | 'follow';
  /** Changes when the screen should frame the route again, such as starting navigation. */
  frameKey?: string;
  /** Road path to draw and frame. Falls back to a straight line through the stops. */
  routePath?: MapPoint[] | null;
  onUserPan?: () => void;
}

function useDarkMap(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}

function drawRouteLine(map: google.maps.Map, path: MapPoint[], dark: boolean) {
  const casing = new google.maps.Polyline({
    map,
    path,
    strokeColor: dark ? '#141a16' : '#ffffff',
    strokeOpacity: 0.95,
    strokeWeight: 9,
    zIndex: 1,
  });
  const line = new google.maps.Polyline({
    map,
    path,
    strokeColor: dark ? '#9d7bff' : '#6734ed',
    strokeOpacity: 1,
    strokeWeight: 5,
    zIndex: 2,
  });
  return () => {
    casing.setMap(null);
    line.setMap(null);
  };
}

function DrivingRoute({ routePath, dark }: { routePath?: MapPoint[] | null; dark: boolean }) {
  const map = useMap();
  const routes = useMapsLibrary('routes');

  useEffect(() => {
    if (!map) return;
    if (routePath && routePath.length > 1) {
      return drawRouteLine(map, routePath, dark);
    }
    if (!routes) return;

    const path = [DEPOT_POINT, ...STOPS.map((stop) => ({ lat: stop.lat, lng: stop.lng }))];
    const clearFallback = drawRouteLine(map, path, dark);

    let cancelled = false;
    let renderer: google.maps.DirectionsRenderer | null = null;
    const last = STOPS[STOPS.length - 1];
    const service = new routes.DirectionsService();
    service.route(
      {
        origin: DEPOT_POINT,
        destination: { lat: last.lat, lng: last.lng },
        waypoints: STOPS.slice(0, -1).map((stop) => ({
          location: { lat: stop.lat, lng: stop.lng },
          stopover: true,
        })),
        travelMode: routes.TravelMode.DRIVING,
        region: 'LK',
      },
      (result, status) => {
        if (cancelled || status !== 'OK' || !result) return;
        renderer = new routes.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: dark ? '#9d7bff' : '#6734ed',
            strokeWeight: 5,
            strokeOpacity: 0.95,
          },
        });
        renderer.setDirections(result);
        clearFallback();
      },
    );

    return () => {
      cancelled = true;
      renderer?.setMap(null);
      clearFallback();
    };
  }, [map, routes, routePath, dark]);

  return null;
}

function DriverDot({ position }: { position: MapPoint }) {
  const core = useMapsLibrary('core');
  if (!core) return null;
  return (
    <Marker
      position={position}
      title="You are here"
      icon={{
        path: core.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#1a73e8',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }}
    />
  );
}

function Camera({
  camera,
  origin,
  target,
  frameKey,
  routePath,
  onUserPan,
}: {
  camera: 'fit' | 'follow';
  origin: MapPoint;
  target: MapPoint;
  frameKey: string;
  routePath?: MapPoint[] | null;
  onUserPan?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const apply = () => {
      if (camera === 'follow') {
        map.panTo(origin);
        map.setZoom(17);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      const points = routePath && routePath.length > 1 ? routePath : [origin, target];
      points.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { top: 160, right: 44, bottom: 80, left: 44 });
    };
    const frame = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(frame);
  }, [map, camera, frameKey, origin.lat, origin.lng, target.lat, target.lng, routePath]);

  useEffect(() => {
    if (!map || !onUserPan) return;
    let armed = false;
    const arm = window.setTimeout(() => {
      armed = true;
    }, 800);
    const listener = map.addListener('dragstart', () => {
      if (armed) onUserPan();
    });
    return () => {
      window.clearTimeout(arm);
      listener.remove();
    };
  }, [map, onUserPan]);

  return null;
}

function GoogleMap({
  activeIndex, showDriver, interactive, dark, driver, camera, frameKey, routePath, onUserPan,
}: {
  activeIndex: number;
  showDriver: boolean;
  interactive: boolean;
  dark: boolean;
  driver: MapPoint | null;
  camera: 'fit' | 'follow';
  frameKey: string;
  routePath?: MapPoint[] | null;
  onUserPan?: () => void;
}) {
  const origin = driver ?? DEPOT_POINT;
  const target = STOPS[activeIndex] ?? STOPS[0];

  return (
    <Map
      className="dv-map-canvas"
      defaultCenter={DEPOT_POINT}
      defaultZoom={12}
      gestureHandling={interactive ? 'greedy' : 'cooperative'}
      disableDefaultUI
      keyboardShortcuts={false}
      clickableIcons={false}
      colorScheme={dark ? 'DARK' : 'LIGHT'}
      reuseMaps
    >
      <DrivingRoute routePath={routePath} dark={dark} />
      <Camera
        camera={camera}
        origin={origin}
        target={{ lat: target.lat, lng: target.lng }}
        frameKey={frameKey}
        routePath={routePath}
        onUserPan={onUserPan}
      />
      {!driver && <Marker position={DEPOT_POINT} title="Peliyagoda depot" />}
      {STOPS.map((stop, index) => (
        <Marker
          key={stop.position}
          position={{ lat: stop.lat, lng: stop.lng }}
          title={stop.name}
          label={{
            text: String(stop.position),
            color: index === activeIndex ? '#ffffff' : '#6734ed',
            fontWeight: '700',
          }}
        />
      ))}
      {showDriver && <DriverDot position={origin} />}
    </Map>
  );
}

export function DvMap({
  activeIndex, className = '', status, showDriver = false, interactive = false,
  driver = null, camera = 'fit', frameKey = 'route', routePath = null, onUserPan,
}: DvMapProps) {
  const dark = useDarkMap();

  return (
    <div className={`dv-map ${className}`} role="img" aria-label="Route map">
      <GoogleMap
        activeIndex={activeIndex}
        showDriver={showDriver}
        interactive={interactive}
        dark={dark}
        driver={driver}
        camera={camera}
        frameKey={frameKey}
        routePath={routePath}
        onUserPan={onUserPan}
      />
      {status && <span className="dv-map-status">{status}</span>}
    </div>
  );
}

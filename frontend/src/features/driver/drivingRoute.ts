import { DEPOT_POINT, distanceMeters, type DriverStop } from './data/driverData';
import type { MapPoint } from './components/DvMap';

export interface RouteStep {
  instruction: string;
  maneuver: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface DrivingRouteResult {
  path: MapPoint[];
  steps: RouteStep[];
  distanceMeters: number;
  durationSeconds: number;
}

function decodePolyline(encoded: string): MapPoint[] {
  const points: MapPoint[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

function asSeconds(value: unknown): number {
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fallbackRoute(origin: MapPoint, stops: DriverStop[]): DrivingRouteResult {
  const path = [origin, ...stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))];
  const steps = stops.map((stop, index) => {
    const from = path[index];
    const to = { lat: stop.lat, lng: stop.lng };
    return {
      instruction: index === 0 ? `Head toward ${stop.name}` : `Continue to ${stop.name}`,
      maneuver: index === stops.length - 1 ? 'DESTINATION' : 'STRAIGHT',
      distanceMeters: distanceMeters(from, to),
      durationSeconds: stop.driveMin * 60,
    };
  });
  return {
    path,
    steps,
    distanceMeters: steps.reduce((sum, step) => sum + step.distanceMeters, 0),
    durationSeconds: steps.reduce((sum, step) => sum + step.durationSeconds, 0),
  };
}

interface RoutesApiStep {
  distanceMeters?: number;
  staticDuration?: string;
  navigationInstruction?: { maneuver?: string; instructions?: string };
  polyline?: { encodedPolyline?: string };
}

interface ApiRoute {
  distanceMeters?: number;
  duration?: string;
  polyline?: { encodedPolyline?: string };
  routeLabels?: string[];
  travelAdvisory?: { fuelConsumptionMicroliters?: string };
  legs?: Array<{ steps?: RoutesApiStep[] }>;
}

interface RoutesApiResponse {
  routes?: ApiRoute[];
  error?: { message?: string };
}

const ROUTE_FIELD_MASK = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.polyline.encodedPolyline',
  'routes.routeLabels',
  'routes.travelAdvisory.fuelConsumptionMicroliters',
  'routes.legs.steps.distanceMeters',
  'routes.legs.steps.staticDuration',
  'routes.legs.steps.navigationInstruction',
].join(',');

function stepsFrom(route: ApiRoute): RouteStep[] {
  return (route.legs ?? []).flatMap((leg) => (leg.steps ?? []).map((step) => ({
    instruction: step.navigationInstruction?.instructions?.split('\n')[0] || 'Continue',
    maneuver: step.navigationInstruction?.maneuver || 'STRAIGHT',
    distanceMeters: step.distanceMeters ?? 0,
    durationSeconds: asSeconds(step.staticDuration),
  }))).filter((step) => step.instruction.length > 0);
}

/** Prefer a route that is fast in traffic, short, and lower fuel when that figure exists. */
function pickBest(routes: ApiRoute[], straightMeters: number): ApiRoute | null {
  const ceiling = Math.max(straightMeters * 4, 20_000);
  const usable = routes.filter((route) => {
    const encoded = route.polyline?.encodedPolyline;
    const distance = route.distanceMeters ?? Infinity;
    return Boolean(encoded) && distance > 0 && distance <= ceiling;
  });
  if (usable.length === 0) return null;

  const durationOf = (route: ApiRoute) => Math.max(1, asSeconds(route.duration));
  const fuelOf = (route: ApiRoute) => {
    const value = Number(route.travelAdvisory?.fuelConsumptionMicroliters);
    return Number.isFinite(value) && value > 0 ? value : null;
  };
  const minDuration = Math.min(...usable.map(durationOf));
  const minDistance = Math.min(...usable.map((route) => route.distanceMeters ?? minDuration));
  const fuels = usable.map(fuelOf).filter((value): value is number => value !== null);
  const minFuel = fuels.length > 0 ? Math.min(...fuels) : null;

  let best = usable[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const route of usable) {
    const timeScore = durationOf(route) / minDuration;
    const distanceScore = (route.distanceMeters ?? minDistance) / minDistance;
    const fuel = fuelOf(route);
    const climateScore = minFuel && fuel ? fuel / minFuel : timeScore;
    const score = timeScore * 0.45 + distanceScore * 0.35 + climateScore * 0.2;
    if (score < bestScore) {
      best = route;
      bestScore = score;
    }
  }
  return best;
}

async function requestLegRoutes(
  from: MapPoint,
  to: MapPoint,
  key: string,
  shape: 'eco' | 'optimal' | 'aware',
): Promise<ApiRoute[]> {
  const routeModifiers: Record<string, unknown> = { avoidFerries: true };
  const body: Record<string, unknown> = {
    origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
    destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
    travelMode: 'DRIVE',
    routingPreference: shape === 'aware' ? 'TRAFFIC_AWARE' : 'TRAFFIC_AWARE_OPTIMAL',
    computeAlternativeRoutes: true,
    routeModifiers,
    languageCode: 'en',
    regionCode: 'LK',
    units: 'METRIC',
    departureTime: new Date(Date.now() + 60_000).toISOString(),
  };
  if (shape !== 'aware') body.trafficModel = 'BEST_GUESS';
  if (shape === 'eco') {
    routeModifiers.vehicleInfo = { emissionType: 'DIESEL' };
    body.requestedReferenceRoutes = ['FUEL_EFFICIENT'];
    body.extraComputations = ['FUEL_CONSUMPTION'];
  }

  const response = await fetch('/maps/route', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': ROUTE_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as RoutesApiResponse;
  if (!response.ok || !payload.routes?.length) return [];
  return payload.routes;
}

let skipEco = false;

async function bestLeg(from: MapPoint, to: MapPoint, key: string): Promise<ApiRoute | null> {
  const straight = distanceMeters(from, to);
  const shapes = (['eco', 'optimal', 'aware'] as const).filter((shape) => shape !== 'eco' || !skipEco);
  for (const shape of shapes) {
    try {
      const chosen = pickBest(await requestLegRoutes(from, to, key, shape), straight);
      if (shape === 'eco') skipEco = !chosen;
      if (chosen) return chosen;
    } catch {
      if (shape === 'eco') skipEco = true;
    }
  }
  return null;
}

export interface DrivingRouteLoad {
  route: DrivingRouteResult;
  warning: string | null;
}

/** Road route and every turn, from the depot through the remaining stops. */
export async function loadDrivingRoute(origin: MapPoint = DEPOT_POINT, stops: DriverStop[] = []): Promise<DrivingRouteLoad> {
  const fallback = fallbackRoute(origin, stops);
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
  const destination = stops[stops.length - 1];
  if (!destination || !key) {
    return { route: fallback, warning: key ? null : 'Map key is missing, so the line follows the stops directly.' };
  }

  try {
    const points: MapPoint[] = [origin, ...stops.map((stop) => ({ lat: stop.lat, lng: stop.lng }))];
    const legs = await Promise.all(points.slice(1).map((point, index) => {
      const from = points[index];
      return from ? bestLeg(from, point, key) : Promise.resolve(null);
    }));
    if (legs.some((leg) => !leg?.polyline?.encodedPolyline)) {
      return {
        route: fallback,
        warning: 'Driving directions are unavailable, so the map shows the stop-to-stop line.',
      };
    }

    const path: MapPoint[] = [];
    const steps: RouteStep[] = [];
    let distanceMetersTotal = 0;
    let durationSeconds = 0;
    for (const leg of legs) {
      if (!leg?.polyline?.encodedPolyline) continue;
      const decoded = decodePolyline(leg.polyline.encodedPolyline);
      if (path.length > 0) decoded.shift();
      path.push(...decoded);
      steps.push(...stepsFrom(leg));
      distanceMetersTotal += leg.distanceMeters ?? 0;
      durationSeconds += asSeconds(leg.duration);
    }

    const tooLong = distanceMetersTotal > Math.max(fallback.distanceMeters * 5, 80_000);
    if (path.length < 2 || tooLong) {
      return {
        route: fallback,
        warning: 'Driving directions are unavailable, so the map shows the stop-to-stop line.',
      };
    }

    return {
      route: {
        path,
        steps: steps.length > 0 ? steps : fallback.steps,
        distanceMeters: distanceMetersTotal,
        durationSeconds,
      },
      warning: null,
    };
  } catch {
    return {
      route: fallback,
      warning: 'Driving directions are unavailable, so the map shows the stop-to-stop line.',
    };
  }
}

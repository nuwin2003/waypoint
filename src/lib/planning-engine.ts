// Waypoint planning & allocation engine.
// Port of the Java engine, aligned with the Tech-Triathlon published planning standard
// (check_allocation.py): one brand + one district per trip, home depot only, reefer for
// chilled, vans for van_only outlets, weight AND volume caps, max two trips per vehicle,
// Fresh trips fit the 270-min pre-dawn window, other brands the 480-min daytime window,
// weekly fuel quota, and every stop must arrive before its outlet's delivery window closes.
// Pure functions — safe to run on server or client.

export type Brand = 'FRESH' | 'STYLE' | 'TECH';
export type DockType = 'REAR_DOCK' | 'STREET' | 'MALL';
export type TempClass = 'CHILLED' | 'AMBIENT';

export type PlanningOrder = {
  id: string;
  depotId: string;
  districtId: string;
  brand: Brand;
  temperature: TempClass;
  parkingConstraint: 'STANDARD' | 'VAN_ONLY';
  dockType: DockType;
  weightKg: number;
  volumeM3: number;
  /** Delivery window, minutes after midnight (Asia/Colombo). Mall outlets use the mall access window. */
  windowOpenMin?: number;
  windowCloseMin?: number;
  chilledPerishable: boolean;
  tightWindow: boolean;
  festivalRamp: boolean;
  lowValueOrDeferrable: boolean;
  deferredYesterday: boolean;
  daysSinceLastServed: number;
};

export type PlanningVehicle = {
  id: string;
  depotId: string;
  type: 'TRUCK' | 'VAN';
  temperature: 'REEFER' | 'AMBIENT';
  status: 'AVAILABLE' | 'IN_WORKSHOP';
  weightCapKg: number;
  volumeCapM3: number;
  weeklyFuelQuotaL: number;
  kmPerL: number;
};

export type TravelProfile = {
  depotToDistrictMinutes: number;
  depotToDistrictKm: number;
  interStopMinutes: number;
  interStopKm: number;
};

export type RuleFailure = { code: string; message: string };
export type Score = { value: number; breakdown: Record<string, number> };

export type TripDraft = {
  vehicleId: string;
  tripNo: number;
  brand: Brand;
  districtId: string;
  vehicle: PlanningVehicle;
  travel: TravelProfile;
  orders: PlanningOrder[];
};

export type ScheduledStop = { order: PlanningOrder; arrivalMin: number; serviceStartMin: number; departMin: number; late: boolean };

export type Deferral = {
  orderId: string;
  reasonCode: string;
  reason: string;
  unavoidable: boolean;
  priorityScore: number;
  scoreBreakdown: Record<string, number>;
};

/** Pre-dawn window 03:30–08:00 for Fresh, daytime window from 08:00 for Style/Tech. */
export const FRESH_START_MIN = 3 * 60 + 30;
export const DAYTIME_START_MIN = 8 * 60;
export const FRESH_BUDGET_MIN = 270;
export const DAYTIME_BUDGET_MIN = 480;
export const MAX_TRIPS = 2;

/** Published service_allowance.csv (minutes). The DB table overrides these at run time. */
export const DEFAULT_ALLOWANCES: Record<string, number> = {
  'FRESH:REAR_DOCK': 15, 'FRESH:STREET': 16, 'FRESH:MALL': 18,
  'STYLE:REAR_DOCK': 38, 'STYLE:STREET': 46, 'STYLE:MALL': 59,
  'TECH:REAR_DOCK': 43, 'TECH:STREET': 55, 'TECH:MALL': 55,
};

export function allowanceMinutes(brand: Brand, dock: DockType, table = DEFAULT_ALLOWANCES): number {
  return table[`${brand}:${dock}`] ?? DEFAULT_ALLOWANCES[`${brand}:${dock}`] ?? 0;
}

export function scoreOrder(order: PlanningOrder): Score {
  const breakdown: Record<string, number> = {
    deferredYesterday: order.deferredYesterday ? 40 : 0,
    daysSinceLastServed: 5 * Math.min(order.daysSinceLastServed, 6),
    chilledPerishable: order.chilledPerishable && order.brand === 'FRESH' ? 20 : 0,
    tightWindow: order.tightWindow ? 15 : 0,
    festivalRamp: order.festivalRamp && order.brand === 'FRESH' ? 10 : 0,
    lowValueOrDeferrable: order.lowValueOrDeferrable ? -10 : 0,
  };
  return { value: Object.values(breakdown).reduce((a, b) => a + b, 0), breakdown };
}

/** Planned trip duration using the published standard (outbound + inter-stop + service; no return leg). */
export function tripMinutes(travel: TravelProfile, orders: PlanningOrder[], table = DEFAULT_ALLOWANCES): number {
  if (orders.length === 0) return 0;
  const service = orders.reduce((s, o) => s + allowanceMinutes(o.brand, o.dockType, table), 0);
  return travel.depotToDistrictMinutes + travel.interStopMinutes * (orders.length - 1) + service;
}

export function tripKm(travel: TravelProfile, orders: PlanningOrder[]): number {
  if (orders.length === 0) return 0;
  return travel.depotToDistrictKm * 2 + travel.interStopKm * (orders.length - 1);
}

export function tripFuel(travel: TravelProfile, orders: PlanningOrder[], vehicle: PlanningVehicle): number {
  return tripKm(travel, orders) / vehicle.kmPerL;
}

const isFresh = (b: Brand) => b === 'FRESH';
const sum = (orders: PlanningOrder[], key: 'weightKg' | 'volumeM3') => orders.reduce((s, o) => s + o[key], 0);

/** Sequence stops (earliest-closing window first) and simulate arrival times. Early arrivals wait for the window. */
export function scheduleStops(travel: TravelProfile, orders: PlanningOrder[], startMin: number, table = DEFAULT_ALLOWANCES, preserveOrder = false): ScheduledStop[] {
  const seq = preserveOrder ? [...orders] : [...orders].sort((a, b) =>
    (a.windowCloseMin ?? 1440) - (b.windowCloseMin ?? 1440) || (a.windowOpenMin ?? 0) - (b.windowOpenMin ?? 0) || a.id.localeCompare(b.id));
  let t = startMin;
  return seq.map((order, i) => {
    t += i === 0 ? travel.depotToDistrictMinutes : travel.interStopMinutes;
    const arrivalMin = t;
    const serviceStartMin = Math.max(arrivalMin, order.windowOpenMin ?? 0);
    const late = order.windowCloseMin != null && serviceStartMin > order.windowCloseMin;
    t = serviceStartMin + allowanceMinutes(order.brand, order.dockType, table);
    return { order, arrivalMin, serviceStartMin, departMin: t, late };
  });
}

/** Start minute of every trip of one vehicle; same-family trips run back to back (incl. return leg). */
export function tripStarts(trips: TripDraft[], table = DEFAULT_ALLOWANCES, preserveOrder = false): Map<TripDraft, number> {
  const starts = new Map<TripDraft, number>();
  let fresh = FRESH_START_MIN;
  let day = DAYTIME_START_MIN;
  for (const trip of [...trips].sort((a, b) => a.tripNo - b.tripNo)) {
    const start = isFresh(trip.brand) ? fresh : day;
    starts.set(trip, start);
    const stops = scheduleStops(trip.travel, trip.orders, start, table, preserveOrder);
    const end = (stops.at(-1)?.departMin ?? start) + trip.travel.depotToDistrictMinutes;
    if (isFresh(trip.brand)) fresh = end; else day = end;
  }
  return starts;
}

function familyMinutes(trips: TripDraft[], brand: Brand, table: Record<string, number>) {
  return trips.filter((t) => isFresh(t.brand) === isFresh(brand)).reduce((m, t) => m + tripMinutes(t.travel, t.orders, table), 0);
}

/**
 * Validate adding `order` to `trip` (an existing or new trip on `vehicle`).
 * `vehicleTrips` = the vehicle's current trips (without the candidate when it is new).
 */
export function validate(
  order: PlanningOrder,
  vehicle: PlanningVehicle,
  trip: TripDraft,
  vehicleTrips: TripDraft[],
  weeklyFuelUsed: number,
  table = DEFAULT_ALLOWANCES,
): RuleFailure[] {
  const f: RuleFailure[] = [];
  if (vehicle.status !== 'AVAILABLE') f.push({ code: 'VEHICLE_UNAVAILABLE', message: 'Vehicle is in the workshop' });
  if (vehicle.depotId !== order.depotId) f.push({ code: 'HOME_DEPOT', message: 'Vehicle belongs to another depot' });
  if (order.parkingConstraint === 'VAN_ONLY' && vehicle.type !== 'VAN') f.push({ code: 'VAN_ONLY_LIMIT', message: 'Outlet can only be reached by van' });
  if (order.temperature === 'CHILLED' && vehicle.temperature !== 'REEFER') f.push({ code: 'NO_REEFER_CAPACITY', message: 'Chilled order needs a refrigerated vehicle' });
  if (trip.brand !== order.brand) f.push({ code: 'BRAND_MIX', message: 'A trip may carry one brand' });
  if (trip.districtId !== order.districtId) f.push({ code: 'DISTRICT_MIX', message: 'A trip may serve one district' });
  if (sum(trip.orders, 'weightKg') + order.weightKg > vehicle.weightCapKg + 1e-6) f.push({ code: 'WEIGHT_CAPACITY', message: 'Weight capacity exceeded' });
  if (sum(trip.orders, 'volumeM3') + order.volumeM3 > vehicle.volumeCapM3 + 1e-6) f.push({ code: 'VOLUME_CAPACITY', message: 'Volume capacity exceeded' });
  if (f.length) return f;

  const candidate: TripDraft = { ...trip, orders: [...trip.orders, order] };
  const others = vehicleTrips.filter((t) => t !== trip);
  const all = [...others, candidate];
  if (all.length > MAX_TRIPS) f.push({ code: 'TRIP_LIMIT', message: 'Vehicle already runs two trips today' });

  const budget = isFresh(order.brand) ? FRESH_BUDGET_MIN : DAYTIME_BUDGET_MIN;
  if (familyMinutes(all, order.brand, table) > budget + 1e-6) {
    f.push({ code: 'TIME_BUDGET', message: isFresh(order.brand) ? 'Pre-dawn window (270 min) exceeded' : 'Daytime window (480 min) exceeded' });
  }
  const fuel = all.reduce((x, t) => x + tripFuel(t.travel, t.orders, t.vehicle), 0);
  if (weeklyFuelUsed + fuel > vehicle.weeklyFuelQuotaL + 1e-6) f.push({ code: 'FUEL_QUOTA', message: 'Weekly fuel quota exceeded' });

  if (!f.length) {
    const starts = tripStarts(all, table);
    for (const t of all) {
      if (scheduleStops(t.travel, t.orders, starts.get(t)!, table).some((s) => s.late)) {
        f.push({ code: 'DELIVERY_WINDOW', message: 'A stop would arrive after its delivery window closes' });
        break;
      }
    }
  }
  return f;
}

type VehicleState = { vehicle: PlanningVehicle; trips: TripDraft[] };

const REASON_TEXT: Record<string, string> = {
  NO_TRAVEL_PROFILE: 'District has no travel profile for this depot',
  NO_VEHICLE_FITS: 'No vehicle in the fleet can carry this order (size, temperature or access)',
  NO_REEFER_CAPACITY: 'All refrigerated capacity is used',
  VAN_ONLY_LIMIT: 'All vans are fully used',
  WEIGHT_CAPACITY: 'Not enough weight capacity left',
  VOLUME_CAPACITY: 'Not enough volume capacity left',
  TIME_BUDGET: 'Remaining vehicles have no time left in the delivery window',
  DELIVERY_WINDOW: 'No vehicle can reach the outlet before its window closes',
  FUEL_QUOTA: 'Remaining vehicles would exceed their weekly fuel quota',
  TRIP_LIMIT: 'All compatible vehicles already run two trips',
  NO_COMPATIBLE_CAPACITY: 'Demand exceeds compatible capacity',
};

/** Could this order ever ride this vehicle (ignoring what's already loaded)? */
function staticFit(order: PlanningOrder, v: PlanningVehicle) {
  return v.status === 'AVAILABLE' && v.depotId === order.depotId
    && (order.parkingConstraint !== 'VAN_ONLY' || v.type === 'VAN')
    && (order.temperature !== 'CHILLED' || v.temperature === 'REEFER')
    && order.weightKg <= v.weightCapKg && order.volumeM3 <= v.volumeCapM3;
}

/**
 * Greedy priority allocation with best-fit packing.
 * Highest-priority orders are placed first. Each order prefers consolidating into an existing
 * trip, then opening a trip on the vehicle that wastes the least scarce capacity
 * (reefers are reserved for chilled, vans for van-only outlets).
 */
export function allocate(
  orders: PlanningOrder[],
  vehicles: PlanningVehicle[],
  travelByDistrict: Record<string, TravelProfile>,
  weeklyFuelUsed: Record<string, number> = {},
  table = DEFAULT_ALLOWANCES,
): { trips: TripDraft[]; deferrals: Deferral[] } {
  const states: VehicleState[] = vehicles
    .filter((v) => v.status === 'AVAILABLE')
    .map((vehicle) => ({ vehicle, trips: [] }));

  const ranked = [...orders].sort((a, b) =>
    scoreOrder(b).value - scoreOrder(a).value
    || (a.windowCloseMin ?? 1440) - (b.windowCloseMin ?? 1440)
    || b.volumeM3 - a.volumeM3
    || a.id.localeCompare(b.id));

  const deferrals: Deferral[] = [];
  for (const order of ranked) {
    const travel = travelByDistrict[order.districtId];
    const s = scoreOrder(order);
    if (!travel) {
      deferrals.push({ orderId: order.id, reasonCode: 'NO_TRAVEL_PROFILE', reason: REASON_TEXT.NO_TRAVEL_PROFILE, unavoidable: true, priorityScore: s.value, scoreBreakdown: s.breakdown });
      continue;
    }
    let best: { state: VehicleState; trip: TripDraft; cost: number } | null = null;
    const failCounts: Record<string, number> = {};
    for (const state of states) {
      const v = state.vehicle;
      if (!staticFit(order, v)) continue;
      const used = weeklyFuelUsed[v.id] ?? 0;
      const reservePenalty = (v.temperature === 'REEFER' && order.temperature !== 'CHILLED' ? 30 : 0)
        + (v.type === 'VAN' && order.parkingConstraint !== 'VAN_ONLY' ? 40 : 0);
      const candidates: TripDraft[] = state.trips.filter((t) => t.brand === order.brand && t.districtId === order.districtId);
      if (state.trips.length < MAX_TRIPS) {
        candidates.push({ vehicleId: v.id, tripNo: state.trips.length + 1, brand: order.brand, districtId: order.districtId, vehicle: v, travel, orders: [] });
      }
      for (const trip of candidates) {
        const failures = validate(order, v, trip, state.trips, used, table);
        if (failures.length) { failures.forEach((x) => { failCounts[x.code] = (failCounts[x.code] ?? 0) + 1; }); continue; }
        const isNew = trip.orders.length === 0;
        const slack = (v.volumeCapM3 - sum(trip.orders, 'volumeM3') - order.volumeM3) / v.volumeCapM3
          + (v.weightCapKg - sum(trip.orders, 'weightKg') - order.weightKg) / v.weightCapKg;
        const cost = (isNew ? 100 : 0) + reservePenalty + slack * 10 + (isNew ? trip.tripNo : 0);
        if (!best || cost < best.cost) best = { state, trip, cost };
      }
    }
    if (!best) {
      const anyFit = vehicles.some((v) => staticFit(order, v));
      const code = !anyFit ? 'NO_VEHICLE_FITS'
        : (Object.entries(failCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? (order.temperature === 'CHILLED' ? 'NO_REEFER_CAPACITY' : order.parkingConstraint === 'VAN_ONLY' ? 'VAN_ONLY_LIMIT' : 'NO_COMPATIBLE_CAPACITY'));
      deferrals.push({ orderId: order.id, reasonCode: code, reason: REASON_TEXT[code] ?? code, unavoidable: !anyFit, priorityScore: s.value, scoreBreakdown: s.breakdown });
    } else {
      best.trip.orders.push(order);
      if (!best.state.trips.includes(best.trip)) best.state.trips.push(best.trip);
    }
  }
  // Renumber trips per vehicle: Fresh (pre-dawn) first.
  for (const st of states) {
    st.trips.sort((a, b) => Number(isFresh(b.brand)) - Number(isFresh(a.brand)) || a.tripNo - b.tripNo).forEach((t, i) => { t.tripNo = i + 1; });
  }
  return { trips: states.flatMap((s) => s.trips), deferrals };
}

/** Independent re-check of a finished plan against every hard rule (mirrors check_allocation.py). */
export function checkPlan(trips: TripDraft[], weeklyFuelUsed: Record<string, number> = {}, table = DEFAULT_ALLOWANCES): string[] {
  const errors: string[] = [];
  const byVehicle = new Map<string, TripDraft[]>();
  trips.forEach((t) => byVehicle.set(t.vehicleId, [...(byVehicle.get(t.vehicleId) ?? []), t]));
  for (const [vid, ts] of byVehicle) {
    const v = ts[0].vehicle;
    if (ts.length > MAX_TRIPS) errors.push(`${vid}: ${ts.length} trips`);
    for (const t of ts) {
      const tag = `${vid} trip ${t.tripNo}`;
      if (t.orders.some((o) => o.depotId !== v.depotId)) errors.push(`${tag}: wrong depot`);
      if (new Set(t.orders.map((o) => o.brand)).size > 1) errors.push(`${tag}: mixes brands`);
      if (new Set(t.orders.map((o) => o.districtId)).size > 1) errors.push(`${tag}: mixes districts`);
      if (t.orders.some((o) => o.temperature === 'CHILLED') && v.temperature !== 'REEFER') errors.push(`${tag}: chilled on ambient vehicle`);
      if (t.orders.some((o) => o.parkingConstraint === 'VAN_ONLY') && v.type !== 'VAN') errors.push(`${tag}: truck at van-only outlet`);
      if (sum(t.orders, 'weightKg') > v.weightCapKg + 1e-6) errors.push(`${tag}: overweight`);
      if (sum(t.orders, 'volumeM3') > v.volumeCapM3 + 1e-6) errors.push(`${tag}: over volume`);
    }
    if (familyMinutes(ts, 'FRESH', table) > FRESH_BUDGET_MIN + 1e-6) errors.push(`${vid}: Fresh trips exceed 270 min`);
    if (familyMinutes(ts, 'STYLE', table) > DAYTIME_BUDGET_MIN + 1e-6) errors.push(`${vid}: daytime trips exceed 480 min`);
    const fuel = ts.reduce((x, t) => x + tripFuel(t.travel, t.orders, t.vehicle), 0);
    if ((weeklyFuelUsed[vid] ?? 0) + fuel > v.weeklyFuelQuotaL + 1e-6) errors.push(`${vid}: weekly fuel quota exceeded`);
  }
  return errors;
}

/** Port of OrderCutoffPolicy: 16:00 Asia/Colombo cutoff for next-day orders. */
export function decideCutoff(requestedDate: string, now = new Date()): { afterCutoff: boolean; effectiveDate: string } {
  const colombo = new Date(now.getTime() + 330 * 60_000); // UTC+5:30, no DST
  const today = colombo.toISOString().slice(0, 10);
  const minutes = colombo.getUTCHours() * 60 + colombo.getUTCMinutes();
  const afterCutoff = minutes >= 16 * 60;
  const tomorrow = nextOperatingDay(today);
  const late = afterCutoff && requestedDate <= tomorrow;
  return { afterCutoff: late, effectiveDate: late ? nextOperatingDay(tomorrow) : requestedDate };
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Waypoint operates Monday–Saturday. */
export function nextOperatingDay(date: string): string {
  let d = addDays(date, 1);
  if (new Date(`${d}T00:00:00Z`).getUTCDay() === 0) d = addDays(d, 1);
  return d;
}

export function timeToMinutes(t: string | null | undefined): number | undefined {
  if (!t) return undefined;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Monday of the ISO week containing `date`. */
export function weekStart(date: string): string {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return addDays(date, -((day + 6) % 7));
}
